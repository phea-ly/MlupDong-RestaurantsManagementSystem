import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth.store";

export const useLoginStore = defineStore("login", () => {
  const auth = useAuthStore();

  const email = ref("");
  const password = ref("");
  const error = ref("");
  const loading = ref(false);
  const showPass = ref(false);
  const remember = ref(false);

  function clearError() {
    error.value = "";
  }

  function toggleShowPass() {
    showPass.value = !showPass.value;
  }

  async function login(router) {
    error.value = "";
    loading.value = true;
    try {
      await auth.login(email.value, password.value);
      await router.replace("/home");
    } catch (e) {
      if (e.response?.status === 422) {
        const errors = e.response.data.errors;
        error.value = errors
          ? Object.values(errors).map((msg) => msg[0]).join(" ")
          : e.response.data.message;
      } else if (e.response?.status === 401) {
        const msg = e.response?.data?.message?.toLowerCase() ?? "";
        if (msg.includes("email")) error.value = "Email address not found.";
        else if (msg.includes("password")) error.value = "Incorrect password.";
        else error.value = "Invalid credentials.";
      } else {
        error.value = e.message || "Something went wrong. Please try again.";
      }
    } finally {
      loading.value = false;
    }
  }

  return {
    email,
    password,
    error,
    loading,
    showPass,
    remember,
    clearError,
    toggleShowPass,
    login,
  };
});
