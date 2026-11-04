/** Optional browser regression suite. Install Playwright separately for QA;
 * the website and `npm test` still require no dependencies.
 * BASE_URL defaults to http://127.0.0.1:3000 (start with npm start).
 * BROWSER_EXECUTABLE_PATH / BROWSER_ARGS_JSON support CI-provided Chromium.
 */
import assert from 'node:assert/strict';
import { readdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = new URL('../', import.meta.url);
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const pages = (await readdir(root)).filter(name => name.endsWith('.html')).sort();
assert.equal(pages.length, 29);
const viewports = [310, 390, 768, 1024, 1280];
const navigationLabels = { en:'Home', th:'หน้าแรก', ja:'ホーム', 'zh-Hans':'首页' };
const browser = await chromium.launch({ headless: true,
  ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {}),
  args: process.env.BROWSER_ARGS_JSON ? JSON.parse(process.env.BROWSER_ARGS_JSON) : ['--no-sandbox'] });
const page = await browser.newPage();
// Third-party embeds are intentionally excluded; test local rendering only.
await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
const errors = [], httpErrors = [], posts = [], results = [], interactions = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.status() >= 400) httpErrors.push(response.url()); });
page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
function group(name) { return name.split(/[_.]/)[0]; }
async function open(name) {
  const response = await page.goto(`${base}/${name}`);
  assert.equal(response.status(), 200, name);
  await page.evaluate(() => document.fonts.ready);
  if (name.startsWith('index')) await page.waitForFunction(() => window.mg1 && window.mg2);
  await page.waitForTimeout(50);
}
try {
  for (const width of viewports) {
    await page.setViewportSize({ width, height: 900 });
    for (const file of pages) {
      await open(file);
      const data = await page.evaluate(() => {
        const rects = {};
        for (const selector of ['.header', '.content', '.div-index1', '.div-index2', '.div-index3-1', '.div-index4', '.div-company1', '.div-company2', '.div-company3', '.div-awarded', '.div-awarded-d', '.div-career', '.div-management2', '.div-contactus1', '.div-contactus2', '.div-contactus3', '.footer', '.footer2']) {
          const el = document.querySelector(selector);
          if (el) { const r = el.getBoundingClientRect(); rects[selector] = { x:r.x, y:r.y, w:r.width, h:r.height }; }
        }
        const brokenImages = [...document.images].filter(img => img.hasAttribute('src') && (!img.complete || !img.naturalWidth)).map(img => img.getAttribute('src'));
        const clipped = [...document.querySelectorAll('.content h1, .content h2')].filter(el => el.clientHeight > 0 && el.scrollHeight > el.clientHeight + 1 && ['hidden','clip'].includes(getComputedStyle(el).overflowY)).map(el => el.textContent);
        return { language:document.documentElement.lang, rects, brokenImages, clipped, overflow:document.documentElement.scrollWidth > innerWidth, homeLabel:document.querySelector('.menu-top a').textContent.trim(), navCounts:['.menu-top a', '#mobile-menu a', '.menu-bottom a'].map(s => document.querySelectorAll(s).length), languages:[...document.querySelectorAll('.menu-top2 a')].map(a => a.getAttribute('href')) };
      });
      assert.deepEqual(data.brokenImages, [], `${width} ${file}: images`);
      assert.deepEqual(data.clipped, [], `${width} ${file}: clipped heading`);
      assert.equal(data.overflow, false, `${width} ${file}: overflow`);
      assert.deepEqual(data.navCounts, [7,7,7], file);
      assert.equal(data.homeLabel,navigationLabels[data.language],file);
      assert.equal(data.languages.length,4,file);
      assert.equal(new Set(data.languages).size,4,file);
      for (const href of data.languages) assert.ok(pages.includes(href), `${file}: language target ${href}`);
      results.push({ file, width, ...data });
    }
  }
  // Each category must start at the same position for every language. Compare
  // subsequent landmarks except translated Company tables, which must be
  // allowed to grow naturally (never crop them to fake matching geometry).
  const landmarks = { index:['.div-index1','.div-index2','.div-index3-1','.div-index4','.footer'], company:['.div-company1','.div-company2','.div-company3'], business:['.footer'], career:['.div-career','.footer'], management:['.div-management2','.footer'], awarded:['.div-awarded-d','.footer'], contactus:['.div-contactus1','.div-contactus2','.div-contactus3','.footer'] };
  for (const width of viewports) for (const category of Object.keys(landmarks)) {
    const rows = results.filter(row => row.width === width && group(row.file) === category);
    const reference = rows.find(row => row.file === `${category}_cn.html`);
    for (const row of rows) for (const selector of ['.header','.content',...landmarks[category]]) {
      for (const key of ['x','y','w']) {
        assert.ok(Math.abs(row.rects[selector][key]-reference.rects[selector][key]) < 1, `${width} ${row.file} ${selector}.${key}: ${row.rects[selector][key]} vs ${reference.rects[selector][key]}`);
      }
    }
  }
  // Run every page's controls at phone size, then verify an in-place desktop
  // -> phone -> desktop resize doesn't desynchronize the header spacer.
  await page.setViewportSize({ width:390, height:900 });
  for (const file of pages) {
    await open(file);
    const toggle = page.locator('.mobile-menu-toggle');
    await toggle.click(); assert.equal(await toggle.getAttribute('aria-expanded'),'true',file);
    assert.equal(await page.locator('#mobile-menu a:visible').count(),7,file);
    await page.keyboard.press('Escape'); assert.equal(await toggle.getAttribute('aria-expanded'),'false',file);
    await toggle.click(); await page.mouse.click(2,2);
    assert.equal(await toggle.getAttribute('aria-expanded'),'false',file);
    const nextLanguage = await page.locator('.menu-top2 a:not([aria-current])').first().getAttribute('href');
    await page.locator(`.menu-top2 a[href="${nextLanguage}"]`).click();
    assert.equal(new URL(page.url()).pathname,`/${nextLanguage}`,file);
    await open(file);
    const row = { file, menu:true, languageSwitch:true };
    if (file.startsWith('index')) {
      for (const id of ['mg1','mg2']) {
        const before = await page.evaluate(id => window[id].options.start,id);
        await page.locator(`#${id} .gs-next`).click();
        await page.waitForFunction(({id,before}) => window[id].options.start !== before,{id,before});
      }
      row.sliders = 2;
    }
    if (file.startsWith('awarded') || file.startsWith('contactus')) {
      const links = page.locator(file.startsWith('awarded') ? '.hpl-list-1' : '.div-contactus2 a[href^="uploads/"]');
      assert.equal(await links.count(),file.startsWith('awarded') ? 6 : 2,file);
      await links.first().click(); await page.locator('.image-viewer').waitFor({state:'visible'});
      for (let index=0; index<await links.count(); index++) {
        if (index) await page.keyboard.press('ArrowRight');
        await page.waitForFunction(() => { const img=document.querySelector('.image-viewer img'); return img.complete && img.naturalWidth>0; });
        assert.ok((await page.locator('.viewer-caption').innerText()).startsWith(`${index+1} / `));
      }
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('Escape'); assert.equal(await page.locator('.image-viewer').isVisible(),false,file);
      row.galleryImages = await links.count();
    }
    if (file.startsWith('contactus')) {
      await page.locator('#frm_check input[type="submit"]').click();
      assert.equal(await page.locator('#warning_text').getAttribute('role'),'status',file);
      assert.equal(new URL(page.url()).pathname,`/${file}`);
      assert.equal(await page.locator('#frm_check input[aria-label]').count(),4);
      row.formNotSent = true;
    }
    await page.setViewportSize({width:1280,height:900}); await page.waitForTimeout(80);
    await page.setViewportSize({width:390,height:900}); await page.waitForTimeout(80);
    await page.setViewportSize({width:1280,height:900}); await page.waitForTimeout(80);
    assert.ok(await page.evaluate(() => Math.abs(document.querySelector('.content').getBoundingClientRect().top + window.scrollY - document.querySelector('.header').offsetHeight + 10) < 1),file);
    await page.setViewportSize({width:390,height:900});
    interactions.push(row);
  }
  assert.deepEqual(errors,[],'Browser JavaScript errors');
  assert.deepEqual(httpErrors,[],'Local HTTP errors');
  assert.deepEqual(posts,[],'No form-delivery backend must be called');
  const report = { date:'2026-11-04', source:'Local Chromium checks; CN variants are per-category layout baselines. Chinese Company HTML remains unchanged. Not a live pixel diff.', thirdPartyEmbeds:'External requests blocked for deterministic QA; Google Maps is not validated.', viewports, pages:pages.length, checks:results.length, interactions, results };
  await writeFile(new URL(process.env.LAYOUT_REPORT || 'docs/all-pages-layout-checks.json',root), JSON.stringify(report,null,2)+'\n');
  console.log(`PASS: ${results.length} page/viewport checks; ${interactions.length} page interaction/resize checks; 7 categories, 4 languages, no JS/HTTP errors or horizontal overflow.`);
} finally { await browser.close(); }
