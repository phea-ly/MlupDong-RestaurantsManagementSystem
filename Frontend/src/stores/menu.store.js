import { defineStore } from 'pinia'
import { ref } from 'vue'
import { menuItemApi, categoryApi } from '@/api/menu.api'

export const useMenuStore = defineStore('menu', () => {
<<<<<<< HEAD
  // ── State ────────────────────────────────────────────────────────
  const menuItems = ref([])
  const categories = ref([])
=======
  const menuItems = ref([
    {
      id: 1,
      name: 'Grilled Lemongrass Chicken',
      nameKm: 'មាន់អាំងគល់ស្លឹកគ្រៃ',
      description: 'Authentic Khmer spice rub',
      descriptionKm: 'គ្រឿងទេសខ្មែរពិតៗ',
      price: 8.50,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      status: true,
      badge: 'BEST SELLER',
    },
    {
      id: 2,
      name: 'Beef Lok Lak',
      nameKm: 'គោឡុកឡាក់',
      description: 'Stir-fried in Kampot pepper sauce',
      descriptionKm: 'ឆាដោយម្រេចកំពត',
      price: 12.00,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      status: true,
    },
    {
      id: 3,
      name: 'Morning Glory',
      nameKm: 'ត្រកួនឆា',
      description: 'Sauteed with local garlic & chili',
      descriptionKm: 'ឆាជាមួយខ្ទឹមស និងម្ទេសក្នុងស្រុក',
      price: 5.50,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
      status: false,
      badge: 'SOLD OUT',
    },
    {
      id: 4,
      name: 'Mango Sticky Rice',
      nameKm: 'បាយដំណើបស្វាយ',
      description: 'Sweet mango and infused rice',
      descriptionKm: 'ស្វាយផ្អែមជាមួយបាយដំណើបក្រអូប',
      price: 4.50,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400',
      status: true,
    },
    {
      id: 5,
      name: 'Fresh Coconut Water',
      nameKm: 'ទឹកដូងស្រស់',
      description: 'Chilled young coconut',
      descriptionKm: 'ទឹកដូងខ្ចីត្រជាក់',
      price: 3.00,
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      status: true,
    },
    {
      id: 6,
      name: 'Iced Coffee',
      nameKm: 'កាហ្វេទឹកកក',
      description: 'Traditional Cambodian style',
      descriptionKm: 'រសជាតិបែបខ្មែរបុរាណ',
      price: 2.50,
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
      status: true,
      badge: 'POPULAR',
    },
    {
      id: 7,
      name: 'Mango Smoothie',
      nameKm: 'ស្មូទីស្វាយ',
      description: 'Fresh tropical mango blend',
      descriptionKm: 'លាយផ្លែស្វាយត្រូពិចស្រស់',
      price: 4.00,
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400',
      status: true,
    },
    {
      id: 8,
      name: 'Angkor Beer',
      nameKm: 'ស្រាបៀរអង្គរ',
      description: 'Local premium lager',
      descriptionKm: 'ស្រាបៀរល្អពីក្នុងស្រុក',
      price: 3.50,
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
      status: true,
    },
    {
      id: 9,
      name: 'Lunch Special',
      nameKm: 'ឈុតអាហារថ្ងៃត្រង់',
      description: 'Any main dish + drink + dessert',
      descriptionKm: 'ម្ហូបចម្បង + ភេសជ្ជៈ + បង្អែម',
      price: 15.00,
      category: 'promotions',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      status: true,
      badge: 'LIMITED TIME',
    },
    {
      id: 10,
      name: 'Family Feast',
      nameKm: 'ឈុតគ្រួសារ',
      description: '4 mains + 2 sides + 4 drinks',
      descriptionKm: 'ម្ហូបចម្បង 4 + ម្ហូបបន្ថែម 2 + ភេសជ្ជៈ 4',
      price: 45.00,
      category: 'promotions',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      status: true,
      badge: 'BEST VALUE',
    },
    {
      id: 11,
      name: 'Happy Hour',
      nameKm: 'ម៉ោងពិសេស',
      description: '50% off all drinks 3-5 PM',
      descriptionKm: 'បញ្ចុះតម្លៃ 50% ភេសជ្ជៈទាំងអស់ ម៉ោង 3-5 ល្ងាច',
      price: 0.00,
      category: 'promotions',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400',
      status: true,
      badge: 'DAILY',
    },
  ])

>>>>>>> c4255a11263de64539af4715253de56ebbc217b2
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)
  const activeCategory = ref('all')

<<<<<<< HEAD
  // ── Helpers ──────────────────────────────────────────────────────
  /** Normalise a raw API menu-item to the shape used throughout the UI */
  function normalise(raw) {
    return {
      id: raw.menu_item_id,
      name: raw.item_name,
      description: raw.description ?? '',
      price: parseFloat(raw.price) || 0,
      image: raw.image ?? '',
      status: Boolean(raw.status),
      category_id: raw.category_id ?? null,
      category: raw.category ?? null,   // nested relation
    }
  }

  // ── Fetch all menu items ─────────────────────────────────────────
  async function fetchMenuItems() {
    loading.value = true
    error.value = null
    try {
      const { data } = await menuItemApi.getAll()
      menuItems.value = data.map(normalise)
    } catch (e) {
      error.value = e?.response?.data?.message ?? 'Failed to load menu items'
    } finally {
      loading.value = false
    }
  }

  // ── Fetch all categories ─────────────────────────────────────────
  async function fetchCategories() {
    try {
      const { data } = await categoryApi.getAll()
      categories.value = data
    } catch (e) {
      console.error('Failed to load categories', e)
    }
  }

  // ── Add menu item ────────────────────────────────────────────────
  async function addMenuItem(payload) {
    saving.value = true
    error.value = null
    try {
      const { data } = await menuItemApi.create(payload)
      menuItems.value.unshift(normalise(data))
      return { success: true }
    } catch (e) {
      error.value = e?.response?.data?.message ?? 'Failed to create menu item'
      return { success: false, errors: e?.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  // ── Update menu item ─────────────────────────────────────────────
  async function updateMenuItem(id, payload) {
    saving.value = true
    error.value = null
    try {
      const { data } = await menuItemApi.update(id, payload)
      const idx = menuItems.value.findIndex(i => i.id === id)
      if (idx !== -1) menuItems.value[idx] = normalise(data)
      return { success: true }
    } catch (e) {
      error.value = e?.response?.data?.message ?? 'Failed to update menu item'
      return { success: false, errors: e?.response?.data?.errors }
    } finally {
      saving.value = false
    }
  }

  // ── Delete menu item ─────────────────────────────────────────────
  async function deleteMenuItem(id) {
    saving.value = true
    error.value = null
    try {
      await menuItemApi.destroy(id)
      menuItems.value = menuItems.value.filter(i => i.id !== id)
      return { success: true }
    } catch (e) {
      error.value = e?.response?.data?.message ?? 'Failed to delete menu item'
      return { success: false }
    } finally {
      saving.value = false
    }
  }

  // ── Toggle status ────────────────────────────────────────────────
  async function toggleStatus(id) {
    const item = menuItems.value.find(i => i.id === id)
    if (!item) return

    const newStatus = !item.status
    // Optimistic update
    item.status = newStatus

    try {
      await menuItemApi.toggleStatus(id, newStatus)
    } catch (e) {
      // Revert
      item.status = !newStatus
      error.value = 'Failed to update status'
    }
  }

  // ── Category CRUD ────────────────────────────────────────────────
  async function addCategory(payload) {
    try {
      const { data } = await categoryApi.create(payload)
      categories.value.unshift(data)
      return { success: true, data }
    } catch (e) {
      return { success: false, errors: e?.response?.data?.errors }
    }
  }

  async function updateCategory(id, payload) {
    try {
      const { data } = await categoryApi.update(id, payload)
      const idx = categories.value.findIndex(c => c.category_id === id)
      if (idx !== -1) categories.value[idx] = data
      return { success: true, data }
    } catch (e) {
      return { success: false, errors: e?.response?.data?.errors }
    }
  }

  async function deleteCategory(id) {
    try {
      await categoryApi.destroy(id)
      categories.value = categories.value.filter(c => c.category_id !== id)
      return { success: true }
    } catch (e) {
      return { success: false }
=======
  function addMenuItem(item) {
    const newItem = {
      ...item,
      id: Date.now(),
      status: true,
    }
    menuItems.value.push(newItem)
  }

  function updateMenuItem(id, updates) {
    const index = menuItems.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      menuItems.value[index] = { ...menuItems.value[index], ...updates }
    }
  }

  function deleteMenuItem(id) {
    const index = menuItems.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      menuItems.value.splice(index, 1)
    }
  }

  function toggleStatus(id) {
    const item = menuItems.value.find((row) => row.id === id)
    if (item) {
      item.status = !item.status
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2
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
<<<<<<< HEAD
    addCategory,
    updateCategory,
    deleteCategory,
=======
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2
  }
})
