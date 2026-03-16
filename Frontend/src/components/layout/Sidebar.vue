<script setup>
<<<<<<< HEAD
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

=======
>>>>>>> 0662d3b81fcaf3c26c949bdb09290af9959f3eab
const menu = [
  { to: '/home/admin-dashboard', label: 'Dashboard',   icon: 'mdi-view-dashboard-outline' },
  { to: '/home/menu',            label: 'Menu',         icon: 'mdi-silverware-fork-knife'  },
  { to: '/home/staff',           label: 'Staff',        icon: 'mdi-account-circle-outline' },
  { to: '/home/table',           label: 'Tables',       icon: 'mdi-table-chair'            },
  { to: '/home/user',            label: 'User',         icon: 'mdi-account-group-outline'  },
]
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2

const reportsMenu = [
  { to: '/home/sales-report', label: 'Sales Report', icon: 'mdi-chart-box-outline' },
  { to: '/home/settings',     label: 'Settings',     icon: 'mdi-cog-outline'       },
]
</script>

<template>
  <v-navigation-drawer permanent width="254" color="#f7faf9" border="e">

    <!-- Brand -->
    <template #prepend>
      <div class="d-flex align-center ga-3 px-4 py-4">
        <v-avatar size="48" rounded="lg">
          <v-img src="/logo.png" cover />
        </v-avatar>
        <div>
          <div class="text-subtitle-2 font-weight-black" style="color:#1a2e48">MLUP DONG</div>
          <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis" style="letter-spacing:.07em">Restaurant</div>
        </div>
      </div>
      <v-divider />
    </template>

    <!-- Main nav -->
    <v-list nav density="comfortable" class="px-2 pt-3">
      <v-list-item
        v-for="item in menu"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.label"
        rounded="lg"
        active-color="#0f9e5f"
        class="mb-1"
      />
    </v-list>

    <!-- Reports section -->
    <div class="text-caption font-weight-black text-uppercase px-4 mt-3 mb-1" style="color:#9aabbd; letter-spacing:.12em">
      Reports
    </div>
    <v-list nav density="comfortable" class="px-2">
      <v-list-item
        v-for="item in reportsMenu"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.label"
        rounded="lg"
        active-color="#0f9e5f"
        class="mb-1"
      />
    </v-list>

  </v-navigation-drawer>
</template>

<style scoped>
:deep(.v-list-item-title) { font-size: 13px !important; font-weight: 700 !important; }
:deep(.v-list-item--active) { background: #def4e8 !important; }
:deep(.v-list-item:not(.v-list-item--active):hover) { background: #ecf3f0 !important; }
</style>