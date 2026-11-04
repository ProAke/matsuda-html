<script setup lang="ts">
import site from '~/data/site.json'
import { sections } from '~/composables/useContent'
const { t, href } = useContent()
</script>
<template><section class="contact-band"><div><span class="eyebrow">MATSUDA SANGYO · THAILAND</span><h2>{{ t.contactTitle }}</h2><p>{{ t.contactText }}</p></div><NuxtLink class="button light" :to="href('contact')">{{ t.contactButton }} <span>↗</span></NuxtLink></section><footer><div class="footer-main"><div><div class="footer-brand">MATSUDA SANGYO<span>THAILAND</span></div><p>{{ site.legalName }}</p><p>{{ site.offices[0].address }}</p></div><div class="footer-links"><NuxtLink v-for="(s,i) in sections" :key="s" :to="href(s)">{{ t.nav[i] }}</NuxtLink></div></div><div class="footer-bottom"><span>© {{ new Date().getFullYear() }} MATSUDA SANGYO CO., LTD. {{ t.copyright }}</span><span>RESOURCES FOR THE FUTURE.</span></div></footer></template>
