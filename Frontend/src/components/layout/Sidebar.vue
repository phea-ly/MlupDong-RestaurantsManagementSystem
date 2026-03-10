<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const route  = useRoute()
const router = useRouter()
const { t } = useI18n()

const menu = computed(() => [
  { path: '/home/admin-dashboard', label: t('layout.dashboard'), icon: 'mdi-view-dashboard-outline' },
  { path: '/home/menu', label: t('layout.menu'), icon: 'mdi-silverware' },
  { path: '/home/staff', label: t('layout.staff'), icon: 'mdi-account-circle-outline' },
  { path: '/home/table', label: t('layout.tables'), icon: 'mdi-table-chair' },
  { path: '/home/user', label: t('layout.user'), icon: 'mdi-account-group-outline' },
])
const reportsMenu = computed(() => [
  { path: '/home/sales-report', label: t('layout.salesReport'), icon: 'mdi-chart-box-outline' },
  { path: '/home/settings', label: t('layout.settings'), icon: 'mdi-cog-outline' },
])

function navigate(path) {
  if (route.path !== path) router.push(path)
}
</script>

<template>
  <v-navigation-drawer
    permanent
    width="262"
    style="border-right:1px solid #dde5e8; background:#f7faf9;"
  >
    <!-- Brand -->
    <div class="d-flex align-center ga-3 px-4 pt-5 pb-4">
      <v-avatar
        size="34" rounded="lg"
        style="background:linear-gradient(135deg,#19e092,#0f9e5f);
               box-shadow:0 4px 12px rgba(15,158,95,0.28); flex-shrink:0"
      >
        <span style="font-size:15px; font-weight:900; color:#063824">M</span>
      </v-avatar>
      <div>
        <div class="brand-title">Mlup Dong Admin</div>
        <div class="brand-sub">Management</div>
      </div>
    </div>

    <v-divider style="border-color:#eaeff2" />

    <!-- Main nav -->
    <v-list nav density="comfortable" class="px-2 pt-3">
      <v-list-item
        v-for="item in menu"
        :key="item.path"
        :title="item.label"
        rounded="lg"
        :active="route.path === item.path"
        active-color="#0f9e5f"
        class="nav-item mb-1"
        @click="navigate(item.path)"
      >
        <template #prepend>
          <v-icon size="18">{{ item.icon }}</v-icon>
        </template>
      </v-list-item>
    </v-list>

    <!-- Reports -->
    <div class="section-label px-4 mt-3 mb-1">{{ t('sidebar.reports') }}</div>
    <v-list nav density="comfortable" class="px-2">
      <v-list-item
        v-for="item in reportsMenu"
        :key="item.path"
        :title="item.label"
        rounded="lg"
        :active="route.path === item.path"
        active-color="#0f9e5f"
        class="nav-item mb-1"
        @click="navigate(item.path)"
      >
        <template #prepend>
          <v-icon size="18">{{ item.icon }}</v-icon>
        </template>
      </v-list-item>
    </v-list>

    <!-- ✅ NO profile section here anymore -->

  </v-navigation-drawer>
</template>

<style scoped>
.brand-title  { font-size:13px; font-weight:900; color:#1a2e48; line-height:1.2; }
.brand-sub    { font-size:9.5px; font-weight:700; color:#7f90a4; text-transform:uppercase; letter-spacing:.07em; }
.section-label{ font-size:10px; font-weight:800; color:#9aabbd; text-transform:uppercase; letter-spacing:.12em; }

.nav-item { min-height:40px; }
.nav-item :deep(.v-list-item-title) { font-size:13px; font-weight:700; color:#4b5d74; }
.nav-item :deep(.v-icon)            { color:#6f8199; }
.nav-item:hover                     { background:#ecf3f0 !important; }
.nav-item.v-list-item--active       { background:#def4e8 !important; }
.nav-item.v-list-item--active :deep(.v-list-item-title),
.nav-item.v-list-item--active :deep(.v-icon) { color:#0f9e5f !important; }
</style>
