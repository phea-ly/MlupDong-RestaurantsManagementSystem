<script setup>
const props = defineProps({
  topCategories: { type: Array, default: () => [] },
})
</script>

<template>
  <v-card rounded="xl" border flat class="pa-4">
    <div class="text-subtitle-1 font-weight-black mb-3">Top Categories</div>
    <div v-if="topCategories.length">
      <div v-for="cat in topCategories" :key="cat.id" class="mb-4">
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-body-2 font-weight-medium">{{ cat.name }}</span>
          <span class="text-caption font-weight-bold">{{ cat.pct }}%</span>
        </div>
        <v-progress-linear :model-value="cat.pct" height="8" rounded color="var(--app-primary)" bg-color="grey-lighten-3" />
      </div>
    </div>
    <v-alert v-else type="info" variant="tonal" density="compact">
      Add categories to see trends here.
    </v-alert>
  </v-card>
</template>

