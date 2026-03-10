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
        form.append("avatar",   payload.avatar);
        form.append("_method",  "PUT");

        response = await api.post("/user", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.put("/user", payload);
      }

      const serverUser = response.data.user ?? {};
      let newAvatar = this.user?.avatar ?? null;

      if (serverUser.avatar) {
        newAvatar = serverUser.avatar;
      } else if (serverUser.profile) {
        const base = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "";
        newAvatar = `${base}/storage/${serverUser.profile}?t=${Date.now()}`;
      }
      const updatedUser = {
        ...this.user,
        ...serverUser,
        avatar: newAvatar,
      };

      this.user = updatedUser;

      const forStorage = { ...updatedUser, avatar: newAvatar?.split("?t=")[0] ?? null };
      localStorage.setItem("user", JSON.stringify(forStorage));
    },

    async updatePassword(payload) {
      await api.put("/user/password", payload);
    },
  },
});