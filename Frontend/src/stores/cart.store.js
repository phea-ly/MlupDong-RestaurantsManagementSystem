import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const specialInstructions = ref('')

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

  return {
    items,
    specialInstructions,
    cartCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
})
