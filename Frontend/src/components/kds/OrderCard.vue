<script setup>
import { computed } from 'vue'
import { useKdsStore } from '@/stores/kds.store'

const props = defineProps({
  order:       { type: Object, required: true },
  waitMinutes: { type: Number, default: null  },
})

defineEmits(['receive-order', 'confirm-cooking', 'prepare-food', 'mark-ready'])

const kdsStore = useKdsStore()

const elapsed          = computed(() => kdsStore.getElapsedSeconds(props.order))
const elapsedFormatted = computed(() => kdsStore.formatElapsed(elapsed.value))
const timerClass       = computed(() => kdsStore.getTimerClass(elapsed.value))
const statusLabel      = computed(() => kdsStore.getStatusLabel(props.order.order_status))
const statusColor      = computed(() => kdsStore.getStatusColor(props.order.order_status))
</script>

<template>
  <v-card :class="['kds-card', `card-${order.order_status}`, { 'card-flash': order._flash }]">

    <!-- Header: table + timer -->
    <div class="kds-card__header">
      <div>
        <div class="kds-card__table">{{ order.table_name }}</div>
        <div class="kds-card__num">{{ order.order_number }}</div>
      </div>
      <div class="kds-card__right">
        <v-chip size="x-small" variant="tonal" :color="statusColor">{{ statusLabel }}</v-chip>
        <div class="kds-card__timer" :class="timerClass">
          <v-icon size="14">mdi-timer-outline</v-icon>
          {{ elapsedFormatted }}
        </div>
        <div v-if="waitMinutes" class="kds-card__wait">
          <v-icon size="12">mdi-clock-outline</v-icon>
          ~{{ waitMinutes }}m left
        </div>
      </div>
    </div>

    <v-divider />

    <!-- Items list -->
    <div class="kds-card__items">
      <div v-for="item in order.items" :key="item.order_item_id ?? item.id" class="kds-item">
        <div class="kds-item__qty">{{ item.quantity }}×</div>
        <div class="kds-item__body">
          <div class="kds-item__name">{{ item.name }}</div>
          <div v-if="item.note" class="kds-item__note">
            <v-icon size="12">mdi-alert-circle-outline</v-icon>
            {{ item.note }}
          </div>
        </div>
      </div>
      <!-- Special instructions -->
      <div v-if="order.special_instructions || order.notes" class="kds-item mt-2">
        <div class="kds-item__qty" style="color:#f59e0b">📝</div>
        <div class="kds-item__note" style="font-style:italic; color:#92400e">
          {{ order.special_instructions || order.notes }}
        </div>
      </div>
    </div>

    <!-- Action button -->
    <div class="kds-card__actions">
      <v-btn
        v-if="order.order_status === 'new'"
        color="blue" variant="flat" block size="small"
        @click="$emit('receive-order', order.id)"
      >Receive Order</v-btn>

      <v-btn
        v-else-if="order.order_status === 'received'"
        color="indigo" variant="flat" block size="small"
        @click="$emit('confirm-cooking', order.id)"
      >Confirm Cooking</v-btn>

      <v-btn
        v-else-if="order.order_status === 'confirmed'"
        color="orange" variant="flat" block size="small"
        @click="$emit('prepare-food', order.id)"
      >Prepare Food</v-btn>

      <v-btn
        v-else-if="order.order_status === 'preparing'"
        color="teal" variant="flat" block size="small"
        @click="$emit('mark-ready', order.id)"
      >Mark as Ready</v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.kds-card {
  border: 1px solid #e5e7eb; border-radius: 14px;
  background: #fff; box-shadow: 0 6px 18px rgba(15,23,42,.04);
  overflow: hidden; transition: transform .15s ease, box-shadow .15s ease;
}
.kds-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15,23,42,.08);
}

.card-new       { border-color: rgba(59,130,246,.5);  }
.card-received  { border-color: rgba(99,102,241,.5);  }
.card-confirmed { border-color: rgba(245,158,11,.6);  }
.card-preparing { border-color: rgba(16,185,129,.6);  }
.card-ready     { border-color: rgba(34,197,94,.6);   }

.card-flash { animation: flashIn 1.2s ease; }
@keyframes flashIn {
  0%   { background: rgba(16,185,129,.15); }
  100% { background: #fff; }
}

.kds-card__header  { display: flex; justify-content: space-between; padding: 12px 14px 8px; }
.kds-card__table   { font-size: 15px; font-weight: 700; color: #111827; }
.kds-card__num     { font-size: 11px; color: #6b7280; font-family: monospace; }
.kds-card__right   { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }

.kds-card__timer {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 600; font-family: monospace;
}
.timer-ok       { color: #6b7280; }
.timer-warn     { color: #f59e0b; }
.timer-critical { color: #ef4444; }

.kds-card__wait {
  display: flex; align-items: center; gap: 3px;
  font-size: 11px; font-weight: 600; color: #10b981;
}

.kds-card__items {
  padding: 10px 14px; display: flex; flex-direction: column;
  gap: 7px; min-height: 60px;
}
.kds-item       { display: flex; align-items: flex-start; gap: 8px; }
.kds-item__qty  { font-size: 13px; font-weight: 700; color: #10b981; font-family: monospace; min-width: 26px; }
.kds-item__body { display: flex; flex-direction: column; gap: 2px; }
.kds-item__name { font-size: 13px; font-weight: 600; color: #111827; }
.kds-item__note { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #f59e0b; }

.kds-card__actions { padding: 0 14px 14px; }
</style>