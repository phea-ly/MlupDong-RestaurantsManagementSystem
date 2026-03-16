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
      console.error('API failed, using mock data:', e);
      // Use mock data if API fails
      menuItems.value = [
        {
          id: 1,
          name: "Classic Burger",
          description: "Juicy beef patty with lettuce, tomato, and our special sauce",
          price: 12.99,
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
          status: true,
          category_id: 1,
          category: "Main Course"
        },
        {
          id: 2,
          name: "Caesar Salad",
          description: "Fresh romaine lettuce with parmesan cheese and croutons",
          price: 8.99,
          image: "https://images.unsplash.com/photo-1550304943-4f24f20dd7b9?w=600",
          status: true,
          category_id: 2,
          category: "Salads"
        },
        {
          id: 3,
          name: "Grilled Salmon",
          description: "Fresh Atlantic salmon with lemon butter sauce",
          price: 18.99,
          image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
          status: true,
          category_id: 1,
          category: "Main Course"
        },
        {
          id: 4,
          name: "French Fries",
          description: "Crispy golden fries with sea salt",
          price: 4.99,
          image: "https://images.unsplash.com/photo-1576107619102-096e28e2f449?w=600",
          status: true,
          category_id: 3,
          category: "Sides"
        },
        {
          id: 5,
          name: "Chocolate Cake",
          description: "Decadent chocolate cake with ganache frosting",
          price: 6.99,
          image: "https://images.unsplash.com/photo-1578985831906-3eb361ec80d0?w=600",
          status: true,
          category_id: 4,
          category: "Desserts"
        }
      ];
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
      console.error("Failed to load categories, using mock data:", e);
      // Use mock categories if API fails
      categories.value = [
        { category_id: 1, category_name: "Main Course" },
        { category_id: 2, category_name: "Salads" },
        { category_id: 3, category_name: "Sides" },
        { category_id: 4, category_name: "Desserts" }
      ];
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
