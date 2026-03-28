<script setup>
import { ref, computed } from 'vue'
import ActivityIpInfo      from './ActivityIpInfo.vue'
import ActivityDetailsPanel from './ActivityDetailsPanel.vue'

const props = defineProps({
  items:   { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false },
  meta:    { type: Object,  default: () => ({ current_page: 1, last_page: 1, total: 0, per_page: 10 }) },
})
defineEmits(['page-change', 'delete'])

// ── Selection ──────────────────────────────────────────────────────────────
const selectedIds = ref([])
const expandedIds = ref([])

function toggleDetails(id) {
  expandedIds.value = expandedIds.value.includes(id)
    ? expandedIds.value.filter(x => x !== id)
    : [...expandedIds.value, id]
}

// ── Color helpers ──────────────────────────────────────────────────────────
const ACTION_COLOR = {
  created:              'success',
  updated:              'blue',
  deleted:              'error',
  login:                'teal',
  logout:               'grey',
  login_failed:         'orange',
  availability_changed: 'purple',
  qr_generated:         'cyan',
  qr_bulk_generated:    'cyan',
  password_changed:     'deep-orange',
}

const EVENT_ICON = {
  user:     'mdi-account-outline',
  menu:     'mdi-silverware-fork-knife',
  order:    'mdi-receipt-outline',
  table:    'mdi-table-furniture',
  staff:    'mdi-badge-account-outline',
  category: 'mdi-tag-outline',
  settings: 'mdi-cog-outline',
  system:   'mdi-server-outline',
}

const TABLE_HEADERS = [
  { title: 'ID',          key: 'id',          sortable: false },
  { title: 'Date',        key: 'timestamp',   sortable: false },
  { title: 'User',        key: 'user',        sortable: false },
  { title: 'IP Address',  key: 'ip_address',  sortable: false },
  { title: 'Event',       key: 'event_type',  sortable: false },
  { title: 'Action',      key: 'action',      sortable: false },
  { title: 'Description', key: 'description', sortable: false },
  { title: '',            key: 'actions',     sortable: false, align: 'end' },
]
</script>

<template>
  <v-card rounded="xl" border flat>
    <v-data-table
      class="activity-table"
      density="compact"
      :headers="TABLE_HEADERS"
      :items="items"
      :loading="loading"
      :items-per-page="meta.per_page"
      :page="meta.current_page"
      :items-length="meta.total"
      :header-props="{ class: 'text-caption font-weight-bold text-uppercase text-medium-emphasis' }"
      :items-per-page-options="[10, 25, 50]"
      item-value="id"
      v-model:selected="selectedIds"
      v-model:expanded="expandedIds"
      @update:page="$emit('page-change', { page: $event, perPage: meta.per_page })"
      @update:items-per-page="$emit('page-change', { page: 1, perPage: $event })"
    >
      <template #loading>
        <v-skeleton-loader type="table-row@8" />
      </template>
      <template #item.id="{ item }">
        <span class="text-body-2 font-weight-medium text-medium-emphasis">#{{ item.id }}</span>
      </template>

      <template #item.timestamp="{ item }">
        <div class="text-body-2 text-no-wrap">{{ item.timestamp }}</div>
      </template>

      <template #item.user="{ item }">
        <div v-if="item.user" class="d-flex align-center ga-2">
          <v-avatar size="26" color="var(--app-primary)" variant="tonal" rounded="md">
            <span style="font-size:10px; font-weight:800">
              {{ (item.user.name?.[0] ?? '?').toUpperCase() }}
            </span>
          </v-avatar>
          <div>
            <div class="text-body-2 text-primary font-weight-medium">{{ item.user.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.user.role }}</div>
          </div>
        </div>
        <span v-else class="text-caption text-medium-emphasis">System</span>
      </template>

      <template #item.ip_address="{ item }">
        <ActivityIpInfo :ip="item.ip_address" />
      </template>

      <template #item.event_type="{ item }">
        <v-chip size="x-small" variant="tonal" color="primary" rounded="sm">
          <template #prepend>
            <v-icon size="10">{{ EVENT_ICON[item.event_type] ?? 'mdi-circle-outline' }}</v-icon>
          </template>
          {{ item.event_type }}
        </v-chip>
      </template>

      <template #item.action="{ item }">
        <v-chip
          size="x-small" variant="tonal" rounded="sm"
          :color="ACTION_COLOR[item.action] ?? 'grey'"
        >{{ item.action }}</v-chip>
      </template>

      <template #item.description="{ item }">
        <span
          class="text-body-2 text-medium-emphasis"
          style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;"
        >{{ item.description }}</span>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex align-center justify-end ga-1">
          <v-btn
            size="small" color="primary" variant="tonal" rounded="lg"
            @click="toggleDetails(item.id)"
          >
            <v-icon size="14" class="mr-1">
              {{ expandedIds.includes(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
            Details
          </v-btn>
          <v-btn icon size="x-small" variant="text" @click="$emit('delete', item.id)">
            <v-icon size="15" color="grey">mdi-delete-outline</v-icon>
            <v-tooltip activator="parent" location="top">Delete</v-tooltip>
          </v-btn>
        </div>
      </template>

      <template #expanded-row="{ columns, item }">
        <tr class="detail-row">
          <td :colspan="columns.length" class="pb-4 px-4">
            <ActivityDetailsPanel :item="item" />
          </td>
        </tr>
      </template>
    </v-data-table>

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
  padding-top: 12px;
  padding-bottom: 12px;
}
.row-selected { background: rgba(15, 158, 95, 0.04); }
.detail-row td { background: #fafafa; padding-top: 0 !important; }
</style>
