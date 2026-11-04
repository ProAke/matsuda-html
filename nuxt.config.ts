export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  routeRules: {
    '/**': { headers: { 'cache-control': 'no-store, no-cache, must-revalidate', 'x-matsuda-design': 'original-html-v2' } },
    '/': { redirect: '/th?preview=original-html-v2', prerender: false },
    '/_nuxt/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/legacy/**': { headers: { 'cache-control': 'public, max-age=86400' } }
  },
  css: ['~/assets/css/legacy-original.css', '~/assets/css/main.css'],
  app: { head: { title: 'Matsuda Sangyo (Thailand)', meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }] } },
  nitro: { prerender: { crawlLinks: true, routes: ['en', 'ja', 'th', 'zh'].flatMap(lang => ['','/company','/business','/awards','/environment','/links','/contact'].map(page => `/${lang}${page}`)) } },
  vite: { server: { allowedHosts: true } }
})
