<script setup>
import { computed, ref } from 'vue'
import { useKdsStore } from '@/stores/kds.store'

const props = defineProps({
  order:       { type: Object, required: true },
  waitMinutes: { type: Number, default: null  },
  accentColor: { type: String, default: '#64748b' },
})

const emit = defineEmits([
  'prepare-food',
  'mark-ready',
  'complete-order',
  'drag-start',
  'drag-end',
  'update-status',
])

const store = useKdsStore()
const dragging = ref(false)

function onDragStart(event) {
  const id = props.order.id
  event.dataTransfer?.setData('text/plain', String(id))
  event.dataTransfer.effectAllowed = 'move'
  emit('drag-start', { id, status: props.order.order_status })
  dragging.value = true
}

function onDragEnd() {
  dragging.value = false
  emit('drag-end')
}

const elapsed          = computed(() => store.getElapsedSeconds(props.order))
const elapsedFormatted = computed(() => store.formatElapsed(elapsed.value))
const timerClass       = computed(() => store.getTimerClass(elapsed.value))

const isPending   = computed(() => ['new', 'received', 'confirmed'].includes(props.order.order_status))
const isPreparing = computed(() => props.order.order_status === 'preparing')
const isReady     = computed(() => props.order.order_status === 'ready')
const isCompleted = computed(() => props.order.order_status === 'completed')

/** Total quantity across all items (shown in "Ready" card like screenshot) */
const totalItems = computed(() =>
  (props.order.items ?? []).reduce((sum, i) => sum + (i.quantity ?? 1), 0)
)
</script>

<template>
  <div
    class="kds-card"
    :class="{
      'kds-card--flash':     order._flash,
      'kds-card--completed': isCompleted,
      'kds-card--dragging':  dragging,
    }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <!-- Left accent stripe — matches screenshot color per column -->
    <div class="kds-card__stripe" :style="{ background: accentColor }" />

    <div class="kds-card__body">

      <!-- ── Row 1: table tag + timer ─────────────────────────────────────── -->
      <div class="kds-card__top">
        <span class="kds-card__table" :style="{ color: accentColor, borderColor: accentColor + '44', background: accentColor + '12' }">
          {{ order.table_name || '—' }}
        </span>
        <span class="kds-card__timer" :class="timerClass">{{ elapsedFormatted }}</span>
      </div>

      <!-- ── Items list ─────────────────────────────────────────────────── -->
      <!--
        For "Ready for Pickup" cards the screenshot shows a summary line
        ("4 Items Total") instead of the full list.
        We replicate that pattern: show items detail when pending/preparing,
        show summary when ready/completed.
      -->
      <div v-if="!isReady && !isCompleted" class="kds-card__items">
        <div
          v-for="item in order.items"
          :key="item.order_item_id ?? item.id"
          class="kds-card__item"
        >
          <span class="kds-card__qty">{{ item.quantity }}×</span>
          <div class="kds-card__item-info">
            <span class="kds-card__item-name">{{ item.name }}</span>
            <span v-if="item.note" class="kds-card__item-note">
              <v-icon size="10">mdi-note-text-outline</v-icon>{{ item.note }}
            </span>
          </div>
        </div>
      </div>

      <!-- Ready: show item count summary (matches screenshot) -->
      <div v-else-if="isReady" class="kds-card__summary">
        {{ totalItems }} Item{{ totalItems !== 1 ? 's' : '' }} Total
      </div>

      <!-- Completed: same summary style -->
      <div v-else class="kds-card__summary kds-card__summary--done">
        {{ totalItems }} Item{{ totalItems !== 1 ? 's' : '' }} Total
      </div>

      <!-- Special instructions -->
      <div
        v-if="order.special_instructions || order.notes"
        class="kds-card__note"
      >
        <v-icon size="11" color="#d97706">mdi-note-edit-outline</v-icon>
        {{ order.special_instructions || order.notes }}
      </div>

      <!-- ── Action row ────────────────────────────────────────────────── -->
      <div class="kds-card__footer">

        <!-- Pending → START PREP -->
        <v-btn
          v-if="isPending"
          variant="tonal"
          block
          size="small"
          rounded="0"
          class="kds-card__btn kds-card__btn--pending"
        >
          <!-- custom style via CSS var -->
          <span @click="emit('prepare-food', order.id)">START PREP</span>
        </v-btn>

        <!-- Preparing → READY -->
        <v-btn
          v-else-if="isPreparing"
          variant="flat"
          block
          size="small"
          rounded="0"
          class="kds-card__btn kds-card__btn--preparing"
          @click="emit('mark-ready', order.id)"
        >
          READY
        </v-btn>

        <!-- Ready → COLLECT (+ optional print icon) -->
        <div v-else-if="isReady" class="kds-card__ready-row">
          <v-btn
            variant="flat"
            block
            size="small"
            rounded="0"
            class="kds-card__btn kds-card__btn--ready"
            @click="emit('complete-order', order.id)"
          >
            COLLECT
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="small"
            class="kds-card__print-btn"
          >
            <v-icon size="16" color="#64748b">mdi-printer-outline</v-icon>
          </v-btn>
        </div>

        <!-- Status change buttons -->
        <div class="kds-card__status-btns">
          <v-btn v-if="isPreparing" variant="outlined" size="x-small" @click="emit('update-status', order.id, 'confirmed')">Back to Pending</v-btn>
          <v-btn v-if="isReady" variant="outlined" size="x-small" @click="emit('update-status', order.id, 'preparing')">Back to Prep</v-btn>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Shell ─────────────────────────────────────────────────────────────────── */
.kds-card {
  display: flex;
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(15,23,42,.07);
  transition: box-shadow .15s ease, transform .15s ease;
}

.kds-card:hover {
  box-shadow: 0 4px 16px rgba(15,23,42,.11);
  transform: translateY(-1px);
}

.kds-card--flash {
  animation: flashCard 1.8s ease;
}

@keyframes flashCard {
  0%   { box-shadow: 0 0 0 3px rgba(20,184,166,.45); }
  100% { box-shadow: 0 1px 4px rgba(15,23,42,.07);   }
}

.kds-card--completed {
  opacity: .6;
}

.kds-card--dragging {
  opacity: 0.5;
}

/* ── Left accent stripe ────────────────────────────────────────────────────── */
.kds-card__stripe {
  width: 5px;
  flex-shrink: 0;
}

/* ── Body ──────────────────────────────────────────────────────────────────── */
.kds-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 14px 0;
  min-width: 0;
}

/* ── Top row: table tag + timer ────────────────────────────────────────────── */
.kds-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.kds-card__table {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid;
  letter-spacing: .3px;
}

.kds-card__timer {
  font-size: 16px;
  font-weight: 800;
  font-family: 'DM Mono', monospace;
  letter-spacing: .5px;
}

/* Timer urgency classes (driven by store.getTimerClass) */
.timer-ok       { color: #334155; }
.timer-warn     { color: #f59e0b; }
.timer-critical { color: #ef4444; animation: timerBlink 1s step-end infinite; }

@keyframes timerBlink { 50% { opacity: .3; } }

/* ── Items list ────────────────────────────────────────────────────────────── */
.kds-card__items {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.kds-card__item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.kds-card__qty {
  font-size: 13px;
  font-weight: 800;
  color: #475569;
  min-width: 24px;
  font-family: 'DM Mono', monospace;
}

.kds-card__item-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.kds-card__item-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.kds-card__item-note {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10.5px;
  color: #b45309;
  font-style: italic;
}

/* ── Summary (ready/completed) ─────────────────────────────────────────────── */
.kds-card__summary {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 10px;
}

.kds-card__summary--done {
  color: #94a3b8;
}

/* ── Special instructions note ─────────────────────────────────────────────── */
.kds-card__note {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 6px 8px;
  margin-bottom: 10px;
  background: #fffbeb;
  border: 1px dashed #fcd34d;
  border-radius: 6px;
  font-size: 11px;
  color: #92400e;
  font-style: italic;
  line-height: 1.4;
}

/* ── Footer / buttons ──────────────────────────────────────────────────────── */
.kds-card__footer {
  margin: 0 -14px;   /* bleed to card edges */
}

/* Shared button base */
.kds-card__btn {
  text-transform: none !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  letter-spacing: 1px !important;
  height: 38px !important;
  border-radius: 0 0 10px 0 !important;  /* bottom-right radius matches card */
}

/* Pending — warm amber tonal */
.kds-card__btn--pending {
  color: #b45309 !important;
  background: #fef3c7 !important;
}

.kds-card__btn--pending:hover {
  background: #fde68a !important;
}

/* Preparing — navy blue flat (matches screenshot) */
.kds-card__btn--preparing {
  background: #1e3a8a !important;
  color: #fff !important;
}

.kds-card__btn--preparing:hover {
  background: #1e40af !important;
}

/* Ready — green flat (matches screenshot) */
.kds-card__btn--ready {
  background: #16a34a !important;
  color: #fff !important;
  flex: 1;
  border-radius: 0 0 0 0 !important;
}

.kds-card__btn--ready:hover {
  background: #15803d !important;
}

/* Ready row: COLLECT btn + print icon side-by-side */
.kds-card__ready-row {
  display: flex;
  align-items: stretch;
}

.kds-card__print-btn {
  width: 42px !important;
  height: 38px !important;
  border-left: 1px solid #e2e8f0 !important;
  border-radius: 0 0 10px 0 !important;
  flex-shrink: 0;
}

.kds-card__status-btns {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  justify-content: flex-end;
}

/* Completed strip */
.kds-card__done {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 36px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 0 0 10px 10px;
}
</style>
