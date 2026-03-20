<script>
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
</script>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import OrderCard from "./OrderCard.vue";

const kdsStore = useKdsStore();

const {
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
} = storeToRefs(kdsStore);

const { receiveOrder, confirmCooking, prepareFood, markReady, fetchOrders, init, cleanup } = kdsStore;

onMounted(init);
onUnmounted(cleanup);
</script>

<template>
  <v-app class="kds-app">
    <v-app-bar flat class="kds-bar">
      <div class="kds-brand">
        <v-icon icon="mdi-silverware-fork-knife" size="20" />
        <span class="kds-brand__title">Kitchen Display</span>
        <span class="kds-clock">{{ currentTime }}</span>
      </div>
      <v-spacer />
      <v-btn-toggle v-model="tab" mandatory class="kds-tabs">
        <v-btn value="active" class="kds-tab-btn" variant="text">
          <v-badge v-if="activeCount > 0" :content="activeCount" color="green" class="kds-badge">
            <span>Active</span>
          </v-badge>
          <span v-else>Active</span>
        </v-btn>
        <v-btn value="done" class="kds-tab-btn" variant="text">Completed</v-btn>
      </v-btn-toggle>
      <v-chip size="small" class="kds-live" :color="connected ? 'green' : 'red'" variant="tonal">
        <v-icon size="14" :icon="connected ? 'mdi-access-point' : 'mdi-access-point-off'" class="mr-1" />
        {{ connected ? 'Live' : 'Reconnecting' }}
      </v-chip>
      <v-btn icon="mdi-refresh" variant="text" :loading="loading" class="kds-refresh" @click="fetchOrders" />
    </v-app-bar>

    <v-main>
      <v-container fluid class="kds-body">
        <div v-if="loading" class="kds-center">
          <v-progress-circular indeterminate color="green" />
          <div class="kds-hint">Loading orders...</div>
        </div>

        <div v-else-if="error" class="kds-center">
          <v-icon icon="mdi-wifi-alert" size="44" color="red" />
          <div class="kds-hint">{{ error }}</div>
          <v-btn color="green" variant="flat" @click="fetchOrders">Retry</v-btn>
        </div>

        <template v-else-if="tab === 'active'">
          <div
            v-if="!incomingOrders.length && !receivedOrders.length && !confirmedOrders.length && !preparingOrders.length"
            class="kds-center"
          >
            <v-icon icon="mdi-check-circle-outline" size="54" color="grey" />
            <div class="kds-hint">All clear, no active orders</div>
          </div>
          <v-row v-else class="kds-board" dense>
            <v-col cols="12" md="3">
              <div class="kds-col__header">
                <span class="kds-col__dot dot-incoming"></span>
                Incoming
                <v-chip size="x-small" class="kds-col__count">{{ incomingOrders.length }}</v-chip>
              </div>
              <div class="kds-col__list">
                <OrderCard
                  v-for="o in incomingOrders" :key="o.id" :order="o"
                  @receive-order="receiveOrder"
                  @confirm-cooking="confirmCooking"
                  @prepare-food="prepareFood"
                  @mark-ready="markReady"
                />
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="kds-col__header">
                <span class="kds-col__dot dot-received"></span>
                Received
                <v-chip size="x-small" class="kds-col__count">{{ receivedOrders.length }}</v-chip>
              </div>
              <div class="kds-col__list">
                <OrderCard
                  v-for="o in receivedOrders" :key="o.id" :order="o"
                  @receive-order="receiveOrder"
                  @confirm-cooking="confirmCooking"
                  @prepare-food="prepareFood"
                  @mark-ready="markReady"
                />
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="kds-col__header">
                <span class="kds-col__dot dot-confirmed"></span>
                Confirmed
                <v-chip size="x-small" class="kds-col__count">{{ confirmedOrders.length }}</v-chip>
              </div>
              <div class="kds-col__list">
                <OrderCard
                  v-for="o in confirmedOrders" :key="o.id" :order="o"
                  @receive-order="receiveOrder"
                  @confirm-cooking="confirmCooking"
                  @prepare-food="prepareFood"
                  @mark-ready="markReady"
                />
              </div>
            </v-col>
            <v-col cols="12" md="3">
              <div class="kds-col__header">
                <span class="kds-col__dot dot-preparing"></span>
                Preparing
                <v-chip size="x-small" class="kds-col__count">{{ preparingOrders.length }}</v-chip>
              </div>
              <div class="kds-col__list">
                <OrderCard
                  v-for="o in preparingOrders" :key="o.id" :order="o"
                  @receive-order="receiveOrder"
                  @confirm-cooking="confirmCooking"
                  @prepare-food="prepareFood"
                  @mark-ready="markReady"
                />
              </div>
            </v-col>
          </v-row>
        </template>

        <div v-else>
          <div v-if="!readyOrders.length && !completedOrders.length" class="kds-center">
            <v-icon icon="mdi-timer-sand" size="48" color="grey" />
            <div class="kds-hint">Ready orders show here</div>
          </div>
          <v-row v-else dense>
            <v-col cols="12" md="6">
              <div class="kds-col__header">
                <span class="kds-col__dot dot-ready"></span>
                Ready
                <v-chip size="x-small" class="kds-col__count">{{ readyOrders.length }}</v-chip>
              </div>
              <div class="kds-col__list">
                <OrderCard v-for="o in readyOrders" :key="o.id" :order="o" />
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="kds-col__header">
                <span class="kds-col__dot dot-completed"></span>
                Completed
                <v-chip size="x-small" class="kds-col__count">{{ completedOrders.length }}</v-chip>
              </div>
              <div class="kds-col__list">
                <OrderCard v-for="o in completedOrders" :key="o.id" :order="o" />
              </div>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" rounded="lg" :timeout="3000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>
  </v-app>
</template>

<style scoped>
:global(:root) {
  --app-font: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
}

:global(body) {
  background: #f6f7fb;
  font-family: var(--app-font);
}

:global(.v-application) {
  font-family: var(--app-font);
}

.kds-app {
  background: #f6f7fb;
  min-height: 100vh;
  color: #1f2937;
}

.kds-bar {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 12px;
}

.kds-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.kds-brand__title {
  font-size: 16px;
  font-weight: 700;
}

.kds-clock {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
  margin-left: 6px;
}

.kds-tabs {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 2px;
  background: #f8fafc;
}

.kds-tab-btn {
  text-transform: none;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.kds-badge :deep(.v-badge__badge) {
  font-size: 10px;
  font-weight: 700;
}

.kds-live {
  margin-left: 12px;
  margin-right: 6px;
}

.kds-refresh {
  margin-left: 4px;
}

.kds-body {
  padding: 20px;
}

.kds-board {
  margin-top: 4px;
}

.kds-col__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.kds-col__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-incoming  { background: #3b82f6; }
.dot-received  { background: #6366f1; }
.dot-confirmed { background: #f59e0b; }
.dot-preparing { background: var(--app-primary); }
.dot-ready     { background: #22c55e; }
.dot-completed { background: #94a3b8; }

.kds-col__count {
  background: #eef2ff;
  color: #475569;
}

.kds-col__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kds-center {
  min-height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.kds-hint {
  font-size: 14px;
  color: #6b7280;
}
</style>