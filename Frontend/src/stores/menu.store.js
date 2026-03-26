// src/stores/menu.store.js
import { defineStore }   from 'pinia'
import { ref, computed } from 'vue'
import { menuItemApi, categoryApi } from '@/api/menu.api'

export const useMenuStore = defineStore('menu', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const categories     = ref([])
  const menuItems      = ref([])
  const loading        = ref(false)
  const saving         = ref(false)
  const error          = ref(null)
  const activeCategory = ref('all')

  // ── Image URL resolver ─────────────────────────────────────────────────────
  // Laravel stores paths as '/storage/menu-images/xxx.jpg'
  // VITE_STORAGE_URL = http://127.0.0.1:8000/storage
  function resolveImageUrl(path) {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    const base = (import.meta.env.VITE_STORAGE_URL ?? 'http://127.0.0.1:8000/storage')
      .replace(/\/+$/, '')
    const clean = path.replace(/^\/storage/, '')
    return `${base}${clean}`
  }

  // ── Mappers ────────────────────────────────────────────────────────────────
  function mapMenuItem(item) {
    return {
      // Keep the raw server path so the card/dialog can resolve it themselves
      // (allows component-level error handling with @error)
      id:          item.menu_item_id ?? item.id,
      rawId:       item.menu_item_id ?? item.id,   // always the DB primary key
      name:        item.item_name    ?? item.name  ?? '',
      description: item.description  ?? '',
      price:       item.price        ?? 0,
      status:      item.status       ?? true,
      category_id: item.category_id  ?? null,
      category:    item.category     ?? null,
      image:       item.image        ?? null,      // raw path — resolved in component
    }
  }

  function mapCategory(c) {
    return {
      category_id:      c.category_id,
      category_name:    c.category_name,
      description:      c.description      ?? '',
      status:           c.status           ?? true,
      menu_items_count: c.menu_items_count ?? 0,
    }
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  const stats = computed(() => ({
    total:      menuItems.value.length,
    active:     menuItems.value.filter(i =>  i.status).length,
    inactive:   menuItems.value.filter(i => !i.status).length,
    categories: categories.value.length,
  }))

  const categoryTabs = computed(() => [
    { value: 'all', label: 'All Items', icon: 'mdi-view-grid-outline' },
    ...categories.value.map(c => ({
      value: c.category_id,
      label: c.category_name,
      icon:  'mdi-tag-outline',
    })),
  ])

  // ── Fetch ──────────────────────────────────────────────────────────────────
  async function fetchCategories() {
    try {
      const { data } = await categoryApi.getAll()
      const list = Array.isArray(data) ? data : (data.data ?? [])
      categories.value = list.map(mapCategory)
    } catch (e) {
      error.value = e.message
    }
  }

  async function fetchMenuItems() {
    loading.value = true
    try {
      const { data } = await menuItemApi.getAll()
      const list = Array.isArray(data) ? data : (data.data ?? [])
      menuItems.value = list.map(mapMenuItem)
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────
  async function addMenuItem(payload) {
    saving.value = true
    try {
      const { data } = await menuItemApi.create(payload)
      menuItems.value.unshift(mapMenuItem(data))
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message, errors: e.errors ?? {} }
    } finally {
      saving.value = false
    }
  }

  async function updateMenuItem(rawId, payload) {
    saving.value = true
    try {
      const { data } = await menuItemApi.update(rawId, payload)
      const mapped   = mapMenuItem(data)
      const idx      = menuItems.value.findIndex(i => i.rawId === rawId)
      if (idx !== -1) menuItems.value[idx] = mapped
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message, errors: e.errors ?? {} }
    } finally {
      saving.value = false
    }
  }

  async function deleteMenuItem(rawId) {
    try {
      await menuItemApi.destroy(rawId)
      menuItems.value = menuItems.value.filter(i => i.rawId !== rawId)
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }

  // Accepts the full item object — toggles status and sends PATCH
  async function toggleStatus(item) {
    const previous = item.status
    item.status    = !previous              // optimistic
    try {
      await menuItemApi.toggleStatus(item.rawId, item.status)
    } catch {
      item.status = previous                // rollback
    }
  }

  // ── Category helpers ───────────────────────────────────────────────────────
  async function addCategory(payload) {
    try {
      const { data } = await categoryApi.create(payload)
      categories.value.unshift(mapCategory(data))
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }

  async function updateCategory(id, payload) {
    try {
      const { data } = await categoryApi.update(id, payload)
      const idx = categories.value.findIndex(c => c.category_id === id)
      if (idx !== -1) categories.value[idx] = mapCategory(data)
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }

  async function deleteCategory(id) {
    try {
      await categoryApi.destroy(id)
      categories.value = categories.value.filter(c => c.category_id !== id)
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }

  async function init() {
    await Promise.all([fetchCategories(), fetchMenuItems()])
  }

  return {
    categories, menuItems, loading, saving, error, activeCategory,
    stats, categoryTabs,
    init, fetchCategories, fetchMenuItems,
    addMenuItem, updateMenuItem, deleteMenuItem, toggleStatus,
    addCategory, updateCategory, deleteCategory,
  }
})