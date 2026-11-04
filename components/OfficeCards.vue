<script setup lang="ts">
import site from '~/data/site.json'
const { t } = useContent()
</script>
<template><div class="office-grid"><article v-for="(office,i) in site.offices" :key="office.tel" class="office-card"><span class="eyebrow">0{{ i+1 }} / THAILAND</span><h3>{{ t.officeNames[i] }}</h3><dl><dt>{{ t.address }}</dt><dd>{{ office.address }}</dd><dt>{{ t.phone }}</dt><dd><a :href="`tel:${office.tel}`">{{ office.phone }}</a></dd><dt>{{ t.fax }}</dt><dd>{{ office.fax }}</dd></dl><a class="text-link" :href="office.map" target="_blank" rel="noopener">{{ t.directions }} <span>↗</span></a></article></div></template>
