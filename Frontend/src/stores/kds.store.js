// src/stores/kds.store.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { kdsApi } from '@/api/order.api'
import echo from '@/echo'

const ACTIVE_STATUSES = ['new', 'received', 'confirmed', 'preparing']

export const useKdsStore = defineStore('kds', () => {

  // ── State ────────────────────────────────────────────────────────
  const orders    = ref([])
  const loading   = ref(false)
  const connected = ref(false)
  const error     = ref(null)
  const tab       = ref('active')

  const currentTime = ref(formatClock())
  let clockTimer    = null
  let echoChannel   = null

  const snackbar = ref({ show: false, message: '', color: 'green' })

  // ── Derived order lists ──────────────────────────────────────────
  const incomingOrders  = computed(() => orders.value.filter((o) => o.order_status === 'new'))
  const receivedOrders  = computed(() => orders.value.filter((o) => o.order_status === 'received'))
  const confirmedOrders = computed(() => orders.value.filter((o) => o.order_status === 'confirmed'))
  const preparingOrders = computed(() => orders.value.filter((o) => o.order_status === 'preparing'))
  const readyOrders     = computed(() => orders.value.filter((o) => o.order_status === 'ready'))
  const completedOrders = computed(() => orders.value.filter((o) => o.order_status === 'completed'))

  const activeCount = computed(() =>
    orders.value.filter((o) => ACTIVE_STATUSES.includes(o.order_status)).length,
  )

  const estimatedWaitMinutes = computed(() => {
    const active = orders.value.filter((o) => ACTIVE_STATUSES.includes(o.order_status)).length
    return 5 + active * 3
  })

  // ── Helpers used by OrderCard ────────────────────────────────────
  function getElapsedSeconds(order) {
    return Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000)
  }

  function formatElapsed(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function getTimerClass(seconds) {
    if (seconds > 900) return 'timer-critical'   
    if (seconds > 480) return 'timer-warn'        
    return 'timer-ok'
  }

  function getOrderWaitMinutes(order) {
    if (!ACTIVE_STATUSES.includes(order.order_status)) return null
    const elapsed = Math.floor(getElapsedSeconds(order) / 60)
    const budget  = estimatedWaitMinutes.value
    return Math.max(0, budget - elapsed)
  }

  function getStatusLabel(status) {
    return {
      new:       'New',
      received:  'Received',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready:     'Ready',
      completed: 'Completed',
      cancelled: 'Cancelled',
    }[status] ?? status
  }

  function getStatusColor(status) {
    return {
      new:       'blue',
      received:  'indigo',
      confirmed: 'amber',
      preparing: 'teal',
      ready:     'green',
      completed: 'grey',
      cancelled: 'red',
    }[status] ?? 'grey'
  }

  // ── Normalise order from API or Echo payload ─────────────────────
  function normaliseOrder(raw) {
    return {
      id:           raw.order_id ?? raw.id,
      order_number: raw.order_number ?? '—',
      order_status: raw.order_status ?? raw.status ?? 'new',
      order_type:   raw.order_type ?? 'dine_in',
      table_name:   raw.table?.table_number ?? raw.table_number ?? '—',
      created_at:   raw.created_at,
      _flash:       false,
      items: (raw.orderItems ?? raw.items ?? []).map((i) => ({
        id:       i.order_item_id ?? i.id,
        name:     i.menuItem?.name ?? i.name ?? '—',
        quantity: i.quantity,
        note:     i.note ?? i.special_instructions ?? null,
      })),
    }
  }

  // ── API calls ────────────────────────────────────────────────────
  async function fetchOrders() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await kdsApi.getActiveOrders()
      orders.value = data
        .filter((o) => o.order_status !== 'cancelled')
        .map(normaliseOrder)
    } catch (e) {
      error.value = 'Failed to load orders. Check your connection.'
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(orderId, newStatus) {
    try {
      await kdsApi.updateStatus(orderId, newStatus)

      const order = orders.value.find((o) => o.id === orderId)
      if (order) {
        order.order_status = newStatus
        order._flash       = true
        setTimeout(() => { order._flash = false }, 1200)
      }

      notify(`Order marked as ${getStatusLabel(newStatus)}`, 'green')
    } catch {
      notify('Failed to update order status', 'red')
    }
  }

  // KDS action shortcuts
  const receiveOrder  = (id) => updateStatus(id, 'received')
  const confirmCooking = (id) => updateStatus(id, 'confirmed')
  const prepareFood   = (id) => updateStatus(id, 'preparing')
  const markReady     = (id) => updateStatus(id, 'ready')

  // ── Echo — WebSocket connection to Laravel Reverb ────────────────
  function connectEcho() {
    // The kitchen channel receives all order events
    echoChannel = echo.channel('kitchen')

    echoChannel.listen('.order.created', (payload) => {
      const exists = orders.value.find((o) => o.id === (payload.order_id ?? payload.id))
      if (!exists) {
        const newOrder = normaliseOrder({ ...payload, _flash: true })
        orders.value.unshift(newOrder)
        notify(`New order: ${newOrder.order_number}`, 'blue')
      }
    })

    echoChannel.listen('.order.status.updated', (payload) => {
      const order = orders.value.find((o) => o.id === (payload.order_id ?? payload.id))
      if (order) {
        order.order_status = payload.order_status ?? payload.status
        order._flash       = true
        setTimeout(() => { order._flash = false }, 1200)
      }
    })

    echoChannel.listen('.order.items.updated', (payload) => {
      const order = orders.value.find((o) => o.id === (payload.order_id ?? payload.id))
      if (order && payload.items) {
        order.items = payload.items.map((i) => ({
          id:       i.order_item_id ?? i.id,
          name:     i.name,
          quantity: i.quantity,
          note:     i.note ?? null,
        }))
      }
    })

    // Monitor WebSocket connection state
    echo.connector.pusher.connection.bind('connected', () => { connected.value = true })
    echo.connector.pusher.connection.bind('disconnected', () => { connected.value = false })
    echo.connector.pusher.connection.bind('unavailable', () => { connected.value = false })
  }

  function disconnectEcho() {
    if (echoChannel) {
      echo.leaveChannel('kitchen')
      echoChannel = null
    }
  }

  // ── Clock ────────────────────────────────────────────────────────
  function formatClock() {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    })
  }

  function startClock() {
    clockTimer = setInterval(() => { currentTime.value = formatClock() }, 1000)
  }

  function stopClock() {
    if (clockTimer) clearInterval(clockTimer)
  }

  // ── Snackbar ─────────────────────────────────────────────────────
  function notify(message, color = 'green') {
    snackbar.value = { show: true, message, color }
  }

  // ── Lifecycle (called from KdsView onMounted / onUnmounted) ──────
  async function init() {
    startClock()
    connectEcho()
    await fetchOrders()
  }

  function cleanup() {
    stopClock()
    disconnectEcho()
  }

  return {
    // state
    orders, loading, connected, error, tab, currentTime,
    snackbar, activeCount, estimatedWaitMinutes,
    // order lists
    incomingOrders, receivedOrders, confirmedOrders,
    preparingOrders, readyOrders, completedOrders,
    // helpers (used by OrderCard)
    getElapsedSeconds, formatElapsed, getTimerClass,
    getOrderWaitMinutes, getStatusLabel, getStatusColor,
    // actions
    fetchOrders, receiveOrder, confirmCooking,
    prepareFood, markReady, init, cleanup, notify,
  }
})