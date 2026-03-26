import { defineStore }   from 'pinia'
import { ref, computed } from 'vue'
import categoryApi       from '@/api/category.api'

export const useCategoryStore = defineStore('category', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const categories  = ref([])
  const loading     = ref(false)
  const saving      = ref(false)
  const deleting    = ref(false)
  const snackbar    = ref({ show: false, message: '', color: 'success' })

  // Dialog state
  const showDialog       = ref(false)
  const showDeleteDialog = ref(false)
  const editingCategory  = ref(null)
  const deletingId       = ref(null)

  // Form + validation
  function blankForm() {
    return { category_name: '', description: '', status: true, restaurant_id: null }
  }
  const form       = ref(blankForm())
  const nameError  = ref('')  

  // ── Computed ───────────────────────────────────────────────────────────────
  const stats = computed(() => {
    const total    = categories.value.length
    const active   = categories.value.filter(c => c.status).length
    return { total, active, inactive: total - active }
  })

  // Map<category_id, menu_items_count> — used by CategoryList
  const categoryCounts = computed(() => {
    const map = new Map()
    categories.value.forEach(c => map.set(c.category_id, c.menu_items_count ?? 0))
    return map
  })

  // Top 4 by item count — used by CategoryTopCard
  const topCategories = computed(() => {
    const total = categories.value.reduce((s, c) => s + (c.menu_items_count ?? 0), 0) || 1
    return [...categories.value]
      .sort((a, b) => (b.menu_items_count ?? 0) - (a.menu_items_count ?? 0))
      .slice(0, 4)
      .map(c => ({
        id:    c.category_id,
        name:  c.category_name,
        count: c.menu_items_count ?? 0,
        pct:   Math.round(((c.menu_items_count ?? 0) / total) * 100),
      }))
  })

  // ── Helpers ────────────────────────────────────────────────────────────────
  function notify(message, color = 'success') {
    snackbar.value = { show: true, message, color }
  }

  function mapCategory(c) {
    return {
      category_id:      c.category_id,
      category_name:    c.category_name,
      description:      c.description      ?? '',
      status:           c.status           ?? true,
      restaurant_id:    c.restaurant_id    ?? null,
      restaurant:       c.restaurant       ?? null,
      menu_items_count: c.menu_items_count ?? 0,
    }
  }

  // ── Duplicate name check ───────────────────────────────────────────────────
  function isDuplicateName(name) {
    const trimmed = name.trim().toLowerCase()
    return categories.value.some(c => {
      const isSelf = editingCategory.value?.category_id === c.category_id
      return !isSelf && c.category_name.toLowerCase() === trimmed
    })
  }

  function validateForm() {
    nameError.value = ''
    if (!form.value.category_name.trim()) {
      nameError.value = 'Category name is required.'
      return false
    }
    if (isDuplicateName(form.value.category_name)) {
      nameError.value = 'A category with this name already exists.'
      return false
    }
    return true
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchCategories() {
    loading.value = true
    try {
      const { data } = await categoryApi.getAll()
      const list = Array.isArray(data) ? data : (data.data ?? [])
      categories.value = list.map(mapCategory)
    } catch {
      notify('Failed to load categories.', 'error')
    } finally {
      loading.value = false
    }
  }

  function openAdd() {
    editingCategory.value = null
    form.value            = blankForm()
    nameError.value       = ''
    showDialog.value      = true
  }

  function openEdit(cat) {
    editingCategory.value = cat
    form.value = {
      category_name: cat.category_name,
      description:   cat.description   ?? '',
      status:        cat.status        ?? true,
      restaurant_id: cat.restaurant_id ?? null,
    }
    nameError.value  = ''
    showDialog.value = true
  }

  async function save() {
    if (!validateForm()) return    
    saving.value = true
    try {
      if (editingCategory.value) {
        const { data } = await categoryApi.update(editingCategory.value.category_id, form.value)
        const idx = categories.value.findIndex(c => c.category_id === editingCategory.value.category_id)
        if (idx !== -1) categories.value[idx] = mapCategory(data)
        notify('Category updated successfully.')
      } else {
        const { data } = await categoryApi.create(form.value)
        categories.value.unshift(mapCategory(data))
        notify('Category added successfully.')
      }
      showDialog.value = false
    } catch (err) {
      if (err.errors?.category_name) {
        nameError.value = err.errors.category_name[0]
      } else {
        notify(err.message ?? 'Failed to save category.', 'error')
      }
    } finally {
      saving.value = false
    }
  }

  function confirmDelete(id) {
    deletingId.value       = id
    showDeleteDialog.value = true
  }

  async function handleDelete() {
    deleting.value = true
    try {
      await categoryApi.remove(deletingId.value)
      categories.value       = categories.value.filter(c => c.category_id !== deletingId.value)
      showDeleteDialog.value = false
      deletingId.value       = null
      notify('Category deleted.')
    } catch (err) {
      notify(err.message ?? 'Failed to delete category.', 'error')
    } finally {
      deleting.value = false
    }
  }

  async function init() {
    await fetchCategories()
  }

  return {
    // state
    categories, loading, saving, deleting, snackbar,
    showDialog, showDeleteDialog, editingCategory, deletingId,
    form, nameError,
    // computed
    stats, categoryCounts, topCategories,
    // actions
    init, fetchCategories,
    openAdd, openEdit, save,
    confirmDelete, handleDelete,
  }
})