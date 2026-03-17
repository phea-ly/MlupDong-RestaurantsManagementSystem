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
    }
  }

  function removeOrder(id) {
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
