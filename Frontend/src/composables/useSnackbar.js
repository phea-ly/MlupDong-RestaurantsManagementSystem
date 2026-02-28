import { useUiStore } from '@/stores/ui.store'

export function useSnackbar() {
  const ui = useUiStore()

  const show = (message, color = 'success') => {
    ui.showSnackbar(message, color)
  }

  return { show }
}