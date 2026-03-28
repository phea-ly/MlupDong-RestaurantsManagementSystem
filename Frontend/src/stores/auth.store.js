import { defineStore } from 'pinia'
import * as authApi from '@/api/auth.api'

export const useAuthStore = defineStore('auth', {

  state: () => ({
    user: null,   // null = not loaded, {} = loaded but empty
    loading: false,
    hasChecked: false,
    error: null,
    errors: {},
  }),

  getters: {
    // ← the source of truth for all auth checks
    isAuthenticated: (state) => !!state.user && !!localStorage.getItem('token'),
  },

  actions: {

    clearSession() {
      this.user = null
      this.hasChecked = false
      this.error = null
      this.errors = {}
      localStorage.removeItem('token')
    },

    async logout() {
      authApi.logoutApi().catch(() => { })
      this.clearSession()              // ← moved after API call, token removed inside
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      this.errors = {}
      try {
        const { data } = await authApi.loginApi({ email, password })
        if (data?.token) {
          localStorage.setItem('token', data.token)
        }
        if (data?.user) {
          this.user = data.user        // ← store user right after login too
        }
        this.hasChecked = true
        return data
      } catch (err) {
        this.error = err.message
        this.errors = err.errors ?? {}
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      this.loading = true
      try {
        const { data } = await authApi.fetchMeApi()
        this.user = data.user
      } catch {
        this.user = null               // ← clear on failure so isAuthenticated = false
      } finally {
        this.loading = false
        this.hasChecked = true
      }
    },

    async updateProfile(payload) {
      this.loading = true
      this.error = null
      this.errors = {}
      try {
        const { data } = await authApi.updateApi(payload)
        if (data?.user) this.user = data.user   // ← sync updated user to store
      } catch (err) {
        this.error = err.message ?? 'Failed to update profile.'
        this.errors = err.errors ?? {}
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateAvatar(payload) {
      this.loading = true
      this.error = null
      try {
        const { data } = await authApi.putApi('/user/avatar', payload)
        if (data?.user) this.user = data.user   // ← sync avatar to store
      } catch (err) {
        this.error = err.message ?? 'Failed to update avatar.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateEmail(payload) {
      this.loading = true
      this.error = null
      this.errors = {}
      try {
        const { data } = await authApi.putApi('/user/email', payload)
        if (data?.user) this.user = data.user   // ← sync email to store
      } catch (err) {
        this.error = err.message ?? 'Failed to update email.'
        this.errors = err.errors ?? {}
        throw err
      } finally {
        this.loading = false
      }
    },

    async updatePassword(payload) {
      this.loading = true
      this.error = null
      this.errors = {}
      try {
        await authApi.updatePasswordApi(payload)
      } catch (err) {
        this.error = err.message ?? 'Failed to update password.'
        this.errors = err.errors ?? {}
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})