<script setup>
import { ref, computed } from 'vue'
import ActivityIpInfo      from './ActivityIpInfo.vue'
import ActivityDetailsPanel from './ActivityDetailsPanel.vue'

const props = defineProps({
  items:   { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false },
  meta:    { type: Object,  default: () => ({ current_page: 1, last_page: 1, total: 0, per_page: 15 }) },
})
defineEmits(['page-change', 'delete'])

// ── Selection ──────────────────────────────────────────────────────────────
const selectedIds = ref([])
const expandedId  = ref(null)
const bulkAction  = ref('Bulk Actions')

const allSelected = computed(() =>
  props.items.length > 0 && selectedIds.value.length === props.items.length
)

function toggleAll() {
  selectedIds.value = allSelected.value ? [] : props.items.map(i => i.id)
}

function toggleRow(id) {
  selectedIds.value = selectedIds.value.includes(id)
    ? selectedIds.value.filter(x => x !== id)
    : [...selectedIds.value, id]
}

function toggleDetails(id) {
  expandedId.value = expandedId.value === id ? null : id
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
</script>

<template>
  <v-card rounded="xl" border flat>

    <!-- Toolbar -->
    <v-card-text class="pa-4 pb-0">
      <div class="d-flex align-center ga-3 flex-wrap">
        <v-select
          v-model="bulkAction"
          :items="['Bulk Actions', 'Delete Selected', 'Export Selected']"
          variant="outlined" density="compact" rounded="lg"
          hide-details style="max-width:170px"
        />
        <v-btn variant="outlined" size="small" :disabled="selectedIds.length === 0">Apply</v-btn>
        <div class="text-caption text-medium-emphasis ml-auto">
          Showing {{ items.length }} of {{ meta.total.toLocaleString() }} entries
        </div>
      </div>
    </v-card-text>

    <v-divider class="mt-3" />

    <!-- Table -->
    <v-table density="compact" class="activity-table">
      <thead>
        <tr>
          <th style="width:36px">
            <v-checkbox-btn :model-value="allSelected" @click="toggleAll" />
          </th>
          <th class="text-caption text-medium-emphasis">ID</th>
          <th class="text-caption text-medium-emphasis">Date</th>
          <th class="text-caption text-medium-emphasis">User</th>
          <th class="text-caption text-medium-emphasis">IP Address</th>
          <th class="text-caption text-medium-emphasis">Event</th>
          <th class="text-caption text-medium-emphasis">Action</th>
          <th class="text-caption text-medium-emphasis">Description</th>
          <th class="text-caption text-medium-emphasis" style="width:120px; text-align:right"></th>
        </tr>
      </thead>

      <tbody>
        <!-- Loading skeleton -->
        <template v-if="loading">
          <tr v-for="i in 8" :key="i">
            <td colspan="9"><v-skeleton-loader type="text" /></td>
          </tr>
        </template>

        <template v-else-if="items.length">
          <template v-for="item in items" :key="item.id">

            <!-- Main row -->
            <tr :class="{ 'row-selected': selectedIds.includes(item.id) }">
              <td>
                <v-checkbox-btn
                  :model-value="selectedIds.includes(item.id)"
                  @click="toggleRow(item.id)"
                />
              </td>
              <td class="text-body-2 font-weight-medium text-medium-emphasis">#{{ item.id }}</td>
              <td>
                <div class="text-body-2 text-no-wrap">{{ item.timestamp }}</div>
              </td>
              <td>
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
              </td>
              <td>
                <ActivityIpInfo :ip="item.ip_address" />
              </td>
              <td>
                <v-chip size="x-small" variant="tonal" color="primary" rounded="sm">
                  <template #prepend>
                    <v-icon size="10">{{ EVENT_ICON[item.event_type] ?? 'mdi-circle-outline' }}</v-icon>
                  </template>
                  {{ item.event_type }}
                </v-chip>
              </td>
              <td>
                <v-chip
                  size="x-small" variant="tonal" rounded="sm"
                  :color="ACTION_COLOR[item.action] ?? 'grey'"
                >{{ item.action }}</v-chip>
              </td>
              <td>
                <span
                  class="text-body-2 text-medium-emphasis"
                  style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;"
                >{{ item.description }}</span>
              </td>
              <td class="text-right">
                <div class="d-flex align-center justify-end ga-1">
                  <v-btn
                    size="small" color="primary" variant="tonal" rounded="lg"
                    @click="toggleDetails(item.id)"
                  >
                    <v-icon size="14" class="mr-1">
                      {{ expandedId === item.id ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                    </v-icon>
                    Details
                  </v-btn>
                  <v-btn icon size="x-small" variant="text" @click="$emit('delete', item.id)">
                    <v-icon size="15" color="grey">mdi-delete-outline</v-icon>
                    <v-tooltip activator="parent" location="top">Delete</v-tooltip>
                  </v-btn>
                </div>
              </td>
            </tr>

            <!-- Expanded detail row -->
            <tr v-if="expandedId === item.id" class="detail-row">
              <td colspan="9" class="pb-4 px-4">
                <ActivityDetailsPanel :item="item" />
              </td>
            </tr>

          </template>
        </template>

        <!-- Empty state -->
        <tr v-else>
          <td colspan="9">
            <div class="d-flex flex-column align-center ga-2 py-12 text-center">
              <v-icon size="48" color="grey-lighten-2">mdi-history</v-icon>
              <span class="text-body-2 text-medium-emphasis">No activity logs found.</span>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Pagination -->
    <v-divider />
    <div class="d-flex justify-center pa-3">
      <v-pagination
        :model-value="meta.current_page"
        :length="meta.last_page"
        :total-visible="7"
        rounded="lg"
        density="comfortable"
        @update:model-value="$emit('page-change', $event)"
      />
    </div>

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