<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboardPathByRole, registerWithCredentials } from '@/utils/auth'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('client')
const loading = ref(false)
const errorText = ref('')

async function register() {
  errorText.value = ''
  loading.value = true

  if (!fullName.value.trim() || !email.value.trim() || !password.value) {
    errorText.value = 'Name, email, and password are required.'
    loading.value = false
    return
  }

  if (password.value !== confirmPassword.value) {
    errorText.value = 'Passwords do not match.'
    loading.value = false
    return
  }

  try {
    await registerWithCredentials({
      name: fullName.value.trim(),
      email: email.value.trim(),
      role: role.value,
      password: password.value,
      password_confirmation: confirmPassword.value,
    })

    await router.push(getDashboardPathByRole())
  } catch (error) {
    errorText.value = error.message
  } finally {
    loading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<template>
  <v-container fluid class="auth-page pa-0">
    <v-row class="fill-height ma-0" align="center" justify="center">
      <v-col cols="12" md="11" lg="10" xl="9">
        <v-sheet class="auth-shell" rounded="xl" elevation="12">
          <div class="left-panel">
            <p class="brand">Urbee</p>
            <h1 class="title">Create Account</h1>
            <p class="subtitle">Sign up with your details to continue.</p>

            <p class="field-label">Full Name</p>
            <v-text-field
              v-model="fullName"
              type="text"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="mb-2"
              placeholder="John Doe"
            />

            <p class="field-label">Email Address</p>
            <v-text-field
              v-model="email"
              type="email"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="mb-2"
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
            />

            <p class="field-label">Confirm Password</p>
            <v-text-field
              v-model="confirmPassword"
              type="password"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="mb-2"
              @keyup.enter="register"
            />

            <p class="field-label">Role</p>
            <v-select
              v-model="role"
              :items="['client', 'admin']"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              class="mb-4"
            />

            <p v-if="errorText" class="error mb-3">{{ errorText }}</p>

            <v-btn
              size="large"
              color="#43a047"
              class="text-none font-weight-bold px-8"
              :loading="loading"
              @click="register"
            >
              Sign Up
            </v-btn>

            <p class="switch-copy">
              Already have an account?
              <button type="button" class="link-btn" @click="goToLogin">Sign In</button>
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

.subtitle {
  margin: 8px 0 6px;
  color: #8c98a5;
  font-size: 14px;
}

.field-label {
  margin: 8px 0 6px;
  font-size: 12px;
  color: #8c98a5;
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
