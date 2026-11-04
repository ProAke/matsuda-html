import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const files = (await readdir(root)).filter(name => name.endsWith('.html'));
const read = name => readFile(new URL(name, root), 'utf8');

test('all 29 pages and seven categories share the responsive layout policy', async () => {
  assert.equal(files.length,29);
  assert.equal(new Set(files.map(name => name.split(/[_.]/)[0])).size,7);
  assert.match(await read('template/styles/reference-repairs.css'), /^@import url\("site-layout\.css"\);/);
  for (const file of files) {
    const html = await read(file);
    assert.match(html, /reference-repairs\.css/, file);
    assert.doesNotMatch(html, /class=['"]content['"][^>]*style=/, file);
    assert.doesNotMatch(html, /company-layout\.css/, file);
  }
});

test('structural div/main/nav/form tags remain balanced in every language', async () => {
  for (const file of files) {
    const html = (await read(file)).replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>/gi,'');
    const counts = new Map(['div','main','nav','form'].map(tag => [tag,0]));
    for (const match of html.matchAll(/<(\/)?(div|main|nav|form)\b[^>]*>/gi)) {
      const tag = match[2].toLowerCase();
      counts.set(tag,counts.get(tag)+(match[1] ? -1 : 1));
      assert.ok(counts.get(tag)>=0,`${file}: extra closing ${tag}`);
    }
    for (const [tag,count] of counts) assert.equal(count,0,`${file}: unclosed ${tag}`);
  }
});

test('desktop, mobile and footer navigation reuse the same native labels per language', async () => {
  const references = { en:'index.html', th:'management.html', ja:'index_jp.html', 'zh-Hans':'index_cn.html' };
  const homeLabels = { en:'Home', th:'หน้าแรก', ja:'ホーム', 'zh-Hans':'首页' };
  const labels = block => [...block.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map(match => match[1]);
  for (const file of files) {
    const html = await read(file);
    const language = html.match(/<html lang="([^"]+)"/)[1];
    const reference = await read(references[language]);
    const expected = labels(reference.match(/<ul class='menu-top'[^>]*>([\s\S]*?)<\/ul>/)[1]);
    assert.equal(expected[0],homeLabels[language]);
    for (const pattern of [/<ul class='menu-top'[^>]*>([\s\S]*?)<\/ul>/, /<ul id="mobile-menu"[^>]*>([\s\S]*?)<\/ul>/, /<ul class='menu-bottom'[^>]*>([\s\S]*?)<\/ul>/]) {
      assert.deepEqual(labels(html.match(pattern)[1]),expected,file);
    }
  }
});

test('Thai homepage initialization never switches its body to English', async () => {
  const html = await read('index_th.html');
  assert.match(html, /window\.onload = function\(\) \{ fnc_lang\("th"\); \};/);
  assert.doesNotMatch(html, /fnc_lang\("en"\)/);
});

test('shared layout preserves natural content growth instead of hiding overflow', async () => {
  const css = await read('template/styles/site-layout.css');
  assert.match(css, /html:not\(\[lang="zh-Hans"\]\)/);
  assert.match(css, /min-height:190px/);
  assert.match(css, /prefers-reduced-motion/);
  assert.doesNotMatch(css, /overflow(?:-x)?\s*:\s*hidden/);
  assert.doesNotMatch(css, /(?:^|[;{])\s*height\s*:\s*\d/m);
});

test('fixed-header spacing observes font changes and shared controls remain localized', async () => {
  const compatibility = await read('js/static-compat.js');
  assert.match(compatibility, /new ResizeObserver\(window\.default_resize\)/);
  assert.match(compatibility, /document\.fonts\.ready\.then\(window\.default_resize\)/);
  for (const label of ['เมนู','メニュー','菜单']) assert.ok(compatibility.includes(label));
  assert.match(compatibility, /aria-label/);
  assert.match(compatibility, /event\.preventDefault\(\)/);
});
