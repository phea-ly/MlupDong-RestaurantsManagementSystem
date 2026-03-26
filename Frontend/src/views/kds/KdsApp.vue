<script setup>
<<<<<<< HEAD
import { onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useKdsStore } from "@/stores/kds.store.js";
import OrderCard from "./OrderCard.vue";
=======
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs }  from 'pinia'
import { useKdsStore }  from '@/stores/kds.store'
import OrderCard        from '@/components/kds/OrderCard.vue'
>>>>>>> 8ed2408b52b97c510cf4fd173bbb935521af3f51

const store = useKdsStore()

const {
  incomingOrders, receivedOrders, confirmedOrders, preparingOrders,
  readyOrders, completedOrders,
  loading, connected, error, tab,
  currentTime, activeCount, estimatedWaitMinutes, snackbar,
} = storeToRefs(store)

const {
  receiveOrder, confirmCooking, prepareFood, markReady,
  fetchOrders, init, cleanup, getOrderWaitMinutes,
} = store

const columns = computed(() => [
  { status: 'new',       label: 'Incoming',  orders: incomingOrders.value  },
  { status: 'received',  label: 'Received',  orders: receivedOrders.value  },
  { status: 'confirmed', label: 'Confirmed', orders: confirmedOrders.value },
  { status: 'preparing', label: 'Preparing', orders: preparingOrders.value },
])

onMounted(init)
onUnmounted(cleanup)
</script>

<template>
  <v-app class="kds-app">

    <!-- ── App bar ──────────────────────────────────────────────────────────── -->
    <v-app-bar flat class="kds-bar">
      <div class="kds-brand">
        <v-icon size="20">mdi-silverware-fork-knife</v-icon>
        <span class="kds-brand__title">Kitchen Display</span>
        <span class="kds-clock">{{ currentTime }}</span>
      </div>
      <v-spacer />

      <!-- Global estimated wait -->
      <v-chip size="small" class="kds-wait mr-3" color="orange" variant="tonal">
        <v-icon size="14" class="mr-1">mdi-clock-fast</v-icon>
        ~{{ estimatedWaitMinutes }} min wait
      </v-chip>

      <!-- Active / Completed tabs -->
      <v-btn-toggle v-model="tab" mandatory class="kds-tabs">
        <v-btn value="active" class="kds-tab-btn" variant="text">
          <v-badge v-if="activeCount > 0" :content="activeCount" color="green">
            <span>Active</span>
          </v-badge>
          <span v-else>Active</span>
        </v-btn>
        <v-btn value="done" class="kds-tab-btn" variant="text">Completed</v-btn>
      </v-btn-toggle>

      <!-- Live indicator -->
      <v-chip
        size="small" class="ml-3 mr-2"
        :color="connected ? 'green' : 'red'" variant="tonal"
      >
        <v-icon size="14" :icon="connected ? 'mdi-access-point' : 'mdi-access-point-off'" class="mr-1" />
        {{ connected ? 'Live' : 'Reconnecting' }}
      </v-chip>

      <v-btn icon="mdi-refresh" variant="text" :loading="loading" @click="fetchOrders" />
    </v-app-bar>

    <v-main>
      <v-container fluid class="kds-body">

        <!-- Loading -->
        <div v-if="loading" class="kds-center">
          <v-progress-circular indeterminate color="green" />
          <div class="kds-hint">Loading orders...</div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="kds-center">
          <v-icon size="44" color="red">mdi-wifi-alert</v-icon>
          <div class="kds-hint">{{ error }}</div>
          <v-btn color="green" variant="flat" @click="fetchOrders">Retry</v-btn>
        </div>

        <!-- ── Active tab ──────────────────────────────────────────────────── -->
        <template v-else-if="tab === 'active'">
          <div
            v-if="!incomingOrders.length && !receivedOrders.length && !confirmedOrders.length && !preparingOrders.length"
            class="kds-center"
          >
            <v-icon size="54" color="grey">mdi-check-circle-outline</v-icon>
            <div class="kds-hint">All clear — no active orders</div>
          </div>

          <v-row v-else dense>
            <v-col v-for="col in columns" :key="col.status" cols="12" md="3">
              <div class="kds-col__header">
                <span class="kds-col__dot" :class="`dot-${col.status}`" />
                {{ col.label }}
                <v-chip size="x-small" class="kds-col__count">{{ col.orders.length }}</v-chip>
              </div>
              <div class="kds-col__list">
                <OrderCard
                  v-for="o in col.orders" :key="o.id"
                  :order="o"
                  :wait-minutes="getOrderWaitMinutes(o)"
                  @receive-order="receiveOrder"
                  @confirm-cooking="confirmCooking"
                  @prepare-food="prepareFood"
                  @mark-ready="markReady"
                />
              </div>
            </v-col>
          </v-row>
        </template>

        <!-- ── Done tab ────────────────────────────────────────────────────── -->
        <div v-else>
          <div v-if="!readyOrders.length && !completedOrders.length" class="kds-center">
            <v-icon size="48" color="grey">mdi-timer-sand</v-icon>
            <div class="kds-hint">Ready & completed orders show here</div>
          </div>
          <v-row v-else dense>
            <v-col cols="12" md="6">
              <div class="kds-col__header">
                <span class="kds-col__dot dot-ready" />
                Ready
                <v-chip size="x-small" class="kds-col__count">{{ readyOrders.length }}</v-chip>
              </div>
              <div class="kds-col__list">
                <OrderCard v-for="o in readyOrders" :key="o.id" :order="o" />
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="kds-col__header">
                <span class="kds-col__dot dot-completed" />
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

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show" :color="snackbar.color"
      location="bottom right" rounded="lg" :timeout="4000"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>

  </v-app>
</template>

<style scoped>
.kds-app  { background: #f6f7fb; }
.kds-bar  { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 0 12px; }

.kds-brand        { display: flex; align-items: center; gap: 10px; }
.kds-brand__title { font-size: 16px; font-weight: 700; }
.kds-clock        { font-size: 12px; color: #6b7280; font-family: monospace; margin-left: 4px; }

.kds-wait    { font-size: 12px; font-weight: 700; }
.kds-tabs    { border: 1px solid #e5e7eb; border-radius: 10px; padding: 2px; background: #f8fafc; }
.kds-tab-btn { text-transform: none; font-size: 13px; font-weight: 600; color: #6b7280; }

.kds-body { padding: 20px; }

.kds-col__header {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 700; color: #6b7280;
  letter-spacing: .6px; text-transform: uppercase;
  margin-bottom: 12px;
}
.kds-col__dot     { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-new          { background: #3b82f6; }
.dot-received     { background: #6366f1; }
.dot-confirmed    { background: #f59e0b; }
.dot-preparing    { background: #14b8a6; }
.dot-ready        { background: #22c55e; }
.dot-completed    { background: #94a3b8; }
.kds-col__count   { background: #eef2ff; color: #475569; }
.kds-col__list    { display: flex; flex-direction: column; gap: 12px; }

.kds-center {
  min-height: calc(100vh - 140px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
}
.kds-hint { font-size: 14px; color: #6b7280; }
</style>