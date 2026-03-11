import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMenuStore = defineStore('menu', () => {
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

  const loading = ref(false)
  const activeCategory = ref('food')

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
    }
  }

  return {
    menuItems,
    loading,
    activeCategory,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleStatus,
  }
})
