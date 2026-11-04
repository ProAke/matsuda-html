<script setup lang="ts">
const legacy = useLegacy()
const { t, href } = useContent()
const order = ['home', 'company', 'links', 'business', 'awards', 'environment', 'contact']
const toTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
</script>
<template><footer><div v-html="legacy.footer.html"></div><div class="footer2"><div class="wrapper2"><p>Copyright ©MATSUDA SANGYO CO.,LTD. {{ t.copyright }}</p><nav :aria-label="t.menu"><ul class="menu-bottom"><li v-for="(s,i) in order" :key="s"><NuxtLink :to="href(s)">{{ legacy.header.nav[i] }}</NuxtLink></li></ul></nav><div class="clear"></div></div></div><div class="footer3"></div></footer><button id="btn-scroll" aria-label="Back to top" @click="toTop"></button></template>
