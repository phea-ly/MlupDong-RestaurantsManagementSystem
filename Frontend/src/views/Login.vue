<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginSession } from '@/utils/auth'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true
  try {
    await loginSession({ email: email.value, password: password.value })
    router.push('/home/dashboard')
  } catch (e) {
    error.value = e?.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-app>
    <v-main class="login-bg">
      <v-container class="d-flex align-center justify-center" style="min-height: 100vh">
        <v-card width="400" rounded="xl" elevation="0" class="pa-6 login-card">

          <div class="text-center mb-6">
            <div class="brand-icon mx-auto mb-3">M</div>
            <p class="brand-title">Mlup Dong</p>
            <p class="brand-subtitle">Restaurant Management</p>
          </div>

          <v-alert v-if="error" type="error" rounded="lg" class="mb-4" density="compact">
            {{ error }}
          </v-alert>

          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-3"
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-4"
          />

          <v-btn
            block
            rounded="lg"
            color="#0f9e5f"
            :loading="loading"
            @click="login"
          >
            Sign In
          </v-btn>

          <p class="text-center mt-4" style="font-size:13px; color:#7a899f">
            Don't have an account?
            <router-link to="/register" style="color:#0f9e5f; font-weight:700">Register</router-link>
          </p>

        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.login-bg {
  background: #edf2f1;
}
.login-card {
  border: 1px solid #dde5e8;
  background: #f7faf9;
}
.brand-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #19e092, #0fcb7e);
  color: #063824;
  font-weight: 900;
  font-size: 20px;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 14px rgba(16, 210, 131, 0.22);
}
.brand-title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  color: #1a2e48;
}
.brand-subtitle {
  margin: 2px 0 0;
  font-size: 11px;
  color: #7f90a4;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}
</style>