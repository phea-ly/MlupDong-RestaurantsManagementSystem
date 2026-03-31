// src/stores/cart.store.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { echo } from '@/echo'
import { customerOrderApi } from '@/api/order.api'

export const useCartStore = defineStore('cart', () => {

  // ── State ────────────────────────────────────────────────────────────────
  const items                = ref([])
  const tableId              = ref(null)
  const tableNumber          = ref(null)
  const specialInstructions  = ref('')

  // Changed: array of orders so multiple sessions work independently
  const orders               = ref([])   // [{ order_id, order_number, order_status, ... }]
  const lastOrder            = computed(() => orders.value[orders.value.length - 1] ?? null)

  let tableChannel = null

  // ── Computed ─────────────────────────────────────────────────────────────
  const cartCount    = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const cartSubtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))
  const cartTax      = computed(() => Math.round(cartSubtotal.value * 0.10 * 100) / 100)
  const cartTotal    = computed(() => Math.round((cartSubtotal.value + cartTax.value) * 100) / 100)

  // ── Actions ───────────────────────────────────────────────────────────────
  function setTableId(id, number) {
    tableId.value     = id
    tableNumber.value = number
    if (number) _subscribeTableChannel(number)
  }

  function addToCart(item) {
    const id       = item.id ?? item.rawId
    const existing = items.value.find(i => i.id === id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({
        id,
        menu_item_id: id,
        name:         item.name ?? item.item_name,
        price:        parseFloat(item.price),
        image:        item.image ?? null,
        quantity:     1,
        note:         '',    // ← per-item note field
      })
    }
  }

  function updateQuantity(id, qty) {
    if (qty <= 0) { removeFromCart(id); return }
    const item = items.value.find(i => i.id === id)
    if (item) item.quantity = qty
  }

  function updateItemNote(id, note) {
    const item = items.value.find(i => i.id === id)
    if (item) item.note = note
  }

  function removeFromCart(id) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function clearCart() {
    items.value               = []
    specialInstructions.value = ''
  }

  function calcEstimatedWait(activeOrdersAhead) {
    return Math.max(5, 5 + activeOrdersAhead * 5)
  }

  async function placeOrder({ order_type, table_id } = {}) {
    if (!items.value.length) return { success: false, message: 'Cart is empty.' }

    const payload = {
      table_id:              table_id ?? tableId.value,
      order_type:            order_type ?? 'dine_in',
      special_instructions:  specialInstructions.value || null,
      items: items.value.map(i => ({
        menu_item_id: i.menu_item_id ?? i.id,
        quantity:     i.quantity,
        note:         i.note || null,    // ← send per-item note
      })),
    }

    try {
      const { data } = await customerOrderApi.placeOrder(payload)

      // Push new order into the orders array — old orders keep their status
      orders.value.push({
        order_id:               data.order_id,
        order_number:           data.order_number,
        order_status:           'new',          // initial status
        total:                  data.total,
        estimated_wait_minutes: data.estimated_wait_minutes,
        confirmed_at:           null,           // set when chef confirms
        prep_started:           false,
      })

      clearCart()
      return { success: true, data }
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'Order failed.'
      return { success: false, message: msg }
    }
  }

  // ── Per-table Echo subscription ──────────────────────────────────────────
  function _subscribeTableChannel(number) {
    if (tableChannel !== null) {
      echo.leaveChannel(`table.${tableChannel}`)
    }
    tableChannel = number

    echo.channel(`table.${number}`)
      .listen('.order.status.updated', (payload) => {
        // Find the matching order in our local orders array
        const orderId = payload.order_id ?? payload.id
        const order   = orders.value.find(o =>
          o.order_id === orderId || o.order_id === payload.order_id
        )
        if (!order) return

        const newStatus = payload.order_status ?? payload.status
        order.order_status = newStatus

        // When chef confirms → record the confirmation time
        // The countdown will start only at this point (not at placement)
        if (newStatus === 'confirmed' || newStatus === 'preparing') {
          if (!order.confirmed_at) {
            order.confirmed_at = new Date().toISOString()
            order.prep_started = true
          }
        }
      })
  }

  function leaveTableChannel() {
    if (tableChannel !== null) {
      echo.leaveChannel(`table.${tableChannel}`)
      tableChannel = null
    }
  }

  return {
    // state
    items, tableId, tableNumber, specialInstructions,
    orders, lastOrder,
    // computed
    cartCount, cartSubtotal, cartTax, cartTotal,
    // actions
    setTableId, addToCart, updateQuantity, updateItemNote,
    removeFromCart, clearCart, calcEstimatedWait, placeOrder,
    leaveTableChannel,
  }
})