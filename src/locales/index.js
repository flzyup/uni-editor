import { createI18n } from 'vue-i18n'
import zh from './zh.js'
import en from './en.js'

const STORAGE_KEY = 'uni-editor-language'

// 获取浏览器语言
function getBrowserLanguage() {
  const lang = navigator.language || navigator.userLanguage
  if (lang.startsWith('zh')) {
    return 'zh'
  }
  return 'en'
}

// 获取保存的语言设置
function getSavedLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

// 保存语言设置
export function saveLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // 静默失败
  }
}

// 确定初始语言
const savedLanguage = getSavedLanguage()
const defaultLanguage = savedLanguage || getBrowserLanguage()

const i18n = createI18n({
  legacy: false, // 启用Composition API模式
  locale: defaultLanguage,
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
})

export default i18n