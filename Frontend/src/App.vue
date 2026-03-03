<script setup>
import { computed, ref } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'

const activeSection = ref('dashboard')

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
  return { title: 'Dashboard', subtitle: 'Welcome to our restaurant', action: 'Add Report' }
})

function cycleSection() {
  const ids = ['dashboard', 'menu', 'staff', 'tables']
  const current = ids.indexOf(activeSection.value)
  activeSection.value = ids[(current + 1) % ids.length]
}
</script>

<template>
  <AppLayout
    :active-section="activeSection"
    :title="viewMeta.title"
    :subtitle="viewMeta.subtitle"
    :action-label="viewMeta.action"
    @update:active-section="activeSection = $event"
    @action="cycleSection"
  >
    <DashboardView :active-section="activeSection" />
  </AppLayout>
</template>