<script setup>
defineProps({
  filters:    { type: Object,  required: true },
  eventTypes: { type: Array,   default: () => [] },
  actions:    { type: Array,   default: () => [] },
  loading:    { type: Boolean, default: false },
  summary:    { type: Object,  default: () => ({ total_entries: 0, db_size_mb: 0 }) },
})
defineEmits(['apply', 'reset'])
</script>

<template>
  <v-card rounded="xl" border flat class="mb-4">
    <v-card-text class="pa-4">

      <!-- Row 1 -->
      <v-row dense>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.date_from"
            label="Date From" type="date"
            variant="outlined" density="compact" rounded="lg" hide-details
          />
        </v-col>
        <v-col cols="12" md="2">
          <v-text-field
            v-model="filters.date_to"
            label="Date To" type="date"
            variant="outlined" density="compact" rounded="lg" hide-details
          />
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center justify-end">
          <v-sheet rounded="lg" border class="d-flex align-center px-3 py-2 ga-3" style="min-width:260px">
            <div class="text-caption text-medium-emphasis">
              Total Entries: <strong color="#407709">{{ summary.total_entries?.toLocaleString() }}</strong>
            </div>
            <v-divider vertical />
            <div class="text-caption text-medium-emphasis">
              DB Size: <strong color="#407709">{{ summary.db_size_mb }} MB</strong>
            </div>
          </v-sheet>
        </v-col>
      </v-row>

      <!-- Row 2 -->
      <v-row dense class="mt-2">
        <v-col cols="12" md="8">
          <v-text-field
            v-model="filters.search"
            label="Search"
            placeholder="Search logs for anything..."
            variant="outlined" density="compact" rounded="lg" hide-details clearable
            @keyup.enter="$emit('apply')"
          >
            <template #append-inner>
              <v-icon size="18" color="grey">mdi-magnify</v-icon>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="4" class="d-flex align-center justify-end ga-2">
          <v-btn
            color="var(--app-primary)" rounded="lg" elevation="0" size="small"
            :loading="loading"
            @click="$emit('apply')"
          >
            <span style="color:white; font-weight:800">Apply Filters</span>
          </v-btn>
          <v-btn variant="outlined" rounded="lg" size="small" @click="$emit('reset')">
            Reset
          </v-btn>
        </v-col>
      </v-row>

    </v-card-text>
  </v-card>
</template>