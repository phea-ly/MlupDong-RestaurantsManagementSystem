<script setup>
import { ref } from 'vue'

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({ totalEntries: 0, dbSize: '0 MB', live: false }),
  },
})

const dateFrom = ref('')
const dateTo = ref('')
const user = ref('All Users')
const eventType = ref('All Events')
const action = ref('All Actions')
const ipAddress = ref('All IP Addresses')
const search = ref('')
const liveMonitor = ref(true)

const users = ['All Users', 'admin', 'system', 'manager', 'staff']
const eventTypes = ['All Events', 'User', 'Media', 'Settings', 'Order', 'Security']
const actions = ['All Actions', 'added', 'updated', 'deleted', 'login', 'logout']
const ipOptions = ['All IP Addresses', '192.168.1.1', '194.35.123.xxx', '10.0.0.24']
</script>

<template>
  <v-card rounded="xl" border flat class="mb-4">
    <v-card-text class="pa-4">
      <v-row dense>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="dateFrom"
            label="Date From"
            placeholder="From"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="dateTo"
            label="Date To"
            placeholder="To"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="user"
            :items="users"
            label="User"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="eventType"
            :items="eventTypes"
            label="Event Type"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="3" class="d-flex align-center">
          <v-checkbox
            v-model="liveMonitor"
            label="Live Monitor"
            density="compact"
            hide-details
            class="mr-2"
          />
          <v-icon size="16" color="grey">mdi-help-circle-outline</v-icon>
          <span class="text-caption ml-2" :class="liveMonitor ? 'text-success' : 'text-medium-emphasis'">
            {{ liveMonitor ? 'Live monitoring active' : 'Live monitoring paused' }}
          </span>
        </v-col>
        <v-col cols="12" md="3" class="d-flex justify-end">
          <v-sheet
            rounded="lg"
            border
            class="d-flex align-center px-3 py-2 ga-4"
            style="min-width:260px"
          >
            <div class="text-caption text-medium-emphasis">
              Total Log Entries: <strong class="text-primary">{{ summary.totalEntries }}</strong>
            </div>
            <v-divider vertical />
            <div class="text-caption text-medium-emphasis">
              Log Database Size: <strong class="text-primary">{{ summary.dbSize }}</strong>
            </div>
            <v-icon size="16" color="grey">mdi-help-circle-outline</v-icon>
          </v-sheet>
        </v-col>
      </v-row>

      <v-row dense class="mt-2">
        <v-col cols="12" md="2">
          <v-select
            v-model="action"
            :items="actions"
            label="Action"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-select
            v-model="ipAddress"
            :items="ipOptions"
            label="IP Address"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="search"
            label="Search"
            placeholder="Search logs for anything..."
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
          >
            <template #append-inner>
              <v-icon size="18" color="grey">mdi-magnify</v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="2" class="d-flex align-center justify-end ga-2">
          <v-btn color="primary" rounded="lg" elevation="0" size="small">Apply Filters</v-btn>
          <v-btn variant="outlined" rounded="lg" size="small">Reset Filters</v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
