import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
const pages = (await readdir(new URL('../', import.meta.url))).filter(name => name.endsWith('.html'));
const read = name => readFile(new URL('../' + name, import.meta.url), 'utf8');
test('all 29 pages remove injected hero banners and have accessible mobile navigation', async () => {
  for (const file of pages) {
    const html = await read(file);
    assert.doesNotMatch(html, /class=['"]hero-banner|margin-top:-350px/);
    assert.match(html, /aria-controls="mobile-menu"/);
    assert.match(html, /<nav class="mobile-navigation"/);
    assert.match(html, /reference-repairs\.css/);
  }
});
test('verified English home/company headings and original business graphics', async () => {
  assert.match(await read('index.html'), /For Prosperity And A Beautiful Earth/);
  assert.match(await read('company.html'), /<h1 class='topic'>Corporate Introduction<\/h1>/);
  for (const file of pages.filter(name => name.startsWith('business'))) {
    const html = await read(file);
    assert.match(html, /images\/img-business1_en\.png/);
    assert.match(html, /images\/business_en\.png/);
    assert.doesNotMatch(html, /Our comprehensive business operations include/);
  }
});
test('footer links are section-specific and preserve the selected language', async () => {
  for (const file of pages) {
    const html = await read(file);
    const footer = html.match(/<ul class='menu-bottom'[^>]*>([\s\S]*?)<\/ul>/)[1];
    const hrefs = [...footer.matchAll(/href='([^']+)'/g)].map(match => match[1]);
    assert.equal(new Set(hrefs).size, 7, file);
    assert.equal(hrefs.length, 7, file);
    if (/_th\./.test(file)) assert.ok(hrefs.every(href => /_th\.html$/.test(href) || href === 'management.html'), file);
    if (/_jp\./.test(file)) assert.ok(hrefs.every(href => /_jp\.html$/.test(href)), file);
    if (/_cn\./.test(file)) assert.ok(hrefs.every(href => /_cn\.html$/.test(href)), file);
  }
});
test('six real award documents, keyboard gallery, original slider height ratio', async () => {
  assert.equal((await read('awarded.html')).match(/class='hpl-list-1'/g).length, 6);
  const compatibility = await read('js/static-compat.js');
  assert.match(compatibility, /viewer\.showModal\(\)/);
  assert.match(compatibility, /ArrowRight/);
  assert.match(await read('js/slider.js'), /this\.options\.height=this\.options\.height\+/);
});
