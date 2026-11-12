import nodemailer from 'nodemailer';

// Deliberately not configurable by the browser, query string or form fields.
export const CONTACT_RECIPIENT = 'contact-ga@matsuda-sangyo.com';
// TEMPORARY: requested test copy. Remove this constant and the cc field below
// after the owner confirms receipt; do not retain for normal customer traffic.
export const CONTACT_TEST_CC = 'worapot.bhi@gmail.com';
const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
const isEmail = value => typeof value === 'string' && value.length <= 254 && emailPattern.test(value);

export function validateContact(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const limits = { name:120, email:254, phone:40, topic:200, detail:5000 };
  const result = {};
  for (const [key,max] of Object.entries(limits)) {
    if (typeof data[key] !== 'string') return null;
    result[key] = data[key].trim();
    if (!result[key] || result[key].length > max || /\0/.test(result[key])) return null;
    if (key !== 'detail' && /[\r\n]/.test(result[key])) return null;
  }
  if (!isEmail(result.email) || !/^[+\d\s().-]{5,40}$/.test(result.phone)) return null;
  result.language = ['en','th','ja','zh-Hans'].includes(data.language) ? data.language : 'en';
  return result;
}

export function smtpOptions(env = process.env) {
  if (!env.SMTP_HOST || !isEmail(env.SMTP_FROM)) return null;
  const port = Number(env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
  if (Boolean(env.SMTP_USER) !== Boolean(env.SMTP_PASS)) return null;
  const secure = env.SMTP_SECURE === 'true' || (env.SMTP_SECURE !== 'false' && port === 465);
  return {
    host:env.SMTP_HOST, port, secure, requireTLS:!secure,
    ...(env.SMTP_USER ? { auth:{ user:env.SMTP_USER, pass:env.SMTP_PASS } } : {}),
    tls:{ rejectUnauthorized:true },
    connectionTimeout:10000, greetingTimeout:10000, socketTimeout:20000,
    disableFileAccess:true, disableUrlAccess:true
  };
}

export function contactMessage(input, from) {
  return {
    from, to:CONTACT_RECIPIENT, cc:CONTACT_TEST_CC, replyTo:input.email,
    subject:`[Website contact] ${input.topic}`,
    text:[
      'Website contact form — Matsuda Sangyo (Thailand)',
      '', `Name: ${input.name}`, `Email: ${input.email}`, `Phone: ${input.phone}`,
      `Subject: ${input.topic}`, `Language: ${input.language}`, '', 'Message:', input.detail
    ].join('\n'),
    disableFileAccess:true, disableUrlAccess:true
  };
}

export function createContactHandler({ env = process.env, sendMail, now = Date.now, log = console } = {}) {
  const options = smtpOptions(env);
  const transporter = !sendMail && options ? nodemailer.createTransport(options) : null;
  const deliver = sendMail || (transporter && transporter.sendMail.bind(transporter));
  const attempts = new Map();
  const windowMs = 10 * 60 * 1000;
  function reply(res, status, code) {
    res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
    res.end(JSON.stringify({ ok:status === 202, code }));
  }
  return async function contact(req, res) {
    if (req.method !== 'POST') { res.setHeader('Allow','POST'); return reply(res,405,'METHOD_NOT_ALLOWED'); }
    // JSON plus same-origin checking prevents cross-site browser form POSTs.
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return reply(res,415,'JSON_REQUIRED');
    if (req.headers['sec-fetch-site'] === 'cross-site') return reply(res,403,'ORIGIN_REJECTED');
    if (req.headers.origin) {
      try {
        const origin = new URL(req.headers.origin);
        const permitted = env.PUBLIC_ORIGIN ? origin.origin === new URL(env.PUBLIC_ORIGIN).origin : origin.host === req.headers.host;
        if (!permitted || !['http:','https:'].includes(origin.protocol)) return reply(res,403,'ORIGIN_REJECTED');
      } catch { return reply(res,403,'ORIGIN_REJECTED'); }
    }
    const time = now();
    for (const [key,value] of attempts) if (time - value.start >= windowMs) attempts.delete(key);
    // Only enable proxy-header trust when the trusted reverse proxy overwrites
    // this header and direct access to this Node process is blocked.
    const ip = env.TRUST_PROXY === 'true' ? String(req.headers['x-forwarded-for'] || req.socket.remoteAddress).split(',')[0].trim() : req.socket.remoteAddress;
    if (!attempts.has(ip) && attempts.size >= 10000) { res.setHeader('Retry-After','600'); return reply(res,429,'RATE_LIMITED'); }
    const entry = attempts.get(ip) || { start:time, count:0 };
    entry.count++; attempts.set(ip,entry);
    if (entry.count > 5 || attempts.size > 10000) { res.setHeader('Retry-After','600'); return reply(res,429,'RATE_LIMITED'); }
    const chunks = [];
    let bytes = 0;
    try {
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes <= 20000) chunks.push(Buffer.from(chunk));
      }
      // Bounded memory; drain an oversized request without retaining its body.
    } catch { if (!res.writableEnded) reply(res,400,'INVALID_REQUEST'); return; }
    if (bytes > 20000) return reply(res,413,'BODY_TOO_LARGE');
    let data;
    try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return reply(res,400,'INVALID_JSON'); }
    // Honeypot is optional for old clients; never forward its value.
    if (data && data.website) return reply(res,400,'INVALID_REQUEST');
    const input = validateContact(data);
    if (!input) return reply(res,422,'INVALID_FIELDS');
    if (!deliver || !isEmail(env.SMTP_FROM)) return reply(res,503,'MAIL_NOT_CONFIGURED');
    try {
      const result = await deliver(contactMessage(input, env.SMTP_FROM));
      if (!result?.accepted?.some(address => String(address).toLowerCase() === CONTACT_RECIPIENT)) {
        return reply(res,502,'MAIL_REJECTED');
      }
      // SMTP acceptance is not a promise of final inbox delivery.
      return reply(res,202,'MAIL_ACCEPTED');
    } catch (error) {
      // Never log submitted text, credentials, or raw SMTP error messages.
      log.error('Contact mail failed', /^[A-Z_]+$/.test(error?.code || '') ? error.code : 'DELIVERY_ERROR');
      return reply(res,503,'MAIL_UNAVAILABLE');
    }
  };
}
