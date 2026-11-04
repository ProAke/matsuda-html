<script setup lang="ts">defineProps<{ error: { statusCode: number } }>()</script>
<template><main class="error-page"><p>MATSUDA SANGYO · THAILAND</p><h1>{{ error.statusCode }}</h1><h2>Page not found / ไม่พบหน้าที่ต้องการ</h2><a class="button" href="/en">Back to home ↗</a></main></template>
