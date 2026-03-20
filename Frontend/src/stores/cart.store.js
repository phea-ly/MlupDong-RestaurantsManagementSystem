import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { orderApi } from '@/api/order.api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const specialInstructions = ref('')
  const tableToken = ref(localStorage.getItem('table_token') || '')

  // Load from local storage
  const savedCart = localStorage.getItem('cart_items')
  if (savedCart) {
    try { items.value = JSON.parse(savedCart) } catch (e) {}
  }
  const savedInstructions = localStorage.getItem('cart_instructions')
  if (savedInstructions) {
    specialInstructions.value = savedInstructions
  }

  // Watch for changes and save to localStorage
  watch(items, (newVal) => {
    localStorage.setItem('cart_items', JSON.stringify(newVal))
  }, { deep: true })

  watch(specialInstructions, (newVal) => {
    localStorage.setItem('cart_instructions', newVal)
  })

  const cartCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const cartSubtotal = computed(() => items.value.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0))
  const taxRate = 0.10 // 10% tax
  const cartTax = computed(() => cartSubtotal.value * taxRate)
  const cartTotal = computed(() => cartSubtotal.value + cartTax.value)

  function addToCart(product) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({
        id: product.id,
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
  }

  async function placeOrder(details = {}) {
    if (items.value.length === 0) return { success: false, message: 'Cart is empty' }

    const payload = {
      order_type: details.order_type || 'dine_in',
      table_id: details.table_id || 1, // Default to table 1 if not specified
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

  function setTableToken(token) {
    tableToken.value = token
    localStorage.setItem('table_token', token)
  }

  return {
    items,
    specialInstructions,
    tableToken,
    cartCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder,
    setTableToken
  }
})
