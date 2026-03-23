<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
})

const showJson  = ref(false)
const copied    = ref(false)

// Build a structured detail shape from the flat store item
const detail = computed(() => ({
  basic: {
    logId:       props.item.id,
    createdAt:   props.item.timestamp,
    eventType:   props.item.event_type,
    action:      props.item.action,
    description: props.item.description,
  },
  user: {
    id:          props.item.user?.id          ?? '—',
    username:    props.item.user?.email       ?? 'system',
    displayName: props.item.user?.name        ?? 'System',
    role:        props.item.user?.role        ?? '—',
  },
  network: {
    ip:         props.item.ip_address ?? '—',
    userAgent:  props.item.user_agent ?? '—',
  },
  metadata: props.item.metadata ?? {},
}))

const rawFields = computed(() => [
  { key: 'id',          value: detail.value.basic.logId },
  { key: 'event_type',  value: detail.value.basic.eventType },
  { key: 'action',      value: detail.value.basic.action },
  { key: 'description', value: detail.value.basic.description },
  { key: 'ip_address',  value: detail.value.network.ip },
  { key: 'user_agent',  value: detail.value.network.userAgent },
  { key: 'created_at',  value: detail.value.basic.createdAt },
  ...Object.entries(detail.value.metadata).map(([key, value]) => ({ key, value })),
])

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(props.item, null, 2))
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { /* ignore */ }
}
</script>

<template>
  <v-card rounded="xl" border flat class="pa-4 mt-3">
    <!-- Toolbar -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4">
      <div class="text-subtitle-2 font-weight-black">Complete Log Entry Details</div>
      <div class="d-flex align-center ga-2">
        <v-btn
          size="small" color="primary" variant="tonal"
          :prepend-icon="showJson ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          @click="showJson = !showJson"
        >{{ showJson ? 'Hide JSON' : 'Show JSON' }}</v-btn>
        <v-btn
          size="small" variant="outlined"
          :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
          @click="copyToClipboard"
        >{{ copied ? 'Copied!' : 'Copy to Clipboard' }}</v-btn>
      </div>
    </div>

    <!-- JSON view -->
    <v-card v-if="showJson" rounded="lg" color="grey-darken-4" flat class="mb-4">
      <v-card-text>
        <pre class="json-pre text-caption text-white">{{ JSON.stringify(item, null, 2) }}</pre>
      </v-card-text>
    </v-card>

    <!-- 4-column detail cards -->
    <v-row dense class="mb-4">

      <!-- Basic -->
      <v-col cols="12" md="3">
        <v-card rounded="lg" border flat class="pa-4 h-100" style="border-left:4px solid #2563eb">
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon size="16" color="primary">mdi-information-outline</v-icon>
            <span class="detail-label">Basic Information</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">LOG ID</span>
            <span class="detail-val font-weight-bold">{{ detail.basic.logId }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">CREATED AT</span>
            <span class="detail-val">{{ detail.basic.createdAt }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">EVENT TYPE</span>
            <span class="detail-val">{{ detail.basic.eventType }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">ACTION</span>
            <span class="detail-val">{{ detail.basic.action }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">DESCRIPTION</span>
            <span class="detail-val">{{ detail.basic.description }}</span>
          </div>
        </v-card>
      </v-col>

      <!-- User -->
      <v-col cols="12" md="3">
        <v-card rounded="lg" border flat class="pa-4 h-100" style="border-left:4px solid #16a34a">
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon size="16" color="success">mdi-account-outline</v-icon>
            <span class="detail-label">User Information</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">USER ID</span>
            <span class="detail-val font-weight-bold">{{ detail.user.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">USERNAME</span>
            <span class="detail-val">{{ detail.user.username }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">DISPLAY NAME</span>
            <span class="detail-val">{{ detail.user.displayName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">USER ROLE</span>
            <span class="detail-val">{{ detail.user.role }}</span>
          </div>
        </v-card>
      </v-col>

      <!-- Network -->
      <v-col cols="12" md="3">
        <v-card rounded="lg" border flat class="pa-4 h-100" style="border-left:4px solid #7c3aed">
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon size="16" color="deep-purple">mdi-lan-connect</v-icon>
            <span class="detail-label">Network Information</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">IP ADDRESS</span>
            <span class="detail-val font-weight-bold font-mono">{{ detail.network.ip }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">USER AGENT</span>
            <span class="detail-val" style="word-break:break-all">{{ detail.network.userAgent }}</span>
          </div>
        </v-card>
      </v-col>

      <!-- Metadata -->
      <v-col cols="12" md="3">
        <v-card rounded="lg" border flat class="pa-4 h-100" style="border-left:4px solid #f59e0b">
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon size="16" color="orange-darken-2">mdi-code-json</v-icon>
            <span class="detail-label">Metadata</span>
          </div>
          <div v-if="Object.keys(detail.metadata).length">
            <div
              v-for="(val, key) in detail.metadata" :key="key"
              class="detail-row"
            >
              <span class="detail-key">{{ String(key).toUpperCase() }}</span>
              <span class="detail-val">{{ val ?? '—' }}</span>
            </div>
          </div>
          <span v-else class="text-caption text-medium-emphasis">No metadata recorded.</span>
        </v-card>
      </v-col>

    </v-row>

    <!-- Raw DB fields -->
    <v-card rounded="lg" border flat class="pa-4">
      <div class="d-flex align-center ga-2 mb-3">
        <v-icon size="16" color="primary">mdi-database-outline</v-icon>
        <span class="detail-label">Raw Database Fields</span>
      </div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-caption text-medium-emphasis" style="width:180px">DATABASE FIELD</th>
            <th class="text-caption text-medium-emphasis">RAW VALUE</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rawFields" :key="row.key">
            <td class="text-body-2 font-weight-medium font-mono">{{ row.key }}</td>
            <td class="text-body-2">{{ row.value ?? '—' }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

  </v-card>
</template>

<style scoped>
.detail-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
.detail-row   { margin-bottom: 10px; }
.detail-key   { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: rgba(0,0,0,.45); margin-bottom: 2px; }
.detail-val   { font-size: 13px; }
.font-mono    { font-family: 'Courier New', monospace; font-size: 11px; }
.json-pre     { white-space: pre-wrap; word-break: break-all; font-family: 'Courier New', monospace; font-size: 11px; }
</style>