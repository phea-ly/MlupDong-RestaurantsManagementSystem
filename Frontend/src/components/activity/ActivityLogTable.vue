<script setup>
import { ref, computed } from 'vue'
import ActivityDetailsPanel from '@/components/activity/ActivityDetailsPanel.vue'
import ActivityIpInfo from '@/components/activity/ActivityIpInfo.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
})

const bulkAction = ref('Bulk Actions')
const selectedIds = ref([])
const expandedId = ref(null)

const bulkActions = ['Bulk Actions', 'Delete', 'Export', 'Archive']

const allSelected = computed(() => props.items.length > 0 && selectedIds.value.length === props.items.length)

function toggleAll() {
  if (allSelected.value) selectedIds.value = []
  else selectedIds.value = props.items.map(item => item.id)
}

function toggleRow(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(itemId => itemId !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

function toggleDetails(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function actionColor(action) {
  if (action === 'updated') return 'info'
  if (action === 'added') return 'success'
  if (action === 'deleted') return 'error'
  if (action === 'login') return 'primary'
  return 'grey'
}
</script>

<template>
  <v-card rounded="xl" border flat>
    <v-card-text class="pa-4 pb-0">
      <div class="d-flex align-center ga-3 flex-wrap">
        <v-select
          v-model="bulkAction"
          :items="bulkActions"
          variant="outlined"
          density="compact"
          rounded="lg"
          hide-details
          style="max-width:160px"
        />
        <v-btn variant="outlined" size="small" :disabled="selectedIds.length === 0">Apply</v-btn>
        <div class="text-caption text-medium-emphasis ml-auto">
          Showing {{ items.length }} entries
        </div>
      </div>
    </v-card-text>

    <v-divider class="mt-3" />

    <v-table density="compact" class="activity-table">
      <thead>
        <tr>
          <th style="width:36px"><v-checkbox-btn :model-value="allSelected" @click="toggleAll" /></th>
          <th class="text-caption text-medium-emphasis">ID</th>
          <th class="text-caption text-medium-emphasis">Date</th>
          <th class="text-caption text-medium-emphasis">User</th>
          <th class="text-caption text-medium-emphasis">IP Address</th>
          <th class="text-caption text-medium-emphasis">Event</th>
          <th class="text-caption text-medium-emphasis">Object</th>
          <th class="text-caption text-medium-emphasis">Action</th>
          <th class="text-caption text-medium-emphasis">Description</th>
          <th class="text-caption text-medium-emphasis" style="width:110px"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="item in items" :key="item.id">
          <tr>
            <td><v-checkbox-btn :model-value="selectedIds.includes(item.id)" @click="toggleRow(item.id)" /></td>
            <td class="text-body-2 font-weight-medium">{{ item.id }}</td>
            <td>
              <div class="text-body-2">{{ item.relativeTime }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.timestamp }}</div>
            </td>
            <td>
              <div class="text-body-2 text-primary">{{ item.user.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.user.role }}</div>
            </td>
            <td>
              <ActivityIpInfo :ip="item.ip" :info="item.ipInfo" />
            </td>
            <td class="text-body-2">{{ item.event }}</td>
            <td class="text-body-2">{{ item.object }}</td>
            <td>
              <v-chip :color="actionColor(item.action)" size="x-small" variant="tonal" class="text-uppercase">
                {{ item.action }}
              </v-chip>
            </td>
            <td class="text-body-2">{{ item.description }}</td>
            <td class="text-right">
              <v-btn size="small" color="primary" variant="tonal" rounded="lg" @click="toggleDetails(item.id)">
                <v-icon size="16">mdi-chevron-down</v-icon>
                Details
              </v-btn>
            </td>
          </tr>
          <tr v-if="expandedId === item.id">
            <td colspan="10" class="pb-4">
              <ActivityDetailsPanel :detail="item.details" />
            </td>
          </tr>
        </template>
      </tbody>
    </v-table>
  </v-card>
</template>

<style scoped>
.activity-table :deep(th) {
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  font-weight: 700;
}
.activity-table :deep(td) {
  vertical-align: top;
  padding-top: 14px;
  padding-bottom: 14px;
}
</style>
