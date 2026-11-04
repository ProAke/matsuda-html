import en from '~/data/locales/en.json'
import th from '~/data/locales/th.json'
import ja from '~/data/locales/ja.json'
import zh from '~/data/locales/zh.json'
export const languages = [{ code: 'en', label: 'ENG' }, { code: 'ja', label: '日本語' }, { code: 'th', label: 'ไทย' }, { code: 'zh', label: '中文' }]
export const sections = ['home', 'company', 'business', 'awards', 'environment', 'links', 'contact']
export function useContent() {
 const route = useRoute()
 const lang = computed(() => String(route.params.lang || 'en'))
 const dictionaries = { en, th, ja, zh }
 const t = computed(() => dictionaries[lang.value as keyof typeof dictionaries] || en)
 const href = (page = 'home') => `/${lang.value}${page === 'home' ? '' : '/' + page}`
 return { lang, t, href }
}
