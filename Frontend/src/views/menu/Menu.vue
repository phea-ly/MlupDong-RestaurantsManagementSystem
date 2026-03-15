<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMenuStore } from '@/stores'
import MenuItemCard from '@/components/menu/MenuItemCard.vue'
import AddMenuItemDialog from '@/components/menu/AddMenuItemDialog.vue'

const menuStore = useMenuStore()

// ── UI state ──────────────────────────────────────────────────────
const searchQuery      = ref('')
const statusFilter     = ref('all')
const showDialog       = ref(false)
const editingItem      = ref(null)
const showDeleteDialog = ref(false)
const deletingItemId   = ref(null)
const deleting         = ref(false)
const snackbar         = ref({ show: false, message: '', color: '' })

// Category management
const showCatDialog    = ref(false)
const editingCategory  = ref(null)
const catForm          = ref({ category_name: '', description: '', status: true })
const catSaving        = ref(false)
const showDeleteCatDlg = ref(false)
const deletingCatId    = ref(null)

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(async () => {
  await menuStore.fetchCategories()
  await menuStore.fetchMenuItems()
})

// ── Computed: filtered items ───────────────────────────────────────
const filteredItems = computed(() => {
  let items = menuStore.menuItems

  if (menuStore.activeCategory !== 'all') {
    items = items.filter(i => String(i.category_id) === String(menuStore.activeCategory))
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    items = items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q))
    )
  }

  if (statusFilter.value !== 'all') {
    items = items.filter(i =>
      statusFilter.value === 'active' ? i.status : !i.status
    )
  }

  return items
})

// ── Stats ─────────────────────────────────────────────────────────
const stats = computed(() => ({
  total:    menuStore.menuItems.length,
  active:   menuStore.menuItems.filter(i => i.status).length,
  inactive: menuStore.menuItems.filter(i => !i.status).length,
  categories: menuStore.categories.length,
}))

// ── Category tabs ─────────────────────────────────────────────────
const allTab = { value: 'all', label: 'All Items', icon: 'mdi-view-grid-outline' }

const categoryTabs = computed(() => [
  allTab,
  ...menuStore.categories.map(c => ({
    value: c.category_id,
    label: c.category_name,
    icon:  'mdi-tag-outline',
  }))
])

// ── Menu Item actions ─────────────────────────────────────────────
function handleAddNew() {
  editingItem.value = null
  showDialog.value  = true
}

function handleEdit(item) {
  editingItem.value = item
  showDialog.value  = true
}

function confirmDelete(id) {
  deletingItemId.value   = id
  showDeleteDialog.value = true
}

async function handleDelete() {
  deleting.value = true
  const result   = await menuStore.deleteMenuItem(deletingItemId.value)
  deleting.value = false
  showDeleteDialog.value = false
  deletingItemId.value   = null

  snackbar.value = result.success
    ? { show: true, message: 'Menu item deleted.', color: 'success' }
    : { show: true, message: 'Failed to delete item.', color: 'error' }
}

// ── Category CRUD ─────────────────────────────────────────────────
function openAddCategory() {
  editingCategory.value = null
  catForm.value = { category_name: '', description: '', status: true }
  showCatDialog.value = true
}

function openEditCategory(cat) {
  editingCategory.value = cat
  catForm.value = {
    category_name: cat.category_name,
    description:   cat.description ?? '',
    status:        cat.status ?? true,
  }
  showCatDialog.value = true
}

async function saveCategory() {
  catSaving.value = true
  let result
  if (editingCategory.value) {
    result = await menuStore.updateCategory(editingCategory.value.category_id, catForm.value)
  } else {
    result = await menuStore.addCategory(catForm.value)
  }
  catSaving.value = false
  if (result.success) {
    showCatDialog.value = false
    snackbar.value = { show: true, message: editingCategory.value ? 'Category updated.' : 'Category added.', color: 'success' }
    await menuStore.fetchMenuItems() // refresh items with new category data
  } else {
    snackbar.value = { show: true, message: 'Failed to save category.', color: 'error' }
  }
}

function confirmDeleteCategory(id) {
  deletingCatId.value   = id
  showDeleteCatDlg.value = true
}

async function handleDeleteCategory() {
  const result = await menuStore.deleteCategory(deletingCatId.value)
  showDeleteCatDlg.value = false
  if (menuStore.activeCategory === deletingCatId.value) menuStore.activeCategory = 'all'
  snackbar.value = result.success
    ? { show: true, message: 'Category deleted.', color: 'success' }
    : { show: true, message: 'Failed to delete category.', color: 'error' }
}
</script>

<template>
  <div class="menu-page">

    <!-- ── Page header ── -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Menu Management</h1>
        <p class="page-sub">Manage your restaurant menu items, categories and availability</p>
      </div>
      <button class="btn-add" @click="handleAddNew">
        <v-icon size="16" color="#063824">mdi-plus</v-icon>
        Add New Item
      </button>
    </div>

    <!-- ── Stats row ── -->
    <div class="stats-row">
      <div class="stat-card">
        <v-icon size="22" color="#3d8ef0">mdi-silverware-fork-knife</v-icon>
        <div>
          <p class="stat-num">{{ stats.total }}</p>
          <p class="stat-label">Total Items</p>
        </div>
      </div>
      <div class="stat-card">
        <v-icon size="22" color="#14dc8b">mdi-check-circle-outline</v-icon>
        <div>
          <p class="stat-num">{{ stats.active }}</p>
          <p class="stat-label">Active</p>
        </div>
      </div>
      <div class="stat-card">
        <v-icon size="22" color="#f59e0b">mdi-eye-off-outline</v-icon>
        <div>
          <p class="stat-num">{{ stats.inactive }}</p>
          <p class="stat-label">Inactive</p>
        </div>
      </div>
      <div class="stat-card">
        <v-icon size="22" color="#a855f7">mdi-tag-multiple-outline</v-icon>
        <div>
          <p class="stat-num">{{ stats.categories }}</p>
          <p class="stat-label">Categories</p>
        </div>
      </div>
    </div>

    <!-- ── Action bar ── -->
    <div class="action-bar">

      <!-- Category tabs -->
      <div class="cat-tabs">
        <button
          v-for="cat in categoryTabs" :key="cat.value"
          class="cat-btn"
          :class="{ active: menuStore.activeCategory === cat.value }"
          @click="menuStore.activeCategory = cat.value"
        >
          <v-icon size="14">{{ cat.icon }}</v-icon>
          {{ cat.label }}
        </button>

        <!-- Manage categories button -->
        <button class="cat-btn manage-btn" @click="openAddCategory">
          <v-icon size="14">mdi-plus</v-icon>
          Category
        </button>
      </div>

      <div class="d-flex align-center ga-2" style="margin-left: auto; flex-wrap: wrap;">
        
        <!-- Search -->
        <div class="search-bar">
          <v-icon size="15" color="#9aabbd">mdi-magnify</v-icon>
          <input v-model="searchQuery" placeholder="Search menu items..." />
        </div>
        <!-- Status filter -->
        <div class="filter-select">
          <v-icon size="14" color="#9aabbd">mdi-filter-outline</v-icon>
          <select v-model="statusFilter">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <v-icon size="14" color="#9aabbd">mdi-chevron-down</v-icon>
        </div>

      </div>
    </div>

    <!-- ── Category management strip ── -->
    <div v-if="menuStore.categories.length" class="cat-manage-strip">
      <p class="strip-label">
        <v-icon size="14" color="#9aabbd">mdi-tag-multiple-outline</v-icon>
        Categories
      </p>
      <div class="cat-chips">
        <div v-for="cat in menuStore.categories" :key="cat.category_id" class="cat-chip">
          <span>{{ cat.category_name }}</span>
          <div class="chip-actions">
            <v-icon size="12" color="#3d8ef0" class="chip-icon" @click="openEditCategory(cat)">mdi-pencil-outline</v-icon>
            <v-icon size="12" color="#ef4444" class="chip-icon" @click="confirmDeleteCategory(cat.category_id)">mdi-close</v-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Loading state ── -->
    <div v-if="menuStore.loading" class="loading-state">
      <v-progress-circular indeterminate color="#14dc8b" size="42" />
      <p>Loading menu items…</p>
    </div>

    <!-- ── Grid ── -->
    <v-row v-else-if="filteredItems.length" dense class="mt-1">
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
          <v-icon size="38" color="#14dc8b">mdi-plus-circle-outline</v-icon>
          <p class="add-new-label">Add New Item</p>
        </div>
      </v-col>
    </v-row>

    <!-- ── Empty state ── -->
    <div v-else class="empty-state">
      <div class="empty-icon-wrap">
        <v-icon size="36" color="#9aabbd">mdi-food-off-outline</v-icon>
      </div>
      <p class="empty-title">No menu items found</p>
      <p class="empty-sub">
        {{ searchQuery || statusFilter !== 'all'
          ? 'Try adjusting your search or filter.'
          : 'Get started by adding your first menu item.' }}
      </p>
      <button class="btn-add mt-3" @click="handleAddNew">
        <v-icon size="16" color="#063824">mdi-plus</v-icon>
        Add New Item
      </button>
    </div>

    <!-- ── Add/Edit Dialog ── -->
    <AddMenuItemDialog
      v-model="showDialog"
      :edit-item="editingItem"
      @saved="() => {}"
    />

    <!-- ── Delete Menu Item Dialog ── -->
    <v-dialog v-model="showDeleteDialog" max-width="400" rounded="xl">
      <v-card rounded="xl" class="pa-6" elevation="0">
        <div class="d-flex align-center ga-3 mb-4">
          <div class="delete-icon-wrap">
            <v-icon size="22" color="#ef4444">mdi-trash-can-outline</v-icon>
          </div>
          <p class="dlg-title">Delete Menu Item</p>
        </div>
        <p class="dlg-body">
          Are you sure you want to delete this menu item? This action cannot be undone.
        </p>
        <div class="d-flex justify-end ga-2 mt-5">
          <button class="btn-cancel" @click="showDeleteDialog = false">Cancel</button>
          <button class="btn-delete" :disabled="deleting" @click="handleDelete">
            <v-progress-circular v-if="deleting" size="14" width="2" indeterminate color="#fff" />
            Delete
          </button>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── Category Add/Edit Dialog ── -->
    <v-dialog v-model="showCatDialog" max-width="420" rounded="xl">
      <v-card rounded="xl" class="pa-6" elevation="0">
        <div class="d-flex align-center ga-3 mb-5">
          <div class="cat-dlg-icon">
            <v-icon size="20" color="#a855f7">mdi-tag-outline</v-icon>
          </div>
          <p class="dlg-title">{{ editingCategory ? 'Edit Category' : 'Add Category' }}</p>
        </div>

        <v-text-field
          v-model="catForm.category_name"
          label="Category Name"
          variant="outlined"
          density="comfortable"
          class="mb-3"
          hide-details="auto"
        />
        <v-textarea
          v-model="catForm.description"
          label="Description (optional)"
          variant="outlined"
          density="comfortable"
          rows="2"
          class="mb-3"
          hide-details="auto"
        />
        <div class="status-row">
          <div>
            <p class="status-label">Status</p>
            <p class="status-hint">{{ catForm.status ? 'Active' : 'Inactive' }}</p>
          </div>
          <v-switch v-model="catForm.status" color="#14dc8b" density="compact" hide-details inset />
        </div>

        <div class="d-flex justify-end ga-2 mt-5">
          <button class="btn-cancel" @click="showCatDialog = false">Cancel</button>
          <button class="btn-save-cat" :disabled="catSaving" @click="saveCategory">
            <v-progress-circular v-if="catSaving" size="14" width="2" indeterminate color="#fff" />
            {{ editingCategory ? 'Update' : 'Add' }}
          </button>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── Delete Category Dialog ── -->
    <v-dialog v-model="showDeleteCatDlg" max-width="400" rounded="xl">
      <v-card rounded="xl" class="pa-6" elevation="0">
        <div class="d-flex align-center ga-3 mb-4">
          <div class="delete-icon-wrap">
            <v-icon size="22" color="#ef4444">mdi-tag-remove-outline</v-icon>
          </div>
          <p class="dlg-title">Delete Category</p>
        </div>
        <p class="dlg-body">
          This will delete the category. Menu items in this category will become uncategorised.
        </p>
        <div class="d-flex justify-end ga-2 mt-5">
          <button class="btn-cancel" @click="showDeleteCatDlg = false">Cancel</button>
          <button class="btn-delete" @click="handleDeleteCategory">Delete</button>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── Snackbar ── -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>

  </div>
</template>

<style scoped>
.menu-page { padding-bottom: 40px; }

/* ── Page header ── */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
}
.page-title { font-size: 22px; font-weight: 900; color: #0f1d38; margin: 0; }
.page-sub   { font-size: 13px; color: #9aabbd; margin: 0; }

/* ── Stats ── */
.stats-row {
  display: flex; gap: 12px;
  margin-bottom: 20px; flex-wrap: wrap;
}
.stat-card {
  display: flex; align-items: center; gap: 12px;
  background: #fff;
  border: 1px solid #e8edf2;
  border-radius: 12px;
  padding: 14px 18px;
  flex: 1; min-width: 130px;
}
.stat-num   { font-size: 22px; font-weight: 900; color: #0f1d38; margin: 0; }
.stat-label { font-size: 11px; font-weight: 700; color: #9aabbd; letter-spacing: 0.05em; margin: 0; text-transform: uppercase; }

/* ── Action bar ── */
.action-bar {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 12px; flex-wrap: wrap;
}
.cat-tabs {
  display: flex; align-items: center; gap: 4px;
  background: #fff; border: 1px solid #dbe3e7;
  border-radius: 10px; padding: 5px 6px;
  flex-wrap: wrap;
}
.cat-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 13px; border-radius: 7px;
  border: none; background: transparent;
  font-size: 12.5px; font-weight: 700; color: #6b7f96;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s; white-space: nowrap;
}
.cat-btn:hover  { background: #f0f7f4; color: #122039; }
.cat-btn.active { background: #122039; color: #fff; }
.cat-btn.active :deep(.v-icon) { color: #14dc8b !important; }
.manage-btn { border: 1px dashed #dbe3e7; color: #14dc8b; }
.manage-btn:hover { border-color: #14dc8b; background: rgba(20,220,139,0.06); }

/* ── Filters ── */
.filter-select {
  display: flex; align-items: center; gap: 5px;
  background: #fff; border: 1px solid #dbe3e7;
  border-radius: 8px; padding: 0 10px; height: 38px;
}
.filter-select select {
  border: none; outline: none; background: transparent;
  font-size: 12.5px; font-weight: 600; color: #3d5166;
  font-family: inherit; cursor: pointer;
  appearance: none; -webkit-appearance: none;
}
.search-bar {
  display: flex; align-items: center; gap: 8px;
  background: #fff; border: 1px solid #dbe3e7;
  border-radius: 8px; padding: 0 12px; height: 38px; width: 210px;
}
.search-bar input {
  border: none; background: transparent; outline: none;
  font-size: 12.5px; color: #3d5166; font-family: inherit; width: 100%;
}
.search-bar input::placeholder { color: #9aabbd; }

/* ── Category manage strip ── */
.cat-manage-strip {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 16px; flex-wrap: wrap;
}
.strip-label {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; color: #9aabbd;
  text-transform: uppercase; letter-spacing: 0.08em; margin: 0;
  white-space: nowrap;
}
.cat-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.cat-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px 4px 12px;
  border-radius: 20px;
  background: #f0f4f8; border: 1px solid #e0e8ef;
  font-size: 12px; font-weight: 700; color: #3d5166;
}
.chip-actions { display: flex; gap: 4px; }
.chip-icon { cursor: pointer; transition: opacity 0.15s; }
.chip-icon:hover { opacity: 0.7; }

/* ── Add button ── */
.btn-add {
  display: flex; align-items: center; gap: 6px;
  height: 38px; padding: 0 18px; border-radius: 9px;
  border: none; background: #14dc8b;
  color: #063824; font-size: 13px; font-weight: 800;
  cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: background 0.15s;
}
.btn-add:hover { background: #0fcb7e; }

/* ── Add new card ── */
.add-new-card {
  height: 100%; min-height: 275px;
  border-radius: 14px; border: 2px dashed #dbe3e7;
  background: #fff;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px; cursor: pointer; transition: all 0.2s;
}
.add-new-card:hover { border-color: #14dc8b; background: rgba(20,220,139,0.04); transform: translateY(-3px); }
.add-new-label { font-size: 13px; font-weight: 700; color: #14dc8b; margin: 0; }

/* ── Loading ── */
.loading-state {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  padding: 80px 20px; color: #9aabbd; font-size: 14px;
}

/* ── Empty state ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 80px 20px; text-align: center;
}
.empty-icon-wrap {
  width: 72px; height: 72px; border-radius: 50%;
  background: #f2f5f8; display: flex; align-items: center; justify-content: center;
}
.empty-title { font-size: 17px; font-weight: 800; color: #0f1d38; margin: 0; }
.empty-sub   { font-size: 13px; color: #9aabbd; margin: 0; }

/* ── Dialogs ── */
.delete-icon-wrap {
  width: 42px; height: 42px; border-radius: 10px;
  background: #fff1f2; border: 1px solid #fca5a5;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cat-dlg-icon {
  width: 42px; height: 42px; border-radius: 10px;
  background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.dlg-title { font-size: 17px; font-weight: 900; color: #0f1d38; margin: 0; }
.dlg-body  { font-size: 13.5px; color: #6b7f96; margin: 0; line-height: 1.6; }

.status-row {
  display: flex; align-items: center; justify-content: space-between;
  background: #f6f9f8; border: 1px solid #e8edf2;
  border-radius: 10px; padding: 12px 16px;
}
.status-label { font-size: 13px; font-weight: 700; color: #3d5166; margin: 0; }
.status-hint  { font-size: 11px; color: #9aabbd; margin: 0; }

.btn-cancel {
  padding: 9px 18px; border-radius: 8px;
  border: 1px solid #dbe3e7; background: #fff;
  font-size: 13px; font-weight: 700; color: #3d5166;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.btn-cancel:hover { background: #f6f9f8; }

.btn-delete {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 8px;
  border: none; background: #ef4444; color: #fff;
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.btn-delete:hover:not(:disabled) { background: #dc2626; }
.btn-delete:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-save-cat {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 20px; border-radius: 8px;
  border: none; background: #14dc8b; color: #063824;
  font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.btn-save-cat:hover:not(:disabled) { background: #0fcb7e; }
.btn-save-cat:disabled { opacity: 0.6; cursor: not-allowed; }
</style>