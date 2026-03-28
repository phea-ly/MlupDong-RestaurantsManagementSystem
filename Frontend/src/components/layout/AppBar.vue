<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  actionLabel: { type: String, default: '' },
})
const emit = defineEmits(['action'])

const auth = useAuthStore()
const router = useRouter()

const { user } = storeToRefs(auth)

const imgError = ref(false)

const avatarUrl = computed(() => {
  if (imgError.value) return null
  // ← check avatar_url first, then fall back to avatar
  const url = user.value?.avatar_url ?? user.value?.avatar ?? null
  if (!url) return null
  if (url.startsWith('/storage/')) {
    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'  // ← removed /api
    return `${base}${url}`
  }
  return url
})

// ← "Mlup Dong"
const profileName = computed(() => {
  const f = user.value?.first_name ?? ''
  const l = user.value?.last_name ?? ''
  return (f + ' ' + l).trim() || 'Unknown User'
})

// ← "Admin" from role.role_name
const profileRole = computed(() =>
  user.value?.role?.role_name ?? 'User'
)

const profileInitials = computed(() => {
  const f = user.value?.first_name?.[0] ?? '?'
  const l = user.value?.last_name?.[0] ?? ''
  return (f + l).toUpperCase()
})

function logout() {
  auth.logout()
  router.replace('/login')
}
</script>
<template>
  <v-app-bar flat color="white" border="b" class="appbar">
    <v-app-bar-title>
      <div class="appbar-title">{{ title }}</div>
      <div class="appbar-subtitle">{{ subtitle }}</div>
    </v-app-bar-title>

    <template #append>
      <div class="d-flex align-center ga-2 pr-3">

        <v-btn v-if="actionLabel" color="var(--app-primary-600)" variant="flat" rounded="lg" size="small"
          :prepend-icon="'mdi-plus'" @click="emit('action')">
          {{ actionLabel }}
        </v-btn>

        <v-btn icon variant="text" size="small" class="appbar-icon">
          <v-icon>mdi-bell-outline</v-icon>
          <v-badge color="error" content="1" floating />
        </v-btn>

        <!-- Profile menu -->
        <v-menu location="bottom end" :close-on-content-click="false" transition="slide-y-transition">
          <template #activator="{ props: mp }">
            <v-avatar v-bind="mp" size="40" style="cursor:pointer; box-shadow:0 4px 14px rgba(20,184,166,0.35);">
              <v-img v-if="avatarUrl" :src="avatarUrl" cover @error="imgError = true" />
              <span v-else
                style="background:linear-gradient(135deg,var(--app-primary),var(--app-primary-600)); width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; color:#063824;">{{
                  profileInitials }}</span>
            </v-avatar>
          </template>

          <v-card rounded="xl" elevation="8" width="248" style="margin-top:8px">

            <v-list-item class="pt-4 pb-3" lines="two">
              <template #prepend>
                <v-avatar size="44" style="overflow:hidden;">
                  <v-img v-if="avatarUrl" :src="avatarUrl" cover @error="imgError = true" />
                  <span v-else
                    style="background:linear-gradient(135deg,#5eead4,var(--app-primary)); width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800; color:#064e4f;">{{
                      profileInitials }}</span>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold">{{ profileName }}</v-list-item-title>
              <v-list-item-subtitle>{{ profileRole }}</v-list-item-subtitle>

            </v-list-item>

            <v-list density="compact" nav class="py-1">
              <v-list-item prepend-icon="mdi-logout" title="Sign Out" rounded="lg" base-color="error" @click="logout" />
            </v-list>

          </v-card>
        </v-menu>

      </div>
    </template>
  </v-app-bar>
</template>

<style scoped>
.appbar {
  background: linear-gradient(180deg, #ffffff 0%, #f6fffd 100%);
}

.appbar-crumb {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(13, 148, 136, 0.65);
  font-weight: 700;
  margin-bottom: 2px;
}

.appbar-title {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.appbar-subtitle {
  font-size: 12px;
  color: rgba(30, 41, 59, 0.6);
}

.appbar-icon :deep(.v-icon) {
  color: var(--app-primary-600);
}
</style>
