export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: { head: { title: 'Matsuda Sangyo (Thailand)', meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }] } },
  nitro: { prerender: { crawlLinks: true, routes: ['en', 'ja', 'th', 'zh'].flatMap(lang => ['','/company','/business','/awards','/environment','/links','/contact'].map(page => `/${lang}${page}`)) } },
  vite: { server: { allowedHosts: true } }
})
