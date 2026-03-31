import { defineStore } from "pinia";
import * as authApi from "@/api/auth.api";
import {
  saveSession,
  clearSession,
  getSessionUser,
  hasUser,
  getDashboardPathByRole,
} from "@/utils/auth";

export const useAuthStore = defineStore("auth", {
  state: () => {
    const session = getSessionUser();
    return {
      user: session?.user ?? null,
      loading: false,
      error: null,
      errors: {},
      hasChecked: false,
    };
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    fullName: (state) =>
      `${state.user?.first_name ?? ""} ${state.user?.last_name ?? ""}`.trim(),
    userEmail: (state) => state.user?.email ?? "",
    avatar: (state) => state.user?.avatar ?? null,
    role: (state) => state.user?.role_name ?? null,

    dashboardPath: (state) => {
      const role = state.user?.role_name ?? null;

      if (!role) return "/login";

      switch (role.toLowerCase()) {
        case "admin":
          return "/home/admin-dashboard";
        case "waiter":
        case "cashier":
        case "staff":
          return "/waiter";
        case "chef":
        case "cheff":
          return "/chef";
        default:
          return "/login";
      }
    },
  },

  actions: {
    _persist(user) {
      this.user = user;
      saveSession(user);
    },

    _patchUser(partial = {}) {
      this.user = { ...this.user, ...partial };
      saveSession(this.user);
    },

    _clearState() {
      this.user = null;
      this.error = null;
      this.errors = {};
      this.hasChecked = true;
      clearSession();
    },

    _setError(err) {
      this.error = err?.message ?? "Something went wrong.";
      this.errors = err?.errors ?? {};
    },

    clearError() {
      this.error = null;
      this.errors = {};
    },

    clearSession() {
      this.user = null;
      this.hasChecked = true;
      clearSession();
    },

    // ✅ Fixed — duplicate logout removed, only one remains
    async logout() {
      authApi.logoutApi().catch(() => {});
      this._clearState();
    },

    async login(email, password) {
      this.loading = true;
      this.error = null;
      this.errors = {};
      try {
        const { data } = await authApi.loginApi({ email, password });

        const user = data.user ?? null;
        if (!user) {
          throw { message: "No user returned from server.", errors: {} };
        }

        this._persist(user);
        this.hasChecked = true;
        return data;
      } catch (err) {
        this.error = err.message;
        this.errors = err.errors ?? {};
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser() {
      this.loading = true;
      try {
        const { data } = await authApi.fetchApi();
        this._persist(data.user ?? data);
      } catch {
        this._clearState();
      } finally {
        this.loading = false;
        this.hasChecked = true;
      }
    },

    async ensureAuthChecked() {
      if (this.hasChecked) return; // ← login sets hasChecked = true, so this returns immediately
      if (!hasUser()) {
        this.hasChecked = true;
        return;
      }
      await this.fetchUser();
    },

    async updateProfile(payload) {
      this.loading = true;
      this.error = null;
      this.errors = {};
      try {
        const { data } = await authApi.updateApi(payload);
        this._patchUser(data.user ?? data);
      } catch (err) {
        this.error = err.message ?? "Failed to update profile.";
        this.errors = err.errors ?? {};
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateAvatar(payload) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await authApi.putApi("/user/avatar", payload);
        this._patchUser(data.user ?? data);
      } catch (err) {
        this._setError(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateEmail(payload) {
      this.loading = true;
      this.error = null;
      this.errors = {};
      try {
        const { data } = await authApi.putApi("/user/email", payload);
        this._patchUser(data.user ?? data);
      } catch (err) {
        this.error = err.message ?? "Failed to update email.";
        this.errors = err.errors ?? {};
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updatePassword(payload) {
      this.loading = true;
      this.error = null;
      this.errors = {};
      try {
        await authApi.updatePasswordApi(payload);
      } catch (err) {
        this.error = err.message ?? "Failed to update password.";
        this.errors = err.errors ?? {};
        throw err;
      } finally {
        this.loading = false;
      }
    },
  },
});
