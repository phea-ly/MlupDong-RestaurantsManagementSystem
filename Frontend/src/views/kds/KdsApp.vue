<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useKdsStore }  from '@/stores/kds.store'
import { useAuthStore } from '@/stores/auth.store'
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

const draggingOrder  = ref(null)
const dragOverColumn = ref(null)

function handleDragStart(order) { draggingOrder.value = order }
function handleDragEnd()        { draggingOrder.value = null; dragOverColumn.value = null }
function handleDragEnter(col)   { dragOverColumn.value = col }
function handleDragLeave(col)   { if (dragOverColumn.value === col) dragOverColumn.value = null }

function handleDrop(columnKey) {
  if (!draggingOrder.value) return
  const statusMap = { pending: 'confirmed', preparing: 'preparing', ready: 'ready' }
  const newStatus = statusMap[columnKey]
  if (newStatus && newStatus !== draggingOrder.value.status) {
    updateStatus(
      draggingOrder.value.id,
      newStatus,
      newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
    )
  }
  handleDragEnd()
}

// Called by OrderCard's @update-status — receives (id, status)
// Maps back-status strings to the correct API status label
function handleUpdateStatus(id, status) {
  const labelMap = {
    confirmed:  'Confirmed',
    preparing:  'Preparing',
    ready:      'Ready',
    completed:  'Completed',
  }
  updateStatus(id, status, labelMap[status] ?? status)
}

const boardCount = computed(() =>
  pendingOrders.value.length + preparingOrders.value.length + readyOrders.value.length
)

const columns = computed(() => [
  { key: 'pending',   label: 'Pending',      accentColor: '#f59e0b', orders: pendingOrders.value   },
  { key: 'preparing', label: 'Preparation',  accentColor: '#1e3a8a', orders: preparingOrders.value },
  { key: 'ready',     label: 'Ready',        accentColor: '#16a34a', orders: readyOrders.value     },
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

        <!-- Board -->
        <template v-else-if="tab === 'active'">
          <KdsEmptyState v-if="!boardCount" />

          <div v-else class="kds-board">
            <KdsColumn
              v-for="col in columns"
              :key="col.key"
              :label="col.label"
              :accent-color="col.accentColor"
              :count="col.orders.length"
              :class="{ 'kds-col--drag-over': dragOverColumn === col.key }"
              @dragover.prevent
              @dragenter.prevent="handleDragEnter(col.key)"
              @dragleave="handleDragLeave(col.key)"
              @drop.prevent="handleDrop(col.key)"
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
                @update-status="handleUpdateStatus"
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
.kds-root { background: #e8eaed !important; }
.kds-main { background: #e8eaed; }

.kds-layout {
  padding: 20px;
  height: calc(100dvh - 58px);
  display: flex;
  flex-direction: column;
}

.kds-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  flex: 1;
  min-height: 0;
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