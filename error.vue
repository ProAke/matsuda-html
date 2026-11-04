<script setup lang="ts">
defineProps<{ error: { statusCode: number } }>()
const { t, lang } = useContent()
useHead(() => ({ htmlAttrs: { lang: lang.value } }))
</script>
<template><main class="error-page"><p>MATSUDA SANGYO · THAILAND</p><h1>{{ error.statusCode }}</h1><h2>{{ t.notFound }}</h2><a class="button" :href="`/${['en','th','ja','zh'].includes(lang) ? lang : 'en'}`">{{ t.backHome }} ↗</a></main></template>
