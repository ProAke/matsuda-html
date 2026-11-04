import en from '~/data/legacy/en.json'
import th from '~/data/legacy/th.json'
import ja from '~/data/legacy/ja.json'
import zh from '~/data/legacy/zh.json'
export function useLegacy() {
  const { lang } = useContent()
  const content = { en, th, ja, zh }
  return computed(() => content[lang.value as keyof typeof content] || en)
}
