// src/stores/cart.store.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { orderApi, orderItemApi } from '@/api/order.api'

export const useCartStore = defineStore('cart', () => {
  const items               = ref([])
  const tableId             = ref(null)
  const tableNumber         = ref(null)
  const specialInstructions = ref('')

  // ── Getters ──────────────────────────────────────────────────────
  const cartCount    = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const cartSubtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))
  const cartTax      = computed(() => cartSubtotal.value * 0.1)
  const cartTotal    = computed(() => cartSubtotal.value + cartTax.value)

  // ── Actions ──────────────────────────────────────────────────────
  function setTableId(id, number) {
    tableId.value     = id
    tableNumber.value = number
  }

  function addToCart(menuItem) {
    const existing = items.value.find((i) => i.id === menuItem.menu_item_id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({
        id:           menuItem.menu_item_id,
        name:         menuItem.name,
        price:        parseFloat(menuItem.price),
        image:        menuItem.image_url ?? null,
        quantity:     1,
        note:         null,
      })
    }
  }

  function removeFromCart(id) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function updateQuantity(id, qty) {
    const item = items.value.find((i) => i.id === id)
    if (item) item.quantity = qty
  }

  function clearCart() {
    items.value               = []
    specialInstructions.value = ''
  }

  // Estimate wait: ~5 min base + 3 min per active order ahead
  function calcEstimatedWait(ordersAhead) {
    return 5 + ordersAhead * 3
  }

  async function placeOrder({ order_type, table_id }) {
    try {
      // 1. Create the order header
      const subtotal = cartSubtotal.value
      const tax      = cartTax.value

      const { data: order } = await orderApi.create({
        order_type,
        table_id,
        order_status:   'new',
        payment_status: 'pending',
        total_amount:   subtotal,
        tax:            tax,
        final_amount:   subtotal + tax,
      })

      // 2. Create each order item
      await Promise.all(
        items.value.map((item) =>
          orderItemApi.create({
            order_id:     order.order_id,
            menu_item_id: item.id,
            quantity:     item.quantity,
            unit_price:   item.price,
            subtotal:     item.price * item.quantity,
            note:         specialInstructions.value || null,
          }),
        ),
      )

      clearCart()
      return { success: true, order }
    } catch (err) {
      const message = err.response?.data?.message ?? err.message ?? 'Unknown error'
      return { success: false, message }
    }
  }

  return {
    items,
    tableId,
    tableNumber,
    specialInstructions,
    cartCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    setTableId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calcEstimatedWait,
    placeOrder,
  }
})