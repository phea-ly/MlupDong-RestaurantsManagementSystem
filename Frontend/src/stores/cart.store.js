import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { orderApi } from '@/api/order.api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const specialInstructions = ref('')
  const tableId = ref(null)
  const tableNumber = ref(null)

  // Load from local storage
  const savedCart = localStorage.getItem('cart_items')
  if (savedCart) {
    try { items.value = JSON.parse(savedCart) } catch (e) {}
  }
  const savedInstructions = localStorage.getItem('cart_instructions')
  if (savedInstructions) {
    specialInstructions.value = savedInstructions
  }
  const savedTableId = localStorage.getItem('cart_table_id')
  if (savedTableId) {
    tableId.value = savedTableId
  }
  const savedTableNumber = localStorage.getItem('cart_table_number')
  if (savedTableNumber) {
    tableNumber.value = savedTableNumber
  }

  // Watch for changes and save to localStorage
  watch(items, (newVal) => {
    localStorage.setItem('cart_items', JSON.stringify(newVal))
  }, { deep: true })

  watch(specialInstructions, (newVal) => {
    localStorage.setItem('cart_instructions', newVal)
  })

  watch(tableId, (newVal) => {
    if (newVal) localStorage.setItem('cart_table_id', newVal)
    else localStorage.removeItem('cart_table_id')
  })

  watch(tableNumber, (newVal) => {
    if (newVal) localStorage.setItem('cart_table_number', newVal)
    else localStorage.removeItem('cart_table_number')
  })

  const cartCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const cartSubtotal = computed(() => items.value.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0))
  const taxRate = 0.10 // 10% tax
  const cartTax = computed(() => cartSubtotal.value * taxRate)
  const cartTotal = computed(() => cartSubtotal.value + cartTax.value)

  function addToCart(product) {
    const existing = items.value.find(i => i.id === product.id || i.id === product.menu_item_id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({
        id: product.id || product.menu_item_id,
        name: product.name,
        price: parseFloat(product.price || 0),
        image: product.image,
        quantity: 1
      })
    }
  }

  function removeFromCart(productId) {
    items.value = items.value.filter(i => i.id !== productId)
  }

  function updateQuantity(productId, quantity) {
    const existing = items.value.find(i => i.id === productId)
    if (existing) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        existing.quantity = quantity
      }
    }
  }

  function clearCart() {
    items.value = []
    specialInstructions.value = ''
    localStorage.removeItem('cart_items')
    localStorage.removeItem('cart_instructions')
    // tableId stays as it corresponds to the physical table
  }

  function setTableId(id, number = null) {
    tableId.value = id
    if (number) tableNumber.value = number
  }

  async function placeOrder(details = {}) {
    if (items.value.length === 0) return { success: false, message: 'Cart is empty' }

    const payload = {
      order_type: details.order_type || 'dine_in',
      table_id: details.table_id || tableId.value || 1, 
      total_amount: cartSubtotal.value,
      tax: cartTax.value,
      final_amount: cartTotal.value,
      order_status: 'new',
      payment_status: 'pending',
      items: items.value.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        note: specialInstructions.value
      }))
    }

    try {
      await orderApi.create(payload)
      clearCart()
      return { success: true }
    } catch (e) {
      console.error('Order placement failed', e)
      return { 
        success: false, 
        message: e.response?.data?.message || 'Failed to place order' 
      }
    }
  }

  return {
    items,
    specialInstructions,
    tableId,
    tableNumber,
    setTableId,
    cartCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder
  }
})

