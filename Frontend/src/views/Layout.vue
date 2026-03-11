<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

const route = useRoute()
const { t } = useI18n()

const meta = computed(() =>
  ({
    '/home/admin-dashboard': { title: t('layout.dashboard'), subtitle: t('layout.overviewRestaurant') },
    '/home/menu': { title: t('layout.menu'), subtitle: t('layout.manageMenu') },
    '/home/staff': { title: t('layout.staff'), subtitle: t('layout.manageTeam') },
    '/home/table': { title: t('layout.tables'), subtitle: t('layout.manageTables') },
    '/home/sales-report': { title: t('layout.salesReport'), subtitle: t('layout.viewSalesAnalytics') },
    '/home/user': { title: t('layout.user'), subtitle: t('layout.manageAccounts') },
    '/home/settings': { title: t('layout.settings'), subtitle: t('layout.systemConfiguration') },
  })[route.path] ?? { title: t('layout.dashboard'), subtitle: t('layout.overviewRestaurant') }
)
</script>

<template>
  <AppLayout :title="meta.title" :subtitle="meta.subtitle">
    <router-view />
  </AppLayout>
</template>
