<script setup lang="ts">
defineProps<{ src: string; alt: string; eager?: boolean }>()
const failed = ref(false)
</script>
<template><div class="original-image"><img v-if="!failed" :src="src" :alt="alt" :loading="eager ? 'eager' : 'lazy'" @error="failed = true"><div v-else class="image-unavailable"><span>↗</span><span>{{ alt }}</span></div></div></template>
