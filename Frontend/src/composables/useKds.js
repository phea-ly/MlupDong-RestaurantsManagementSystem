// src/composables/useKds.js
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { kdsApi, connectKdsStream } from '@/api/kds.api.js'

export function useKds() {
  const orders = ref([])
  const loading = ref(true)
  const connected = ref(false)
  const error = ref(null)
  const notification = ref(null)
  let eventSource = null
  let reconnectTimer = null
  let reconnectDelay = 3000

  // Derived
  const incomingOrders = computed(() => orders.value.filter(o => o.order_status === 'new'))
  const receivedOrders = computed(() => orders.value.filter(o => o.order_status === 'received'))
  const confirmedOrders = computed(() => orders.value.filter(o => o.order_status === 'confirmed'))
  const preparingOrders = computed(() => orders.value.filter(o => o.order_status === 'preparing'))
  const readyOrders = computed(() => orders.value.filter(o => o.order_status === 'ready'))
  const completedOrders = computed(() => orders.value.filter(o => o.order_status === 'completed'))

  function notify(message, color = 'primary') {
    notification.value = { id: Date.now() + Math.random(), message, color }
  }

  function upsertOrder(incoming) {
    const idx = orders.value.findIndex(o => o.id === incoming.id)
    if (idx !== -1) {
      orders.value[idx] = { ...orders.value[idx], ...incoming, _flash: true }
      setTimeout(() => { if (orders.value[idx]) orders.value[idx]._flash = false }, 1200)
    } else {
      orders.value.unshift({ ...incoming, _flash: true })
      setTimeout(() => {
        const i = orders.value.findIndex(o => o.id === incoming.id)
        if (i !== -1) orders.value[i]._flash = false
      }, 1200)
    }
  }

  function removeOrder(id) {
    orders.value = orders.value.filter(o => o.id !== id)
  }

  async function fetchOrders() {
    loading.value = true
    error.value = null
    try {
      const { data } = await kdsApi.getActiveOrders()
      orders.value = data
    } catch (e) {
      error.value = 'Could not load orders - is the backend running?'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  function startStream() {
    if (eventSource) eventSource.close()
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    eventSource = connectKdsStream(
      ({ event, payload }) => {
        connected.value = true
        reconnectDelay = 3000
        if (event === 'connected') return

        if (event === 'order.created' || event === 'order.items.updated') {
          upsertOrder(payload)
          notify(`New order ${payload.order_number} received`, 'success')
        }

        if (event === 'order.status.updated') {
          if (payload.order_status === 'cancelled') {
            removeOrder(payload.id)
            notify(`Order ${payload.order_number} cancelled`, 'error')
          } else {
            upsertOrder(payload)
            notify(`Order ${payload.order_number} updated to ${payload.order_status}`, 'info')
          }
        }
      },
      () => {
        if (eventSource?.readyState === EventSource.OPEN) return
        connected.value = false
        if (reconnectTimer) return
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null
          reconnectDelay = Math.min(reconnectDelay * 2, 15000)
          startStream()
        }, reconnectDelay)
      },
      () => {
        connected.value = true
        reconnectDelay = 3000
      }
    )
  }

  async function receiveOrder(orderId) {
    try {
      const { data } = await kdsApi.updateOrderStatus(orderId, 'received')
      upsertOrder(data)
      notify(`Order ${data.order_number} received`, 'success')
    } catch (e) {
      console.error('receiveOrder failed', e)
    }
  }

  async function confirmCooking(orderId) {
    try {
      const { data } = await kdsApi.updateOrderStatus(orderId, 'confirmed')
      upsertOrder(data)
      notify(`Order ${data.order_number} confirmed`, 'info')
    } catch (e) {
      console.error('confirmCooking failed', e)
    }
  }

  async function prepareFood(orderId) {
    try {
      const { data } = await kdsApi.updateOrderStatus(orderId, 'preparing')
      upsertOrder(data)
      notify(`Order ${data.order_number} is preparing`, 'warning')
    } catch (e) {
      console.error('prepareFood failed', e)
    }
  }

  async function markReady(orderId) {
    try {
      const { data } = await kdsApi.updateOrderStatus(orderId, 'ready')
      upsertOrder(data)
      notify(`Order ${data.order_number} is ready`, 'success')
    } catch (e) {
      console.error('markReady failed', e)
    }
  }

  onMounted(async () => {
    await fetchOrders()
    startStream()
  })

  onUnmounted(() => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    eventSource?.close()
  })

  return {
    orders,
    incomingOrders,
    receivedOrders,
    confirmedOrders,
    preparingOrders,
    readyOrders,
    completedOrders,
    loading,
    connected,
    error,
    receiveOrder,
    confirmCooking,
    prepareFood,
    markReady,
    fetchOrders,
    notification,
  }
}
