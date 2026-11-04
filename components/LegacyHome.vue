<script setup lang="ts">
import assets from '~/data/assets.json'
import documents from '~/data/documents.json'
const { t, lang } = useContent()
const slide = ref(0)
const gallery = ref(0)
const visibleGallery = computed(() => Array.from({ length: 3 }, (_, i) => assets.homeGallery[(gallery.value + i) % assets.homeGallery.length]))
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
 if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => { slide.value = (slide.value + 1) % assets.hero.length }, 10000)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>
<template>
<div>
<section class="div-index1" aria-roledescription="carousel" :aria-label="t.legacyHome.title"><div class="native-banner"><img :src="assets.hero[slide]" :alt="t.legacyHome.title" width="1900" height="515" fetchpriority="high"><button class="banner-prev" :aria-label="`${t.slide} ${((slide + 2) % 3) + 1}`" @click="slide = (slide + assets.hero.length - 1) % assets.hero.length"></button><button class="banner-next" :aria-label="`${t.slide} ${((slide + 1) % 3) + 1}`" @click="slide = (slide + 1) % assets.hero.length"></button><div class="banner-dots"><button v-for="(_,i) in assets.hero" :key="i" :class="{ active: slide === i }" :aria-label="`${t.slide} ${i+1}`" :aria-pressed="slide === i" @click="slide = i"></button></div></div></section>
<section class="div-index2"><div class="wrapper2"><div class="l"><h1 class="h-f3">{{ t.homeTitle }}</h1></div><div class="r"><p>{{ t.homeStatement }}</p></div><div class="r2"><p v-for="service in t.homeServices" :key="service">- {{ service }}</p></div></div></section>
<div id="div-index3"><div class="div-index3-1"><div class="wrapper w-index3-1"><img :src="assets.homeDiagram[0]" class="line-index3-1" alt="" loading="lazy"></div><div class="wrapper wrapper-hidden w-index3-2"><img :src="assets.homeDiagram[1]" class="img-index3-1" :alt="t.homeBusinessTitle" loading="lazy"></div></div><div class="div-index3-2"><div class="wrapper wrapper-hidden"><img :src="assets.homeDiagram[2]" class="img-index3-2" :alt="t.homeBusinessTitle" loading="lazy"></div></div><p v-if="lang !== 'en'" class="wrapper document-note">{{ t.imageEnglish }}</p></div>
<section class="div-index4"><div class="d"><div class="wrapper2 business-description"><h2>{{ t.homeBusinessTitle }}</h2><p>{{ t.homeDescription }}</p><div class="native-gallery"><button class="gallery-prev" :aria-label="`${t.slide} ${((gallery + 5) % 6) + 1}`" @click="gallery = (gallery + assets.homeGallery.length - 1) % assets.homeGallery.length"></button><div class="native-gallery-images"><img v-for="(image,i) in visibleGallery" :key="`${gallery}-${i}`" :src="image" :alt="`${t.legacyHome.business} ${((gallery + i) % assets.homeGallery.length) + 1}`" loading="lazy" width="265" height="215"></div><button class="gallery-next" :aria-label="`${t.slide} ${((gallery + 1) % 6) + 1}`" @click="gallery = (gallery + 1) % assets.homeGallery.length"></button></div></div></div><img :src="assets.homeBackground" class="bg-index4" alt="" loading="lazy"></section>
<div class="home-map"><iframe :src="documents.maps.home" :title="t.map" width="100%" height="305" loading="lazy" referrerpolicy="no-referrer"></iframe></div>
</div>
</template>
