import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useMenuStore } from "./menu.store";

export const useCategoriesViewStore = defineStore("categoriesView", () => {
  const menuStore = useMenuStore();

  const showCatDialog = ref(false);
  const editingCategory = ref(null);
  const catForm = ref({ category_name: "", description: "", status: true });
  const catSaving = ref(false);
  const showDeleteCatDlg = ref(false);
  const deletingCatId = ref(null);
  const snackbar = ref({ show: false, message: "", color: "" });

  const categoryStats = computed(() => {
    const total = menuStore.categories.length;
    const active = menuStore.categories.filter((c) => c.status).length;
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
          id: c.category_id,
          name: c.category_name,
          count,
          pct: Math.round((count / totalItems) * 100),
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
      ? await menuStore.updateCategory(editingCategory.value.category_id, catForm.value)
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
      snackbar.value = { show: true, message: "Failed to save category.", color: "error" };
    }
  }

  function confirmDeleteCategory(id) {
    deletingCatId.value = id;
    showDeleteCatDlg.value = true;
  }

  async function handleDeleteCategory() {
    const result = await menuStore.deleteCategory(deletingCatId.value);
    showDeleteCatDlg.value = false;
    if (menuStore.activeCategory === deletingCatId.value) menuStore.activeCategory = "all";
    snackbar.value = result.success
      ? { show: true, message: "Category deleted.", color: "success" }
      : { show: true, message: "Failed to delete category.", color: "error" };
  }

  function viewItems(router, categoryId) {
    menuStore.activeCategory = categoryId ?? "all";
    router.push("/home/menu");
  }

  return {
    showCatDialog,
    editingCategory,
    catForm,
    catSaving,
    showDeleteCatDlg,
    deletingCatId,
    snackbar,
    categoryStats,
    categoryCounts,
    topCategories,
    init,
    openAddCategory,
    openEditCategory,
    saveCategory,
    confirmDeleteCategory,
    handleDeleteCategory,
    viewItems,
  };
});
