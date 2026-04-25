<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const props = defineProps({
  title:       { type: String, required: true },
  subtitle:    { type: String, required: true },
  actionLabel: { type: String, default: ''    },
})
const emit = defineEmits(['action'])

const auth   = useAuthStore()
const router = useRouter()

const { user } = storeToRefs(auth)

const imgError  = ref(false)
const avatarUrl = computed(() => {
  if (imgError.value) return null
  const url = user.value?.avatar ?? null
  if (!url) return null
  if (url.startsWith('/storage/')) {
    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
    return `${base}${url}`
  }
  return url
})

const profileName = computed(() => {
  const f = user.value?.first_name ?? ''
  const l = user.value?.last_name  ?? ''
  return (f + ' ' + l).trim() || 'Admin User'
})

const profileRole = computed(() => {
  if (user.value?.role)    return user.value.role
  if (user.value?.role_id) return 'Admin'
  return 'Manager'
})

const profileInitials = computed(() => {
  const f = user.value?.first_name?.[0] ?? 'A'
  const l = user.value?.last_name?.[0]  ?? 'U'
  return (f + l).toUpperCase()
})

const cartoonAvatar = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

function logout() {
  auth.logout()
  router.replace('/login')
}
</script>

<template>
  <v-app-bar flat color="#ffffff" border="b" height="56" class="appbar">

    <!-- Left: Page title + subtitle -->
    <v-app-bar-title>
      <div class="appbar-title">{{ title }}</div>
      <div class="appbar-subtitle">{{ subtitle }}</div>
    </v-app-bar-title>

    <!-- Right: Bell | divider | user name + role | avatar -->
    <template #append>
      <div class="appbar-right">

        <!-- Bell -->
        <v-btn icon variant="text" size="small" class="bell-btn">
          <v-icon size="20" color="#6b7280">mdi-bell-outline</v-icon>
        </v-btn>

        <!-- Divider -->
        <div class="appbar-divider" />

        <!-- User name + role -->
        <div class="user-info-text">
          <span class="user-name">{{ profileName }}</span>
          <span class="user-role">{{ profileRole.toUpperCase() }}</span>
        </div>

        <!-- Avatar with logout menu -->
        <v-menu>
          <template #activator="{ props }">
            <v-avatar size="34" class="user-avatar" v-bind="props" style="cursor:pointer">
              <v-img
                v-if="avatarUrl"
                :src="avatarUrl"
                cover
                @error="imgError = true"
              />
              <img
                v-else
                :src="cartoonAvatar"
                style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
              />
            </v-avatar>
          </template>
          <v-list density="compact" min-width="150">
            <v-list-item @click="logout">
              <template #prepend>
                <v-icon size="18" color="error">mdi-logout</v-icon>
              </template>
              <v-list-item-title class="text-error">Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

      </div>
    </template>
  </v-app-bar>
</template>

<style scoped>
.appbar {
  border-bottom: 1px solid #e5e7eb !important;
}

/* Left titles */
.appbar-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  line-height: 1.2;
}
.appbar-subtitle {
  font-size: 11.5px;
  color: #9ca3af;
  font-weight: 400;
  line-height: 1.2;
}

/* Right container */
.appbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-right: 20px;
  height: 56px;
}

/* Bell */
.bell-btn {
  flex-shrink: 0;
}

/* Thin vertical divider */
.appbar-divider {
  width: 1px;
  height: 24px;
  background-color: #e5e7eb;
  flex-shrink: 0;
}

/* User text: name on top, role below, right-aligned */
.user-info-text {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  line-height: 1.2;
}
.user-name {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
}
.user-role {
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

/* Avatar */
.user-avatar {
  flex-shrink: 0;
  border: 2px solid #e5e7eb;
  transition: border-color 0.15s ease;
}
.user-avatar:hover {
  border-color: #2D5A27;
}
</style>