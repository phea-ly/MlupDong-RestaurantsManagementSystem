<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginWithCredentials } from '@/utils/auth'

const router = useRouter()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const errorText = ref('')
const loading = ref(false)

async function login() {
  errorText.value = ''
  loading.value = true

  try {
    await loginWithCredentials(email.value.trim(), password.value, rememberMe.value)
    await router.push('/home/dashboard')
  } catch (error) {
    errorText.value = error.message
  } finally {
    loading.value = false
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<template>
  <v-container fluid class="auth-page pa-0">
    <v-row class="fill-height ma-0" align="center" justify="center">
      <v-col cols="12" md="11" lg="10" xl="9">
        <v-sheet class="auth-shell" rounded="xl" elevation="12">
          <div class="left-panel">
            <p class="brand">Urbee</p>
            <h1 class="title">Welcome Back</h1>
            <p class="subtitle">Sign in with your email address and password.</p>

            <p class="field-label">Email Address</p>
            <v-text-field
              v-model="email"
              type="email"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="mb-3"
              placeholder="name@example.com"
            />

            <p class="field-label">Password</p>
            <v-text-field
              v-model="password"
              type="password"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="mb-2"
              @keyup.enter="login"
            />

            <div class="meta-row">
              <v-checkbox
                v-model="rememberMe"
                density="compact"
                hide-details
                color="#43a047"
                label="Remember me"
              />
              <a href="#" class="forgot">Forgot Password?</a>
            </div>

            <p v-if="errorText" class="error mb-3">{{ errorText }}</p>

            <v-btn
              size="large"
              color="#43a047"
              class="text-none font-weight-bold px-8"
              :loading="loading"
              @click="login"
            >
              Sign In
            </v-btn>

            <p class="switch-copy">
              Don't have an account?
              <button type="button" class="link-btn" @click="goToRegister">Sign Up</button>
            </p>
          </div>

          <div class="right-panel" />
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  padding: 28px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 12% 15%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 38%),
    radial-gradient(circle at 88% 12%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 34%),
    linear-gradient(180deg, #d8dde1 0%, #cfd4d9 100%);
}

.auth-shell {
  min-height: 500px;
  width: min(1320px, 100%);
  display: grid;
  grid-template-columns: minmax(300px, 440px) 1fr;
  overflow: hidden;
  border: 1px solid #e5e8eb;
  box-shadow:
    0 40px 80px rgba(30, 40, 52, 0.28),
    0 8px 24px rgba(30, 40, 52, 0.2);
}

.left-panel {
  background: #f8f8f8;
  padding: 34px 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.right-panel {
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.12)),
    url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80');
  background-size: cover;
  background-position: center;
}

.brand {
  margin: 0 0 16px;
  font-size: 36px;
  line-height: 1;
  letter-spacing: 0.03em;
  font-family: "Segoe Script", "Lucida Handwriting", cursive;
  color: #1f1f1f;
}

.title {
  margin: 0;
  font-size: 28px;
  color: #1f1f1f;
}

.field-label {
  margin: 18px 0 6px;
  font-size: 12px;
  color: #8c98a5;
}

.meta-row {
  margin: 8px 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot {
  color: #95a1ad;
  text-decoration: none;
  font-size: 13px;
}

.switch-copy {
  margin: 18px 0 0;
  color: #9aa4ae;
  font-size: 13px;
}

.link-btn {
  margin-left: 4px;
  border: none;
  background: transparent;
  color: #43a047;
  font-weight: 700;
  cursor: pointer;
}

.subtitle {
  margin: 8px 0 6px;
  color: #8c98a5;
  font-size: 14px;
}

.error {
  color: #d95353;
  font-size: 13px;
}

@media (max-width: 960px) {
  .auth-shell {
    grid-template-columns: 1fr;
    min-height: auto;
    width: min(560px, 100%);
  }

  .right-panel {
    min-height: 220px;
  }

  .left-panel {
    padding: 30px 24px;
  }
}
</style>
