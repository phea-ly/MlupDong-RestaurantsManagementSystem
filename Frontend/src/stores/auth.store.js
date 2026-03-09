// src/stores/auth.store.js   ← must match the import path
import { defineStore } from "pinia";
import api from "@/plugins/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) ?? null,
    token: localStorage.getItem("token") ?? null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email, password) {
      const { data } = await api.post("/login", { email, password });

      if (!data.token) throw new Error("No token received");

      this.token = data.token;
      this.user = data.user ?? null;

      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
    },
    async logout() {
      // Clear state immediately — don't wait for API
      this.token = null;
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Call API in background — we don't care about the response
      api.post("/logout").catch(() => {});
    },
    async updateProfile(data) {
      const response = await api.put("/user", data);
      this.user = { ...this.user, ...response.data.user };
      localStorage.setItem("user", JSON.stringify(this.user));
    },
  },
});
