<script setup>
import { computed } from 'vue'
import { getSessionUser } from '@/utils/auth'

const props = defineProps({
  activeSection: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:active-section', 'logout'])

const sessionUser = computed(() => getSessionUser())
const profileName = computed(() => sessionUser.value?.name || 'Sophal K.')
const profileRole = computed(() => {
  const role = sessionUser.value?.role || 'manager'
  return role.charAt(0).toUpperCase() + role.slice(1)
})
const profileInitials = computed(() => {
  const name = profileName.value.trim()
  if (!name) return 'SK'
  const parts = name.split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map(p => p[0].toUpperCase()).join('') || 'SK'
})

const menu = [
  { id: 'dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard-outline' },
  { id: 'menu', label: 'Menu', icon: 'mdi-silverware' },
  { id: 'staff', label: 'Staff', icon: 'mdi-account-circle-outline' },
  { id: 'tables', label: 'Tables', icon: 'mdi-table-chair' },
  { id: 'user', label: 'User', icon: 'mdi-account-group-outline' },
]

const reportsMenu = [
  { id: 'sales-report', label: 'Sales Report', icon: 'mdi-chart-box-outline' },
  { id: 'settings', label: 'Settings', icon: 'mdi-cog-outline' },
]

function selectSection(sectionId) {
  emit('update:active-section', sectionId)
}
</script>

<template>
  <div class="sidebar">
    <!-- Brand -->
    <div class="brand px-4 pt-6 pb-3">
      <div class="brand-icon">M</div>
      <div>
        <p class="brand-title">Mlup Dong Admin</p>
        <p class="brand-subtitle">Management</p>
      </div>
    </div>

    <!-- Main Menu -->
    <v-list nav density="comfortable" class="px-3 mt-1 mb-1">
      <v-list-item
        v-for="item in menu"
        :key="item.id"
        :title="item.label"
        rounded="lg"
        :active="props.activeSection === item.id"
        class="nav-item"
        @click="selectSection(item.id)"
      >
        <template #prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
      </v-list-item>
    </v-list>

    <!-- Reports -->
    <p class="menu-heading px-5 mt-3 mb-2">Reports</p>
    <v-list nav density="comfortable" class="px-3">
      <v-list-item
        v-for="item in reportsMenu"
        :key="item.id"
        :title="item.label"
        rounded="lg"
        :active="props.activeSection === item.id"
        class="nav-item"
        @click="selectSection(item.id)"
      >
        <template #prepend>
          <v-icon>{{ item.icon }}</v-icon>
        </template>
      </v-list-item>
    </v-list>

    <!-- Spacer -->
    <div style="flex: 1" />

    <!-- User Card -->
    <div class="mx-3 mb-4 pa-3 user-card" @click="emit('logout')">
      <div class="d-flex align-center ga-2">
        <v-avatar color="#0fd582" size="30" class="user-avatar">{{ profileInitials }}</v-avatar>
        <div>
          <p class="user-name">{{ profileName }}</p>
          <p class="user-role">{{ profileRole }}</p>
        </div>
        <v-icon size="16" color="#9aabbd" style="margin-left:auto">mdi-logout</v-icon>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 278px;
  min-width: 278px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #dde5e8;
  background: #f7faf9;
  overflow-y: auto;
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
}

.brand-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #19e092 0%, #0fcb7e 100%);
  color: #063824;
  font-weight: 900;
  display: grid;
  place-items: center;
  box-shadow: 0 6px 14px rgba(16, 210, 131, 0.22);
  flex-shrink: 0;
}

.brand-title {
  margin: 0;
  font-size: 13px;
  font-weight: 900;
  line-height: 1.2;
  color: #1a2e48;
}

.brand-subtitle {
  margin: 1px 0 0;
  color: #7f90a4;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 700;
  font-size: 10px;
}

.menu-heading {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: #9aabbd;
  font-weight: 800;
  text-transform: uppercase;
}

.nav-item {
  margin-bottom: 3px;
  min-height: 40px;
}

.nav-item :deep(.v-list-item-title) {
  font-size: 13px;
  font-weight: 700;
  color: #4b5d74;
}

.nav-item :deep(.v-icon) {
  color: #6f8199;
}

.nav-item:hover {
  background: #ecf3f0;
}

.nav-item.v-list-item--active {
  background: #def4e8;
}

.nav-item.v-list-item--active :deep(.v-list-item-title),
.nav-item.v-list-item--active :deep(.v-icon) {
  color: #0f9e5f;
}

.user-card {
  background: #f2f6f8;
  border: 1px solid #d9e2e7;
  border-radius: 10px;
  cursor: pointer;
}

.user-avatar {
  color: #083723;
  font-size: 11px;
  font-weight: 800;
}

.user-name {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  color: #1b2f4a;
}

.user-role {
  margin: 0;
  font-size: 11px;
  color: #7a899f;
}
</style>