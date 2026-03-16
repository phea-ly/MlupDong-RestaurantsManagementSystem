import { defineStore } from "pinia";
import { ref } from "vue";
import { menuItemApi, categoryApi } from "@/api/menu.api";

export const useMenuStore = defineStore("menu", () => {
  // ── State ───
  const menuItems = ref([]);
  const categories = ref([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref(null);
  const activeCategory = ref("all");

  // ── Normalise raw API response → UI shape ──────
  function normalise(raw) {
    return {
      id: raw.menu_item_id,
      name: raw.item_name,
      description: raw.description ?? "",
      price: parseFloat(raw.price) || 0,
      image: raw.image ?? "",
      status: Boolean(raw.status),
      category_id: raw.category_id ?? null,
      category: raw.category ?? null,
    };
  }

  // ── Fetch menu items ─────
  async function fetchMenuItems() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await menuItemApi.getAll();
      menuItems.value = data.map(normalise);
    } catch (e) {
      error.value = e?.response?.data?.message ?? "Failed to load menu items";
    } finally {
      loading.value = false;
    }
  }

  // ── Fetch categories ──────
  async function fetchCategories() {
    try {
      const { data } = await categoryApi.getAll();
      categories.value = Array.isArray(data) ? data : (data?.data ?? []);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  }

  // ── Add menu item ─────
  async function addMenuItem(payload) {
    saving.value = true;
    error.value = null;
    try {
      const { data } = await menuItemApi.create(payload);
      menuItems.value.unshift(normalise(data));
      return { success: true };
    } catch (e) {
      error.value = e?.response?.data?.message ?? "Failed to create menu item";
      return { success: false, errors: e?.response?.data?.errors };
    } finally {
      saving.value = false;
    }
  }

  // ── Update menu item ─────
  async function updateMenuItem(id, payload) {
    saving.value = true;
    error.value = null;
    try {
      const { data } = await menuItemApi.update(id, payload);
      const idx = menuItems.value.findIndex((i) => i.id === id);
      if (idx !== -1) menuItems.value[idx] = normalise(data);
      return { success: true };
    } catch (e) {
      error.value = e?.response?.data?.message ?? "Failed to update menu item";
      return { success: false, errors: e?.response?.data?.errors };
    } finally {
      saving.value = false;
    }
  }

  // ── Delete menu item ─────
  async function deleteMenuItem(id) {
    saving.value = true;
    error.value = null;
    try {
      await menuItemApi.destroy(id);
      menuItems.value = menuItems.value.filter((i) => i.id !== id);
      return { success: true };
    } catch (e) {
      error.value = e?.response?.data?.message ?? "Failed to delete menu item";
      return { success: false };
    } finally {
      saving.value = false;
    }
  }

  // ── Toggle status ─────
  async function toggleStatus(id) {
    const item = menuItems.value.find((i) => i.id === id);
    if (!item) return;

    const newStatus = !item.status;
    item.status = newStatus;

    try {
      await menuItemApi.toggleStatus(id, newStatus);
    } catch (e) {
      item.status = !newStatus;
      error.value = "Failed to update availability";
    }
  }

  // ── Category CRUD ─────
  async function addCategory(payload) {
    try {
      const { data } = await categoryApi.create(payload);
      categories.value.unshift(data);
      return { success: true, data };
    } catch (e) {
      return { success: false, errors: e?.response?.data?.errors };
    }
  }

  async function updateCategory(id, payload) {
    try {
      const { data } = await categoryApi.update(id, payload);
      const idx = categories.value.findIndex((c) => c.category_id === id);
      if (idx !== -1) categories.value[idx] = data;
      return { success: true, data };
    } catch (e) {
      return { success: false, errors: e?.response?.data?.errors };
    }
  }

  async function deleteCategory(id) {
    try {
      await categoryApi.destroy(id);
      categories.value = categories.value.filter((c) => c.category_id !== id);
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  }

  return {
    // state
    menuItems,
    categories,
    loading,
    saving,
    error,
    activeCategory,
    // actions
    fetchMenuItems,
    fetchCategories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleStatus,
    addCategory,
    updateCategory,
    deleteCategory,
  };
});
