import { defineStore } from 'pinia'
import * as authApi    from '@/api/auth.api'
import {
  saveSession,
  clearSession,
  getSessionUser,
} from '../utils/auth'

export const useAuthStore = defineStore('auth', {

  state: () => {
    const session = getSessionUser()
    return {
      user:    session?.user  ?? null,
      loading: false,
      error:   null,
      errors:  {},
      hasChecked: false,
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    fullName:        (state) => `${state.user?.first_name ?? ''} ${state.user?.last_name ?? ''}`.trim(),
    userEmail:       (state) => state.user?.email ?? '',
    avatar:          (state) => state.user?.avatar ?? null,
    role:            (state) => state.user?.role   ?? null,
  },

  actions: {

    _persistUser(user) {
      this.user  = user
      saveSession({ user })
    },

    _patchUser(partial = {}) {
      this.user = { ...this.user, ...partial }
      saveSession({ user: this.user })
    },

    clearError() {
      this.error  = null
      this.errors = {}
    },

    clearSession() {
      this.user  = null
      this.hasChecked = true
      clearSession()
    },

    async logout() {
      this.clearSession()
      authApi.logoutApi().catch(() => {})
    },

    async login(email, password) {
      this.loading = true
      this.error   = null
      this.errors  = {}
      try {
        const { data } = await authApi.loginApi({ email, password })
        this._persistUser(data.user ?? null)
        this.hasChecked = true
        return data
      } catch (err) {
        this.error  = err.message
        this.errors = err.errors ?? {}
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchUser() {
      this.loading = true
      try {
        const { data } = await authApi.fetchApi()
        this._persistUser(data.user ?? data)
      } catch {
        // 401 is handled by the axios interceptor (clears session + redirects)
      } finally {
        this.loading = false
        this.hasChecked = true
      }
    },

    async ensureAuthChecked() {
      if (this.hasChecked) return
      await this.fetchUser()
    },

    async updateProfile(payload) {
      this.loading = true
      this.error   = null
      this.errors  = {}
      try {
        const { data } = await authApi.updateApi(payload)
        this._patchUser(data.user ?? data)
      } catch (err) {
        this.error  = err.message ?? 'Failed to update profile.'
        this.errors = err.errors  ?? {}
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateAvatar(payload) {
      this.loading = true
      this.error   = null
      try {
        const { data } = await authApi.putApi('/user/avatar', payload)
        this._patchUser(data.user ?? data)
      } catch (err) {
        this.error = err.message ?? 'Failed to update avatar.'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateEmail(payload) {
      this.loading = true
      this.error   = null
      this.errors  = {}
      try {
        const { data } = await authApi.putApi('/user/email', payload)
        this._patchUser(data.user ?? data)
      } catch (err) {
        this.error  = err.message ?? 'Failed to update email.'
        this.errors = err.errors  ?? {}
        throw err
      } finally {
        this.loading = false
      }
    },

    async updatePassword(payload) {
      this.loading = true
      this.error   = null
      this.errors  = {}
      try {
        await authApi.updatePasswordApi(payload)
      } catch (err) {
        this.error  = err.message ?? 'Failed to update password.'
        this.errors = err.errors  ?? {}
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
