<script setup>
import ActivityHeader from '@/components/activity/ActivityHeader.vue'
import ActivityFilters from '@/components/activity/ActivityFilters.vue'
import ActivityLogTable from '@/components/activity/ActivityLogTable.vue'
import ActivityTrends from '@/components/activity/ActivityTrends.vue'
import { storeToRefs } from 'pinia'
import { useActivityStore } from '@/stores'

const activityStore = useActivityStore()
const { summary, logItems } = storeToRefs(activityStore)
</script>

<template>
  <v-container fluid class="pa-0">
    <ActivityHeader />
    <ActivityFilters :summary="summary" />
    <ActivityLogTable :items="logItems" />
    <ActivityTrends />
  </v-container>
</template>
