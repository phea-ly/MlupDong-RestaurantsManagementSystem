import { computed } from 'vue'
import { useUiStore } from '@/stores/ui.store'
import { messages } from '@/i18n/messages'

export function useI18n() {
  const ui = useUiStore()

  const locale = computed(() => ui.language || 'en')

  const t = (key) => {
    const lang = locale.value
    return messages[lang]?.[key] ?? messages.en[key] ?? key
  }

  return {
    locale,
    t,
  }
}
