<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const meta = computed(() => {
  switch (route.path) {
    case '/home/admin-dashboard': return { title: 'Dashboard',    subtitle: 'Restaurant overview'            }
    case '/home/menu':            return { title: 'Menu',         subtitle: 'Manage menu items & categories' }
    case '/home/staff':           return { title: 'Staff',        subtitle: 'Manage your team'               }
    case '/home/table':           return { title: 'Tables',       subtitle: 'Manage tables & QR codes'       }
    case '/home/sales-report':    return { title: 'Sales Report', subtitle: 'View sales analytics'           }
    case '/home/user':            return { title: 'Users',        subtitle: 'Manage accounts'                }
    case '/home/settings':        return { title: 'Settings',     subtitle: 'System configuration'          }
    default:                      return { title: 'Dashboard',    subtitle: 'Restaurant overview'            }
  }
})

</script>

<template>
  <AppLayout :title="meta.title" :subtitle="meta.subtitle">
    <router-view />
  </AppLayout>
</template>