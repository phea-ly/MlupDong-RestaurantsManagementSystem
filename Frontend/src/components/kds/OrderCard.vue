<script setup>
import { computed } from 'vue'
import { useKdsStore } from '@/stores/kds.store'

const props = defineProps({
  order:       { type: Object, required: true },
  waitMinutes: { type: Number, default: null  },
})

defineEmits(['receive-order', 'confirm-cooking', 'prepare-food', 'mark-ready', 'complete-order'])

const kdsStore = useKdsStore()

const elapsed          = computed(() => kdsStore.getElapsedSeconds(props.order))
const elapsedFormatted = computed(() => kdsStore.formatElapsed(elapsed.value))
const timerClass       = computed(() => kdsStore.getTimerClass(elapsed.value))
const statusLabel      = computed(() => kdsStore.getStatusLabel(props.order.order_status))

const STATUS_CONFIG = {
  new:       { accent: '#3b82f6', label: 'New'       },
  received:  { accent: '#6366f1', label: 'Received'  },
  confirmed: { accent: '#f59e0b', label: 'Confirmed' },
  preparing: { accent: '#14b8a6', label: 'Preparing' },
  ready:     { accent: '#22c55e', label: 'Ready'     },
  completed: { accent: '#94a3b8', label: 'Done'      },
}

const cfg = computed(() => STATUS_CONFIG[props.order.order_status] ?? STATUS_CONFIG.completed)
</script>

<template>
  <v-card
    :class="['order-card', `order-card--${order.order_status}`, { 'order-card--flash': order._flash }]"
    rounded="xl"
    elevation="0"
  >
    <!-- ── Accent line ────────────────────────────────────────────────── -->
    <div class="order-card__accent" :style="{ background: cfg.accent }" />

    <!-- ── Header ────────────────────────────────────────────────────── -->
    <div class="order-card__header">
      <div class="order-card__table-wrap">
        <div class="order-card__table">{{ order.table_name || '—' }}</div>
        <div class="order-card__num"># {{ order.order_number }}</div>
      </div>

      <div class="order-card__meta">
        <!-- Status badge -->
        <v-chip
          size="x-small"
          variant="tonal"
          :style="{ background: cfg.accent + '22', color: cfg.accent }"
          class="order-card__status-chip"
        >
          {{ statusLabel }}
        </v-chip>

        <!-- Timer -->
        <div class="order-card__timer" :class="timerClass">
          <v-icon size="13">mdi-timer-outline</v-icon>
          {{ elapsedFormatted }}
        </div>

        <!-- Wait minutes chip -->
        <div v-if="waitMinutes" class="order-card__wait">
          <v-icon size="12">mdi-clock-fast</v-icon>
          ~{{ waitMinutes }}m
        </div>
      </div>
    </div>

    <v-divider />

    <!-- ── Items list ─────────────────────────────────────────────────── -->
    <div class="order-card__items">
      <div
        v-for="item in order.items"
        :key="item.order_item_id ?? item.id"
        class="order-card__item"
      >
        <div class="order-card__qty">{{ item.quantity }}×</div>
        <div class="order-card__item-body">
          <div class="order-card__item-name">{{ item.name }}</div>
          <!-- Per-item note visible to chef -->
          <div v-if="item.note" class="order-card__item-note">
            <v-icon size="11">mdi-note-text-outline</v-icon>
            {{ item.note }}
          </div>
        </div>
      </div>

      <!-- Special instructions for the whole order -->
      <div
        v-if="order.special_instructions || order.notes"
        class="order-card__instruction"
      >
        <v-icon size="13" color="amber-darken-2">mdi-note-edit-outline</v-icon>
        <span>{{ order.special_instructions || order.notes }}</span>
      </div>
    </div>

    <!-- ── Action buttons — 3 explicit steps ─────────────────────────── -->
    <div class="order-card__footer">

      <!-- STEP 1: Pending → Start Cooking (new / received / confirmed) -->
      <v-btn
        v-if="['new', 'received', 'confirmed'].includes(order.order_status)"
        color="teal"
        variant="flat"
        block
        size="small"
        rounded="lg"
        class="order-card__btn"
        @click="$emit('prepare-food', order.id)"
      >
        <v-icon start size="15">mdi-fire</v-icon>
        Start Cooking
      </v-btn>

      <!-- STEP 2: Cooking → Mark Ready (preparing) -->
      <v-btn
        v-else-if="order.order_status === 'preparing'"
        color="green"
        variant="flat"
        block
        size="small"
        rounded="lg"
        class="order-card__btn"
        @click="$emit('mark-ready', order.id)"
      >
        <v-icon start size="15">mdi-check-circle-outline</v-icon>
        Mark Ready
      </v-btn>

      <!-- STEP 3: Ready → Complete Order (ready) -->
      <v-btn
        v-else-if="order.order_status === 'ready'"
        color="grey-darken-3"
        variant="flat"
        block
        size="small"
        rounded="lg"
        class="order-card__btn"
        @click="$emit('complete-order', order.id)"
      >
        <v-icon start size="15">mdi-check-all</v-icon>
        Complete Order
      </v-btn>

      <!-- Completed — done strip, no button -->
      <div
        v-else-if="order.order_status === 'completed'"
        class="order-card__done order-card__done--done"
      >
        <v-icon size="15" color="grey">mdi-check-all</v-icon>
        <span>Completed</span>
      </div>

    </div>

  </v-card>
</template>

<style scoped>
/* ── Card shell ──────────────────────────────────────────────────────────── */
.order-card {
  position: relative;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  overflow: hidden;
  transition: transform .15s ease, box-shadow .15s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, .10) !important;
}

/* ── Accent top bar ───────────────────────────────────────────────────────── */
.order-card__accent {
  height: 4px;
  width: 100%;
}

/* ── Flash animation (new order arrives) ─────────────────────────────────── */
.order-card--flash {
  animation: flashIn 1.5s ease;
}

@keyframes flashIn {
  0%   { box-shadow: 0 0 0 3px rgba(20, 184, 166, .5); }
  100% { box-shadow: none; }
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.order-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 11px 14px 9px;
  gap: 8px;
}

.order-card__table {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.order-card__num {
  font-size: 10px;
  color: #94a3b8;
  font-family: monospace;
  margin-top: 2px;
}

.order-card__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.order-card__status-chip {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .3px;
}

/* ── Timer ───────────────────────────────────────────────────────────────── */
.order-card__timer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  font-family: monospace;
}

.timer-ok       { color: #94a3b8; }
.timer-warn     { color: #f59e0b; }
.timer-critical { color: #ef4444; animation: timerBlink 1s step-end infinite; }

@keyframes timerBlink {
  50% { opacity: .4; }
}

.order-card__wait {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  color: #10b981;
}

/* ── Items list ───────────────────────────────────────────────────────────── */
.order-card__items {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-height: 50px;
}

.order-card__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.order-card__qty {
  font-size: 12px;
  font-weight: 800;
  color: #0d9488;
  font-family: monospace;
  min-width: 26px;
  padding-top: 1px;
}

.order-card__item-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-card__item-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

/* Per-item note — amber highlight for chef attention */
.order-card__item-note {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  color: #b45309;
  font-style: italic;
}

/* Order-level special instructions */
.order-card__instruction {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 4px;
  padding: 7px 10px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 8px;
  font-size: 11px;
  color: #92400e;
  font-style: italic;
}

/* ── Footer / action buttons ──────────────────────────────────────────────── */
.order-card__footer {
  padding: 0 12px 12px;
}

.order-card__btn {
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .3px;
  text-transform: none;
}

/* ── Done strip ───────────────────────────────────────────────────────────── */
.order-card__done {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
}

.order-card__done--ready { background: #f0fdf4; color: #16a34a; }
.order-card__done--done  { background: #f8fafc; color: #94a3b8; }
</style>