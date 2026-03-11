import { defineStore } from 'pinia'

function normalizeLanguage(raw) {
  const map = {
    en: 'en',
    km: 'km',
    fr: 'fr',
    zh: 'zh',
    'English (US)': 'en',
    Khmer: 'km',
    French: 'fr',
    Chinese: 'zh',
  }
  return map[raw] || 'en'
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    sidebarOpen: true,
    theme: 'light',
    language: normalizeLanguage(localStorage.getItem('appLanguage')),
  }),
  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    setTheme(theme) {
      this.theme = theme
    },
    setLanguage(language) {
      const normalized = normalizeLanguage(language)
      this.language = normalized
      localStorage.setItem('appLanguage', normalized)
    },
  }
})
