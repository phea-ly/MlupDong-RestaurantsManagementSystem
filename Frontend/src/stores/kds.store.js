import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { echo } from "@/echo";
import { kdsApi } from "@/api/order.api";
import {
  ACTIVE_ORDER_STATUSES,
  PENDING_ORDER_STATUSES,
  getOrderStatusColor,
  getOrderStatusLabel,
  normalizeOrder,
  normalizeOrderStatus,
  sortOrdersByNewest,
} from "@/utils/orderStatus";

export const useKdsStore = defineStore("kds", () => {
  const orders = ref([]);
  const loading = ref(false);
  const connected = ref(false);
  const error = ref(null);
  const tab = ref("active");
  const snackbar = ref({ show: false, message: "", color: "success" });
  const currentTime = ref(new Date().toLocaleTimeString());

  let clockTimer = null;
  let channel = null;

  const recentOrders = computed(() => {
    currentTime.value;
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

    return [...orders.value]
      .filter((order) => {
        const timestamp = new Date(order.updated_at ?? order.created_at ?? 0).getTime();
        return timestamp > dayAgo;
      })
      .sort(sortOrdersByNewest);
  });

  const pendingOrders = computed(() =>
    recentOrders.value.filter((order) =>
      PENDING_ORDER_STATUSES.includes(order.order_status),
    ),
  );

  const preparingOrders = computed(() =>
    recentOrders.value.filter((order) => order.order_status === "preparing"),
  );

  const readyOrders = computed(() =>
    recentOrders.value.filter((order) => order.order_status === "ready"),
  );

  const completedOrders = computed(() =>
    recentOrders.value.filter((order) =>
      ["completed", "served"].includes(order.order_status),
    ),
  );

  const activeCount = computed(
    () =>
      pendingOrders.value.length +
      preparingOrders.value.length +
      readyOrders.value.length,
  );

  const estimatedWaitMinutes = computed(() => Math.max(5, activeCount.value * 5));

  function notify(message, color = "success") {
    snackbar.value = { show: true, message, color };
  }

  function upsertOrder(rawOrder, flash = false) {
    const order = { ...normalizeOrder(rawOrder), _flash: flash };
    const index = orders.value.findIndex((entry) => entry.id === order.id);

    if (index === -1) {
      orders.value.unshift(order);
      return;
    }

    orders.value[index] = {
      ...orders.value[index],
      ...order,
    };
  }

  function removeOrder(orderId) {
    orders.value = orders.value.filter((order) => order.id !== orderId);
  }

  function getElapsedSeconds(order) {
    if (!order?.created_at) return 0;
    return Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000);
  }

  function formatElapsed(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  function getTimerClass(seconds) {
    if (seconds > 900) return "timer-critical";
    if (seconds > 600) return "timer-warn";
    return "timer-ok";
  }

  function getOrderWaitMinutes(order) {
    if (!ACTIVE_ORDER_STATUSES.includes(order.order_status)) return null;

    const ordersAhead = recentOrders.value.filter((candidate) => {
      if (!ACTIVE_ORDER_STATUSES.includes(candidate.order_status)) return false;

      const candidateTime = new Date(candidate.created_at ?? 0).getTime();
      const orderTime = new Date(order.created_at ?? 0).getTime();

      if (candidateTime === orderTime) return candidate.id < order.id;
      return candidateTime < orderTime;
    }).length;

    return Math.max(5, 5 + ordersAhead * 5);
  }

  function getStatusLabel(status) {
    return getOrderStatusLabel(status);
  }

  function getStatusColor(status) {
    return getOrderStatusColor(status);
  }

  async function fetchOrders() {
    loading.value = true;
    error.value = null;

    try {
      const { data } = await kdsApi.getActiveOrders();
      orders.value = (Array.isArray(data) ? data : [])
        .map(normalizeOrder)
        .sort(sortOrdersByNewest);
    } catch (err) {
      error.value = err.message ?? "Failed to load orders.";
    } finally {
      loading.value = false;
    }
  }

  async function updateStatus(orderId, status, label) {
    try {
      const { data } = await kdsApi.updateStatus(orderId, status);
      upsertOrder(data);
      notify(`Order ${data.order_number} -> ${label}`);
    } catch (err) {
      notify(err.message ?? "Failed to update status.", "error");
    }
  }

  const receiveOrder = (orderId) => updateStatus(orderId, "received", "Received");
  const confirmCooking = (orderId) =>
    updateStatus(orderId, "confirmed", "Confirmed");
  const prepareFood = (orderId) =>
    updateStatus(orderId, "preparing", "Preparing");
  const markReady = (orderId) => updateStatus(orderId, "ready", "Ready");
  const completeOrder = (orderId) =>
    updateStatus(orderId, "completed", "Completed");

  function subscribeEcho() {
    channel = echo.channel("kitchen");

    channel.subscribed(() => {
      connected.value = true;
    });

    channel.listen(".order.created", (payload) => {
      upsertOrder(payload, true);
      notify(`New order: ${payload.order_number}`, "success");
    });

    channel.listen(".order.status.updated", (payload) => {
      const normalized = normalizeOrder(payload);

      if (normalizeOrderStatus(normalized.order_status) === "cancelled") {
        removeOrder(normalized.id);
        notify(`Order ${normalized.order_number} cancelled`, "error");
        return;
      }

      upsertOrder(normalized);

      const statusMessages = {
        preparing: "Cooking started",
        ready: "Ready for delivery",
        completed: "Order delivered",
        served: "Order delivered",
      };

      const message = statusMessages[normalized.order_status];
      if (message) {
        notify(`${message}: ${normalized.order_number}`);
      }
    });

    channel.listen(".order.items.updated", (payload) => {
      upsertOrder(payload);
    });

    echo.connector.pusher.connection.bind("disconnected", () => {
      connected.value = false;
    });

    echo.connector.pusher.connection.bind("connected", () => {
      connected.value = true;
    });
  }

  function unsubscribeEcho() {
    if (!channel) return;
    echo.leaveChannel("kitchen");
    channel = null;
  }

  async function init() {
    await fetchOrders();
    subscribeEcho();

    if (!clockTimer) {
      clockTimer = setInterval(() => {
        currentTime.value = new Date().toLocaleTimeString();
      }, 1000);
    }
  }

  function cleanup() {
    unsubscribeEcho();

    if (clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  }

  return {
    orders,
    loading,
    connected,
    error,
    tab,
    snackbar,
    currentTime,
    pendingOrders,
    preparingOrders,
    readyOrders,
    completedOrders,
    activeCount,
    estimatedWaitMinutes,
    getElapsedSeconds,
    formatElapsed,
    getTimerClass,
    getOrderWaitMinutes,
    getStatusLabel,
    getStatusColor,
    fetchOrders,
    receiveOrder,
    confirmCooking,
    prepareFood,
    markReady,
    completeOrder,
    init,
    cleanup,
  };
});
