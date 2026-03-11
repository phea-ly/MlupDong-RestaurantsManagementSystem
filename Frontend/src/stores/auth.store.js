// src/stores/auth.store.js
import { defineStore } from "pinia";
import api from "@/plugins/axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user:  JSON.parse(localStorage.getItem("user")) ?? null,
    token: localStorage.getItem("token")            ?? null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(email, password) {
      const { data } = await api.post("/login", { email, password });
      if (!data.token) throw new Error("No token received");

      this.token = data.token;
      this.user  = data.user ?? null;

      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
    },

    async logout() {
      this.token = null;
      this.user  = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      api.post("/logout").catch(() => {});
    },

    // Instantly show local preview in AppBar while upload is in-flight
    patchAvatar(avatarUrl) {
      if (!this.user) return;
      this.user = { ...this.user, avatar: avatarUrl };
    },

    async updateProfile(payload) {
      let response;

      if (payload.avatar instanceof File) {
        const form = new FormData();
        if (payload.first_name) form.append("first_name", payload.first_name);
        if (payload.last_name)  form.append("last_name",  payload.last_name);
        form.append("avatar",  payload.avatar);
        form.append("_method", "PUT"); // ✅ Laravel method spoofing

        // ✅ FIXED: was "/user/update" — correct route is "/user"
        response = await api.post("/user", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // ✅ FIXED: was "/user/update" — correct route is "/user"
        response = await api.put("/user", payload);
      }

      const serverUser = response.data.user ?? {};

      const updatedUser = {
        ...this.user,
        ...serverUser,
        avatar: serverUser.avatar ?? this.user?.avatar ?? null,
      };

      this.user = updatedUser;
      localStorage.setItem("user", JSON.stringify(updatedUser));
    },

    async updatePassword(payload) {
      await api.put("/user/password", payload);
    },
  },
});