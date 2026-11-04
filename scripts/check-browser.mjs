// Browser smoke tests use a local production server; external Maps requests are stubbed only in tests.
import { chromium as playwright } from '@playwright/test'
import chromium, { inflate } from '@sparticuz/chromium'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000'
// Include NSS libraries bundled for minimal Linux CI images.
const libraries = await inflate(resolve(dirname(fileURLToPath(import.meta.resolve('@sparticuz/chromium'))), '../bin/al2023.tar.br'))
const browser = await playwright.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true, env: { ...process.env, LD_LIBRARY_PATH: `${libraries}/lib:${process.env.LD_LIBRARY_PATH || ''}` } })
await mkdir('.arena/screenshots', { recursive: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', msg => { if (msg.type() === 'error' || /hydration/i.test(msg.text())) errors.push(msg.text()) })
await page.route('https://www.google.com/maps/**', route => route.fulfill({ contentType: 'text/html', body: '<html><body>Map embed (external service)</body></html>' }))
const sections = ['', '/company','/links','/business','/awards','/environment','/contact']
try {
 for (const lang of ['en','th','ja','zh']) for (const section of sections) {
  const response = await page.goto(base + '/' + lang + section, { waitUntil: 'networkidle' })
  assert.equal(response.status(),200,`${lang}${section}`)
  assert.equal(await page.locator('html').getAttribute('lang'),lang)
  await page.locator('footer').scrollIntoViewIfNeeded()
  await page.waitForFunction(() => [...document.images].every(img => img.complete))
  const broken = await page.locator('img').evaluateAll(images => images.filter(i => !i.naturalWidth).map(i => i.src))
  assert.deepEqual(broken, [], `Broken images on ${lang}${section}`)
  assert.ok(await page.locator('main').innerText() || await page.locator('main img').count())
 }
 for (const width of [1280,768,375]) {
  await page.setViewportSize({ width, height: 900 })
  for (const section of sections) {
   await page.goto(base + '/en' + section, { waitUntil: 'networkidle' })
   const size = await page.evaluate(() => ({ window: innerWidth, content: document.documentElement.scrollWidth }))
   assert.ok(size.content <= size.window + 1, `Horizontal overflow ${width}${section}: ${size.content}`)
   if (width === 375) {
    await page.getByRole('button', { name: /Menu/ }).click()
    await page.locator('#navigation a').first().waitFor({ state: 'visible' })
   }
   await page.screenshot({ path: `.arena/screenshots/${width}-${section.slice(1) || 'home'}.png`, fullPage: true })
  }
 }
 await page.goto(base+'/en/company', { waitUntil: 'networkidle' })
 await page.locator('.menu-top2 a[lang="ja"]').click()
 await page.waitForURL('**/ja/company')
 await page.goto(base+'/en', { waitUntil: 'networkidle' })
 const before = await page.locator('.native-banner>img').getAttribute('src')
 await page.locator('.banner-next').click()
 assert.notEqual(await page.locator('.native-banner>img').getAttribute('src'), before)
 // Regression checks for the audit corrections.
 await page.setViewportSize({ width: 1280, height: 900 })
 for (const lang of ['en','th','ja','zh']) {
  await page.goto(base + '/' + lang + '/links', { waitUntil: 'networkidle' })
  assert.equal(await page.locator('main img[src$="/Untitled2.jpg"]').count(),1)
  assert.ok(!(await page.locator('main').innerText()).includes('Management Message'))
  await page.goto(base + '/' + lang + '/business', { waitUntil: 'networkidle' })
  assert.equal(await page.locator('main img[src$="/business_en.png"]').count(),1)
  assert.ok(!(await page.locator('main').innerText()).includes('Carbon credit initiatives'))
  await page.goto(base + '/' + lang + '/contact', { waitUntil: 'networkidle' })
  const form = page.locator('.feedback-draft')
  assert.equal(await form.locator(':invalid').count(),4)
  await form.locator('[name="name"]').fill('Content review')
  await form.locator('[name="email"]').fill('review@example.com')
  await form.locator('[name="subject"]').fill('Review & inquiry')
  await form.locator('[name="message"]').fill('Test draft only. Do not send.')
  await form.locator('[type="submit"]').click()
  await page.locator('.draft-result').waitFor({ state: 'visible' })
  const mail = await page.locator('.draft-result a').getAttribute('href')
  assert.ok(mail.startsWith('mailto:sale1@matsuda-sangyo.co.th?subject='))
  assert.ok(mail.includes(encodeURIComponent('Review & inquiry')))
  await form.locator('[name="subject"]').fill('Changed draft')
  assert.equal(await page.locator('.draft-result').count(),0)
 }
 await page.goto(base + '/th/awards?page=11', { waitUntil: 'networkidle' })
 assert.equal(await page.locator('.source-warning').count(),1)
 assert.equal(await page.locator('.div-awarded-d a').count(),6)
 assert.ok(!(await page.locator('main').innerText()).includes('Page 11'))
 for (const [from, to] of [['management.php','/en/links'],['company_jp.html','/ja/company'],['career_cn.html','/zh/environment'],['index.html','/th']]) {
  const response = await page.request.get(base + '/' + from, { maxRedirects: 0 })
  assert.equal(response.status(),301)
  assert.equal(response.headers().location,to)
 }
 assert.deepEqual(errors,[])
 const notFound = await page.goto(base+'/en/not-a-page')
 assert.equal(notFound.status(),404)
 console.log('PASS: 28 localized routes, local images, 3 screen widths, mobile menu, language switch, carousel, 404; audit corrections, draft-only feedback and legacy redirects; no console/hydration errors.')
} finally { await browser.close() }
