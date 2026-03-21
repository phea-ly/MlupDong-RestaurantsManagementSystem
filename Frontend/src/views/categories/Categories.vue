<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { defineStore, storeToRefs } from "pinia";
import { useMenuStore } from "@/stores/menu.store";
import CategoryStatsRow from "@/components/categories/CategoryStatsRow.vue";
import CategoryTopCard from "@/components/categories/CategoryTopCard.vue";
import CategoryList from "@/components/categories/CategoryList.vue";
import CategoryDialog from "@/components/categories/CategoryDialog.vue";
import CategoryDeleteDialog from "@/components/categories/CategoryDeleteDialog.vue";

// ── Store definition ──────────────────────────────────────────────────────────
const useCategoriesViewStore = defineStore("categoriesView", () => {
  const menuStore = useMenuStore();

  const showCatDialog    = ref(false);
  const editingCategory  = ref(null);
  const catForm          = ref({ category_name: "", description: "", status: true });
  const catSaving        = ref(false);
  const showDeleteCatDlg = ref(false);
  const deletingCatId    = ref(null);
  const snackbar         = ref({ show: false, message: "", color: "" });

  const categoryStats = computed(() => {
    const total    = menuStore.categories.length;
    const active   = menuStore.categories.filter((c) => c.status).length;
    const inactive = total - active;
    return { total, active, inactive };
  });

  const categoryCounts = computed(() => {
    const counts = new Map();
    menuStore.menuItems.forEach((item) => {
      const key = item.category_id ?? "uncategorized";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  });

  const topCategories = computed(() => {
    const totalItems = menuStore.menuItems.length || 1;
    return menuStore.categories
      .map((c) => {
        const count = categoryCounts.value.get(c.category_id) ?? 0;
        return {
          id:    c.category_id,
          name:  c.category_name,
          count,
          pct:   Math.round((count / totalItems) * 100),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  });

  async function init() {
    await menuStore.fetchCategories();
    await menuStore.fetchMenuItems();
  }

  function openAddCategory() {
    editingCategory.value = null;
    catForm.value         = { category_name: "", description: "", status: true };
    showCatDialog.value   = true;
  }

  function openEditCategory(cat) {
    editingCategory.value = cat;
    catForm.value = {
      category_name: cat.category_name,
      description:   cat.description ?? "",
      status:        cat.status      ?? true,
    };
    showCatDialog.value = true;
  }

  async function saveCategory() {
    catSaving.value = true;
    const result = editingCategory.value
      ? await menuStore.updateCategory(editingCategory.value.category_id, catForm.value)
      : await menuStore.addCategory(catForm.value);
    catSaving.value = false;

    if (result.success) {
      showCatDialog.value = false;
      snackbar.value = {
        show:    true,
        message: editingCategory.value ? "Category updated." : "Category added.",
        color:   "success",
      };
      await menuStore.fetchMenuItems();
    } else {
      snackbar.value = { show: true, message: "Failed to save category.", color: "error" };
    }
  }

  function confirmDeleteCategory(id) {
    deletingCatId.value    = id;
    showDeleteCatDlg.value = true;
  }

  async function handleDeleteCategory() {
    const result = await menuStore.deleteCategory(deletingCatId.value);
    showDeleteCatDlg.value = false;
    if (menuStore.activeCategory === deletingCatId.value) menuStore.activeCategory = "all";
    snackbar.value = result.success
      ? { show: true, message: "Category deleted.",          color: "success" }
      : { show: true, message: "Failed to delete category.", color: "error"   };
  }

  function viewItems(router, categoryId) {
    menuStore.activeCategory = categoryId ?? "all";
    router.push("/home/menu");
  }

  return {
    showCatDialog, editingCategory, catForm, catSaving,
    showDeleteCatDlg, deletingCatId, snackbar,
    categoryStats, categoryCounts, topCategories,
    init, openAddCategory, openEditCategory, saveCategory,
    confirmDeleteCategory, handleDeleteCategory, viewItems,
  };
});

// ── Component setup ───────────────────────────────────────────────────────────
const router          = useRouter();
const menuStore       = useMenuStore();
const categoriesStore = useCategoriesViewStore();

const {
  showCatDialog, editingCategory, catForm, catSaving,
  showDeleteCatDlg, snackbar, categoryStats, categoryCounts, topCategories,
} = storeToRefs(categoriesStore);

const {
  init, openAddCategory, openEditCategory, saveCategory,
  confirmDeleteCategory, handleDeleteCategory, viewItems,
} = categoriesStore;

onMounted(init);
</script>

<template>
  <v-container fluid class="pa-0">
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div />
      <v-btn
        color="var(--app-primary)" rounded="lg" height="40" elevation="0"
        prepend-icon="mdi-plus"
        @click="openAddCategory"
      >
        <span style="color:#063824; font-weight:800">Add Category</span>
      </v-btn>
    </div>

    <CategoryStatsRow :stats="categoryStats" />

    <v-row dense>
      <v-col cols="12" md="4">
        <CategoryTopCard :top-categories="topCategories" />
      </v-col>
      <v-col cols="12" md="8">
        <CategoryList
          :categories="menuStore.categories"
          :category-counts="categoryCounts"
          @view="(id) => viewItems(router, id)"
          @edit="openEditCategory"
          @delete="confirmDeleteCategory"
          @view-all="() => viewItems(router, 'all')"
        />
      </v-col>
    </v-row>

    <CategoryDialog
      v-model="showCatDialog"
      :editing="editingCategory"
      :form="catForm"
      :saving="catSaving"
      @save="saveCategory"
    />

    <CategoryDeleteDialog
      v-model="showDeleteCatDlg"
      @confirm="handleDeleteCategory"
    />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom right"
      :timeout="3000"
      rounded="lg"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </v-container>
</template>