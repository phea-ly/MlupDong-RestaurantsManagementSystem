<script setup>
import { ref, computed } from 'vue'
import { useMenuStore } from '@/stores'
import MenuItemCard from '@/components/menu/MenuItemCard.vue'
import AddMenuItemDialog from '@/components/menu/AddMenuItemDialog.vue'

const menuStore = useMenuStore()
const searchQuery = ref('')
const statusFilter = ref('all')
const showDialog = ref(false)
const editingItem = ref(null)
const showDeleteDialog = ref(false)
const deletingItemId = ref(null)

const filteredItems = computed(() => {
  let items = menuStore.menuItems.filter(item =>
    menuStore.activeCategory === 'all' ? true : item.category === menuStore.activeCategory
  )

  console.log('Active Category:', menuStore.activeCategory)
  console.log('Total items:', menuStore.menuItems.length)
  console.log('Filtered items:', items.length)

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value !== 'all') {
    items = items.filter(item => {
      if (statusFilter.value === 'active') return item.status
      return !item.status
    })
  }

  return items
})

function handleAddNew() {
  editingItem.value = null
  showDialog.value = true
}

function handleEdit(item) {
  editingItem.value = item
  showDialog.value = true
}

function handleSave(itemData) {
  if (editingItem.value) {
    menuStore.updateMenuItem(editingItem.value.id, itemData)
  } else {
    menuStore.addMenuItem(itemData)
  }
}

function confirmDelete(id) {
  deletingItemId.value = id
  showDeleteDialog.value = true
}

function handleDelete() {
  if (deletingItemId.value) {
    menuStore.deleteMenuItem(deletingItemId.value)
    showDeleteDialog.value = false
    deletingItemId.value = null
  }
}
</script>

<template>
  <div>
    <!-- Header Section -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Menu Management</h1>
        <p class="text-subtitle-1" style="color: #71839b">
          Manage your restaurant's food, drinks, and seasonal promotions.
        </p>
      </div>
      <v-btn
        color="#2d5f3f"
        size="large"
        prepend-icon="mdi-plus"
        class="text-none"
        @click="handleAddNew"
      >
        Add New Item
      </v-btn>
    </div>

    <!-- Tabs and Search -->
    <v-card rounded="lg" border class="pa-3 mb-4">
      <div class="d-flex flex-wrap justify-space-between align-center ga-3">
        <div class="d-flex ga-2">
          <v-btn
            :variant="menuStore.activeCategory === 'all' ? 'flat' : 'outlined'"
            :color="menuStore.activeCategory === 'all' ? '#111a2e' : undefined"
            size="small"
            prepend-icon="mdi-view-grid"
            class="text-none"
            @click="menuStore.activeCategory = 'all'"
          >
            All
          </v-btn>
          <v-btn
            :variant="menuStore.activeCategory === 'food' ? 'flat' : 'outlined'"
            :color="menuStore.activeCategory === 'food' ? '#111a2e' : undefined"
            size="small"
            prepend-icon="mdi-silverware-fork-knife"
            class="text-none"
            @click="menuStore.activeCategory = 'food'"
          >
            Food
          </v-btn>
          <v-btn
            :variant="menuStore.activeCategory === 'drinks' ? 'flat' : 'outlined'"
            :color="menuStore.activeCategory === 'drinks' ? '#111a2e' : undefined"
            size="small"
            prepend-icon="mdi-cup"
            class="text-none"
            @click="menuStore.activeCategory = 'drinks'"
          >
            Drinks
          </v-btn>
          <v-btn
            :variant="menuStore.activeCategory === 'promotions' ? 'flat' : 'outlined'"
            :color="menuStore.activeCategory === 'promotions' ? '#111a2e' : undefined"
            size="small"
            prepend-icon="mdi-tag"
            class="text-none"
            @click="menuStore.activeCategory = 'promotions'"
          >
            Pr
omotions
          </v-btn>
        </div>

        <div class="d-flex ga-2 align-center">
          <v-select
            v-model="statusFilter"
            :items="[
              { title: 'All Status', value: 'all' },
              { title: 'Active', value: 'active' },
              { title: 'Inactive', value: 'inactive' }
            ]"
            item-title="title"
            item-value="value"
            density="compact"
            variant="outlined"
            hide-details
            style="width: 150px"
          />
          <v-text-field
            v-model="searchQuery"
            density="compact"
            variant="outlined"
            placeholder="Search menu items..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            style="max-width: 300px"
          />
        </div>
      </div>
    </v-card>

    <!-- Menu Items Grid -->
    <v-row dense>
      <v-col
        v-for="item in filteredItems"
        :key="item.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
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
        <v-card
          rounded="lg"
          border
          class="add-new-card d-flex flex-column align-center justify-center"
          @click="handleAddNew"
        >
          <v-icon size="48" color="#14d886">mdi-plus-circle-outline</v-icon>
          <p class="mt-3 font-weight-medium" style="color: #14d886">
            Add New Menu Item
          </p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Dialog -->
    <AddMenuItemDialog
      v-model="showDialog"
      :edit-item="editingItem"
      @save="handleSave"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="pa-4">
          <span class="text-h6 font-weight-bold">Delete Menu Item</span>
        </v-card-title>
        <v-card-text class="pa-4">
          Are you sure you want to delete this menu item? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="outlined" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="#ff5757" @click="handleDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.add-new-card {
  height: 340px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px dashed #e0e0e0 !important;
}

.add-new-card:hover {
  border-color: #14d886 !important;
  background-color: rgba(20, 216, 134, 0.05);
  transform: translateY(-2px);
}
</style>
