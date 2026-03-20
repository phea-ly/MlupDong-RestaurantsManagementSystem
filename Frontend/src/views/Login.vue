<script>
import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth.store";

export const useLoginStore = defineStore("login", () => {
  const auth = useAuthStore();

  const email    = ref("");
  const password = ref("");
  const error    = ref("");
  const loading  = ref(false);
  const showPass = ref(false);
  const remember = ref(false);

  function clearError() {
    error.value = "";
  }

  function toggleShowPass() {
    showPass.value = !showPass.value;
  }

  async function login(router) {
    error.value   = "";
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
        if (msg.includes("email"))         error.value = "Email address not found.";
        else if (msg.includes("password")) error.value = "Incorrect password.";
        else                               error.value = "Invalid credentials.";
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
</script>

<script setup>
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const router     = useRouter();
const loginStore = useLoginStore();

const { email, password, error, loading, showPass, remember } = storeToRefs(loginStore);

const login          = () => loginStore.login(router);
const clearError     = loginStore.clearError;
const toggleShowPass = loginStore.toggleShowPass;
</script>

<template>
  <v-app>
    <v-main class="login-bg">
      <div class="bg-image" />
      <div class="bg-overlay" />

      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" sm="8" md="5" lg="4" xl="3">

            <v-card class="glass-card" rounded="xl" elevation="0">
              <v-card-text class="pa-8">

                <!-- Brand -->
                <div class="d-flex flex-column align-center ga-3 mb-6">
                  <v-avatar size="44" rounded="lg" style="background:linear-gradient(135deg,var(--app-primary),var(--app-primary-600)); box-shadow:0 4px 14px rgba(15,158,95,0.4);">
                    <span style="font-size:17px; font-weight:900; color:#063824;">M</span>
                  </v-avatar>
                  <div class="text-center">
                    <div class="text-subtitle-2 font-weight-black" style="color:#fff">Mlup Dong</div>
                    <div class="text-caption font-weight-bold text-uppercase" style="color:rgba(255,255,255,0.6); letter-spacing:0.1em">Restaurant Management</div>
                  </div>
                </div>

                <div class="login-title mb-1">Sign In</div>
                <div class="login-sub mb-6">Welcome back! Please enter your credentials.</div>

                <v-alert
                  v-if="error"
                  type="error" variant="tonal" rounded="lg" density="compact" closable
                  class="mb-4"
                  @click:close="clearError"
                >
                  {{ error }}
                </v-alert>

                <v-text-field
                  v-model="email"
                  placeholder="Email address"
                  type="email"
                  append-inner-icon="mdi-account-outline"
                  variant="outlined" rounded="lg" density="comfortable"
                  class="glass-field mb-3"
                  hide-details="auto"
                  @keyup.enter="login"
                />

                <v-text-field
                  v-model="password"
                  placeholder="Password"
                  :type="showPass ? 'text' : 'password'"
                  :append-inner-icon="showPass ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                  variant="outlined" rounded="lg" density="comfortable"
                  class="glass-field mb-3"
                  hide-details="auto"
                  @click:append-inner="toggleShowPass"
                  @keyup.enter="login"
                />

                <v-checkbox
                  v-model="remember"
                  label="Remember me"
                  color="var(--app-primary)"
                  density="compact"
                  hide-details
                  class="mb-5"
                />

                <v-btn
                  block size="large" rounded="lg"
                  :loading="loading"
                  class="login-btn mb-5"
                  @click="login"
                >
                  Sign In
                </v-btn>

                <v-divider class="mb-4" style="border-color:rgba(255,255,255,0.15)" />

                <div class="text-center text-caption" style="color:rgba(255,255,255,0.45)">
                  Powered by <em><strong style="color:rgba(255,255,255,0.7)">Mlup Dong</strong></em>
                </div>

              </v-card-text>
            </v-card>

          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Manrope:wght@400;600;700;800&display=swap");

.login-bg {
  font-family: "Manrope", sans-serif;
  position: relative;
  min-height: 100vh;
}

.bg-image {
  position: fixed; inset: 0; z-index: 0;
  background: url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=90") center / cover no-repeat;
  animation: slow-zoom 20s ease-in-out infinite alternate;
}
@keyframes slow-zoom {
  from { transform: scale(1);    }
  to   { transform: scale(1.06); }
}

.bg-overlay {
  position: fixed; inset: 0; z-index: 1;
  background: linear-gradient(170deg, rgba(6,30,18,.45) 0%, rgba(10,80,50,.38) 50%, rgba(6,20,12,.55) 100%);
}

.v-container { position: relative; z-index: 2; }

.glass-card {
  background: rgba(255,255,255,0.12) !important;
  backdrop-filter: blur(22px) saturate(1.4);
  -webkit-backdrop-filter: blur(22px) saturate(1.4);
  border: 1px solid rgba(255,255,255,0.22) !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.18) inset !important;
  animation: rise .6s cubic-bezier(.16,1,.3,1) both;
}
@keyframes rise {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0);    }
}

.login-title { font-family: "Playfair Display", serif; font-size: 32px; font-weight: 700; color: #fff; }
.login-sub   { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; }

.glass-field :deep(.v-field)           { background: rgba(255,255,255,0.12) !important; border: 1px solid rgba(255,255,255,0.25) !important; }
.glass-field :deep(.v-field__outline)  { display: none; }
.glass-field :deep(input)              { color: #fff !important; font-family: "Manrope", sans-serif; font-weight: 500; }
.glass-field :deep(input::placeholder) { color: rgba(255,255,255,0.55) !important; }
.glass-field :deep(.v-icon)            { color: rgba(255,255,255,0.6) !important; }

:deep(.v-checkbox .v-label) { color: rgba(255,255,255,0.85) !important; font-size: 13.5px; font-weight: 600; }

.login-btn {
  background: linear-gradient(135deg, var(--app-primary), var(--app-primary-600)) !important;
  color: #063824 !important; font-weight: 800 !important; font-size: 15px !important;
  box-shadow: 0 6px 22px rgba(15,158,95,0.45) !important;
  transition: transform .15s, box-shadow .15s !important;
}
.login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(15,158,95,0.55) !important; }
</style>