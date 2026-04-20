<script setup>
import KdsOrderCard from '@/components/kds/OrderCard.vue'

defineProps({
  orders:        { type: Array,    default: () => [] },
  getWaitMinutes:{ type: Function, default: () => null },
})
</script>

<template>
  <div class="kds-hist">

    <!-- Empty -->
    <div v-if="!orders.length" class="kds-hist__empty">
      <v-icon size="40" color="grey-lighten-2">mdi-history</v-icon>
      <p class="kds-hist__empty-title">No history yet</p>
      <p class="kds-hist__empty-sub">Completed orders will appear here.</p>
    </div>

    <template v-else>
      <div class="kds-hist__header">
        <v-icon size="14" color="grey-darken-1">mdi-history</v-icon>
        <span class="kds-hist__title">Completed Orders</span>
        <span class="kds-hist__chip">{{ orders.length }}</span>
      </div>

      <v-row dense>
        <v-col
          v-for="order in orders"
          :key="order.id"
          cols="12" sm="6" md="4" lg="3"
        >
          <KdsOrderCard
            :order="order"
            :wait-minutes="getWaitMinutes(order)"
            accent-color="#94a3b8"
          />
        </v-col>
      </v-row>
    </template>

  </div>
</template>

<style scoped>
.kds-hist {
  padding-top: 4px;
}

.kds-hist__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100dvh - 140px);
  gap: 8px;
}

.kds-hist__empty-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.kds-hist__empty-sub {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.kds-hist__header {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 14px;
}

.kds-hist__title {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.kds-hist__chip {
  background: #e2e8f0;
  color: #475569;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 99px;
}
</style>
