<script setup>
import { ref, computed, onMounted } from "vue";
import { useMenuStore } from "@/stores";
import MenuItemCard from "@/components/menu/MenuItemCard.vue";
import AddMenuItemDialog from "@/components/menu/AddMenuItemDialog.vue";

const menuStore = useMenuStore();

// ── UI state ──────────────────────────────────────────────────────
const searchQuery = ref("");
const statusFilter = ref("all");
const showDialog = ref(false);
const editingItem = ref(null);
const showDeleteDialog = ref(false);
const deletingItemId = ref(null);
const deleting = ref(false);
const snackbar = ref({ show: false, message: "", color: "" });

// Category management
const showCatDialog = ref(false);
const editingCategory = ref(null);
const catForm = ref({ category_name: "", description: "", status: true });
const catSaving = ref(false);
const showDeleteCatDlg = ref(false);
const deletingCatId = ref(null);

const statusOptions = [
  { title: "All Status", value: "all" },
  { title: "Active", value: "active" },
  { title: "Inactive", value: "inactive" },
];

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(async () => {
  await menuStore.fetchCategories();
  await menuStore.fetchMenuItems();
});

// ── Computed ───────────────────────────────────────────────────────
const filteredItems = computed(() => {
  let items = menuStore.menuItems;

  if (menuStore.activeCategory !== "all") {
    items = items.filter(
      (i) => String(i.category_id) === String(menuStore.activeCategory),
    );
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)),
    );
  }

  if (statusFilter.value !== "all") {
    items = items.filter((i) =>
      statusFilter.value === "active" ? i.status : !i.status,
    );
  }

  return items;
});

const stats = computed(() => ({
  total: menuStore.menuItems.length,
  active: menuStore.menuItems.filter((i) => i.status).length,
  inactive: menuStore.menuItems.filter((i) => !i.status).length,
  categories: menuStore.categories.length,
}));

const categoryTabs = computed(() => [
  { value: "all", label: "All Items", icon: "mdi-view-grid-outline" },
  ...menuStore.categories.map((c) => ({
    value: c.category_id,
    label: c.category_name,
    icon: "mdi-tag-outline",
  })),
]);

// ── Menu Item actions ──────────────────────────────────────────────
function handleAddNew() {
  editingItem.value = null;
  showDialog.value = true;
}

function handleEdit(item) {
  editingItem.value = item;
  showDialog.value = true;
}

function confirmDelete(id) {
  deletingItemId.value = id;
  showDeleteDialog.value = true;
}

async function handleDelete() {
  deleting.value = true;
  const result = await menuStore.deleteMenuItem(deletingItemId.value);
  deleting.value = false;
  showDeleteDialog.value = false;
  deletingItemId.value = null;

  snackbar.value = result.success
    ? { show: true, message: "Menu item deleted.", color: "success" }
    : { show: true, message: "Failed to delete item.", color: "error" };
}

// ── Category CRUD ──────────────────────────────────────────────────
function openAddCategory() {
  editingCategory.value = null;
  catForm.value = { category_name: "", description: "", status: true };
  showCatDialog.value = true;
}

function openEditCategory(cat) {
  editingCategory.value = cat;
  catForm.value = {
    category_name: cat.category_name,
    description: cat.description ?? "",
    status: cat.status ?? true,
  };
  showCatDialog.value = true;
}

async function saveCategory() {
  catSaving.value = true;
  const result = editingCategory.value
    ? await menuStore.updateCategory(
        editingCategory.value.category_id,
        catForm.value,
      )
    : await menuStore.addCategory(catForm.value);
  catSaving.value = false;

  if (result.success) {
    showCatDialog.value = false;
    snackbar.value = {
      show: true,
      message: editingCategory.value ? "Category updated." : "Category added.",
      color: "success",
    };
    await menuStore.fetchMenuItems();
  } else {
    snackbar.value = {
      show: true,
      message: "Failed to save category.",
      color: "error",
    };
  }
}

function confirmDeleteCategory(id) {
  deletingCatId.value = id;
  showDeleteCatDlg.value = true;
}

async function handleDeleteCategory() {
  const result = await menuStore.deleteCategory(deletingCatId.value);
  showDeleteCatDlg.value = false;
  if (menuStore.activeCategory === deletingCatId.value)
    menuStore.activeCategory = "all";
  snackbar.value = result.success
    ? { show: true, message: "Category deleted.", color: "success" }
    : { show: true, message: "Failed to delete category.", color: "error" };
}
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- ── Page header ── -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-black text-high-emphasis">
          Menu Management
        </h1>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Manage your restaurant menu items, categories and availability
        </p>
      </div>
      <v-btn
        color="#14dc8b"
        rounded="lg"
        height="40"
        elevation="0"
        prepend-icon="mdi-plus"
        @click="handleAddNew"
      >
        <span style="color: #063824; font-weight: 800">Add New Item</span>
      </v-btn>
    </div>

    <!-- ── Stats row ── -->
    <v-row dense class="mb-4">
      <v-col cols="6" sm="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="d-flex align-center ga-3 pa-4">
            <v-avatar color="blue-lighten-5" rounded="lg" size="40">
              <v-icon color="#3d8ef0" size="20"
                >mdi-silverware-fork-knife</v-icon
              >
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-black">{{ stats.total }}</div>
              <div
                class="text-caption font-weight-bold text-medium-emphasis text-uppercase"
                style="letter-spacing: 0.06em"
              >
                Total Items
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="d-flex align-center ga-3 pa-4">
            <v-avatar color="green-lighten-5" rounded="lg" size="40">
              <v-icon color="#14dc8b" size="20"
                >mdi-check-circle-outline</v-icon
              >
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-black">{{ stats.active }}</div>
              <div
                class="text-caption font-weight-bold text-medium-emphasis text-uppercase"
                style="letter-spacing: 0.06em"
              >
                Active
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="d-flex align-center ga-3 pa-4">
            <v-avatar color="orange-lighten-5" rounded="lg" size="40">
              <v-icon color="#f59e0b" size="20">mdi-eye-off-outline</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-black">{{ stats.inactive }}</div>
              <div
                class="text-caption font-weight-bold text-medium-emphasis text-uppercase"
                style="letter-spacing: 0.06em"
              >
                Inactive
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="6" sm="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="d-flex align-center ga-3 pa-4">
            <v-avatar color="purple-lighten-5" rounded="lg" size="40">
              <v-icon color="#a855f7" size="20"
                >mdi-tag-multiple-outline</v-icon
              >
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-black">
                {{ stats.categories }}
              </div>
              <div
                class="text-caption font-weight-bold text-medium-emphasis text-uppercase"
                style="letter-spacing: 0.06em"
              >
                Categories
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Toolbar: category tabs + search + filter ── -->
    <v-card rounded="xl" border flat class="mb-4">
      <v-card-text class="pa-3">
        <div class="d-flex align-center flex-wrap ga-2">
          <!-- Category tabs -->
          <div class="d-flex align-center flex-wrap ga-1 flex-grow-1">
            <v-btn
              v-for="cat in categoryTabs"
              :key="cat.value"
              :variant="
                menuStore.activeCategory === cat.value ? 'flat' : 'tonal'
              "
              :color="
                menuStore.activeCategory === cat.value
                  ? '#122039'
                  : 'grey-lighten-3'
              "
              rounded="lg"
              size="default"
              height="38"
              class="px-4"
              :prepend-icon="cat.icon"
              @click="menuStore.activeCategory = cat.value"
            >
              <span
                class="text-body-2 font-weight-bold"
                :style="
                  menuStore.activeCategory === cat.value
                    ? 'color:#fff'
                    : 'color:#6b7f96'
                "
              >
                {{ cat.label }}
              </span>
            </v-btn>

            <!-- Add category -->
            <v-btn
              variant="outlined"
              rounded="lg"
              size="default"
              height="38"
              class="px-4"
              prepend-icon="mdi-plus"
              style="
                border-style: dashed;
                color: #14dc8b;
                border-color: #14dc8b;
              "
              @click="openAddCategory"
            >
              <span class="text-body-2 font-weight-bold" style="color: #14dc8b"
                >Category</span
              >
            </v-btn>
          </div>

          <!-- Search -->
          <v-text-field
            v-model="searchQuery"
            placeholder="Search menu items..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            rounded="lg"
            density="compact"
            hide-details
            clearable
            style="max-width: 220px; min-width: 160px"
          />

          <!-- Status filter -->
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            item-title="title"
            item-value="value"
            variant="outlined"
            rounded="lg"
            density="compact"
            hide-details
            prepend-inner-icon="mdi-filter-outline"
            style="max-width: 160px; min-width: 130px"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- ── Category chips strip ── -->
    <div
      v-if="menuStore.categories.length"
      class="d-flex align-center flex-wrap ga-2 mb-4"
    >
      <span
        class="text-caption font-weight-bold text-medium-emphasis text-uppercase"
        style="letter-spacing: 0.08em"
      >
        <v-icon size="13" class="mr-1">mdi-tag-multiple-outline</v-icon
        >Categories
      </span>
      <v-chip
        v-for="cat in menuStore.categories"
        :key="cat.category_id"
        size="small"
        rounded="pill"
        variant="tonal"
        color="blue-grey"
        label
        class="font-weight-bold"
      >
        {{ cat.category_name }}
        <template #append>
          <v-icon
            size="13"
            color="primary"
            class="ml-1 cursor-pointer"
            @click.stop="openEditCategory(cat)"
            >mdi-pencil-outline</v-icon
          >
          <v-icon
            size="13"
            color="error"
            class="ml-1 cursor-pointer"
            @click.stop="confirmDeleteCategory(cat.category_id)"
            >mdi-close</v-icon
          >
        </template>
      </v-chip>
    </div>

    <!-- ── Loading ── -->
    <div
      v-if="menuStore.loading"
      class="d-flex flex-column align-center justify-center ga-4 py-16"
    >
      <v-progress-circular indeterminate color="#14dc8b" size="48" width="3" />
      <span class="text-body-2 text-medium-emphasis">Loading menu items…</span>
    </div>

    <!-- ── Grid ── -->
    <v-row v-else-if="filteredItems.length" dense>
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

      <!-- Add new placeholder card -->
      <v-col cols="12" sm="6" md="4" lg="3">
        <v-card
          rounded="xl"
          border
          flat
          height="275"
          style="
            border-style: dashed !important;
            cursor: pointer;
            transition: all 0.2s;
          "
          class="d-flex flex-column align-center justify-center ga-3 add-new-card"
          @click="handleAddNew"
        >
          <v-icon size="40" color="#14dc8b">mdi-plus-circle-outline</v-icon>
          <span class="text-body-2 font-weight-bold" style="color: #14dc8b"
            >Add New Item</span
          >
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Empty state ── -->
    <v-card v-else rounded="xl" border flat class="py-16">
      <v-card-text class="d-flex flex-column align-center ga-3 text-center">
        <v-avatar size="72" color="grey-lighten-4" rounded="circle">
          <v-icon size="36" color="grey-lighten-1">mdi-food-off-outline</v-icon>
        </v-avatar>
        <div>
          <p class="text-h6 font-weight-black">No menu items found</p>
          <p class="text-body-2 text-medium-emphasis mt-1">
            {{
              searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter."
                : "Get started by adding your first menu item."
            }}
          </p>
        </div>
        <v-btn
          color="#14dc8b"
          rounded="lg"
          elevation="0"
          prepend-icon="mdi-plus"
          @click="handleAddNew"
        >
          <span style="color: #063824; font-weight: 800">Add New Item</span>
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- ── Add / Edit dialog ── -->
    <AddMenuItemDialog
      v-model="showDialog"
      :edit-item="editingItem"
      @saved="() => {}"
    />

    <!-- ── Delete menu item dialog ── -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card rounded="xl" elevation="0">
        <v-card-text class="pa-6">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar
              color="red-lighten-5"
              rounded="lg"
              size="44"
              style="border: 1px solid #fca5a5"
            >
              <v-icon color="error" size="22">mdi-trash-can-outline</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-black">Delete Menu Item</span>
          </div>
          <p class="text-body-2 text-medium-emphasis">
            Are you sure you want to delete this menu item? This action cannot
            be undone.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            rounded="lg"
            @click="showDeleteDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            :loading="deleting"
            @click="handleDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Category add / edit dialog ── -->
    <v-dialog v-model="showCatDialog" max-width="420">
      <v-card rounded="xl" elevation="0">
        <v-card-text class="pa-6">
          <div class="d-flex align-center ga-3 mb-5">
            <v-avatar
              color="purple-lighten-5"
              rounded="lg"
              size="44"
              style="border: 1px solid rgba(168, 85, 247, 0.25)"
            >
              <v-icon color="#a855f7" size="20">mdi-tag-outline</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-black">
              {{ editingCategory ? "Edit Category" : "Add Category" }}
            </span>
          </div>

          <v-text-field
            v-model="catForm.category_name"
            label="Category Name"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            class="mb-3"
            hide-details="auto"
          />
          <v-textarea
            v-model="catForm.description"
            label="Description (optional)"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            rows="2"
            class="mb-3"
            hide-details="auto"
          />

          <v-card variant="tonal" color="grey-lighten-3" rounded="lg">
            <v-card-text
              class="d-flex align-center justify-space-between py-3 px-4"
            >
              <div>
                <div class="text-body-2 font-weight-bold">Status</div>
                <div class="text-caption text-medium-emphasis">
                  {{ catForm.status ? "Active" : "Inactive" }}
                </div>
              </div>
              <v-switch
                v-model="catForm.status"
                color="#14dc8b"
                density="compact"
                hide-details
                inset
              />
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" @click="showCatDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="#14dc8b"
            variant="flat"
            rounded="lg"
            :loading="catSaving"
            @click="saveCategory"
          >
            <span style="color: #063824; font-weight: 800">
              {{ editingCategory ? "Update" : "Add" }}
            </span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Delete category dialog ── -->
    <v-dialog v-model="showDeleteCatDlg" max-width="400">
      <v-card rounded="xl" elevation="0">
        <v-card-text class="pa-6">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar
              color="red-lighten-5"
              rounded="lg"
              size="44"
              style="border: 1px solid #fca5a5"
            >
              <v-icon color="error" size="22">mdi-tag-remove-outline</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-black">Delete Category</span>
          </div>
          <p class="text-body-2 text-medium-emphasis">
            This will delete the category. Menu items in this category will
            become uncategorised.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            rounded="lg"
            @click="showDeleteCatDlg = false"
            >Cancel</v-btn
          >
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            @click="handleDeleteCategory"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Snackbar ── -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom right"
      :timeout="3000"
      rounded="lg"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          size="small"
          @click="snackbar.show = false"
        />
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.add-new-card:hover {
  border-color: #14dc8b !important;
  background: rgba(20, 220, 139, 0.04) !important;
  transform: translateY(-3px);
}
</style>
