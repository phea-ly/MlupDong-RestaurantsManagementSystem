<script setup>
import { computed, onMounted, onUnmounted } from "vue";
import { useKdsStore } from "@/stores/kds.store";
import KdsColumn from "@/components/kds/Column.vue";
import KdsEmptyState from "@/components/kds/EmptyState.vue";
import WaiterOrderCard from "@/components/kds/WaiterOrderCard.vue";

const kdsStore = useKdsStore();

const pendingOrders = computed(() => kdsStore.pendingOrders);
const preparingOrders = computed(() => kdsStore.preparingOrders);
const deliveryOrders = computed(() => [
  ...kdsStore.readyOrders,
  ...kdsStore.completedOrders,
]);

const stats = computed(() => [
  {
    label: "Pending",
    value: pendingOrders.value.length,
    hint: "New and confirmed orders waiting for the kitchen flow.",
    tone: "amber",
  },
  {
    label: "Preparing",
    value: preparingOrders.value.length,
    hint: "Orders actively being cooked right now.",
    tone: "blue",
  },
  {
    label: "Ready / Done",
    value: deliveryOrders.value.length,
    hint: "Deliver ready food and keep completed orders visible for handoff.",
    tone: "green",
  },
]);

const boardHasOrders = computed(
  () =>
    pendingOrders.value.length +
      preparingOrders.value.length +
      deliveryOrders.value.length >
    0,
);

onMounted(() => {
  kdsStore.init();
});

onUnmounted(() => {
  kdsStore.cleanup();
});
</script>

<template>
  <div class="waiter-board">

    <div class="waiter-stats">
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="waiter-stat"
        :class="`waiter-stat--${stat.tone}`"
      >
        <div class="waiter-stat__label">{{ stat.label }}</div>
        <div class="waiter-stat__value">{{ stat.value }}</div>
        <div class="waiter-stat__hint">{{ stat.hint }}</div>
      </article>
    </div>

    <div v-if="kdsStore.loading" class="waiter-state">
      <v-progress-circular indeterminate color="#234228" />
      <div>Loading waiter dashboard...</div>
    </div>

    <div v-else-if="kdsStore.error" class="waiter-state">
      <v-icon size="42" color="error">mdi-alert-circle-outline</v-icon>
      <div>{{ kdsStore.error }}</div>
    </div>

    <KdsEmptyState v-else-if="!boardHasOrders" />

    <div v-else class="waiter-columns">
      <KdsColumn
        label="Pending"
        accent-color="#d97706"
        :count="pendingOrders.length"
      >
        <WaiterOrderCard
          v-for="order in pendingOrders"
          :key="order.id"
          :order="order"
        />
      </KdsColumn>

      <KdsColumn
        label="Preparing"
        accent-color="#1d4ed8"
        :count="preparingOrders.length"
      >
        <WaiterOrderCard
          v-for="order in preparingOrders"
          :key="order.id"
          :order="order"
        />
      </KdsColumn>

      <KdsColumn
        label="Ready / Done"
        accent-color="#15803d"
        :count="deliveryOrders.length"
      >
        <WaiterOrderCard
          v-for="order in deliveryOrders"
          :key="order.id"
          :order="order"
          :action-label="order.order_status === 'ready' ? 'Mark delivered' : ''"
          action-color="#15803d"
          @action="kdsStore.completeOrder"
        />
      </KdsColumn>
    </div>
  </div>
</template>

<style scoped>
.waiter-board {
  display: grid;
  gap: 20px;
  min-height: 100%;
}

.waiter-board__hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  padding: 24px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(44, 123, 69, 0.16), transparent 30%),
    linear-gradient(135deg, #ffffff 0%, #f5f8f6 100%);
  border: 1px solid rgba(35, 66, 40, 0.08);
}

.waiter-board__eyebrow {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6b7f70;
  margin-bottom: 8px;
}

.waiter-board__title {
  font-size: 30px;
  line-height: 1.05;
  margin: 0;
  color: #102116;
}

.waiter-board__subtitle {
  margin: 10px 0 0;
  max-width: 720px;
  color: #66756b;
  line-height: 1.6;
}

.waiter-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.waiter-stat {
  padding: 18px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.waiter-stat__label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.waiter-stat__value {
  font-size: 36px;
  line-height: 1;
  font-weight: 900;
  margin-bottom: 10px;
}

.waiter-stat__hint {
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.waiter-stat--amber .waiter-stat__label,
.waiter-stat--amber .waiter-stat__value {
  color: #b45309;
}

.waiter-stat--blue .waiter-stat__label,
.waiter-stat--blue .waiter-stat__value {
  color: #1d4ed8;
}

.waiter-stat--green .waiter-stat__label,
.waiter-stat--green .waiter-stat__value {
  color: #15803d;
}

.waiter-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  min-height: 0;
  flex: 1;
}

.waiter-state {
  min-height: 280px;
  display: grid;
  place-items: center;
  gap: 12px;
  text-align: center;
  color: #64748b;
}

@media (max-width: 1100px) {
  .waiter-stats,
  .waiter-columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .waiter-board__hero {
    padding: 18px;
    display: grid;
  }

  .waiter-board__title {
    font-size: 24px;
  }
}
</style>
