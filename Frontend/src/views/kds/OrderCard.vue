<template>
  <v-card :class="['kds-card', `card-${order.order_status}`, { 'card-flash': order._flash }]">
    <div class="kds-card__header">
      <div>
        <div class="kds-card__table">{{ order.table_name }}</div>
        <div class="kds-card__num">{{ order.order_number }}</div>
      </div>
      <div class="kds-card__right">
        <v-chip size="x-small" variant="tonal" :color="statusColor">{{ statusLabel }}</v-chip>
        <div class="kds-card__timer" :class="timerClass">
          <v-icon size="14" icon="mdi-timer-outline" />
          {{ elapsedFormatted }}
        </div>
        <!-- Per-order estimated wait (only while still active) -->
        <div v-if="waitMinutes" class="kds-card__wait">
          <v-icon size="12" icon="mdi-clock-outline" />
          ~{{ waitMinutes }}m left
        </div>
      </div>
    </div>

    <v-divider />

    <div class="kds-card__items">
      <div v-for="item in order.items" :key="item.id" class="kds-item">
        <div class="kds-item__qty">{{ item.quantity }}x</div>
        <div class="kds-item__body">
          <div class="kds-item__name">{{ item.name }}</div>
          <div v-if="item.note" class="kds-item__note">
            <v-icon size="12" icon="mdi-alert-circle-outline" />
            {{ item.note }}
          </div>
        </div>
      </div>
    </div>

    <div class="kds-card__actions">
      <v-btn
        v-if="order.order_status === 'new'"
        color="blue" variant="flat" block
        @click="$emit('receive-order', order.id)"
      >Receive Order</v-btn>

      <v-btn
        v-else-if="order.order_status === 'received'"
        color="indigo" variant="flat" block
        @click="$emit('confirm-cooking', order.id)"
      >Confirm Cooking</v-btn>

      <v-btn
        v-else-if="order.order_status === 'confirmed'"
        color="orange" variant="flat" block
        @click="$emit('prepare-food', order.id)"
      >Prepare Food</v-btn>

      <v-btn
        v-else-if="order.order_status === 'preparing'"
        color="teal" variant="flat" block
        @click="$emit('mark-ready', order.id)"
      >Mark as Ready</v-btn>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { useKdsStore } from "@/stores/kds.store";

const props = defineProps({
  order:       { type: Object,  required: true },
  waitMinutes: { type: Number,  default: null  },
});

defineEmits(["receive-order", "confirm-cooking", "prepare-food", "mark-ready"]);

const kdsStore = useKdsStore();

const elapsed        = computed(() => kdsStore.getElapsedSeconds(props.order));
const elapsedFormatted = computed(() => kdsStore.formatElapsed(elapsed.value));
const timerClass     = computed(() => kdsStore.getTimerClass(elapsed.value));
const statusLabel    = computed(() => kdsStore.getStatusLabel(props.order.order_status));
const statusColor    = computed(() => kdsStore.getStatusColor(props.order.order_status));
</script>

<style scoped>
.kds-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.kds-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.card-preparing { border-color: rgba(16, 185, 129, 0.6); }
.card-received  { border-color: rgba(99, 102, 241, 0.5); }
.card-confirmed { border-color: rgba(245, 158, 11, 0.6); }
.card-ready     { border-color: rgba(34, 197, 94, 0.6);  }

.card-flash { animation: flashIn 1.2s ease; }
@keyframes flashIn {
  0%   { background: rgba(16, 185, 129, 0.12); }
  100% { background: #ffffff; }
}

.kds-card__header {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px 10px;
}
.kds-card__table { font-size: 16px; font-weight: 700; color: #111827; }
.kds-card__num   { font-size: 11px; color: #6b7280; font-family: monospace; }

.kds-card__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.kds-card__timer {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 600; font-family: monospace;
}
.timer-ok       { color: #6b7280; }
.timer-warn     { color: #f59e0b; }
.timer-critical { color: #ef4444; }

.kds-card__wait {
  display: flex; align-items: center; gap: 3px;
  font-size: 11px; font-weight: 600;
  color: #10b981;
}

.kds-card__items {
  padding: 12px 16px;
  display: flex; flex-direction: column; gap: 8px;
  min-height: 70px;
}
.kds-item        { display: flex; align-items: flex-start; gap: 10px; }
.kds-item__qty   { font-size: 13px; font-weight: 700; color: #10b981; font-family: monospace; min-width: 28px; }
.kds-item__body  { display: flex; flex-direction: column; gap: 2px; }
.kds-item__name  { font-size: 14px; font-weight: 600; color: #111827; }
.kds-item__note  { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #f59e0b; }

.kds-card__actions { padding: 0 16px 16px; }
</style>