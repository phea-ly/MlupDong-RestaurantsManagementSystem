import { defineStore } from 'pinia'
import * as authApi from '@/api/auth.api'
import {
  saveSession,
  clearSession,
  getSessionUser,
  hasUser,
  getDashboardPathByRole,
} from '@/utils/auth'

export const useAuthStore = defineStore('auth', {

  // ── State ────────────────────────────────────────────────────────────────
  state: () => {
    const session = getSessionUser()
    return {
      user: session?.user ?? null,
      loading: false,
      error: null,
      errors: {},
      hasChecked: false,
    }
  },

  // ── Getters ──────────────────────────────────────────────────────────────
  getters: {
    isAuthenticated: (state) => !!state.user,

    fullName:  (state) => `${state.user?.first_name ?? ''} ${state.user?.last_name ?? ''}`.trim(),
    userEmail: (state) => state.user?.email  ?? '',
    avatar:    (state) => state.user?.avatar ?? null,

    /** Handles all role shapes Laravel may return. */
    role: (state) =>
      state.user?.role?.name      ??
      state.user?.role?.role_name ??
      state.user?.role            ??
      null,

    /** Resolves the correct home route for the current role. */
    dashboardPath() {
      return getDashboardPathByRole(this.role)
    },
  },

  // ── Actions ──────────────────────────────────────────────────────────────
  actions: {

    // ── Private helpers ────────────────────────────────────────────────────

    /** Save user to state and localStorage. No token — cookie handles that. */
    _persist(user) {
      this.user = user
      saveSession(user)
    },

    /** Merge partial data into the user without a full replace. */
    _patchUser(partial = {}) {
      this.user = { ...this.user, ...partial }
      saveSession(this.user)
    },

    /** Wipe all auth state and localStorage. Cookie is cleared by the server. */
    _clearState() {
      this.user       = null
      this.error      = null
      this.errors     = {}
      this.hasChecked = true
      clearSession()
    },

    /** Centralised error setter. */
    _setError(err) {
      this.error  = err?.message ?? 'Something went wrong.'
      this.errors = err?.errors  ?? {}
    },

    // ── Public helpers ─────────────────────────────────────────────────────

    clearError() {
      this.error = null
      this.errors = {}
    },

    clearSession() {
      this.user = null
      this.hasChecked = true
      clearSession()
    },

    async logout() {
      this.clearSession()
      authApi.logoutApi().catch(() => { })
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      this.errors = {}
      try {
        const { data } = await authApi.loginApi({ email, password })

        const user = data.user ?? null
        if (!user) {
          throw { message: 'No user returned from server.', errors: {} }
        }

        this._persist(user)
        this.hasChecked = true

        return data
      } catch (err) {
        this._setError(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async logout() {
      authApi.logoutApi().catch(() => {})
      this._clearState()
    },

    async fetchUser() {
      this.loading = true
      try {
        const { data } = await authApi.fetchApi()
        this._persist(data.user ?? data)
      } catch {
        this._clearState()
      } finally {
        this.loading    = false
        this.hasChecked = true
      }
    },

    async ensureAuthChecked() {
      if (this.hasChecked) return
      if (!hasUser()) {
        this.hasChecked = true
        return
      }
      await this.fetchUser()
    },

    // ── Profile ───────────────────────────────────────────────────────────

    async updateProfile(payload) {
      this.loading = true
      this.error = null
      this.errors = {}
      try {
        const { data } = await authApi.updateApi(payload)
        this._patchUser(data.user ?? data)
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
        this._patchUser(data.user ?? data)
      } catch (err) {
        this._setError(err)
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
        this._patchUser(data.user ?? data)
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