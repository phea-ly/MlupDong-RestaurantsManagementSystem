<script setup>
const menu = [
  { to: '/home/admin-dashboard', label: 'Dashboard',   icon: 'mdi-view-dashboard-outline' },
  { to: '/home/categories',      label: 'Categories',   icon: 'mdi-tag-multiple-outline'   },
  { to: '/home/menu',            label: 'Menus',        icon: 'mdi-silverware-fork-knife'  },
  { to: '/home/roles',           label: 'Roles',       icon: 'mdi-account-edit' },
  { to: '/home/user',            label: 'Users',        icon: 'mdi-account-group-outline'  },
  { to: '/home/staff',           label: 'Staffs',       icon: 'mdi-account-circle-outline' },
  { to: '/home/table',           label: 'Tables',       icon: 'mdi-table-chair'            },
]

const reportsMenu = [
  { to: '/home/sales-report', label: 'Sales Report', icon: 'mdi-chart-box-outline'      },
  { to: '/home/activity',     label: 'Activity Log', icon: 'mdi-clipboard-text-outline' },
  { to: '/home/settings',     label: 'Settings',     icon: 'mdi-cog-outline'            },
]
</script>

<template>
  <v-navigation-drawer color="#ffffff" class="sidebar-drawer">

    <!-- Brand -->
    <template #prepend>
      <div class="brand-wrap px-3 pt-5">
        <v-avatar size="48" class="brand-avatar">
          <v-img src="/logo.png" cover />
        </v-avatar>
        <div class="brand-text">
          <div class="brand-title">MLUP DONG</div>
          <div class="brand-subtitle">Restaurant</div>
        </div>
      </div>
    </template>

    <!-- Main nav -->
    <v-list nav density="compact" class="px-4 pt-3 ">
      <v-list-item
        v-for="item in menu"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.label"
        rounded="lg"
        color=secondary
        base-color="#6b7280"
        class="nav-item mb-0.5"
      />
    </v-list>

    <!-- Reports section -->
    <div class="section-label px-4 mt-4 mb-1">
      Reports
    </div>
    <v-list nav density="compact" class="px-4 pb-0">
      <v-list-item
        v-for="item in reportsMenu"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.label"
        rounded="lg"
        color="#1a6b4a"
        base-color="#6b7280"
        class="nav-item mb-0.5"
      />
    </v-list>

  </v-navigation-drawer>
</template>

<style scoped>
/* Drawer */
/* .sidebar-drawer {
  border-radius: 12px;
} */
/* Brand */
.brand-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-avatar {
  flex-shrink: 0;
  background: #e8f5ee;
  border: 1px solid #c6e8d4;
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  overflow: hidden;
}
.brand-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.brand-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Section label */
.section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #9ca3af;
}

/* Nav item overrides */
:deep(.v-list-item-title) {
  font-size: 13.5px !important;
  font-weight: 500 !important;
  color: inherit;
}

/* Prepend icon sizing */
:deep(.v-list-item__prepend .v-icon) {
  font-size: 18px !important;
  opacity: 0.85;
}

/* Active state — light green tint, like the image's highlight */
:deep(.v-list-item--active) {
  background-color: #f0faf4 !important;
  font-weight: 600 !important;
}
:deep(.v-list-item--active .v-list-item-title) {
  font-weight: 600 !important;
}

/* Hover state — very subtle grey */
:deep(.v-list-item:not(.v-list-item--active):hover) {
  background-color: #f3f4f6 !important;
}

/* Tighten internal padding */
:deep(.v-list-item) {
  min-height: 36px !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
}
</style>
