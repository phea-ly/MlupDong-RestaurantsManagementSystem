<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserRole, logoutSession } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const routeToSection = {
  '/home/menu': 'menu',
  '/home/dashboard': 'dashboard',
  '/home/admin-dashboard': 'dashboard',
  '/home/client-dashboard': 'dashboard',
  '/home/sales-report': 'sales-report',
  '/home/staff': 'staff',
  '/home/users': 'users',
  '/home/table': 'tables',
}

const sectionToRoute = {
  menu: '/home/menu',
  dashboard: '/home/dashboard',
  'sales-report': '/home/sales-report',
  staff: '/home/staff',
  users: '/home/users',
  tables: '/home/table',
}

const activeSection = computed(() => routeToSection[route.path] || 'dashboard')
const userRole = computed(() => getUserRole())

const viewMeta = computed(() => {
  if (activeSection.value === 'staff') {
    return { title: 'Staff Management', subtitle: 'Manage your team operations', action: 'Add Staff' }
  }
  if (activeSection.value === 'tables') {
    return { title: 'Active Tables', subtitle: 'Track orders and service live', action: 'Refresh' }
  }
  if (activeSection.value === 'menu') {
    return { title: 'Menu Management', subtitle: 'Manage menu items and categories', action: 'Add Item' }
  }
  if (activeSection.value === 'users') {
    return { title: 'User Management', subtitle: 'Create, update, and manage user accounts', action: '' }
  }
  if (activeSection.value === 'sales-report') {
    return { title: 'Sales Report', subtitle: 'Welcome to our restaurant!', action: '' }
  }
  if (userRole.value === 'admin') {
    return { title: 'Dashboard', subtitle: 'Welcome to our restaurant', action: '' }
  }
  return { title: 'Client Dashboard', subtitle: 'Track your orders and activity', action: 'New Order' }
})

function goToSection(sectionId) {
  const targetPath = sectionToRoute[sectionId]
  if (targetPath && targetPath !== route.path) {
    router.push(targetPath)
  }
}

function handleAction() {
  // Keep current route; this button is reserved for section-specific actions.
}

async function logout() {
  await logoutSession()
  router.push('/login')
}
</script>

<template>
  <AppLayout
    :active-section="activeSection"
    :title="viewMeta.title"
    :subtitle="viewMeta.subtitle"
    :action-label="viewMeta.action"
    @update:active-section="goToSection"
    @action="handleAction"
    @logout="logout"
  >
    <router-view />
  </AppLayout>
</template>
