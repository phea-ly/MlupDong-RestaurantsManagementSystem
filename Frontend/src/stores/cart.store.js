// src/stores/cart.store.js
import { defineStore }      from 'pinia'
import { ref, computed }    from 'vue'
import { echo }             from '@/echo'
import { customerOrderApi } from '@/api/order.api'

export const useCartStore = defineStore('cart', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const items               = ref([])
  const tableId             = ref(null)
  const tableNumber         = ref(null)
  const specialInstructions = ref('')

  // Last placed order — for tracking status live on customer screen
  const lastOrder  = ref(null)
  let tableChannel = null

  // ── Computed ───────────────────────────────────────────────────────────────
  const cartCount    = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const cartSubtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))
  const cartTax      = computed(() => Math.round(cartSubtotal.value * 0.10 * 100) / 100)
  const cartTotal    = computed(() => Math.round((cartSubtotal.value + cartTax.value) * 100) / 100)

  // ── Actions ────────────────────────────────────────────────────────────────
  function setTableId(id, number) {
    tableId.value     = id
    tableNumber.value = number
    // Subscribe to per-table channel so customer can track their order live
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
      })
    }
  }

  function updateQuantity(id, qty) {
    if (qty <= 0) { removeFromCart(id); return }
    const item = items.value.find(i => i.id === id)
    if (item) item.quantity = qty
  }

  function removeFromCart(id) {
    items.value = items.value.filter(i => i.id !== id)
  }

  function clearCart() {
    items.value               = []
    specialInstructions.value = ''
  }

  // Rough wait estimate shown before placing order
  function calcEstimatedWait(activeOrdersAhead) {
    return Math.max(5, 5 + activeOrdersAhead * 5)
  }

  async function placeOrder({ order_type, table_id }) {
    if (!items.value.length) return { success: false, message: 'Cart is empty.' }

    const payload = {
      table_id:             table_id ?? tableId.value,
      order_type:           order_type ?? 'dine_in',
      special_instructions: specialInstructions.value || null,
      items: items.value.map(i => ({
        menu_item_id: i.menu_item_id ?? i.id,
        quantity:     i.quantity,
        note:         i.note ?? null,
      })),
    }

    try {
      const { data } = await customerOrderApi.placeOrder(payload)
      // Save last order so the success screen can show order number + wait
      lastOrder.value = {
        order_id:     data.order_id,
        order_number: data.order_number,
        order_status: 'new',
        total:        data.total,
        estimated_wait_minutes: data.estimated_wait_minutes,
      }
      clearCart()
      return { success: true, data }
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'Order failed.'
      return { success: false, message: msg }
    }
  }

  // ── Per-table Echo subscription ────────────────────────────────────────────
  // Customer menu listens to table.{number} so it sees live status updates
  // from the kitchen without polling
  function _subscribeTableChannel(number) {
    if (tableChannel !== null) {
      echo.leaveChannel(`table.${tableChannel}`)
    }
    tableChannel = number

    echo.channel(`table.${number}`)
      .listen('.order.status.updated', (payload) => {
        if (lastOrder.value && (payload.order_id === lastOrder.value.order_id || payload.id === lastOrder.value.order_id)) {
          lastOrder.value = { ...lastOrder.value, order_status: payload.order_status }
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
    items, tableId, tableNumber, specialInstructions, lastOrder,
    // computed
    cartCount, cartSubtotal, cartTax, cartTotal,
    // actions
    setTableId, addToCart, updateQuantity, removeFromCart, clearCart,
    calcEstimatedWait, placeOrder, leaveTableChannel,
  }
})