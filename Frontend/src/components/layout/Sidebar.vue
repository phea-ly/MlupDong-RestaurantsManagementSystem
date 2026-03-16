<script setup>
const menu = [
  { to: '/home/admin-dashboard', label: 'Dashboard',   icon: 'mdi-view-dashboard-outline' },
  { to: '/home/menu',            label: 'Menu',         icon: 'mdi-silverware-fork-knife'  },
  { to: '/home/staff',           label: 'Staff',        icon: 'mdi-account-circle-outline' },
  { to: '/home/table',           label: 'Tables',       icon: 'mdi-table-chair'            },
  { to: '/home/user',            label: 'User',         icon: 'mdi-account-group-outline'  },
]

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