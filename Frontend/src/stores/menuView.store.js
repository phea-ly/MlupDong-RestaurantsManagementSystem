import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useMenuStore } from "./menu.store";

export const useMenuViewStore = defineStore("menuView", () => {
  const menuStore = useMenuStore();

  const searchQuery = ref("");
  const statusFilter = ref("all");
  const showDialog = ref(false);
  const editingItem = ref(null);
  const showDeleteDialog = ref(false);
  const deletingItemId = ref(null);
  const deleting = ref(false);
  const snackbar = ref({ show: false, message: "", color: "" });

  const statusOptions = ref([
    { title: "All Status", value: "all" },
    { title: "Active", value: "active" },
    { title: "Inactive", value: "inactive" },
  ]);

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

  async function init() {
    await menuStore.fetchCategories();
    await menuStore.fetchMenuItems();
  }

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

  async function handleSaved() {
    await menuStore.fetchCategories();
    await menuStore.fetchMenuItems();
  }

  function goToCategories(router) {
    router.push("/home/categories");
  }

  return {
    searchQuery,
    statusFilter,
    showDialog,
    editingItem,
    showDeleteDialog,
    deletingItemId,
    deleting,
    snackbar,
    statusOptions,
    filteredItems,
    stats,
    categoryTabs,
    init,
    handleAddNew,
    handleEdit,
    confirmDelete,
    handleDelete,
    handleSaved,
    goToCategories,
  };
});
