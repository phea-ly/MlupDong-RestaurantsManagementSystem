<script setup>
import { computed } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiViewDashboard,
  mdiSilverware,
  mdiAccountGroup,
  mdiTablePicnic,
  mdiChartBoxOutline,
  mdiCogOutline,
} from '@mdi/js'
import { getSessionUser } from '@/utils/auth'


const props = defineProps({
  activeSection: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:active-section', 'logout'])

const sessionUser = computed(() => getSessionUser())
const profileName = computed(() => sessionUser.value?.name || 'Guest User')
const profileRole = computed(() => {
  const role = sessionUser.value?.role || 'client'
  return role.charAt(0).toUpperCase() + role.slice(1)
})
const profileInitials = computed(() => {
  const name = profileName.value.trim()

  if (!name) {
    return 'GU'
  }

  const parts = name.split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('')
  return initials || 'GU'
})

const menu = [
  { id: 'dashboard', label: 'Dashboard', icon: mdiViewDashboard },
  { id: 'menu', label: 'Menu', icon: mdiSilverware },
  { id: 'staff', label: 'Staff', icon: mdiAccountGroup },
  { id: 'tables', label: 'Tables', icon: mdiTablePicnic }
]

const reportsMenu = [
  { id: 'sales-report', label: 'Sales Report', icon: mdiChartBoxOutline },
  { id: 'settings', label: 'Settings', icon: mdiCogOutline }
]

function selectSection(sectionId) {
  emit('update:active-section', sectionId)
}
</script>

<template>
  <v-navigation-drawer permanent width="268" class="sidebar" elevation="0">
    <div class="brand pa-4 pt-6">
      <div class="brand-icon">MD</div>
      <div>
        <p class="brand-title">Mlup Dong</p>
        <p class="brand-subtitle">Management</p>
      </div>
    </div>

    <v-list nav density="comfortable" class="px-3 mt-2 mb-2 ">
      <v-list-item
        v-for="item in menu"
        :key="item.id"
        :title="item.label"
        rounded="lg"
        :active="props.activeSection === item.id"
        class="nav-item ga-3"
        @click="selectSection(item.id)"
      >
        <template #prepend>
          <svg-icon type="mdi" :path="item.icon"></svg-icon>
        </template>
      </v-list-item>
    </v-list>

    <p class="menu-heading px-5 mt-6 mb-2">Reports</p>
    <v-list nav density="comfortable" class="px-3">
      <v-list-item
        v-for="item in reportsMenu"
        :key="item.id"
        :title="item.label"
        rounded="lg"
        class="nav-item ga-3"
      >
        <template #prepend>
          <svg-icon type="mdi" :path="item.icon"></svg-icon>
        </template>
      </v-list-item>
    </v-list>

    <v-spacer />
    <v-card flat rounded="xl" class="mx-3 mb-5 pa-3 user-card">
      <div class="d-flex align-center ga-3 mb-2">
        <v-avatar color="#10d283" size="36">{{ profileInitials }}</v-avatar>
        <div>
          <p class="user-name">{{ profileName }}</p>
          <p class="user-role">{{ profileRole }}</p>
        </div>
      </div>
      <v-btn block rounded="lg" color="#14dc8b" class="text-none font-weight-bold" @click="emit('logout')">
        Switch Shift
      </v-btn>
    </v-card>
  </v-navigation-drawer>
</template>

<style scoped>
.sidebar {
  border-right: 1px solid #d2dbe0;
  background: linear-gradient(180deg, #f7faf9 0%, #f2f6f5 100%);
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
}

.brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: linear-gradient(135deg, #16db8b 0%, #0fcf80 100%);
  color: #063824;
  font-weight: 900;
  display: grid;
  place-items: center;
  box-shadow: 0 8px 18px rgba(16, 210, 131, 0.28);
}

.brand-title {
  margin: 0;
  font-size: 19px;
  font-weight: 900;
  line-height: 1;
}

.brand-subtitle {
  margin: 4px 0 0;
  color: #73819a;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  font-size: 11px;
}

.menu-heading {
  font-size: 12px;
  letter-spacing: 0.12em;
  color: #8b9bb1;
  font-weight: 800;
  text-transform: uppercase;
}

.nav-item {
  margin-bottom: 4px;
  min-height: 44px;
}

.nav-item :deep(.v-list-item-title) {
  font-size: 15px;
  font-weight: 700;
  color: #3f5067;
}

.nav-item :deep(.v-list-item__prepend) {
  width: 24px;
  min-width: 24px;
  margin-inline-end: 12px;
}

.nav-item :deep(.v-icon) {
  color: #61748f;
  opacity: 0.95;
}

.nav-item:hover {
  background: #e8f1ee;
}

.nav-item.v-list-item--active {
  background: #d7f1e5;
}

.nav-item.v-list-item--active :deep(.v-list-item-title),
.nav-item.v-list-item--active :deep(.v-icon) {
  color: #0b9f5c;
}

.user-card {
  background: #edf3f6;
  border: 1px solid #dbe4e9;
}

.user-name {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
}

.user-role {
  margin: 0;
  font-size: 12px;
  color: #7a899f;
}
</style>
