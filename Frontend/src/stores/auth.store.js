import { defineStore } from 'pinia'
import * as authApi    from '@/api/auth.api'
import {
  saveSession,
  clearSession,
  getSessionUser,
  isAuthenticated,
} from '@/utils/auth'

export const useAuthStore = defineStore('auth', {

  // ── State ─────────────────────────────────────────────────────────────────
  state: () => {
    const session = getSessionUser()
    return {
      user:    session?.user  ?? null,
      token:   session?.token ?? null,
      loading: false,
      error:   null,
      errors:  {},
    }
  },

  // ── Getters ───────────────────────────────────────────────────────────────
  getters: {
    isAuthenticated: (state) => !!state.token,
    fullName:        (state) => state.user?.name  ?? '',
    userEmail:       (state) => state.user?.email ?? '',
    avatar:          (state) => state.user?.avatar ?? null,
    role:            (state) => state.user?.role   ?? null,
  },

  // ── Actions ───────────────────────────────────────────────────────────────
  actions: {

    // ── Private helpers ────────────────────────────────────────────────────
    _persist(token, user) {
      this.token = token
      this.user  = user
      saveSession({ token, user })
    },

    _patchUser(partial = {}) {
      this.user = { ...this.user, ...partial }
      saveSession({ token: this.token, user: this.user })
    },

    clearError() {
      this.error  = null
      this.errors = {}
    },

    // ── clearSession — local wipe only, no HTTP call ───────────────────────
    clearSession() {
      this.token = null
      this.user  = null
      clearSession()
    },

    // ── logout — wipe locally + notify server ─────────────────────────────
    async logout() {
      this.clearSession()
      authApi.logoutApi().catch(() => {})   
    },

    // ── login ──────────────────────────────────────────────────────────────
    async login(email, password) {
      this.loading = true
      this.error   = null
      this.errors  = {}
      try {
        const { data } = await authApi.loginApi({ email, password })

        if (!data.token) throw new Error('No token received from server.')

        this._persist(data.token, data.user ?? null)
        return data
      } catch (err) {
        this.error  = err.message
        this.errors = err.errors ?? {}
        throw err
      } finally {
        this.loading = false
      }
    },

    // ── fetchUser — call on app mount to verify token still valid ──────────
    async fetchUser() {
      if (!this.token) return
      this.loading = true
      try {
        const { data } = await authApi.fetchApi()
        this._patchUser(data)
      } catch {
        // 401 is handled by the axios interceptor (clears session + redirects)
      } finally {
        this.loading = false
      }
    },

    // ── Profile updates ────────────────────────────────────────────────────
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