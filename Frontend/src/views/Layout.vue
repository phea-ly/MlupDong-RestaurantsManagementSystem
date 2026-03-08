<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageMeta = {
  '/home/admin-dashboard': { title: 'Dashboard',    subtitle: 'Overview of your restaurant' },
  '/home/menu':            { title: 'Menu',         subtitle: 'Manage your menu items'       },
  '/home/staff':           { title: 'Staff',        subtitle: 'Manage your team'             },
  '/home/table':           { title: 'Tables',       subtitle: 'Manage restaurant tables'     },
  '/home/sales-report':    { title: 'Sales Report', subtitle: 'View sales analytics'         },
  '/home/user':            { title: 'User',         subtitle: 'Manage system accounts'       },
  '/home/settings':        { title: 'Settings',     subtitle: 'System configuration'         },
}

const meta = computed(() =>
  pageMeta[route.path] ?? { title: 'Dashboard', subtitle: 'Overview of your restaurant' }
)
</script>

<template>
  <AppLayout :title="meta.title" :subtitle="meta.subtitle">
    <router-view />
  </AppLayout>
</template>