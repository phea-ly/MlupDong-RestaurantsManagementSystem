import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    snackbar: {
      show: false,
      message: '',
      color: 'success'
    }
  }),
  actions: {
    showSnackbar(message, color) {
      this.snackbar = { show: true, message, color }
    }
  }
})