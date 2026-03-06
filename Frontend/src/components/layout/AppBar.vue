<script setup>
import { computed } from 'vue'
import { getSessionUser } from '@/utils/auth'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  actionLabel: { type: String, default: '' }
})

const emit = defineEmits(['action'])

const sessionUser = computed(() => getSessionUser())
const profileInitials = computed(() => {
  const name = sessionUser.value?.name?.trim() || ''
  if (!name) return 'SH'
  const parts = name.split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('') || 'SH'
})
</script>

<template>
  <div class="topbar px-6">
    <div>
      <h1 class="header-title">{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </div>
    <div class="spacer" />
    <div class="d-flex align-center" style="gap: 8px">
      <button v-if="actionLabel" class="action-btn" @click="emit('action')">
        + {{ actionLabel }}
      </button>
      <v-btn icon="mdi-bell-outline" variant="text" size="small" class="toolbar-icon" />
      <v-btn icon="mdi-cog-outline" variant="text" size="small" class="toolbar-icon" />
      <v-avatar color="#e7eef3" size="30" class="avatar-text">{{ profileInitials }}</v-avatar>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  height: 64px;
  min-height: 64px;
  border-bottom: 1px solid #dbe3e7;
  background: #f6f9f8;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 12px;
  flex-shrink: 0;
}

.spacer { flex: 1; }

.header-title {
  margin: 0;
  font-size: 24px;
  line-height: 1;
  font-weight: 900;
  color: #122039;
}

.subtitle {
  margin: 2px 0 0;
  color: #7a8ca2;
  font-size: 12px;
}

.action-btn {
  background: #14dc8b;
  color: #063824;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.action-btn:hover {
  background: #0fcb7e;
}

.toolbar-icon { color: #6d8098; }

.avatar-text {
  color: #2f4a67;
  font-weight: 800;
  font-size: 11px;
}
</style>