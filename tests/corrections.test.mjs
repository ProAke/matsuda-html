import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
const read = async path => JSON.parse(await readFile(new URL('../data/'+path,import.meta.url),'utf8'))
const source = async path => readFile(new URL('../'+path,import.meta.url),'utf8')
test('eleven source URLs reviewed; no invented eleven-page collection',async()=>{
 const review=await read('awards-source-review.json')
 assert.equal(review.pages.length,11)
 assert.equal(review.verifiedDocumentCount,6)
 assert.deepEqual(review.pages.map(p=>p.page),Array.from({length:11},(_,i)=>i+1))
 assert.ok(review.pages.slice(1).every(p=>p.documentsFound===0))
 const component=await source('components/AwardsCollection.vue')
 assert.doesNotMatch(component,/Page 1 from 11|Array\.from.*11/)
})
test('missing images restored without unverified business/management copy',async()=>{
 const component=await source('components/CorporatePages.vue')
 assert.match(component,/assets\.group/)
 assert.match(component,/assets\.business\[1\]/)
 assert.doesNotMatch(component,/Management Message|Carbon credit|Green Industry/)
 const assets=await read('assets.json')
 for(const file of [assets.group,...assets.business])await access(new URL('../public'+file,import.meta.url))
})
for(const lang of ['en','th','ja','zh'])test(`${lang}: localized active page content and single-source facts`,async()=>{
 const t=await read(`locales/${lang}.json`)
 assert.equal(t.officeNames.length,2)
 assert.equal(t.officeAddresses.length,2)
 assert.equal(t.businessTypes.length,2)
 assert.equal(t.awardTitles.length,6)
 assert.ok(t.draftNotice && t.privacy && t.documentEnglish && t.backTop)
 if(lang!=='en'){
  assert.notEqual(t.contactHeading,'Contact Information')
  assert.notEqual(t.homeTitle,'For Prosperity And A Beautiful Earth')
  assert.notEqual(t.footerParagraphs[0],(await read('locales/en.json')).footerParagraphs[0])
 }
})
test('official policy documents preserve actual language and images',async()=>{
 const documents=await read('documents.json')
 assert.equal(documents.policies.ja.language,'en')
 assert.equal(documents.policies.zh.language,'en')
 assert.equal(documents.policies.th.language,'th')
 for(const p of Object.values(documents.policies))await access(new URL('../public'+p.src,import.meta.url))
})
test('active pages no longer render imported HTML snapshots',async()=>{
 for(const file of ['components/LegacyHome.vue','components/SiteFooter.vue','pages/[lang]/[[page]].vue']){
  const component=await source(file);assert.doesNotMatch(component,/v-html|useLegacy/)
 }
 const form=await source('components/FeedbackDraft.vue')
 assert.match(form,/@submit.prevent/);assert.match(form,/mailto:/)
 assert.doesNotMatch(form,/fetch\(|localStorage|sessionStorage/)
})
