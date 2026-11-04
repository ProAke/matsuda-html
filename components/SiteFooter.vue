<script setup lang="ts">
import site from '~/data/site.json'
import { sections } from '~/composables/useContent'
const { t, href } = useContent()
const order = ['home', 'company', 'links', 'business', 'awards', 'environment', 'contact']
const toTop = () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
const emailLabels = computed(() => [t.value.businessEmail, t.value.careersEmail, t.value.generalEmail])
</script>
<template><footer><div class="footer"><div class="wrapper2"><div class="d"><div class="r footer-r"><p v-for="paragraph in t.footerParagraphs" :key="paragraph">{{ paragraph }}</p></div><div class="r3 footer-r3"><h3>{{ site.legalName }}</h3><p>{{ t.officeAddresses[0] }}</p><p>{{ t.phone }}: <a :href="`tel:${site.offices[0]!.tel}`">{{ site.offices[0]!.phone }}</a></p><p>{{ t.fax }}: {{ site.offices[0]!.fax }}</p><div v-for="(email,i) in site.emails" :key="email.key" class="footer-email"><p>{{ emailLabels[i] }}</p><a :href="`mailto:${email.address}`">{{ email.address }}</a></div></div></div></div><img src="/legacy/images/bg-footer.png" class="bg-footer" alt="" loading="lazy"></div><div class="footer2"><div class="wrapper2"><p>Copyright ©MATSUDA SANGYO CO.,LTD. {{ t.copyright }}</p><nav :aria-label="t.menu"><ul class="menu-bottom"><li v-for="s in order" :key="s"><NuxtLink :to="href(s)">{{ t.nav[sections.indexOf(s)] }}</NuxtLink></li></ul></nav><div class="clear"></div></div></div><div class="footer3"></div></footer><button id="btn-scroll" :aria-label="t.backTop" @click="toTop"></button></template>
