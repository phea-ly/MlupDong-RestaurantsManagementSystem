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
      try {
        await api.post("/logout");
      } catch (e) {
        // continue logout even if API fails
      } finally {
        this.token = null;
        this.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
  },
});
