<script setup>
import { onMounted }        from 'vue'
import { storeToRefs }      from 'pinia'
import { useActivityStore } from '@/stores/activity.store'

import ActivityHeader       from '@/components/activity/ActivityHeader.vue'
import ActivityFilters      from '@/components/activity/ActivityFilters.vue'
import ActivityLogTable     from '@/components/activity/ActivityLogTable.vue'
import ActivityTrends       from '@/components/activity/ActivityTrends.vue'

const store = useActivityStore()

const {
  logs, summary, loading, snackbar, meta, filters,
  EVENT_TYPES, ACTIONS,
  trendData, topActions, recentDays,
} = storeToRefs(store)

const {
  init, fetchLogs,
  deleteLog,
  applyFilters, resetFilters,
} = store

onMounted(init)
</script>

<template>
  <v-container fluid class="pa-0">

    <ActivityHeader
      :total="summary.total_entries"
      :db-size-mb="summary.db_size_mb"
      @refresh="init"
    />

    <ActivityFilters
      :filters="filters"
      :event-types="EVENT_TYPES"
      :actions="ACTIONS"
      :loading="loading"
      :summary="summary"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <ActivityLogTable
      :items="logs"
      :loading="loading"
      :meta="meta"
      @page-change="fetchLogs"
      @delete="deleteLog"
    />

    <ActivityTrends
      :trend-data="trendData"
      :top-actions="topActions"
      :recent-days="recentDays"
    />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom right"
      :timeout="3000"
      rounded="lg"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>

  </v-container>
</template>