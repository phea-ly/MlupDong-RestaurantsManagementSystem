<script setup>
<<<<<<< HEAD
import { computed } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon';
import {
  mdiViewDashboard,
  mdiSilverware,
  mdiAccountGroup,
  mdiAccountCog,
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
const profileName = computed(() => sessionUser.value?.name || 'Sophal K.')
const profileRole = computed(() => {
  const role = sessionUser.value?.role || 'manager'
  return role.charAt(0).toUpperCase() + role.slice(1)
})

const isAdmin = computed(() => sessionUser.value?.role === 'admin')
const profileInitials = computed(() => {
  const name = profileName.value.trim()

  if (!name) {
    return 'SK'
  }

  const parts = name.split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('')
  return initials || 'SK'
})

const menu = computed(() => {
  const baseMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: mdiViewDashboard },
    { id: 'menu', label: 'Menu', icon: mdiSilverware },
    { id: 'staff', label: 'Staff', icon: mdiAccountGroup },
    { id: 'tables', label: 'Tables', icon: mdiTablePicnic },
  ]

  if (isAdmin.value) {
    baseMenu.splice(3, 0, { id: 'users', label: 'Users', icon: mdiAccountCog })
  }

  return baseMenu
})
=======
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menu = [
  { path: '/home/admin-dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard-outline' },
  { path: '/home/menu', label: 'Menu', icon: 'mdi-silverware' },
  { path: '/home/staff', label: 'Staff', icon: 'mdi-account-circle-outline' },
  { path: '/home/table', label: 'Tables', icon: 'mdi-table-chair' },
  { path: '/home/user', label: 'User', icon: 'mdi-account-group-outline' },
]
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2

const reportsMenu = [
  { path: '/home/sales-report', label: 'Sales Report', icon: 'mdi-chart-box-outline' },
  { path: '/home/settings', label: 'Settings', icon: 'mdi-cog-outline' },
]

function navigate(path) {
  if (route.path !== path) router.push(path)
}
</script>

<template>
  <v-navigation-drawer permanent width="254" style="border-right:1px solid #dde5e8; background:#f7faf9;">
    <!-- Brand -->
    <div class="d-flex flex-row align-center ga-3 px-2 pt-4 pb-0">
      <v-avatar size="60">
        <v-img src="../../../public/logo.png" cover />
      </v-avatar>
      <div class="text-start">
        <div class="brand-title">MLUP DONG</div>
        <div class="brand-sub">Restaurant</div>
      </div>
    </div>

    <v-divider style="border-color:#eaeff2" />

    <!-- Main nav -->
    <v-list nav density="comfortable" class="px-2 pt-3">
      <v-list-item v-for="item in menu" :key="item.path" :title="item.label" rounded="lg"
        :active="route.path === item.path" active-color="#0f9e5f" class="nav-item mb-1" @click="navigate(item.path)">
        <template #prepend>
          <v-icon size="18">{{ item.icon }}</v-icon>
        </template>
      </v-list-item>
    </v-list>

    <!-- Reports -->
    <div class="section-label px-4 mt-3 mb-1">Reports</div>
    <v-list nav density="comfortable" class="px-2">
      <v-list-item v-for="item in reportsMenu" :key="item.path" :title="item.label" rounded="lg"
        :active="route.path === item.path" active-color="#0f9e5f" class="nav-item mb-1" @click="navigate(item.path)">
        <template #prepend>
          <v-icon size="18">{{ item.icon }}</v-icon>
        </template>
      </v-list-item>
    </v-list>

  </v-navigation-drawer>
</template>

<style scoped>
.brand-title {
  font-size: 14px;
  font-weight: 900;
  color: #1a2e48;
  line-height: 1.2;
}

.brand-sub {
  font-size: 9.5px;
  font-weight: 700;
  color: #7f90a4;
  text-transform: uppercase;
  letter-spacing: .07em;
}

.section-label {
  font-size: 10px;
  font-weight: 800;
  color: #9aabbd;
  text-transform: uppercase;
  letter-spacing: .12em;
}

.nav-item {
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
  background: #ecf3f0 !important;
}

.nav-item.v-list-item--active {
  background: #def4e8 !important;
}

.nav-item.v-list-item--active :deep(.v-list-item-title),
.nav-item.v-list-item--active :deep(.v-icon) {
  color: #0f9e5f !important;
}
</style>