<script setup>
const props = defineProps({
  categories: { type: Array, default: () => [] },
  categoryCounts: { type: Object, required: true },
})
const emit = defineEmits(['view', 'edit', 'delete', 'view-all'])
</script>

<template>
  <v-card rounded="xl" border flat>
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="text-subtitle-1 font-weight-black">All Categories</div>
        <v-btn variant="outlined" rounded="lg" size="small" @click="emit('view-all')">
          View All Items
        </v-btn>
      </div>

      <div v-if="!categories.length" class="text-caption text-medium-emphasis">
        No categories found.
      </div>

      <v-row v-else dense>
        <v-col v-for="cat in categories" :key="cat.category_id" cols="12" sm="6">
          <v-card rounded="lg" border flat class="pa-3">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-body-1 font-weight-black">{{ cat.category_name }}</div>
                <div class="text-caption text-medium-emphasis">{{ cat.description || 'No description' }}</div>
              </div>
              <v-chip size="x-small" variant="tonal" :color="cat.status ? 'success' : 'grey'">
                {{ cat.status ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>
            <div class="d-flex align-center justify-space-between mt-3">
              <div class="text-caption text-medium-emphasis">
                {{ categoryCounts.get(cat.category_id) ?? 0 }} items
              </div>
              <div class="d-flex align-center ga-1">
                <v-btn icon size="small" variant="text" @click="emit('view', cat.category_id)">
                  <v-icon size="16">mdi-view-grid-outline</v-icon>
                  <v-tooltip activator="parent" location="top">View Items</v-tooltip>
                </v-btn>
                <v-btn icon size="small" variant="text" @click="emit('edit', cat)">
                  <v-icon size="16">mdi-pencil-outline</v-icon>
                  <v-tooltip activator="parent" location="top">Edit</v-tooltip>
                </v-btn>
                <v-btn icon size="small" variant="text" @click="emit('delete', cat.category_id)">
                  <v-icon size="16">mdi-delete-outline</v-icon>
                  <v-tooltip activator="parent" location="top">Delete</v-tooltip>
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
