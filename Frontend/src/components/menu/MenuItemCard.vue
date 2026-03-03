<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['toggle-status', 'edit', 'delete'])
</script>

<template>
  <v-card rounded="lg" border class="menu-item-card">
    <div class="image-container">
      <v-img :src="item.image" height="200" cover />
      <v-chip
        v-if="item.badge"
        size="small"
        :color="item.badge === 'SOLD OUT' ? '#ff5757' : '#14d886'"
        class="badge-chip"
      >
        {{ item.badge }}
      </v-chip>
    </div>

    <v-card-text class="pa-4">
      <div class="d-flex justify-space-between align-start mb-2">
        <div class="flex-grow-1">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-description">{{ item.description }}</p>
        </div>
        <p class="item-price">${{ item.price.toFixed(2) }}</p>
      </div>

      <div class="d-flex align-center justify-space-between mt-3">
        <div class="d-flex align-center ga-2">
          <span class="status-label">STATUS</span>
          <v-switch
            :model-value="item.status"
            color="#14d886"
            density="compact"
            hide-details
            @update:model-value="emit('toggle-status', item.id)"
          />
        </div>

        <div class="d-flex ga-1">
          <v-btn
            icon
            size="small"
            variant="text"
            color="#14d886"
            @click="emit('edit', item)"
          >
            <v-icon size="18">mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            size="small"
            variant="text"
            color="#ff5757"
            @click="emit('delete', item.id)"
          >
            <v-icon size="18">mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.menu-item-card {
  height: 100%;
  transition: all 0.2s;
}

.menu-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
}

.badge-chip {
  position: absolute;
  top: 12px;
  left: 12px;
  font-weight: 700;
  font-size: 10px;
}

.item-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #0f1d38;
}

.item-description {
  font-size: 12px;
  color: #71839b;
  margin: 0;
}

.item-price {
  font-size: 18px;
  font-weight: 700;
  color: #14d886;
  margin: 0;
  white-space: nowrap;
  margin-left: 12px;
}

.status-label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #76879f;
}
</style>
