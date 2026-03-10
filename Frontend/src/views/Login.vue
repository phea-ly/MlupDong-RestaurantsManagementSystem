<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { useI18n } from "@/composables/useI18n";

const auth = useAuthStore();
const router = useRouter();
const { t } = useI18n();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const showPass = ref(false);
const remember = ref(false);

async function login() {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    await router.replace("/home");
  } catch (e) {
    if (e.response?.status === 422) {
      const errors = e.response.data.errors;
      error.value = errors
        ? Object.values(errors)
            .map((e) => e[0])
            .join(" ")
        : e.response.data.message;
    } else if (e.response?.status === 401) {
      const msg = e.response?.data?.message?.toLowerCase() ?? "";
      if (msg.includes("email"))
        error.value = t("login.emailNotFound");
      else if (msg.includes("password"))
        error.value = t("login.incorrectPassword");
      else error.value = t("login.invalidCredentials");
    } else {
      error.value = e.message || t("login.somethingWrong");
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-app>
    <v-main class="login-page">
      <!-- Full-page background food image -->
      <div class="bg-image" />
      <div class="bg-overlay" />

      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" sm="8" md="5" lg="4" xl="3">
            <!-- Glassmorphism card -->
            <v-card class="glass-card pa-8" rounded="xl" elevation="0">

              <!-- Brand logo - centered -->
              <div class="d-flex flex-column align-center ga-3 mb-6">
                <v-avatar size="44" rounded="lg" class="brand-avatar">
                  <span class="brand-letter">M</span>
                </v-avatar>
                <div class="text-center">
                  <div class="brand-name">Mlup Dong</div>
                  <div class="brand-tag">Restaurant Management</div>
                </div>
              </div>

              <!-- Title -->
              <div class="login-title mb-1">{{ t('login.login') }}</div>
              <div class="login-sub mb-6">
                {{ t('login.welcomeBack') }}
              </div>

              <!-- Error -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                rounded="lg"
                density="compact"
                closable
                class="mb-4"
                @click:close="error = ''"
                >{{ error }}</v-alert
              >

              <!-- Email -->
              <v-text-field
                v-model="email"
                :placeholder="t('login.emailAddress')"
                type="email"
                append-inner-icon="mdi-account-outline"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                color="white"
                class="glass-field mb-3"
                hide-details="auto"
                :error="!!error && error.toLowerCase().includes('email')"
                @keyup.enter="login"
              />

              <!-- Password -->
              <v-text-field
                v-model="password"
                :placeholder="t('login.password')"
                :type="showPass ? 'text' : 'password'"
                :append-inner-icon="
                  showPass ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
                "
                variant="outlined"
                rounded="lg"
                density="comfortable"
                color="white"
                class="glass-field mb-3"
                hide-details="auto"
                :error="!!error && error.toLowerCase().includes('password')"
                @click:append-inner="showPass = !showPass"
                @keyup.enter="login"
              />

              <!-- Remember me -->
              <v-checkbox
                v-model="remember"
                :label="t('login.rememberMe')"
                color="#19e092"
                density="compact"
                hide-details
                class="remember-check mb-5"
              />

              <!-- Login button -->
              <v-btn
                block
                size="large"
                rounded="lg"
                :loading="loading"
                type="button"
                class="login-btn mb-5"
                @click="login"
              >
                {{ t('login.login') }}
              </v-btn>

              <v-divider
                class="mb-4"
                style="border-color: rgba(255, 255, 255, 0.15)"
              />

              <!-- Footer -->
              <div class="text-center footer-text">
                {{ t('login.poweredBy') }} <em><strong>Mlup Dong</strong></em>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Manrope:wght@400;600;700;800&display=swap");

/* ── Full page bg ── */
.login-page {
  font-family: "Manrope", sans-serif;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

.bg-image {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=90")
    center / cover no-repeat;
  animation: slow-zoom 20s ease-in-out infinite alternate;
}
@keyframes slow-zoom {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.06);
  }
}

.bg-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    170deg,
    rgba(6, 30, 18, 0.45) 0%,
    rgba(10, 80, 50, 0.38) 50%,
    rgba(6, 20, 12, 0.55) 100%
  );
}

/* ── Container above overlay ── */
.v-container {
  position: relative;
  z-index: 2;
}

/* ── Glass card ── */
.glass-card {
  background: rgba(255, 255, 255, 0.12) !important;
  backdrop-filter: blur(22px) saturate(1.4);
  -webkit-backdrop-filter: blur(22px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.22) !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.28),
    0 1px 0 rgba(255, 255, 255, 0.18) inset !important;
  animation: rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Brand ── */
.brand-avatar {
  background: linear-gradient(135deg, #19e092, #0f9e5f) !important;
  box-shadow: 0 4px 14px rgba(15, 158, 95, 0.4) !important;
}
.brand-letter {
  font-size: 17px;
  font-weight: 900;
  color: #063824;
}
.brand-name {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}
.brand-tag {
  font-size: 9.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ── Titles ── */
.login-title {
  font-family: "Playfair Display", serif;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}
.login-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

/* ── Glass fields ── */
.glass-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  backdrop-filter: blur(8px);
}
.glass-field :deep(.v-field__outline) {
  display: none;
}
.glass-field :deep(input) {
  color: #fff !important;
  font-family: "Manrope", sans-serif;
  font-weight: 500;
}
.glass-field :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.55) !important;
}
.glass-field :deep(.v-icon) {
  color: rgba(255, 255, 255, 0.6) !important;
}
.glass-field :deep(.v-label) {
  color: rgba(255, 255, 255, 0.6) !important;
}

/* ── Remember me ── */
.remember-check :deep(.v-label) {
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 13.5px;
  font-weight: 600;
}

/* ── Login button ── */
.login-btn {
  background: linear-gradient(135deg, #19e092, #0f9e5f) !important;
  color: #063824 !important;
  font-weight: 800 !important;
  font-size: 15px !important;
  letter-spacing: 0.01em;
  box-shadow: 0 6px 22px rgba(15, 158, 95, 0.45) !important;
  transition:
    transform 0.15s,
    box-shadow 0.15s !important;
}
.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(15, 158, 95, 0.55) !important;
}

/* ── Register row ── */
.register-row {
  color: rgba(255, 255, 255, 0.8);
}
.signup-link {
  color: #fff;
  font-weight: 800;
  text-decoration: none;
}
.signup-link:hover {
  color: #19e092;
}

/* ── Footer ── */
.footer-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}
.footer-text em strong {
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}
</style>
