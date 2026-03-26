<<<<<<< HEAD
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { kdsApi, connectKdsStream } from "@/api/kds.api.js";

export const useKdsStore = defineStore("kds", () => {
  const orders = ref([]);
  const loading = ref(true);
  const connected = ref(false);
  const error = ref(null);
  const notification = ref(null);
  const tab = ref("active");
  const snackbar = ref({ show: false, message: "", color: "primary" });
  const now = ref(Date.now());

  let eventSource = null;
  let reconnectTimer = null;
  let reconnectDelay = 3000;
  let clockTimer = null;
  let initialized = false;

  const incomingOrders = computed(() => orders.value.filter((o) => o.order_status === "new"));
  const receivedOrders = computed(() => orders.value.filter((o) => o.order_status === "received"));
  const confirmedOrders = computed(() => orders.value.filter((o) => o.order_status === "confirmed"));
  const preparingOrders = computed(() => orders.value.filter((o) => o.order_status === "preparing"));
  const readyOrders = computed(() => orders.value.filter((o) => o.order_status === "ready"));
  const completedOrders = computed(() => orders.value.filter((o) => o.order_status === "completed"));

  const currentTime = computed(() => {
    return new Date(now.value).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  });

  const activeCount = computed(
    () =>
      incomingOrders.value.length +
      receivedOrders.value.length +
      confirmedOrders.value.length +
      preparingOrders.value.length,
  );

  function notify(message, color = "primary") {
    notification.value = { id: Date.now() + Math.random(), message, color };
    snackbar.value = { show: true, message, color };
  }

  function upsertOrder(incoming) {
    const idx = orders.value.findIndex((o) => o.id === incoming.id);
    if (idx !== -1) {
      orders.value[idx] = { ...orders.value[idx], ...incoming, _flash: true };
      setTimeout(() => {
        if (orders.value[idx]) orders.value[idx]._flash = false;
      }, 1200);
    } else {
      orders.value.unshift({ ...incoming, _flash: true });
      setTimeout(() => {
        const i = orders.value.findIndex((o) => o.id === incoming.id);
        if (i !== -1) orders.value[i]._flash = false;
      }, 1200);
=======
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

  // ── Computed ───────────────────────────────────────────────────────────────
  const incomingOrders  = computed(() => orders.value.filter(o => o.order_status === 'new'))
  const receivedOrders  = computed(() => orders.value.filter(o => o.order_status === 'received'))
  const confirmedOrders = computed(() => orders.value.filter(o => o.order_status === 'confirmed'))
  const preparingOrders = computed(() => orders.value.filter(o => o.order_status === 'preparing'))
  const readyOrders     = computed(() => orders.value.filter(o => o.order_status === 'ready'))
  const completedOrders = computed(() => orders.value.filter(o => o.order_status === 'completed'))

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
>>>>>>> 8ed2408b52b97c510cf4fd173bbb935521af3f51
    }
  }

  function removeOrder(id) {
<<<<<<< HEAD
    orders.value = orders.value.filter((o) => o.id !== id);
  }

  async function fetchOrders() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await kdsApi.getActiveOrders();
      orders.value = data;
    } catch (e) {
      error.value = "Could not load orders - is the backend running?";
      console.error(e);
    } finally {
      loading.value = false;
    }
  }

  function startStream() {
    if (eventSource) eventSource.close();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    eventSource = connectKdsStream(
      ({ event, payload }) => {
        connected.value = true;
        reconnectDelay = 3000;
        if (event === "connected") return;

        if (event === "order.created" || event === "order.items.updated") {
          upsertOrder(payload);
          notify(`New order ${payload.order_number} received`, "success");
        }

        if (event === "order.status.updated") {
          if (payload.order_status === "cancelled") {
            removeOrder(payload.id);
            notify(`Order ${payload.order_number} cancelled`, "error");
          } else {
            upsertOrder(payload);
            notify(`Order ${payload.order_number} updated to ${payload.order_status}`, "info");
          }
        }
      },
      () => {
        if (eventSource?.readyState === EventSource.OPEN) return;
        connected.value = false;
        if (reconnectTimer) return;
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          reconnectDelay = Math.min(reconnectDelay * 2, 15000);
          startStream();
        }, reconnectDelay);
      },
      () => {
        connected.value = true;
        reconnectDelay = 3000;
      },
    );
  }

  function stopStream() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    eventSource?.close();
    eventSource = null;
    connected.value = false;
  }

  async function receiveOrder(orderId) {
    try {
      const { data } = await kdsApi.updateOrderStatus(orderId, "received");
      upsertOrder(data);
      notify(`Order ${data.order_number} received`, "success");
    } catch (e) {
      console.error("receiveOrder failed", e);
    }
  }

  async function confirmCooking(orderId) {
    try {
      const { data } = await kdsApi.updateOrderStatus(orderId, "confirmed");
      upsertOrder(data);
      notify(`Order ${data.order_number} confirmed`, "info");
    } catch (e) {
      console.error("confirmCooking failed", e);
    }
  }

  async function prepareFood(orderId) {
    try {
      const { data } = await kdsApi.updateOrderStatus(orderId, "preparing");
      upsertOrder(data);
      notify(`Order ${data.order_number} is preparing`, "warning");
    } catch (e) {
      console.error("prepareFood failed", e);
    }
  }

  async function markReady(orderId) {
    try {
      const { data } = await kdsApi.updateOrderStatus(orderId, "ready");
      upsertOrder(data);
      notify(`Order ${data.order_number} is ready`, "success");
    } catch (e) {
      console.error("markReady failed", e);
    }
  }

  function startClock() {
    if (clockTimer) return;
    clockTimer = setInterval(() => {
      now.value = Date.now();
    }, 1000);
  }

  function stopClock() {
    if (!clockTimer) return;
    clearInterval(clockTimer);
    clockTimer = null;
  }

  async function init() {
    if (initialized) return;
    initialized = true;
    startClock();
    await fetchOrders();
    startStream();
  }

  function cleanup() {
    initialized = false;
    stopStream();
    stopClock();
  }

  const statusMap = {
    new: { label: "INCOMING", color: "blue" },
    received: { label: "RECEIVED", color: "indigo" },
    confirmed: { label: "CONFIRMED", color: "orange" },
    preparing: { label: "PREPARING", color: "teal" },
    ready: { label: "READY", color: "green" },
  };

  function getElapsedSeconds(order) {
    return Math.floor((now.value - new Date(order.created_at).getTime()) / 1000);
  }

  function formatElapsed(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(Math.max(0, seconds % 60)).padStart(2, "0");
    return `${m}:${s}`;
  }

  function getTimerClass(seconds) {
    if (seconds > 900) return "timer-critical";
    if (seconds > 600) return "timer-warn";
    return "timer-ok";
  }

  function getStatusLabel(status) {
    return statusMap[status]?.label ?? "UNKNOWN";
  }

  function getStatusColor(status) {
    return statusMap[status]?.color ?? "grey";
  }

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
    tab,
    currentTime,
    activeCount,
    snackbar,
    fetchOrders,
    receiveOrder,
    confirmCooking,
    prepareFood,
    markReady,
    init,
    cleanup,
    getElapsedSeconds,
    formatElapsed,
    getTimerClass,
    getStatusLabel,
    getStatusColor,
  };
});
=======
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
    const ahead = orders.value.filter(
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
    readyOrders, completedOrders, activeCount, estimatedWaitMinutes,
    // helpers
    getElapsedSeconds, formatElapsed, getTimerClass,
    getOrderWaitMinutes, getStatusLabel, getStatusColor,
    // actions
    fetchOrders,
    receiveOrder, confirmCooking, prepareFood, markReady,
    // lifecycle
    init, cleanup,
  }
})
>>>>>>> 8ed2408b52b97c510cf4fd173bbb935521af3f51
