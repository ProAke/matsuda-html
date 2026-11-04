<script setup lang="ts">
import { languages, sections } from '~/composables/useContent'
const { t, lang, href } = useContent()
const route = useRoute()
const open = ref(false)
watch(() => route.fullPath, () => open.value = false)
const page = computed(() => String(route.params.page || 'home'))
</script>
<template>
<a class="skip" href="#main">{{ t.skip }}</a>
<div class="topbar"><span>MATSUDA SANGYO GROUP</span><div class="languages"><NuxtLink v-for="l in languages" :key="l.code" :to="`/${l.code}${page === 'home' ? '' : '/' + page}`" :class="{ selected: lang === l.code }" :lang="l.code" :aria-current="lang === l.code ? 'true' : undefined">{{ l.label }}</NuxtLink></div></div>
<header class="header"><NuxtLink :to="href()" class="brand" aria-label="Matsuda Sangyo Thailand"><span class="brand-symbol" aria-hidden="true">M</span><span><strong>MATSUDA SANGYO</strong><small>THAILAND</small></span></NuxtLink><button class="menu-toggle" :aria-expanded="open" aria-controls="navigation" @click="open = !open">{{ t.menu }} ☰</button><nav id="navigation" :class="{ open }" :aria-label="t.menu"><NuxtLink v-for="(s,i) in sections.filter(s => s !== 'links')" :key="s" :to="href(s)" :class="{ active: page === s, 'contact-nav': s === 'contact' }">{{ t.nav[sections.indexOf(s)] }}<span v-if="s === 'contact'"> ↗</span></NuxtLink></nav></header>
</template>
