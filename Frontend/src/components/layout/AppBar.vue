<script setup>
import { computed } from 'vue'
import { getSessionUser } from '@/utils/auth'

defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  actionLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['action'])

const sessionUser = computed(() => getSessionUser())
const profileInitials = computed(() => {
  const name = sessionUser.value?.name?.trim() || ''

  if (!name) {
    return 'SH'
  }

  const parts = name.split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('')
  return initials || 'SH'
})
</script>

<template>
  <v-app-bar flat height="96" class="topbar px-6">
    <div>
      <h1 class="header-title">{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </div>
    <v-spacer />
    <div class="d-flex align-center ga-2">
      <v-btn v-if="actionLabel" color="#14dc8b" rounded="lg" class="text-none font-weight-bold" @click="emit('action')">
        {{ actionLabel }}
      </v-btn>
      <v-btn icon="mdi-bell-outline" variant="text" size="small" class="toolbar-icon" />
      <v-btn icon="mdi-cog-outline" variant="text" size="small" class="toolbar-icon" />
      <v-avatar color="#e7eef3" size="30" class="avatar-text">{{ profileInitials }}</v-avatar>
    </div>
  </v-app-bar>
</template>

<style scoped>
.topbar {
  border-bottom: 1px solid #dbe3e7;
  background: #f6f9f8;
}

.header-title {
  margin: 0;
  font-size: 37px;
  line-height: 1;
  font-weight: 900;
  color: #122039;
}

.subtitle {
  margin: 2px 0 0;
  color: #7a8ca2;
  font-size: 12px;
}

.toolbar-icon {
  color: #6d8098;
}

.avatar-text {
  color: #2f4a67;
  font-weight: 800;
  font-size: 11px;
}
</style>
