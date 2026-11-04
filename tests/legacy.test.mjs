import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
const base = new URL('../', import.meta.url)
const read = async path => JSON.parse(await readFile(new URL(path, base), 'utf8'))
function strings(value) { return typeof value === 'string' ? [value] : Object.values(value).flatMap(strings) }
for (const lang of ['en','ja','th','zh']) {
 test(`${lang}: legacy HTML is complete, sanitized and uses local assets`, async () => {
  const content = await read(`data/legacy/${lang}.json`)
  for (const key of ['home','company','links','business','awards','environment','contact','footer','header']) assert.ok(content[key], key)
  assert.equal(content.header.nav.length, 7)
  for (const text of strings(content)) {
   assert.doesNotMatch(text, /<script\b|\son\w+=|javascript:|data-cf|<form\b|<object\b/i)
   assert.doesNotMatch(text, /hi\.matsuda-sangyothailand\.com/)
   for (const match of text.matchAll(/(?:src|href)="(\/legacy\/[^"?#]+)"/g)) await access(new URL(`public${match[1]}`, base))
   assert.doesNotMatch(text, /href="(?!https?:)[^"#]*\.(?:php|html)(?:\?|\")/)
  }
  assert.match(content.footer.html, /mailto:sale1@matsuda-sangyo\.co\.th/)
  assert.equal((content.awards.html.match(/<img/g) || []).length,6)
 })
}
test('manifest and original CSS have no missing local assets', async () => {
 const assets = await read('data/assets.json')
 for (const path of strings(assets).filter(p => p.startsWith('/legacy/'))) await access(new URL('public' + path, base))
 const css = await readFile(new URL('assets/css/legacy-original.css',base),'utf8')
 for (const match of css.matchAll(/url\("(\/legacy\/[^"#]+)"\)/g)) await access(new URL('public' + match[1],base))
})
