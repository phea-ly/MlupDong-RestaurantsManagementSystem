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
  <v-card class="activity-card" rounded="xl" border flat>
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
        <span class="id-badge">#{{ item.id }}</span>
      </template>

      <template #item.timestamp="{ item }">
        <div class="text-body-2 text-no-wrap timestamp">{{ item.timestamp }}</div>
      </template>

      <template #item.user="{ item }">
        <div v-if="item.user" class="d-flex align-center ga-2">
          <v-avatar size="28" class="user-avatar" rounded="md">
            <span class="avatar-initials">
              {{ (item.user.name?.[0] ?? '?').toUpperCase() }}
            </span>
          </v-avatar>
          <div>
            <div class="text-body-2 font-weight-medium user-name">{{ item.user.name }}</div>
            <div class="text-caption user-role">{{ item.user.role }}</div>
          </div>
        </div>
        <span v-else class="system-label">System</span>
      </template>

      <template #item.ip_address="{ item }">
        <ActivityIpInfo :ip="item.ip_address" />
      </template>

      <template #item.event_type="{ item }">
        <v-chip size="x-small" class="event-chip" rounded="sm">
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
        <span class="description-text">{{ item.description }}</span>
      </template>

      <template #item.actions="{ item }">
        <div class="d-flex align-center justify-end ga-1">
          <v-btn
            size="small"
            class="details-btn"
            variant="tonal"
            rounded="lg"
            @click="toggleDetails(item.id)"
          >
            <v-icon size="14" class="mr-1">
              {{ expandedIds.includes(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            </v-icon>
            Details
          </v-btn>
          <v-btn icon size="x-small" variant="text" class="delete-btn" @click="$emit('delete', item.id)">
            <v-icon size="15">mdi-delete-outline</v-icon>
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
/* ── Brand tokens ──────────────────────────────────────────────────────────── */
:root {
  --brand:        #407709;
  --brand-light:  #5a9e10;
  --brand-dim:    rgba(64, 119, 9, 0.10);
  --brand-dimmer: rgba(64, 119, 9, 0.06);
}

/* ── Card shell ────────────────────────────────────────────────────────────── */
.activity-card {
  border-color: rgba(64, 119, 9, 0.18) !important;
  overflow: hidden;
}

/* ── Table header ──────────────────────────────────────────────────────────── */
.activity-table :deep(th) {
  text-transform: uppercase;
  font-size: 0.70rem;
  letter-spacing: 0.06em;
  font-weight: 700;
  color: #407709 !important;
  border-bottom: 2px solid rgba(64, 119, 9, 0.20) !important;
  background: rgba(64, 119, 9, 0.04) !important;
}

/* ── Table cells ───────────────────────────────────────────────────────────── */
.activity-table :deep(td) {
  vertical-align: top;
  padding-top: 12px;
  padding-bottom: 12px;
  border-bottom-color: rgba(64, 119, 9, 0.08) !important;
}

/* ── Row hover ─────────────────────────────────────────────────────────────── */
.activity-table :deep(tbody tr:hover td) {
  background: rgba(64, 119, 9, 0.04) !important;
}

/* ── ID badge ──────────────────────────────────────────────────────────────── */
.id-badge {
  font-size: 0.80rem;
  font-weight: 600;
  color: #407709;
  background: rgba(64, 119, 9, 0.10);
  padding: 2px 7px;
  border-radius: 5px;
  letter-spacing: 0.02em;
}

/* ── Timestamp ─────────────────────────────────────────────────────────────── */
.timestamp {
  color: #555;
}

/* ── User avatar ───────────────────────────────────────────────────────────── */
.user-avatar {
  background: rgba(64, 119, 9, 0.14) !important;
}
.avatar-initials {
  font-size: 10px;
  font-weight: 800;
  color: #407709;
}
.user-name {
  color: #407709;
}
.user-role {
  color: #888;
}
.system-label {
  font-size: 0.75rem;
  color: #aaa;
}

/* ── Event chip ────────────────────────────────────────────────────────────── */
.event-chip {
  background: rgba(64, 119, 9, 0.12) !important;
  color: #407709 !important;
  font-weight: 600;
}
.event-chip :deep(.v-icon) {
  color: #407709 !important;
}

/* ── Description ───────────────────────────────────────────────────────────── */
.description-text {
  font-size: 0.875rem;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Details button ────────────────────────────────────────────────────────── */
.details-btn {
  background: rgba(64, 119, 9, 0.10) !important;
  color: #407709 !important;
  font-weight: 600;
  font-size: 0.78rem;
  transition: background 0.2s ease;
}
.details-btn:hover {
  background: rgba(64, 119, 9, 0.18) !important;
}

/* ── Delete button ─────────────────────────────────────────────────────────── */
.delete-btn :deep(.v-icon) {
  color: #bbb !important;
  transition: color 0.2s ease;
}
.delete-btn:hover :deep(.v-icon) {
  color: #e53935 !important;
}

/* ── Selected row ──────────────────────────────────────────────────────────── */
.activity-table :deep(tr.v-data-table__selected td) {
  background: rgba(64, 119, 9, 0.06) !important;
}

/* ── Expanded / detail row ─────────────────────────────────────────────────── */
.detail-row td {
  background: rgba(64, 119, 9, 0.03) !important;
  border-top: 1px dashed rgba(64, 119, 9, 0.15) !important;
  padding-top: 0 !important;
}

/* ── Pagination area ───────────────────────────────────────────────────────── */
.activity-table :deep(.v-data-table-footer) {
  border-top: 1px solid rgba(64, 119, 9, 0.12);
  background: rgba(64, 119, 9, 0.03);
}

/* ── Vuetify override: loading bar ─────────────────────────────────────────── */
.activity-table :deep(.v-progress-linear__background),
.activity-table :deep(.v-progress-linear__buffer) {
  background: rgba(64, 119, 9, 0.15) !important;
}
.activity-table :deep(.v-progress-linear__determinate),
.activity-table :deep(.v-progress-linear__indeterminate) {
  background: #407709 !important;
}
</style>