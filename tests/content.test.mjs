import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const read = async path => JSON.parse(await readFile(new URL('../data/' + path, import.meta.url), 'utf8'))
const english = await read('locales/en.json')
for (const lang of ['en','ja','th','zh']) test(`${lang}: complete translation keys and array lengths`, async () => {
 const content = await read(`locales/${lang}.json`)
 assert.deepEqual(Object.keys(content).sort(), Object.keys(english).sort())
 for (const key of Object.keys(english)) {
  assert.equal(typeof content[key], typeof english[key])
  if (Array.isArray(english[key])) assert.equal(content[key].length, english[key].length)
  assert.ok(Array.isArray(content[key]) ? content[key].every(v => typeof v === 'string' && v.trim()) : content[key].trim())
 }
})
test('original image manifest and office information', async () => {
 const assets = await read('assets.json')
 assert.equal(assets.hero.length, 3)
 assert.equal(assets.services.length, 3)
 assert.equal(assets.awards.length, 6)
 const site = await read('site.json')
 assert.equal(site.offices.length, 2)
 for (const office of site.offices) assert.match(office.tel, /^\+66\d+$/)
})
