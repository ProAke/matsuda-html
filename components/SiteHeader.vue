<script setup lang="ts">
import { languages, sections } from '~/composables/useContent'
const order = ['home', 'company', 'links', 'business', 'awards', 'environment', 'contact']
const { t, lang, href } = useContent()
const route = useRoute()
const open = ref(false)
watch(() => route.fullPath, () => open.value = false)
const page = computed(() => String(route.params.page || 'home'))
</script>
<template>
<a class="skip" href="#main">{{ t.skip }}</a>
<div id="empty-header"></div>
<header class="header" id="header"><div class="wrapper">
<NuxtLink :to="href()" class="logo" aria-label="Matsuda Sangyo Thailand"></NuxtLink>
<ul class="menu-top2"><li v-for="(l,i) in languages" :key="l.code"><span v-if="i" class="language-separator">/</span><NuxtLink :to="`/${l.code}${page === 'home' ? '' : '/' + page}`" :class="{ linked: lang === l.code }" :lang="l.code" :aria-current="lang === l.code ? 'true' : undefined">{{ l.label }}</NuxtLink></li></ul>
<button class="menu-toggle" :aria-expanded="open" aria-controls="navigation" @click="open = !open">{{ t.menu }} ☰</button>
<nav :aria-label="t.menu" id="navigation" :class="{ open }"><ul class="menu-top"><li v-for="s in order" :key="s"><NuxtLink :to="href(s)" @click="open = false" :class="{ linked: page === s }" :aria-current="page === s ? 'page' : undefined">{{ t.nav[sections.indexOf(s)] }}</NuxtLink></li></ul></nav><div class="clear"></div>
</div></header>
</template>
