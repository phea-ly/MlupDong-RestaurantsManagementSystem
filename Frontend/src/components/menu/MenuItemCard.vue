<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  item: { type: Object, required: true },
})
const emit = defineEmits(['toggle-status', 'edit', 'delete'])

const imgError = ref(false)

const imageUrl = computed(() => {
  const raw = props.item.image
  if (imgError.value || !raw) return null
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  // Use VITE_STORAGE_URL so /storage/ paths resolve correctly
  const base = (import.meta.env.VITE_STORAGE_URL ?? 'http://127.0.0.1:8000/storage')
    .replace(/\/+$/, '')
  // raw is already '/storage/menu-images/xxx.jpg' — strip the '/storage' prefix
  const path = raw.replace(/^\/storage/, '')
  return `${base}${path}`
})

const formattedPrice = computed(() => Number(props.item.price).toFixed(2))
const categoryName   = computed(() => props.item.category?.category_name ?? null)
</script>

<template>
  <v-card
    rounded="xl" elevation="0" border
    :class="{ 'opacity-60': !item.status }"
    style="transition: box-shadow 0.2s, transform 0.2s"
    hover
  >
    <!-- Image -->
    <div style="position:relative; height:160px; overflow:hidden; background:#f2f5f8;">
      <v-img
        v-if="imageUrl"
        :src="imageUrl"
        height="160" cover
        @error="imgError = true"
      />
      <div v-else class="d-flex align-center justify-center" style="height:160px;">
        <v-icon size="48" color="grey-lighten-2">mdi-image-off-outline</v-icon>
      </div>

      <!-- Status badge -->
      <v-chip
        :color="item.status ? 'success' : 'error'"
        variant="tonal" size="x-small"
        style="position:absolute; top:10px; right:10px;"
      >
        <template #prepend><v-icon size="8">mdi-circle</v-icon></template>
        {{ item.status ? 'Active' : 'Inactive' }}
      </v-chip>

      <!-- Category badge -->
      <v-chip
        v-if="categoryName"
        color="black" variant="flat" size="x-small"
        style="position:absolute; bottom:10px; left:10px; opacity:0.75;"
      >
        {{ categoryName }}
      </v-chip>
    </div>

    <v-card-text class="pb-2">
      <div class="text-subtitle-2 font-weight-black text-truncate mb-1">{{ item.name }}</div>
      <div
        class="text-caption text-medium-emphasis"
        style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:32px;"
      >
        {{ item.description || 'No description provided.' }}
      </div>
      <div class="text-h6 font-weight-black mt-2">${{ formattedPrice }}</div>
    </v-card-text>

    <v-divider />

    <v-card-actions class="px-3 py-2">
      <!-- Toggle availability -->
      <v-btn
        :color="item.status ? 'success' : 'default'"
        variant="tonal" size="small" rounded="lg"
        :prepend-icon="item.status ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
        @click="emit('toggle-status', item)"
      >
        {{ item.status ? 'Available' : 'Unavailable' }}
      </v-btn>

      <v-spacer />

      <v-btn icon size="small" variant="text" color="primary" @click="emit('edit', item)">
        <v-icon size="18">mdi-pencil-outline</v-icon>
        <v-tooltip activator="parent" location="top">Edit</v-tooltip>
      </v-btn>
      <v-btn icon size="small" variant="text" color="error" @click="emit('delete', item.rawId)">
        <v-icon size="18">mdi-delete-outline</v-icon>
        <v-tooltip activator="parent" location="top">Delete</v-tooltip>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>