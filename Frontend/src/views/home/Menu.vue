<script setup>
import { ref, computed } from 'vue'
import { useMenuStore } from '@/stores'
import MenuItemCard from '@/components/menu/MenuItemCard.vue'
import AddMenuItemDialog from '@/components/menu/AddMenuItemDialog.vue'

const menuStore    = useMenuStore()
const searchQuery  = ref('')
const statusFilter = ref('all')
const showDialog   = ref(false)
const editingItem  = ref(null)
const showDeleteDialog = ref(false)
const deletingItemId   = ref(null)

const filteredItems = computed(() => {
  let items = menuStore.menuItems.filter(item =>
    menuStore.activeCategory === 'all' ? true : item.category === menuStore.activeCategory
  )

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    )
  }

  if (statusFilter.value !== 'all') {
    items = items.filter(item =>
      statusFilter.value === 'active' ? item.status : !item.status
    )
  }

  return items
})

const categories = [
  { value: 'all',        label: 'All',        icon: 'mdi-view-grid-outline' },
  { value: 'food',       label: 'Food',        icon: 'mdi-silverware-fork-knife' },
  { value: 'drinks',     label: 'Drinks',      icon: 'mdi-cup-outline' },
  { value: 'promotions', label: 'Promotions',  icon: 'mdi-tag-outline' },
]

function handleAddNew() {
  editingItem.value = null
  showDialog.value  = true
}

function handleEdit(item) {
  editingItem.value = item
  showDialog.value  = true
}

function handleSave(itemData) {
  if (editingItem.value) {
    menuStore.updateMenuItem(editingItem.value.id, itemData)
  } else {
    menuStore.addMenuItem(itemData)
  }
}

function confirmDelete(id) {
  deletingItemId.value   = id
  showDeleteDialog.value = true
}

function handleDelete() {
  if (deletingItemId.value) {
    menuStore.deleteMenuItem(deletingItemId.value)
    showDeleteDialog.value = false
    deletingItemId.value   = null
  }
}
</script>

<template>
  <div>

    <!-- ── Top Action Bar ── -->
    <div class="action-bar">

      <!-- Category tabs -->
      <div class="cat-tabs">
        <button
          v-for="cat in categories" :key="cat.value"
          class="cat-btn"
          :class="{ active: menuStore.activeCategory === cat.value }"
          @click="menuStore.activeCategory = cat.value"
        >
          <v-icon size="15">{{ cat.icon }}</v-icon>
          {{ cat.label }}
        </button>
      </div>

      <div class="d-flex align-center ga-2" style="margin-left: auto">

        <!-- Status filter -->
        <div class="filter-select">
          <select v-model="statusFilter">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <v-icon size="16" color="#9aabbd">mdi-chevron-down</v-icon>
        </div>

        <!-- Search -->
        <div class="search-bar">
          <v-icon size="16" color="#9aabbd">mdi-magnify</v-icon>
          <input v-model="searchQuery" placeholder="Search menu items..." />
        </div>

        <!-- Add New Item button -->
        <button class="btn-add" @click="handleAddNew">
          <v-icon size="17" color="#063824">mdi-plus</v-icon>
          Add New Item
        </button>

      </div>
    </div>

    <!-- ── Menu Items Grid ── -->
    <v-row dense>
      <v-col
        v-for="item in filteredItems" :key="item.id"
        cols="12" sm="6" md="4" lg="3"
      >
        <MenuItemCard
          :item="item"
          @toggle-status="menuStore.toggleStatus"
          @edit="handleEdit"
          @delete="confirmDelete"
        />
      </v-col>

      <!-- Add New Card -->
      <v-col cols="12" sm="6" md="4" lg="3">
        <div class="add-new-card" @click="handleAddNew">
          <v-icon size="40" color="#14dc8b">mdi-plus-circle-outline</v-icon>
          <p class="add-new-label">Add New Menu Item</p>
        </div>
      </v-col>
    </v-row>

    <!-- Empty state -->
    <div v-if="filteredItems.length === 0" class="empty-state">
      <v-icon size="48" color="#d1dce4">mdi-food-off-outline</v-icon>
      <p class="empty-title">No menu items found</p>
      <p class="empty-sub">Try adjusting your search or filter, or add a new item.</p>
      <button class="btn-add mt-2" @click="handleAddNew">
        <v-icon size="17" color="#063824">mdi-plus</v-icon>
        Add New Item
      </button>
    </div>

    <!-- ── Add / Edit Dialog (existing component) ── -->
    <AddMenuItemDialog
      v-model="showDialog"
      :edit-item="editingItem"
      @save="handleSave"
    />

    <!-- ── Delete Confirmation Dialog ── -->
    <v-dialog v-model="showDeleteDialog" max-width="400" rounded="xl">
      <v-card rounded="xl" class="pa-6" elevation="0">
        <div class="d-flex align-center ga-3 mb-4">
          <div class="delete-icon-wrap">
            <v-icon size="22" color="#ef4444">mdi-trash-can-outline</v-icon>
          </div>
          <p class="dialog-title">Delete Menu Item</p>
        </div>
        <p class="dialog-body">
          Are you sure you want to delete this menu item? This action cannot be undone.
        </p>
        <div class="d-flex justify-end ga-2 mt-5">
          <button class="btn-cancel" @click="showDeleteDialog = false">Cancel</button>
          <button class="btn-delete" @click="handleDelete">Delete</button>
        </div>
      </v-card>
    </v-dialog>

  </div>
</template>

<style scoped>
/* ── Action Bar ── */
.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* Category tabs */
.cat-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 10px;
  padding: 5px 6px;
}

.cat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 7px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  color: #6b7f96;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}

.cat-btn:hover { background: #f0f7f4; color: #122039; }

.cat-btn.active {
  background: #122039;
  color: #fff;
}

.cat-btn.active :deep(.v-icon) { color: #fff !important; }

/* Status filter */
.filter-select {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 8px;
  padding: 0 10px;
  height: 38px;
  cursor: pointer;
}

.filter-select select {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #3d5166;
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2px;
}

/* Search bar */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 8px;
  padding: 0 12px;
  height: 38px;
  width: 220px;
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #3d5166;
  font-family: inherit;
  width: 100%;
}

.search-bar input::placeholder { color: #9aabbd; }

/* Add button */
.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 18px;
  border-radius: 8px;
  border: none;
  background: #14dc8b;
  color: #063824;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-add:hover { background: #0fcb7e; }

/* ── Add New Card ── */
.add-new-card {
  height: 340px;
  border-radius: 14px;
  border: 2px dashed #dbe3e7;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-new-card:hover {
  border-color: #14dc8b;
  background: rgba(20, 220, 139, 0.04);
  transform: translateY(-2px);
}

.add-new-label {
  font-size: 14px;
  font-weight: 700;
  color: #14dc8b;
  margin: 0;
}

/* ── Empty State ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 20px;
  text-align: center;
}

.empty-title { font-size: 16px; font-weight: 800; color: #122039; margin: 0; }
.empty-sub   { font-size: 13px; color: #9aabbd; margin: 0; }

/* ── Delete Dialog ── */
.delete-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #fff1f2;
  border: 1px solid #fca5a5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-title { font-size: 17px; font-weight: 900; color: #122039; margin: 0; }
.dialog-body  { font-size: 13.5px; color: #6b7f96; margin: 0; line-height: 1.6; }

.btn-cancel {
  padding: 9px 18px;
  border-radius: 8px;
  border: 1px solid #dbe3e7;
  background: #fff;
  font-size: 13.5px;
  font-weight: 700;
  color: #3d5166;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-cancel:hover { background: #f6f9f8; }

.btn-delete {
  padding: 9px 18px;
  border-radius: 8px;
  border: none;
  background: #ef4444;
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.btn-delete:hover { background: #dc2626; }
</style>