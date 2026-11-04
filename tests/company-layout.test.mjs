import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = name => readFile(new URL('../' + name, import.meta.url), 'utf8');
const variants = ['company.html', 'company_th.html', 'company_jp.html'];

test('company translations use the Chinese reference section order and visible company-name band', async () => {
  for (const name of ['company_cn.html', ...variants]) {
    const html = await read(name);
    const intro = html.match(/<div class='div-company1'>[\s\S]*?<!-- div-company1-->/)[0];
    const band = html.match(/<div class='div-company2'[^>]*>[\s\S]*?<!-- div-company2-->/)[0];
    assert.doesNotMatch(intro, /<h2\b/, `${name}: company name must not move beside the photo`);
    assert.doesNotMatch(band, /\bhidden\b|display\s*:\s*none/, `${name}: blue band must remain visible`);
    assert.match(band, /<h2>[^<]+<\/h2>/);
    assert.doesNotMatch(band, /<h2>COMPANY PROFILE<\/h2>/);
    assert.ok(html.indexOf("class='div-company1'") < html.indexOf("class='div-company2'"));
    assert.ok(html.indexOf("class='div-company2'") < html.indexOf("class='div-company3'"));
    assert.doesNotMatch(html, /class=['"]content['"][^>]*style=/, `${name}: no extra per-language content offset`);
  }
});

test('Company pages use the same responsive layout policy as all other sections', async () => {
  for (const name of ['company_cn.html', ...variants, 'index.html', 'business.html']) {
    assert.match(await read(name), /reference-repairs\.css/);
    assert.doesNotMatch(await read(name), /company-layout\.css/);
  }
  assert.match(await read('template/styles/reference-repairs.css'), /@import url\("site-layout\.css"\)/);
  const css = await read('template/styles/site-layout.css');
  assert.match(css, /@media \(min-width: 1024px\)/);
  assert.match(css, /flex-wrap:wrap/);
  assert.doesNotMatch(css, /overflow(?:-x)?\s*:\s*hidden/);
});
