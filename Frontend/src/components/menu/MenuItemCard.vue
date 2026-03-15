<script setup>
const props = defineProps({
  item: { type: Object, required: true }
})

const emit = defineEmits(['toggle-status', 'edit', 'delete'])

const fallbackImg = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400'

function formatPrice(price) {
  return parseFloat(price || 0).toFixed(2)
}

function getCategoryName(item) {
  return item.category?.category_name ?? ''
}
</script>

<template>
  <div class="menu-card" :class="{ inactive: !item.status }">

    <!-- Image area -->
    <div class="card-image-wrap">
      <img
        class="card-img"
        :src="item.image || fallbackImg"
        :alt="item.name"
        @error="e => e.target.src = fallbackImg"
      />

      <!-- Inactive overlay -->
      <div v-if="!item.status" class="inactive-overlay">
        <v-icon size="20" color="#fff">mdi-eye-off-outline</v-icon>
        <span>Inactive</span>
      </div>

      <!-- Category badge -->
      <div v-if="getCategoryName(item)" class="cat-badge">
        {{ getCategoryName(item) }}
      </div>
    </div>

    <!-- Body -->
    <div class="card-body">

      <!-- Name + Price -->
      <div class="card-title-row">
        <h3 class="card-name">{{ item.name }}</h3>
        <span class="card-price">${{ formatPrice(item.price) }}</span>
      </div>

      <!-- Description -->
      <p class="card-desc">{{ item.description || 'No description provided.' }}</p>

      <!-- Divider -->
      <div class="card-divider" />

      <!-- Footer row -->
      <div class="card-footer">

        <!-- Status toggle -->
        <div class="status-toggle-wrap">
          <v-switch
            :model-value="item.status"
            color="#14dc8b"
            density="compact"
            hide-details
            inset
            @update:model-value="emit('toggle-status', item.id)"
          />
          <span class="status-text" :class="item.status ? 'active' : 'inactive-text'">
            {{ item.status ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <!-- Edit / Delete actions -->
        <div class="card-actions">
          <button class="action-btn edit-btn" title="Edit" @click="emit('edit', item)">
            <v-icon size="15">mdi-pencil-outline</v-icon>
          </button>
          <button class="action-btn delete-btn" title="Delete" @click="emit('delete', item.id)">
            <v-icon size="15">mdi-trash-can-outline</v-icon>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Card wrapper ── */
.menu-card {
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e8edf2;
  transition: all 0.22s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.menu-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(18, 32, 57, 0.1);
  border-color: #cdd8e2;
}
.menu-card.inactive {
  opacity: 0.75;
}

/* ── Image ── */
.card-image-wrap {
  position: relative;
  height: 180px;
  flex-shrink: 0;
  overflow: hidden;
  background: #f0f5f8;
}
.card-img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.menu-card:hover .card-img { transform: scale(1.04); }

.inactive-overlay {
  position: absolute; inset: 0;
  background: rgba(18, 32, 57, 0.55);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 6px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.cat-badge {
  position: absolute;
  bottom: 10px; right: 10px;
  background: rgba(18,32,57,0.8);
  color: #14dc8b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

/* ── Body ── */
.card-body {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.card-name {
  font-size: 14.5px;
  font-weight: 800;
  color: #0f1d38;
  margin: 0;
  line-height: 1.3;
  flex: 1;
}

.card-price {
  font-size: 16px;
  font-weight: 900;
  color: #14dc8b;
  white-space: nowrap;
}

.card-desc {
  font-size: 12px;
  color: #8899aa;
  margin: 0 0 12px;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-divider {
  height: 1px;
  background: #f0f4f7;
  margin-bottom: 10px;
}

/* ── Footer ── */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-toggle-wrap {
  display: flex; align-items: center; gap: 6px;
}
.status-text {
  font-size: 11.5px;
  font-weight: 700;
}
.status-text.active      { color: #14dc8b; }
.status-text.inactive-text { color: #9aabbd; }

/* ── Action buttons ── */
.card-actions { display: flex; gap: 4px; }

.action-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid #e8edf2;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.edit-btn :deep(.v-icon)   { color: #3d8ef0; }
.delete-btn :deep(.v-icon) { color: #ef4444; }

.edit-btn:hover   { background: #eef4fe; border-color: #3d8ef0; }
.delete-btn:hover { background: #fff1f2; border-color: #fca5a5; }
</style>
