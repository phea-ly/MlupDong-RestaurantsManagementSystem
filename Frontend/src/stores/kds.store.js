// src/stores/kds.store.js
import { defineStore }   from 'pinia'
import { ref, computed } from 'vue'
import { echo }          from '@/echo'
import { kdsApi }        from '@/api/order.api'

const STATUS_LABEL = {
  new:       'Incoming',
  received:  'Received',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready:     'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_COLOR = {
  new:       'blue',
  received:  'indigo',
  confirmed: 'orange',
  preparing: 'teal',
  ready:     'success',
  completed: 'grey',
  cancelled: 'error',
}

export const useKdsStore = defineStore('kds', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const orders      = ref([])
  const loading     = ref(false)
  const connected   = ref(false)
  const error       = ref(null)
  const tab         = ref('active')
  const snackbar    = ref({ show: false, message: '', color: 'success' })
  const currentTime = ref(new Date().toLocaleTimeString())
  let clockTimer    = null

  const recentOrders = computed(() => {
    currentTime.value // Reactive dependency
    const dayAgo = Date.now() - (24 * 60 * 60 * 1000)
    return orders.value.filter(o => {
      const ts = new Date(o.updated_at || o.created_at).getTime()
      return ts > dayAgo
    })
  })

  // ── Computed ───────────────────────────────────────────────────────────────
  const incomingOrders  = computed(() => recentOrders.value.filter(o => o.order_status === 'new'))
  const receivedOrders  = computed(() => recentOrders.value.filter(o => o.order_status === 'received'))
  const confirmedOrders = computed(() => recentOrders.value.filter(o => o.order_status === 'confirmed'))
  const preparingOrders = computed(() => recentOrders.value.filter(o => o.order_status === 'preparing'))
  const readyOrders     = computed(() => recentOrders.value.filter(o => o.order_status === 'ready'))
  const completedOrders = computed(() => recentOrders.value.filter(o => o.order_status === 'completed'))

  const pendingOrders   = computed(() => recentOrders.value.filter(o => ['new', 'received', 'confirmed'].includes(o.order_status)))

  const activeCount = computed(() =>
    incomingOrders.value.length +
    receivedOrders.value.length +
    confirmedOrders.value.length +
    preparingOrders.value.length
  )

  const estimatedWaitMinutes = computed(() => Math.max(5, activeCount.value * 5))

  // ── Helpers ────────────────────────────────────────────────────────────────
  function notify(message, color = 'success') {
    snackbar.value = { show: true, message, color }
  }

  // Normalise: backend may send 'id' or 'order_id'
  function normalise(payload) {
    return { ...payload, id: payload.id ?? payload.order_id }
  }

  function upsertOrder(raw, flash = false) {
    const payload = normalise(raw)
    const idx     = orders.value.findIndex(o => o.id === payload.id)
    const order   = { ...payload, _flash: flash }
    if (idx !== -1) {
      orders.value[idx] = order
    } else {
      orders.value.unshift(order)
    }
  }

  function removeOrder(id) {
    orders.value = orders.value.filter(o => o.id !== id)
  }

  // ── Time helpers ───────────────────────────────────────────────────────────
  function getElapsedSeconds(order) {
    if (!order.created_at) return 0
    return Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000)
  }

  function formatElapsed(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function getTimerClass(seconds) {
    if (seconds > 900) return 'timer-critical'
    if (seconds > 600) return 'timer-warn'
    return 'timer-ok'
  }

  function getOrderWaitMinutes(order) {
    const active = ['new', 'received', 'confirmed', 'preparing']
    if (!active.includes(order.order_status)) return null
    const ahead = recentOrders.value.filter(
      o => active.includes(o.order_status) && o.id < order.id
    ).length
    return Math.max(5, ahead * 5)
  }

  function getStatusLabel(status) { return STATUS_LABEL[status] ?? status }
  function getStatusColor(status) { return STATUS_COLOR[status] ?? 'grey' }

  // ── Fetch ──────────────────────────────────────────────────────────────────
  async function fetchOrders() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await kdsApi.getActiveOrders()
      orders.value   = (Array.isArray(data) ? data : []).map(normalise)
    } catch (err) {
      error.value = err.message ?? 'Failed to load orders.'
    } finally {
      loading.value = false
    }
  }

  // ── Status actions ─────────────────────────────────────────────────────────
  async function updateStatus(orderId, status, label) {
    try {
      const { data } = await kdsApi.updateStatus(orderId, status)
      upsertOrder(data)
      notify(`Order ${data.order_number} → ${label}`)
    } catch (err) {
      notify(err.message ?? 'Failed to update status.', 'error')
    }
  }

  const receiveOrder   = (id) => updateStatus(id, 'received',  'Received')
  const confirmCooking = (id) => updateStatus(id, 'confirmed', 'Confirmed')
  const prepareFood    = (id) => updateStatus(id, 'preparing', 'Preparing')
  const markReady      = (id) => updateStatus(id, 'ready',     'Ready ✓')
  const completeOrder  = (id) => updateStatus(id, 'completed', 'Completed')

  // ── Echo WebSocket ─────────────────────────────────────────────────────────
  let channel = null

  function subscribeEcho() {
    // Subscribes to the 'kitchen' public channel defined in routes/channels.php
    channel = echo.channel('kitchen')

    channel.subscribed(() => { connected.value = true })

    // New order arrives from customer QR menu
    channel.listen('.order.created', (payload) => {
      upsertOrder(payload, true)   // true = flash animation
      notify(`🆕 New order: ${payload.order_number} — ${payload.table_name}`, 'success')
    })

    // Order status changed (by KDS button or back-office)
    channel.listen('.order.status.updated', (payload) => {
      if (payload.order_status === 'cancelled') {
        removeOrder(payload.id ?? payload.order_id)
        notify(`Order ${payload.order_number} cancelled`, 'error')
      } else {
        upsertOrder(payload)
      }
    })

    // Items changed (from back-office order edit)
    channel.listen('.order.items.updated', (payload) => {
      upsertOrder(payload)
    })

    // Track WebSocket connection state
    echo.connector.pusher.connection.bind('disconnected', () => { connected.value = false })
    echo.connector.pusher.connection.bind('connected',    () => { connected.value = true  })
  }

  function unsubscribeEcho() {
    if (channel) {
      echo.leaveChannel('kitchen')
      channel = null
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  async function init() {
    await fetchOrders()
    subscribeEcho()
    clockTimer = setInterval(() => {
      currentTime.value = new Date().toLocaleTimeString()
    }, 1000)
  }

  function cleanup() {
    unsubscribeEcho()
    if (clockTimer) { clearInterval(clockTimer); clockTimer = null }
  }

  return {
    // state
    orders, loading, connected, error, tab, snackbar, currentTime,
    // computed
    incomingOrders, receivedOrders, confirmedOrders, preparingOrders,
    pendingOrders, readyOrders, completedOrders, activeCount, estimatedWaitMinutes,
    // helpers
    getElapsedSeconds, formatElapsed, getTimerClass,
    getOrderWaitMinutes, getStatusLabel, getStatusColor,
    // actions
    fetchOrders,
    receiveOrder, confirmCooking, prepareFood, markReady, completeOrder,
    // lifecycle
    init, cleanup,
  }
})
