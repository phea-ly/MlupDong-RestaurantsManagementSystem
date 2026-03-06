<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logoutSession } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const routeToSection = {
  '/home/admin-dashboard': 'dashboard',
  '/home/sales-report': 'sales-report',
  '/home/menu': 'menu',
  '/home/staff': 'staff',
  '/home/table': 'tables',
  '/home/settings': 'settings',  // ✅ add this
}

const sectionToRoute = {
  dashboard: '/home/admin-dashboard',
  'sales-report': '/home/sales-report',
  menu: '/home/menu',
  staff: '/home/staff',
  tables: '/home/table',
  settings: '/home/settings',    // ✅ add this
}

// Page meta per section
const pageMeta = {
  dashboard:      { title: 'Dashboard',    subtitle: 'Overview of your restaurant', actionLabel: '' },
  menu:           { title: 'Menu',         subtitle: 'Manage your menu items',       actionLabel: 'Add Item' },
  staff:          { title: 'Staff',        subtitle: 'Manage your team',             actionLabel: 'Add Staff' },
  tables:         { title: 'Tables',       subtitle: 'Manage restaurant tables',     actionLabel: 'Add Table' },
  'sales-report': { title: 'Sales Report', subtitle: 'View sales analytics',         actionLabel: 'Export' },
  settings:       { title: 'Settings',     subtitle: 'System settings',              actionLabel: '' },
}

const activeSection = computed(() => routeToSection[route.path] ?? 'dashboard')
const meta = computed(() => pageMeta[activeSection.value] ?? pageMeta.dashboard)

function goToSection(sectionId) {
  const targetPath = sectionToRoute[sectionId]
  if (targetPath && targetPath !== route.path) {
    router.push(targetPath)
  }
}

async function logout() {
  await logoutSession()
  router.push('/login')
}
</script>

<template>
  <AppLayout
    :active-section="activeSection"
    :title="meta.title"
    :subtitle="meta.subtitle"
    :action-label="meta.actionLabel"
    @update:active-section="goToSection"
    @logout="logout"
  >
    <router-view />
  </AppLayout>
</template>
