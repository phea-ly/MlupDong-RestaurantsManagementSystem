import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import kh from './locales/kh.json'
 
// Detect saved locale or fall back to browser language
const savedLocale = localStorage.getItem('locale')
const browserLocale = navigator.language.split('-')[0]
 
const i18n = createI18n({
  legacy: false,          // Required for <script setup>
  locale: savedLocale || browserLocale || 'kh',
  fallbackLocale: 'en',   // Fall back to English if key is missing
  messages: { en, kh }
})
 
export default i18n
