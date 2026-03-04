<template>
  <v-container>
    <v-text-field v-model="email" label="Email" />
    <v-text-field v-model="password" label="Password" type="password" />
    <v-btn @click="handleLogin">Login</v-btn>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const email = ref('')
const password = ref('')
const { login } = useAuth()

const handleLogin = () => {
  login({ email: email.value, password: password.value })
}
</script>