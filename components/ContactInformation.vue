<script setup lang="ts">
import site from '~/data/site.json'
import documents from '~/data/documents.json'
const { t } = useContent()
</script>
<template><div class="div-contactus1"><iframe :src="documents.maps.contact" :title="t.map" width="100%" height="305" loading="lazy" referrerpolicy="no-referrer"></iframe></div><section class="div-contactus2"><div class="wrapper"><h1>{{ t.contactHeading }}</h1><section v-for="(office,i) in site.offices" :key="office.tel" :class="i === 0 ? 'l' : 'l2'"><h2>{{ t.officeNames[i] }}</h2><p>{{ t.officeZones[i] }}</p><p>{{ t.officeAddresses[i] }}</p><p>{{ t.phone }}: <a :href="`tel:${office.tel}`">{{ office.phone }}</a></p><p>{{ t.fax }}: {{ office.fax }}</p></section><div class="r"><a v-for="map in documents.contactMaps" :key="map.src" :href="map.src" target="_blank" rel="noopener noreferrer" :title="`${t.map}: ${t.officeNames[map.office]}`"><img :src="map.thumbnail" :alt="`${t.map}: ${t.officeNames[map.office]}`" loading="lazy"></a></div></div></section><FeedbackDraft /></template>
