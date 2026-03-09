import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    async login(email, password) {
      this.user = { email: credentials.email }
      this.token = 'fake-token'
    },
    logout() {
      this.user = null
      this.token = null
    }
  }
})