<script setup lang="ts">
import assets from '~/data/assets.json'
const { t } = useContent()
const route = useRoute()
const sourcePageUnverified = computed(() => !!(route.query.sourcePage || route.query.page) && String(route.query.sourcePage || route.query.page) !== '1')
</script>
<template><section class="div-awarded"><div class="wrapper2"><div class="d"><h1 class="topic">{{ t.nav[3] }}</h1><p class="awards-count">{{ t.availableDocuments }}: {{ assets.awards.length }}</p><ClientOnly><p v-if="sourcePageUnverified" class="source-warning" role="status">{{ t.sourcePending }}</p></ClientOnly><div class="div-awarded-d"><a v-for="(award,i) in assets.awards" :key="award.src" class="hpl-list-1" :href="award.src" target="_blank" rel="noopener noreferrer" :title="`${t.originalDocument}: ${award.title}`"><img :src="award.src.replace('/awards/', '/awards/tmp_')" :alt="t.awardTitles[i]" loading="lazy"></a></div></div></div></section></template>
