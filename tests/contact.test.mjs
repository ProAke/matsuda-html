import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { once } from 'node:events';
import { readFile, readdir } from 'node:fs/promises';
import { createContactHandler, CONTACT_RECIPIENT, contactMessage, smtpOptions, validateContact } from '../server/contact.mjs';
const valid = { name:'QA User', email:'qa@example.org', phone:'+66 2000 0000', topic:'Contact form test', detail:'ทดสอบข้อความ\n日本語 / 中文', language:'th', website:'' };
const env = { SMTP_FROM:'website@example.org' };
async function api(t, options = {}) {
  const server = http.createServer(createContactHandler({ env, log:{ error(){} }, ...options }));
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const url = `http://127.0.0.1:${server.address().port}/api/contact`;
  return (data = valid, extra = {}) => fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json', ...extra.headers }, body:typeof data === 'string' ? data : JSON.stringify(data), ...Object.fromEntries(Object.entries(extra).filter(([key]) => key !== 'headers')) });
}

test('all 29 footer email labels and mailto targets use contact-ga', async () => {
  for (const file of (await readdir(new URL('../',import.meta.url))).filter(file => file.endsWith('.html'))) {
    const html = await readFile(new URL('../'+file,import.meta.url),'utf8');
    assert.doesNotMatch(html, /msta-admin@matsuda-sangyo\.com/,file);
    assert.match(html, /href="mailto:contact-ga@matsuda-sangyo\.com"/,file);
    assert.ok((html.match(/contact-ga@matsuda-sangyo\.com/g)||[]).length >= 2,file);
  }
});

test('SMTP uses mandatory TLS, verified certificates and server-held credentials', () => {
  assert.equal(smtpOptions({}),null);
  assert.equal(smtpOptions({ SMTP_HOST:'smtp.example.org', SMTP_FROM:'bad' }),null);
  assert.equal(smtpOptions({ SMTP_HOST:'smtp.example.org', SMTP_FROM:env.SMTP_FROM, SMTP_USER:'u' }),null);
  const starttls = smtpOptions({ ...env, SMTP_HOST:'smtp.example.org', SMTP_USER:'user', SMTP_PASS:'test-only' });
  assert.equal(starttls.port,587); assert.equal(starttls.requireTLS,true);
  assert.equal(starttls.tls.rejectUnauthorized,true);
  assert.equal(smtpOptions({ ...env, SMTP_HOST:'smtp.example.org', SMTP_PORT:'465' }).secure,true);
});

test('validation rejects missing fields, header injection, invalid email and oversized text', () => {
  assert.ok(validateContact(valid));
  for (const data of [null,[],{}, { ...valid, name:'' },{ ...valid, email:'invalid' },{ ...valid, email:'qa@example.org\r\nBcc:evil@example.org' },{ ...valid, topic:'x\nBcc:y' },{ ...valid, phone:'not a phone' },{ ...valid, detail:'x'.repeat(5001) }]) assert.equal(validateContact(data),null);
  const message = contactMessage(validateContact(valid),env.SMTP_FROM);
  assert.equal(message.to,CONTACT_RECIPIENT); assert.equal(message.replyTo,valid.email);
  assert.match(message.text,/ทดสอบข้อความ/); assert.equal(message.html,undefined);
});

test('SMTP acceptance returns 202 and client-supplied recipients/from cannot override routing', async t => {
  let sent;
  const post = await api(t,{ sendMail:async message => { sent=message;return { accepted:[CONTACT_RECIPIENT] }; } });
  const response = await post({ ...valid, to:'evil@example.org', cc:'evil@example.org', from:'evil@example.org', bcc:'evil@example.org' });
  assert.equal(response.status,202); assert.deepEqual(await response.json(),{ ok:true, code:'MAIL_ACCEPTED' });
  assert.equal(sent.to,'contact-ga@matsuda-sangyo.com'); assert.equal(sent.from,env.SMTP_FROM);
  assert.equal(sent.replyTo,valid.email); assert.equal(sent.bcc,undefined);
  assert.equal(sent.cc,'worapot.bhi@gmail.com', 'temporary test CC is server-controlled');
});

test('unconfigured SMTP never reports success', async t => {
  const post = await api(t,{ env:{} }); const response = await post();
  assert.equal(response.status,503); assert.equal((await response.json()).code,'MAIL_NOT_CONFIGURED');
});

test('SMTP rejection and connection failures never report success', async t => {
  const rejected = await api(t,{ sendMail:async () => ({ accepted:[], rejected:[CONTACT_RECIPIENT] }) });
  assert.equal((await rejected()).status,502);
  const failed = await api(t,{ sendMail:async () => { throw Object.assign(new Error('private error'),{ code:'EAUTH' }); } });
  const response = await failed(); assert.equal(response.status,503);
  assert.doesNotMatch(await response.text(),/private error|EAUTH/);
});

test('API rejects cross-site posts, form-encoded requests, malformed JSON, honeypots and large bodies', async t => {
  let sends=0;
  const post = await api(t,{ sendMail:async () => { sends++;return { accepted:[CONTACT_RECIPIENT] }; } });
  assert.equal((await post(valid,{ headers:{ Origin:'https://evil.example' } })).status,403);
  assert.equal((await post(valid,{ headers:{ 'Content-Type':'application/x-www-form-urlencoded' } })).status,415);
  assert.equal((await post('{')).status,400);
  assert.equal((await post({ ...valid, website:'spam.example' })).status,400);
  assert.equal((await post({ ...valid, detail:'x'.repeat(21000) })).status,413);
  assert.equal((await post({ ...valid, email:'invalid' })).status,422);
  assert.equal(sends,0);
});

test('rate limit rejects a sixth attempt and ignores spoofed proxy IPs by default', async t => {
  const post = await api(t,{ sendMail:async () => ({ accepted:[CONTACT_RECIPIENT] }) });
  for (let index=0;index<5;index++) assert.equal((await post(valid,{ headers:{ 'X-Forwarded-For':`192.0.2.${index}` } })).status,202);
  const response = await post(); assert.equal(response.status,429);assert.equal(response.headers.get('retry-after'),'600');
});

test('all four forms target API, validate fields and load the new handler without legacy blockers', async () => {
  for (const file of ['contactus.html','contactus_th.html','contactus_jp.html','contactus_cn.html']) {
    const html = await readFile(new URL('../'+file,import.meta.url),'utf8');
    assert.match(html,/action='\/api\/contact'/); assert.match(html,/js\/contact-form\.js/);
    assert.doesNotMatch(html,/Event\.observe\('frm_check','submit',check\.add/);
    assert.match(html,/type='email' name='email' required/);
    assert.match(html,/name='detail' required maxlength='5000'/);
    assert.match(html,/name='website'/);
  }
});

test('browser handler localizes all languages, preserves failed input, resets only SMTP acceptance', async () => {
  const { runInNewContext } = await import('node:vm');
  const source = await readFile(new URL('../js/contact-form.js',import.meta.url),'utf8');
  for (const language of ['en','th','ja','zh-Hans']) {
    let ready, submit, resets=0, calls=0;
    const status = { style:{}, dataset:{}, scrollIntoView(){} };
    const button = { value:'Submit', disabled:false };
    const form = {
      querySelector:() => button, reportValidity:() => true,
      addEventListener:(event,callback) => { if(event==='submit') submit=callback; },
      setAttribute(){}, removeAttribute(){}, reset(){ resets++; }
    };
    const document = { documentElement:{ lang:language }, addEventListener:(event,callback) => { ready=callback; }, getElementById:id => id==='frm_check' ? form : status };
    let response = { status:503, json:async () => ({ ok:false, code:'MAIL_NOT_CONFIGURED' }) };
    runInNewContext(source,{ document, FormData:class { get(key){ return valid[key]; } }, fetch:async (url,request) => { calls++; assert.equal(url,'/api/contact'); assert.equal(JSON.parse(request.body).language,language); return response; } });
    ready();
    await submit({ preventDefault(){} });
    assert.equal(resets,0); assert.equal(status.dataset.state,'error'); assert.equal(button.disabled,false);
    assert.match(status.textContent,/contact-ga@matsuda-sangyo.com/);
    response = { status:202, json:async () => ({ ok:true, code:'MAIL_ACCEPTED' }) };
    await submit({ preventDefault(){} });
    assert.equal(resets,1); assert.equal(status.dataset.state,'success');
    response = { status:200, json:async () => ({ ok:true, code:'MAIL_ACCEPTED' }) };
    await submit({ preventDefault(){} });
    assert.equal(resets,1); assert.equal(status.dataset.state,'error');
    assert.equal(calls,3);
  }
});
