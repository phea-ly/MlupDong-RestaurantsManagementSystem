<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs }  from 'pinia'
import { useKdsStore }  from '@/stores/kds.store'
import { useAuthStore } from '@/stores/auth.store'   // ← add your auth store import
import OrderCard        from '@/components/kds/OrderCard.vue'

const store = useKdsStore()
const auth  = useAuthStore()                         // ← auth store instance

const {
  pendingOrders, preparingOrders, readyOrders, completedOrders,
  loading, connected, error, tab,
  currentTime, activeCount, estimatedWaitMinutes, snackbar,
} = storeToRefs(store)

const {
  receiveOrder, confirmCooking, prepareFood, markReady, completeOrder,
  fetchOrders, init, cleanup, getOrderWaitMinutes,
} = store

// ── Logout ──────────────────────────────────────────────────────────────────
const logoutDialog = ref(false)

async function handleLogout () {
  logoutDialog.value = false
  await auth.logout()           // calls your existing auth store logout action
  // router.push('/login')      // uncomment if your auth.logout() doesn't redirect
}
// ────────────────────────────────────────────────────────────────────────────

const boardCount = computed(() =>
  pendingOrders.value.length + preparingOrders.value.length + readyOrders.value.length
)

const columns = computed(() => [
  {
    status:  'pending',
    label:   'Pending',
    icon:    'mdi-clock-outline',
    color:   '#f59e0b',
    bg:      'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    border:  '#fcd34d',
    orders:  pendingOrders.value,
  },
  {
    status:  'preparing',
    label:   'Preparing',
    icon:    'mdi-fire',
    color:   '#0d9488',
    bg:      'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
    border:  '#5eead4',
    orders:  preparingOrders.value,
  },
  {
    status:  'ready',
    label:   'Ready',
    icon:    'mdi-check-circle',
    color:   '#16a34a',
    bg:      'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    border:  '#86efac',
    orders:  readyOrders.value,
  },
])

onMounted(init)
onUnmounted(cleanup)
</script>

<template>
  <v-app class="kds-app">

    <!-- ── App bar ─────────────────────────────────────────────────────────── -->
    <v-app-bar flat class="kds-bar" height="56">
      <template #prepend>
        <div class="kds-brand">
          <div class="kds-brand__icon">
            <v-icon size="18" color="white">mdi-silverware-fork-knife</v-icon>
          </div>
          <div>
            <div class="kds-brand__title">Kitchen Display</div>
            <div class="kds-brand__sub">mlup dong restaurant</div>
          </div>
        </div>
      </template>

      <v-spacer />

      <!-- Stats chips -->
      <div class="kds-stats">
        <div class="kds-stat-chip kds-stat-pending">
          <v-icon size="13">mdi-clock-outline</v-icon>
          <span>{{ pendingOrders.length }} Pending</span>
        </div>
        <div class="kds-stat-chip kds-stat-preparing">
          <v-icon size="13">mdi-fire</v-icon>
          <span>{{ preparingOrders.length }} Preparing</span>
        </div>
        <div class="kds-stat-chip kds-stat-ready">
          <v-icon size="13">mdi-check-circle</v-icon>
          <span>{{ readyOrders.length }} Ready</span>
        </div>
        <div class="kds-stat-divider" />
        <div class="kds-stat-chip kds-stat-wait">
          <v-icon size="13">mdi-timer-sand</v-icon>
          <span>~{{ estimatedWaitMinutes }}m wait</span>
        </div>
      </div>

      <v-spacer />

      <!-- Board / History tabs -->
      <v-btn-toggle v-model="tab" mandatory class="kds-tabs">
        <v-btn value="active" class="kds-tab-btn" variant="text">
          <v-badge v-if="boardCount > 0" :content="boardCount" color="green" class="kds-badge">
            <span>Board</span>
          </v-badge>
          <span v-else>Board</span>
        </v-btn>
        <v-btn value="done" class="kds-tab-btn" variant="text">History</v-btn>
      </v-btn-toggle>

      <!-- Live indicator -->
      <v-chip
        size="small" class="ml-3 kds-live-chip"
        :class="connected ? 'kds-live-chip--on' : 'kds-live-chip--off'"
      >
        <span class="kds-live-dot" :class="connected ? 'dot-pulse' : ''" />
        {{ connected ? 'Live' : 'Offline' }}
      </v-chip>

      <v-btn icon="mdi-refresh" variant="text" :loading="loading" size="small" @click="fetchOrders" class="ml-1" />

      <!-- Current time -->
      <div class="kds-clock">{{ currentTime }}</div>

      <!-- ── Logout button ──────────────────────────────────────────────── -->
      <v-btn
        icon
        variant="text"
        size="small"
        class="kds-logout-btn ml-1 mr-1"
        @click="logoutDialog = true"
      >
        <v-icon size="18">mdi-logout</v-icon>
        <v-tooltip activator="parent" location="bottom">Logout</v-tooltip>
      </v-btn>
      <!-- ─────────────────────────────────────────────────────────────── -->
    </v-app-bar>

    <v-main>
      <v-container fluid class="kds-body pa-4">

        <!-- Loading -->
        <div v-if="loading" class="kds-center">
          <v-progress-circular indeterminate color="teal" size="48" width="4" />
          <div class="kds-hint">Loading orders…</div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="kds-center">
          <v-icon size="52" color="red-lighten-1">mdi-wifi-alert</v-icon>
          <div class="kds-hint">{{ error }}</div>
          <v-btn color="teal" variant="flat" rounded="lg" @click="fetchOrders">
            <v-icon start>mdi-refresh</v-icon>Retry
          </v-btn>
        </div>

        <!-- ── Board tab ──────────────────────────────────────────────────── -->
        <template v-else-if="tab === 'active'">
          <div
            v-if="!pendingOrders.length && !preparingOrders.length && !readyOrders.length"
            class="kds-center"
          >
            <div class="kds-empty-icon">
              <v-icon size="40" color="green">mdi-check-all</v-icon>
            </div>
            <div class="kds-empty-title">Kitchen is clear!</div>
            <div class="kds-hint">No active orders on the board right now.</div>
          </div>

          <div v-else class="kds-board">
            <div
              v-for="col in columns" :key="col.status"
              class="kds-col"
              :style="{ '--col-color': col.color, '--col-border': col.border, '--col-bg': col.bg }"
            >
              <!-- Column header -->
              <div class="kds-col__head">
                <div class="kds-col__head-left">
                  <div class="kds-col__icon-wrap">
                    <v-icon size="16" :color="col.color">{{ col.icon }}</v-icon>
                  </div>
                  <span class="kds-col__label">{{ col.label }}</span>
                </div>
                <span class="kds-col__badge">{{ col.orders.length }}</span>
              </div>

              <!-- Orders list -->
              <div class="kds-col__body">
                <OrderCard
                  v-for="o in col.orders" :key="o.id"
                  :order="o"
                  :wait-minutes="getOrderWaitMinutes(o)"
                  @prepare-food="prepareFood"
                  @mark-ready="markReady"
                  @complete-order="completeOrder"
                />
                <div v-if="!col.orders.length" class="kds-col__empty">
                  <v-icon size="28" color="grey-lighten-1">{{ col.icon }}</v-icon>
                  <span>No {{ col.label.toLowerCase() }} orders</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── History tab ────────────────────────────────────────────────── -->
        <div v-else>
          <div v-if="!completedOrders.length" class="kds-center">
            <div class="kds-empty-icon">
              <v-icon size="40" color="grey-lighten-1">mdi-history</v-icon>
            </div>
            <div class="kds-empty-title">No history yet</div>
            <div class="kds-hint">Completed orders will appear here.</div>
          </div>

          <template v-else>
            <div class="kds-history-header">
              <v-icon size="16" color="grey">mdi-history</v-icon>
              <span class="kds-history-title">Completed Orders</span>
              <v-chip size="x-small" class="kds-col__count ml-2">{{ completedOrders.length }}</v-chip>
            </div>
            <v-row dense>
              <v-col v-for="o in completedOrders" :key="o.id" cols="12" sm="6" md="4" lg="3">
                <OrderCard :order="o" />
              </v-col>
            </v-row>
          </template>
        </div>

      </v-container>
    </v-main>

    <!-- ── Logout confirm dialog ──────────────────────────────────────────── -->
    <v-dialog v-model="logoutDialog" max-width="360" persistent>
      <v-card rounded="xl" class="kds-logout-dialog">
        <div class="kds-logout-dialog__icon-wrap">
          <div class="kds-logout-dialog__icon">
            <v-icon size="28" color="white">mdi-logout</v-icon>
          </div>
        </div>

        <v-card-title class="kds-logout-dialog__title">Sign out?</v-card-title>
        <v-card-text class="kds-logout-dialog__body">
          You'll be signed out of the Kitchen Display System. Any unsaved state will be lost.
        </v-card-text>

        <v-card-actions class="kds-logout-dialog__actions">
          <v-btn
            variant="tonal"
            rounded="lg"
            class="kds-logout-dialog__cancel"
            @click="logoutDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            class="kds-logout-dialog__confirm"
            @click="handleLogout"
          >
            <v-icon start size="16">mdi-logout</v-icon>
            Sign out
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- ─────────────────────────────────────────────────────────────────── -->

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show" :color="snackbar.color"
      location="bottom right" rounded="xl" :timeout="4000"
      min-width="260"
    >
      <div class="d-flex align-center ga-2">
        <v-icon size="18">{{ snackbar.color === 'error' ? 'mdi-alert-circle' : 'mdi-check-circle' }}</v-icon>
        {{ snackbar.message }}
      </div>
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>

  </v-app>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────────────── */
.kds-app { background: #f1f1f1; }
.kds-bar { background: #f1f5f9 !important; box-shadow: 0 2px 12px rgba(0,0,0,.25) !important; }

/* ── Brand ────────────────────────────────────────────────────────────────── */
.kds-brand        { display: flex; align-items: center; gap: 10px; padding-left: 4px; }
.kds-brand__icon  {
  width: 34px; height: 34px; border-radius: 9px;
  background: linear-gradient(135deg, #14b8a6, #059669);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.kds-brand__title { font-size: 15px; font-weight: 700; color: #14b8a6; line-height: 1.2; }
.kds-brand__sub   { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }

/* ── Stats row ────────────────────────────────────────────────────────────── */
.kds-stats        { display: flex; align-items: center; gap: 6px; }
.kds-stat-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 600; letter-spacing: .2px;
}
.kds-stat-pending  { background: rgba(245,158,11,.15); color: #f59e0b; }
.kds-stat-preparing{ background: rgba(20,184,166,.15);  color: #14b8a6; }
.kds-stat-ready    { background: rgba(22,163,74,.15);   color: #22c55e; }
.kds-stat-wait     { background: rgba(148,163,184,.12); color: #94a3b8; }
.kds-stat-divider  { width: 1px; height: 18px; background: #1e293b; margin: 0 4px; }

/* ── Tabs ─────────────────────────────────────────────────────────────────── */
.kds-tabs    { border: 1px solid #1e293b; border-radius: 10px; padding: 2px; background: #e2e8f0; }
.kds-tab-btn { text-transform: none; font-size: 12px; font-weight: 600; color: #64748b !important; border-radius: 8px !important; }
.kds-tab-btn.v-btn--active { background: #22c55e   !important; color: #f1f5f9 !important; }

/* ── Live chip ────────────────────────────────────────────────────────────── */
.kds-live-chip     { font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 5px; }
.kds-live-chip--on { background: rgba(22,163,74,.15) !important; color: #22c55e !important; }
.kds-live-chip--off{ background: rgba(239,68,68,.15)  !important; color: #ef4444 !important; }
.kds-live-dot   { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; background: currentColor; }
.dot-pulse      { animation: pulse 1.8s ease-in-out infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.7)} }

/* ── Clock ────────────────────────────────────────────────────────────────── */
.kds-clock { font-size: 12px; color: #475569; font-family: monospace; font-weight: 600; padding: 0 4px; }

/* ── Logout button ────────────────────────────────────────────────────────── */
.kds-logout-btn {
  color: #94a3b8 !important;
  transition: color .15s ease, background .15s ease;
}
.kds-logout-btn:hover {
  color: #ef4444 !important;
  background: rgba(239,68,68,.08) !important;
}

/* ── Logout dialog ────────────────────────────────────────────────────────── */
.kds-logout-dialog {
  padding: 8px 4px 4px;
  text-align: center;
}
.kds-logout-dialog__icon-wrap {
  display: flex; justify-content: center;
  padding-top: 24px; padding-bottom: 4px;
}
.kds-logout-dialog__icon {
  width: 56px; height: 56px; border-radius: 16px;
  background: linear-gradient(135deg, #f87171, #ef4444);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 20px rgba(239,68,68,.3);
}
.kds-logout-dialog__title {
  font-size: 17px !important; font-weight: 800 !important;
  color: #0f172a; text-align: center; padding-bottom: 4px !important;
}
.kds-logout-dialog__body {
  font-size: 13px; color: #64748b; text-align: center;
  padding-top: 0 !important; padding-bottom: 20px !important;
  line-height: 1.5;
}
.kds-logout-dialog__actions {
  display: flex; gap: 8px;
  padding: 0 16px 20px !important;
}
.kds-logout-dialog__cancel {
  flex: 1; font-weight: 600; font-size: 13px;
  text-transform: none; color: #64748b !important;
}
.kds-logout-dialog__confirm {
  flex: 1.4; font-weight: 700; font-size: 13px;
  text-transform: none;
}

/* ── Body ─────────────────────────────────────────────────────────────────── */
.kds-body { padding: 16px 20px; }

/* ── Board (3-column kanban) ──────────────────────────────────────────────── */
.kds-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: start;
}

/* ── Column ───────────────────────────────────────────────────────────────── */
.kds-col {
  background: var(--col-bg);
  border: 1.5px solid var(--col-border);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.kds-col__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255,255,255,.6);
  border-bottom: 1px solid var(--col-border);
  backdrop-filter: blur(6px);
}

.kds-col__head-left { display: flex; align-items: center; gap: 8px; }

.kds-col__icon-wrap {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(255,255,255,.8);
  border: 1px solid var(--col-border);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.kds-col__label {
  font-size: 12px; font-weight: 800; color: #1e293b;
  letter-spacing: .5px; text-transform: uppercase;
}

.kds-col__badge {
  min-width: 24px; height: 24px; padding: 0 6px;
  background: var(--col-color); color: white;
  font-size: 11px; font-weight: 800;
  border-radius: 999px; display: flex; align-items: center; justify-content: center;
}

.kds-col__body {
  padding: 12px;
  display: flex; flex-direction: column; gap: 10px;
  flex: 1;
}

.kds-col__empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; padding: 32px 0;
  color: #94a3b8; font-size: 12px; font-weight: 500;
}

/* ── History header ───────────────────────────────────────────────────────── */
.kds-history-header {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 16px;
  font-size: 11px; font-weight: 700; color: #6b7280;
  letter-spacing: .6px; text-transform: uppercase;
}
.kds-history-title { font-size: 11px; font-weight: 700; color: #6b7280; letter-spacing: .5px; text-transform: uppercase; }
.kds-col__count { background: #eef2ff; color: #475569; }

/* ── Empty / Center ───────────────────────────────────────────────────────── */
.kds-center {
  min-height: calc(100vh - 120px);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px;
}
.kds-empty-icon {
  width: 72px; height: 72px; border-radius: 20px;
  background: #f8fafc; border: 2px solid #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.kds-empty-title { font-size: 17px; font-weight: 700; color: #1e293b; }
.kds-hint        { font-size: 13px; color: #94a3b8; }

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .kds-board   { grid-template-columns: 1fr; }
  .kds-stats   { display: none; }
}
@media (max-width: 640px) {
  .kds-brand__sub { display: none; }
  .kds-clock      { display: none; }
}
</style>