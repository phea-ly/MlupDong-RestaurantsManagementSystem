<script setup>
defineProps({
  total:    { type: Number, default: 0 },
  dbSizeMb: { type: Number, default: 0 },
})
defineEmits(['refresh'])
</script>

<template>
  <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-5">
    <div class="d-flex align-center ga-3">
    </div>

    <div class="d-flex align-center ga-3 flex-wrap">
      <!-- Summary pill -->
      <v-sheet rounded="lg" border class="d-flex align-center px-3 py-2 ga-3">
        <div class="text-caption text-medium-emphasis">
          Total Entries: <strong class="text-primary">{{ total.toLocaleString() }}</strong>
        </div>
        <v-divider vertical />
        <div class="text-caption text-medium-emphasis">
          DB Size: <strong class="text-primary">{{ dbSizeMb }} MB</strong>
        </div>
      </v-sheet>
      <v-btn variant="outlined" rounded="lg" size="small" prepend-icon="mdi-refresh" @click="$emit('refresh')">
        Refresh
      </v-btn>
    </div>
  </div>
</template>