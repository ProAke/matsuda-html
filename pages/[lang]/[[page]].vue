<script setup lang="ts">
import assets from '~/data/assets.json'
import site from '~/data/site.json'
import { sections, languages } from '~/composables/useContent'
definePageMeta({ validate: route => languages.some(l => l.code === route.params.lang) && (!route.params.page || sections.includes(String(route.params.page))) })
const { t, lang } = useContent()
const legacy = useLegacy()
const route = useRoute()
const page = computed(() => String(route.params.page || 'home'))
const title = computed(() => t.value.nav[sections.indexOf(page.value)])
const innerHtml = computed(() => {
 const data = legacy.value[page.value as keyof typeof legacy.value]
 return data && 'html' in data ? data.html : ''
})
useHead(() => ({ htmlAttrs: { lang: lang.value }, bodyAttrs: { class: { ja: 'jp', zh: 'cn', th: 'th', en: 'en' }[lang.value] || 'en' }, title: `${title.value} | ${site.legalName}` }))
useSeoMeta({ description: () => t.value.description, ogTitle: () => `${title.value} | Matsuda Sangyo Thailand`, ogDescription: () => t.value.description, ogImage: assets.hero[0] })
</script>
<template><div class="site"><SiteHeader /><main id="main"><LegacyHome v-if="page === 'home'" /><div v-else class="legacy-content" v-html="innerHtml"></div></main><SiteFooter /></div></template>
