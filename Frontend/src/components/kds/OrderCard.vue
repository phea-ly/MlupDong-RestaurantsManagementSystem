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

const store    = useKdsStore()
const dragging = ref(false)

function onDragStart(event) {
  event.dataTransfer?.setData('text/plain', String(props.order.id))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
  emit('drag-start', { id: props.order.id, status: props.order.order_status })
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

const totalItems = computed(() =>
  (props.order.items ?? []).reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)
)

function goBackToPending()   { emit('update-status', props.order.id, 'confirmed')  }
function goBackToPreparing() { emit('update-status', props.order.id, 'preparing')  }
</script>

<template>
  <div
    class="kc"
    :class="{
      'kc--flash':     order._flash,
      'kc--completed': isCompleted,
      'kc--dragging':  dragging,
    }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <!-- Left accent stripe -->
    <div class="kc__stripe" :style="{ background: accentColor }" />

    <!-- Card content -->
    <div class="kc__body">

      <!-- ── Head: table tag | order num | timer ──────────────────────── -->
      <div class="kc__head">
        <span class="kc__table-tag">{{ order.table_name || '—' }}</span>
        <div class="kc__head-right">
          <span v-if="order.order_number" class="kc__order-num">#{{ order.order_number }}</span>
          <span class="kc__timer" :class="timerClass">{{ elapsedFormatted }}</span>
        </div>
      </div>

      <!-- ── Items (pending / preparing) ──────────────────────────────── -->
      <div v-if="!isReady && !isCompleted" class="kc__items">
        <div
          v-for="item in order.items"
          :key="item.order_item_id ?? item.id"
          class="kc__item"
        >
          <span class="kc__qty">{{ item.quantity }}×</span>
          <div class="kc__item-detail">
            <span class="kc__item-name">{{ item.name }}</span>
            <span v-if="item.note" class="kc__item-note">
              <v-icon size="10" color="#d97706">mdi-note-text-outline</v-icon>
              {{ item.note }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── Summary (ready / completed) ──────────────────────────────── -->
      <div v-else class="kc__summary" :class="{ 'kc__summary--done': isCompleted }">
        {{ totalItems }} Item{{ totalItems !== 1 ? 's' : '' }} Total
      </div>

      <!-- ── Special instructions ──────────────────────────────────────── -->
      <div v-if="order.special_instructions || order.notes" class="kc__note">
        <v-icon size="11" color="#d97706">mdi-note-edit-outline</v-icon>
        {{ order.special_instructions || order.notes }}
      </div>

      <!-- ── Order type ─────────────────────────────────────────────────── -->
      <div v-if="order.order_type" class="kc__type-row">
        <span class="kc__type-chip">{{ order.order_type.replace('_', ' ').toUpperCase() }}</span>
      </div>

    </div>

    <!-- ── Action button (full-width, no side padding) ──────────────────── -->

    <!-- Pending → START PREP -->
    <button
      v-if="isPending"
      class="kc__btn kc__btn--pending"
      @click.stop="emit('prepare-food', order.id)"
    >
      <v-icon size="13" color="#92400e">mdi-fire</v-icon>
      START PREP
    </button>

    <!-- Preparing → MARK READY -->
    <button
      v-else-if="isPreparing"
      class="kc__btn kc__btn--preparing"
      @click.stop="emit('mark-ready', order.id)"
    >
      <v-icon size="13" color="white">mdi-check</v-icon>
      MARK READY
    </button>

    <!-- Ready → COLLECT -->
    <div v-else-if="isReady" class="kc__collect-row">
      <button class="kc__btn kc__btn--ready" @click.stop="emit('complete-order', order.id)">
        <v-icon size="13" color="white">mdi-package-up</v-icon>
        COLLECT
      </button>
      <button class="kc__print-btn" @click.stop>
        <v-icon size="15" color="#94a3b8">mdi-printer-outline</v-icon>
      </button>
    </div>

    <!-- Completed -->
    <div v-else class="kc__done-strip">
      <v-icon size="13" color="#94a3b8">mdi-check-circle-outline</v-icon>
      Completed
    </div>

  </div>
</template>

<style scoped>
/* ── Shell ─────────────────────────────────────────────────────────────── */
.kc {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(15,23,42,.08), 0 0 0 1px rgba(15,23,42,.05);
  transition: box-shadow .15s, transform .15s, opacity .15s;
  cursor: grab;
  position: relative;
}
.kc:hover      { box-shadow: 0 5px 18px rgba(15,23,42,.13), 0 0 0 1px rgba(15,23,42,.07); transform: translateY(-1px); }
.kc--dragging  { opacity: .4; cursor: grabbing; }
.kc--completed { opacity: .55; }
.kc--flash     { animation: flashCard 1.8s ease; }

@keyframes flashCard {
  0%   { box-shadow: 0 0 0 3px rgba(20,184,166,.5); }
  100% { box-shadow: 0 1px 4px rgba(15,23,42,.08);  }
}

/* ── Left stripe ───────────────────────────────────────────────────────── */
.kc__stripe {
  position: absolute;
  top: 0; left: 0;
  width: 4px;
  height: 100%;
}

/* ── Body ──────────────────────────────────────────────────────────────── */
.kc__body {
  padding: 13px 14px 10px 18px; /* 18px clears the stripe */
}

/* ── Head ──────────────────────────────────────────────────────────────── */
.kc__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 11px;
}

/* Table tag — border only, no fill (matches screenshot) */
.kc__table-tag {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 7px;
  border: 1.5px solid #c7d2e7;
  color: #334155;
  background: transparent;
  letter-spacing: .2px;
  flex-shrink: 0;
}

.kc__head-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.kc__order-num {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  font-family: 'DM Mono', 'Courier New', monospace;
  letter-spacing: .2px;
}

/* Timer — bold mono with letter-spacing to match "05 : 48" */
.kc__timer {
  font-size: 17px;
  font-weight: 800;
  font-family: 'DM Mono', 'Courier New', monospace;
  letter-spacing: 3px;
}

.timer-ok       { color: #1e293b; }
.timer-warn     { color: #f59e0b; }
.timer-critical { color: #ef4444; animation: blink 1s step-end infinite; }
@keyframes blink { 50% { opacity: .2; } }

/* ── Items ─────────────────────────────────────────────────────────────── */
.kc__items {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.kc__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.kc__qty {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  min-width: 26px;
  font-family: 'DM Mono', 'Courier New', monospace;
  flex-shrink: 0;
}

.kc__item-detail { display: flex; flex-direction: column; gap: 1px; }

.kc__item-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}

.kc__item-note {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10.5px;
  color: #b45309;
  font-style: italic;
}

/* ── Summary ───────────────────────────────────────────────────────────── */
.kc__summary {
  font-size: 13.5px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 10px;
}
.kc__summary--done { color: #94a3b8; }

/* ── Note ──────────────────────────────────────────────────────────────── */
.kc__note {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  padding: 6px 9px;
  margin-bottom: 8px;
  background: #fffbeb;
  border: 1px dashed #fcd34d;
  border-radius: 6px;
  font-size: 11px;
  color: #92400e;
  font-style: italic;
  line-height: 1.4;
}

/* ── Order type chip ───────────────────────────────────────────────────── */
.kc__type-row { margin-bottom: 4px; }

.kc__type-chip {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .6px;
  color: #64748b;
  background: #f1f5f9;
  border-radius: 4px;
  padding: 2px 7px;
}

/* ── Action buttons ────────────────────────────────────────────────────── */
.kc__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  height: 42px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.2px;
  border-radius: 0;
  transition: filter .12s;
}
.kc__btn:hover  { filter: brightness(1.07); }
.kc__btn:active { filter: brightness(.92); }

.kc__btn--pending    { background: #fef3c7; color: #92400e; }
.kc__btn--preparing  { background: #1e3a8a; color: #ffffff; }
.kc__btn--ready      { background: #16a34a; color: #ffffff; flex: 1; height: 42px; border-radius: 0; }

/* ── Collect row ───────────────────────────────────────────────────────── */
.kc__collect-row { display: flex; align-items: stretch; }

.kc__print-btn {
  width: 44px;
  flex-shrink: 0;
  background: #f8fafc;
  border: none;
  border-left: 1px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .12s;
}
.kc__print-btn:hover { background: #f1f5f9; }

/* ── Done strip ────────────────────────────────────────────────────────── */
.kc__done-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  font-size: 11.5px;
  font-weight: 700;
  color: #94a3b8;
  background: #f8fafc;
}

/* ── Back row ──────────────────────────────────────────────────────────── */
.kc__back-row {
  display: flex;
  justify-content: flex-end;
  padding: 5px 10px 6px;
  background: #ffffff;
}

.kc__back-link {
  font-size: 10.5px;
  font-weight: 600;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 5px;
  border-radius: 4px;
  transition: color .12s, background .12s;
}
.kc__back-link:hover { color: #475569; background: #f1f5f9; }
</style> 