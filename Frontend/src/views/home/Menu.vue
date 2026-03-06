<script setup>
import { computed, onMounted, ref } from 'vue'
import MenuItemCard from '@/components/menu/MenuItemCard.vue'
import AddMenuItemDialog from '@/components/menu/AddMenuItemDialog.vue'
import {
  createMenuItemApi,
  deleteMenuItemApi,
  getCategoriesApi,
  getMenuItemsApi,
  updateMenuItemApi,
} from '@/api/management.api'

const loading = ref(false)
const menuItems = ref([])
const categories = ref([])
const activeCategory = ref('all')
const searchQuery = ref('')
const statusFilter = ref('all')
const showDialog = ref(false)
const editingItem = ref(null)
const showDeleteDialog = ref(false)
const deletingItemId = ref(null)
const errorText = ref('')

const filteredItems = computed(() => {
  let items = menuItems.value.filter((item) =>
    activeCategory.value === 'all' ? true : item.category === activeCategory.value
  )

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(
      (item) => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value !== 'all') {
    items = items.filter((item) => {
      if (statusFilter.value === 'active') return item.status
      return !item.status
    })
  }

  return items
})

function normalizeCategory(categoryName) {
  const key = String(categoryName || '').toLowerCase()
  if (key.includes('drink')) return 'drinks'
  if (key.includes('promo')) return 'promotions'
  return 'food'
}

function categoryIdFromKey(key) {
  const found = categories.value.find((c) => normalizeCategory(c.category_name) === key)
  return found?.category_id ?? null
}

async function loadMenuData() {
  loading.value = true
  errorText.value = ''

  try {
    const [menuRes, categoriesRes] = await Promise.all([getMenuItemsApi(), getCategoriesApi()])
    categories.value = Array.isArray(categoriesRes.data) ? categoriesRes.data : []

    const rawItems = Array.isArray(menuRes.data) ? menuRes.data : []
    menuItems.value = rawItems.map((item) => ({
      id: item.menu_item_id,
      name: item.item_name,
      description: item.description || '',
      price: Number(item.price || 0),
      category: normalizeCategory(item.category?.category_name),
      image:
        item.image ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
      badge: item.status ? '' : 'SOLD OUT',
      status: !!item.status,
      category_id: item.category_id ?? null,
    }))
  } catch (error) {
    errorText.value = error?.response?.data?.message || 'Failed to load menu data.'
  } finally {
    loading.value = false
  }
}

function handleAddNew() {
  editingItem.value = null
  showDialog.value = true
}

function handleEdit(item) {
  editingItem.value = item
  showDialog.value = true
}

async function handleSave(itemData) {
  const payload = {
    item_name: itemData.name,
    description: itemData.description || null,
    price: Number(itemData.price || 0),
    image: itemData.image || null,
    status: itemData.badge === 'SOLD OUT' ? false : true,
    category_id: categoryIdFromKey(itemData.category),
  }

  if (editingItem.value) {
    await updateMenuItemApi(editingItem.value.id, payload)
  } else {
    await createMenuItemApi(payload)
  }

  await loadMenuData()
}

function confirmDelete(id) {
  deletingItemId.value = id
  showDeleteDialog.value = true
}

async function handleDelete() {
  if (!deletingItemId.value) return

  await deleteMenuItemApi(deletingItemId.value)
  await loadMenuData()
  showDeleteDialog.value = false
  deletingItemId.value = null
}

async function toggleStatus(itemId) {
  const item = menuItems.value.find((row) => row.id === itemId)
  if (!item) return

  await updateMenuItemApi(itemId, { status: !item.status })
  await loadMenuData()
}

onMounted(loadMenuData)
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Menu Management</h1>
        <p class="text-subtitle-1" style="color: #71839b">
          Manage your restaurant's food, drinks, and seasonal promotions.
        </p>
      </div>
      <v-btn color="#2d5f3f" size="large" prepend-icon="mdi-plus" class="text-none" @click="handleAddNew">
        Add New Item
      </v-btn>
    </div>

    <v-card rounded="lg" border class="pa-3 mb-4">
      <div class="d-flex flex-wrap justify-space-between align-center ga-3">
        <div class="d-flex ga-2">
          <v-btn
            :variant="activeCategory === 'all' ? 'flat' : 'outlined'"
            :color="activeCategory === 'all' ? '#111a2e' : undefined"
            size="small"
            prepend-icon="mdi-view-grid"
            class="text-none"
            @click="activeCategory = 'all'"
          >
            All
          </v-btn>
          <v-btn
            :variant="activeCategory === 'food' ? 'flat' : 'outlined'"
            :color="activeCategory === 'food' ? '#111a2e' : undefined"
            size="small"
            prepend-icon="mdi-silverware-fork-knife"
            class="text-none"
            @click="activeCategory = 'food'"
          >
            Food
          </v-btn>
          <v-btn
            :variant="activeCategory === 'drinks' ? 'flat' : 'outlined'"
            :color="activeCategory === 'drinks' ? '#111a2e' : undefined"
            size="small"
            prepend-icon="mdi-cup"
            class="text-none"
            @click="activeCategory = 'drinks'"
          >
            Drinks
          </v-btn>
          <v-btn
            :variant="activeCategory === 'promotions' ? 'flat' : 'outlined'"
            :color="activeCategory === 'promotions' ? '#111a2e' : undefined"
            size="small"
            prepend-icon="mdi-tag"
            class="text-none"
            @click="activeCategory = 'promotions'"
          >
            Promotions
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

    <v-alert v-if="errorText" type="error" variant="tonal" class="mb-3">{{ errorText }}</v-alert>
    <v-alert v-else-if="loading" type="info" variant="tonal" class="mb-3">Loading menu items...</v-alert>

    <v-row dense>
      <v-col v-for="item in filteredItems" :key="item.id" cols="12" sm="6" md="4" lg="3">
        <MenuItemCard :item="item" @toggle-status="toggleStatus" @edit="handleEdit" @delete="confirmDelete" />
      </v-col>

      <v-col cols="12" sm="6" md="4" lg="3">
        <v-card
          rounded="lg"
          border
          class="add-new-card d-flex flex-column align-center justify-center"
          @click="handleAddNew"
        >
          <v-icon size="48" color="#14d886">mdi-plus-circle-outline</v-icon>
          <p class="mt-3 font-weight-medium" style="color: #14d886">Add New Menu Item</p>
        </v-card>
      </v-col>
    </v-row>

    <AddMenuItemDialog v-model="showDialog" :edit-item="editingItem" @save="handleSave" />

    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title class="pa-4">
          <span class="text-h6 font-weight-bold">Delete Menu Item</span>
        </v-card-title>
        <v-card-text class="pa-4">Are you sure you want to delete this menu item? This action cannot be undone.</v-card-text>
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
