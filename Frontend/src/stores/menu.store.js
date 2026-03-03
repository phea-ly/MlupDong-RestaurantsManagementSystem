import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMenuStore = defineStore('menu', () => {
  const menuItems = ref([
    // Food Items
    {
      id: 1,
      name: 'Grilled Lemongrass Chicken',
      description: 'Authentic Khmer spice rub',
      price: 8.50,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      status: true,
      badge: 'BEST SELLER'
    },
    {
      id: 2,
      name: 'Beef Lok Lak',
      description: 'Stir-fried in Kampot pepper sauce',
      price: 12.00,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      status: true
    },
    {
      id: 3,
      name: 'Morning Glory',
      description: 'Sautéed with local garlic & chili',
      price: 5.50,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
      status: false,
      badge: 'SOLD OUT'
    },
    {
      id: 4,
      name: 'Mango Sticky Rice',
      description: 'Sweet mango and infused rice',
      price: 4.50,
      category: 'food',
      image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400',
      status: true
    },
    // Drinks
    {
      id: 5,
      name: 'Fresh Coconut Water',
      description: 'Chilled young coconut',
      price: 3.00,
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400',
      status: true
    },
    {
      id: 6,
      name: 'Iced Coffee',
      description: 'Traditional Cambodian style',
      price: 2.50,
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400',
      status: true,
      badge: 'POPULAR'
    },
    {
      id: 7,
      name: 'Mango Smoothie',
      description: 'Fresh tropical mango blend',
      price: 4.00,
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400',
      status: true
    },
    {
      id: 8,
      name: 'Angkor Beer',
      description: 'Local premium lager',
      price: 3.50,
      category: 'drinks',
      image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
      status: true
    },
    // Promotions
    {
      id: 9,
      name: 'Lunch Special',
      description: 'Any main dish + drink + dessert',
      price: 15.00,
      category: 'promotions',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      status: true,
      badge: 'LIMITED TIME'
    },
    {
      id: 10,
      name: 'Family Feast',
      description: '4 mains + 2 sides + 4 drinks',
      price: 45.00,
      category: 'promotions',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
      status: true,
      badge: 'BEST VALUE'
    },
    {
      id: 11,
      name: 'Happy Hour',
      description: '50% off all drinks 3-5 PM',
      price: 0.00,
      category: 'promotions',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400',
      status: true,
      badge: 'DAILY'
    }
  ])

  const loading = ref(false)
  const activeCategory = ref('food')

  function addMenuItem(item) {
    const newItem = {
      ...item,
      id: Date.now(),
      status: true
    }
    menuItems.value.push(newItem)
  }

  function updateMenuItem(id, updates) {
    const index = menuItems.value.findIndex(item => item.id === id)
    if (index !== -1) {
      menuItems.value[index] = { ...menuItems.value[index], ...updates }
    }
  }

  function deleteMenuItem(id) {
    const index = menuItems.value.findIndex(item => item.id === id)
    if (index !== -1) {
      menuItems.value.splice(index, 1)
    }
  }

  function toggleStatus(id) {
    const item = menuItems.value.find(item => item.id === id)
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
    toggleStatus
  }
})
