<script setup>
const menu = [
  { to: '/home/admin-dashboard', label: 'Dashboard',   icon: 'mdi-view-dashboard-outline' },
  { to: '/home/menu',            label: 'Menus',         icon: 'mdi-silverware-fork-knife'  },
  { to: '/home/categories',      label: 'Categories',   icon: 'mdi-tag-multiple-outline'   },
  { to: '/home/staff',           label: 'Staffs',        icon: 'mdi-account-circle-outline' },
  { to: '/home/table',           label: 'Tables',       icon: 'mdi-table-chair'            },
  { to: '/home/user',            label: 'Users',         icon: 'mdi-account-group-outline'  },
]

const reportsMenu = [
  { to: '/home/sales-report', label: 'Sales Report', icon: 'mdi-chart-box-outline' },
  { to: '/home/activity',     label: 'Activity Log', icon: 'mdi-clipboard-text-outline' },
  { to: '/home/settings',     label: 'Settings',     icon: 'mdi-cog-outline'       },
]
</script>

<template>
  <v-navigation-drawer permanent width="254" color="#f7faf9" border="e">

    <!-- Brand -->
    <template #prepend>
      <div class="brand-wrap px-4 py-4">
        <v-avatar size="56" rounded="xl" class="brand-avatar">
          <v-img src="/logo.png" cover />
        </v-avatar>
        <div class="brand-text">
          <div class="brand-title">MLUP DONG</div>
          <div class="brand-subtitle">Restaurant</div>
        </div>
        <v-chip size="x-small" class="brand-chip" variant="tonal">Admin</v-chip>
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
        color="var(--app-primary-600)"
        base-color="#475569"
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
        color="var(--app-primary-600)"
        base-color="#475569"
        class="mb-1"
      />
    </v-list>

  </v-navigation-drawer>
</template>

<style scoped>
.brand-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-avatar {
  box-shadow: 0 8px 18px rgba(20, 184, 166, 0.25);
  border: 1px solid rgba(20, 184, 166, 0.35);
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.brand-title {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #0f172a;
}
.brand-subtitle {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(13, 148, 136, 0.8);
}
.brand-chip {
  margin-left: auto;
  font-weight: 700;
  color: var(--app-primary-600);
  background: rgba(204, 251, 241, 0.9);
}
:deep(.v-list-item-title) { font-size: 13px !important; font-weight: 700 !important; }
:deep(.v-list-item--active) { background: #def4e8 !important; }
:deep(.v-list-item:not(.v-list-item--active):hover) { background: #ecf3f0 !important; }
</style>

