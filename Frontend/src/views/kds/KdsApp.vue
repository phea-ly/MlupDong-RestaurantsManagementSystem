<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useKdsStore }  from '@/stores/kds.store'
import { useAuthStore } from '@/stores/auth.store'
import { PENDING_ORDER_STATUSES } from '@/utils/orderStatus'
import KdsAppBar      from '@/components/kds/AppBar.vue'
import KdsColumn      from '@/components/kds/Column.vue'
import KdsOrderCard   from '@/components/kds/OrderCard.vue'
import KdsEmptyState  from '@/components/kds/EmptyState.vue'
import KdsHistoryGrid from '@/components/kds/HistoryGrid.vue'

const store = useKdsStore()
const auth  = useAuthStore()

const {
  pendingOrders, preparingOrders, readyOrders, completedOrders,
  loading, connected, error, tab,
  currentTime, estimatedWaitMinutes, snackbar,
} = storeToRefs(store)

const { prepareFood, markReady, completeOrder, fetchOrders, init, cleanup, getOrderWaitMinutes, updateStatus } = store

const draggingOrder = ref(null)
const dragOverColumn = ref(null)

function handleDragStart(order) {
  draggingOrder.value = order
}

function handleDragEnd() {
  draggingOrder.value = null
  dragOverColumn.value = null
}

function handleDragEnter(columnKey) {
  dragOverColumn.value = columnKey
}

function handleDragLeave(columnKey) {
  if (dragOverColumn.value === columnKey) {
    dragOverColumn.value = null
  }
}

function handleDrop(columnKey) {
  if (!draggingOrder.value) return

  const status = draggingOrder.value.status
  const id = draggingOrder.value.id

  // Map column to status
  const statusMap = {
    'pending': 'confirmed',
    'preparing': 'preparing',
    'ready': 'ready'
  }

  const newStatus = statusMap[columnKey]
  if (newStatus && newStatus !== status) {
    updateStatus(id, newStatus, newStatus.charAt(0).toUpperCase() + newStatus.slice(1))
  }

  handleDragEnd()
}

const boardCount = computed(() =>
  pendingOrders.value.length + preparingOrders.value.length + readyOrders.value.length
)

/** Each column definition drives KdsColumn + which orders it renders */
const columns = computed(() => [
  { key: 'pending',   label: 'Pending',           accentColor: '#f59e0b', orders: pendingOrders.value   },
  { key: 'preparing', label: 'Preparation',        accentColor: '#1e3a8a', orders: preparingOrders.value },
  { key: 'ready',     label: 'Ready',   accentColor: '#16a34a', orders: readyOrders.value     },
])

onMounted(init)
onUnmounted(cleanup)
</script>

<template>
  <v-app class="kds-root">

    <KdsAppBar
      :connected="connected"
      :current-time="currentTime"
      :board-count="boardCount"
      :loading="loading"
      v-model:tab="tab"
      @refresh="fetchOrders"
      @logout="auth.logout()"
    />

    <v-main class="kds-main">
      <div class="kds-layout">

        <!-- Loading -->
        <div v-if="loading" class="kds-center">
          <v-progress-circular indeterminate color="#1e3a8a" size="44" width="3" />
          <p class="kds-hint">Loading kitchen orders…</p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="kds-center">
          <v-icon size="48" color="red-lighten-2">mdi-wifi-alert</v-icon>
          <p class="kds-hint">{{ error }}</p>
          <v-btn variant="flat" color="#1e3a8a" rounded="pill" size="small" @click="fetchOrders">
            <v-icon start size="14">mdi-refresh</v-icon>Retry
          </v-btn>
        </div>

        <!-- Board (3 columns) -->
        <template v-else-if="tab === 'active'">
          <KdsEmptyState v-if="!boardCount" />

          <div v-else class="kds-board">
            <KdsColumn
              v-for="col in columns"
              :key="col.key"
              :label="col.label"
              :accent-color="col.accentColor"
              :count="col.orders.length"
              @dragover.prevent
              @dragenter.prevent="handleDragEnter(col.key)"
              @dragleave="handleDragLeave(col.key)"
              @drop.prevent="handleDrop(col.key)"
              :class="{ 'kds-col--drag-over': dragOverColumn === col.key }"
            >
              <KdsOrderCard
                v-for="order in col.orders"
                :key="order.id"
                :order="order"
                :wait-minutes="getOrderWaitMinutes(order)"
                :accent-color="col.accentColor"
                @prepare-food="prepareFood"
                @mark-ready="markReady"
                @complete-order="completeOrder"
                @drag-start="handleDragStart"
                @drag-end="handleDragEnd"
                @update-status="(id, status) => updateStatus(id, status, status.charAt(0).toUpperCase() + status.slice(1))"
              />
            </KdsColumn>
          </div>
        </template>

        <!-- History -->
        <KdsHistoryGrid
          v-else
          :orders="completedOrders"
          :get-wait-minutes="getOrderWaitMinutes"
        />

      </div>
    </v-main>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom right"
      rounded="xl"
      :timeout="4000"
      min-width="240"
    >
      <div class="d-flex align-center ga-2">
        <v-icon size="16">
          {{ snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle' }}
        </v-icon>
        {{ snackbar.message }}
      </div>
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>

  </v-app>
</template>

<style scoped>
.kds-root  { background: #ebebeb !important; }
.kds-main  { background: #ebebeb; }

.kds-layout {
  padding: 20px;
  height: calc(100dvh - 58px);
  display: flex;
  flex-direction: column;
}

/* 3-column board fills remaining height */
.kds-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  flex: 1;
  min-height: 0;          /* crucial for flex children */
}

@media (max-width: 960px) {
  .kds-board { grid-template-columns: 1fr; height: auto; }
}

.kds-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
}

.kds-hint {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}
</style>
