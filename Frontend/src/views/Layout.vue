<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const meta = computed(() =>
  ({
    '/home/admin-dashboard': { title: 'Dashboard',    subtitle: 'Restaurant overview'               },
    '/home/menu':            { title: 'Menu',         subtitle: 'Manage menu items & categories'    },
    '/home/staff':           { title: 'Staff',        subtitle: 'Manage your team'                  },
    '/home/table':           { title: 'Tables',       subtitle: 'Manage tables & QR codes'          },
    '/home/sales-report':    { title: 'Sales Report', subtitle: 'View sales analytics'              },
    '/home/user':            { title: 'Users',        subtitle: 'Manage accounts'                   },
    '/home/settings':        { title: 'Settings',     subtitle: 'System configuration'              },
})[route.path] ?? { title: 'Dashboard', subtitle: 'Restaurant overview' }
)
</script>

<template>
  <AppLayout :title="meta.title" :subtitle="meta.subtitle">
    <router-view />
  </AppLayout>
</template>