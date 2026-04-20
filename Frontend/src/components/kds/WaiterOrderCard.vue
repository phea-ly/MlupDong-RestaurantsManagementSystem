<script setup>
import { computed } from "vue";
import { useKdsStore } from "@/stores/kds.store";

const props = defineProps({
  order: { type: Object, required: true },
  actionLabel: { type: String, default: "" },
  actionColor: { type: String, default: "#234228" },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["action"]);

const kdsStore = useKdsStore();

const totalItems = computed(() =>
  (props.order.items ?? []).reduce(
    (sum, item) => sum + Number(item.quantity ?? 0),
    0,
  ),
);

const elapsedTime = computed(() =>
  kdsStore.formatElapsed(kdsStore.getElapsedSeconds(props.order)),
);
</script>

<template>
  <article class="waiter-card">
    <div class="waiter-card__head">
      <div>
        <div class="waiter-card__table">{{ order.table_name || "Walk-in" }}</div>
        <div class="waiter-card__order">{{ order.order_number }}</div>
      </div>

      <div class="waiter-card__time">
        <v-icon size="14">mdi-timer-outline</v-icon>
        {{ elapsedTime }}
      </div>
    </div>

    <div class="waiter-card__meta">
      <v-chip size="small" variant="tonal" color="primary">
        {{ totalItems }} item{{ totalItems === 1 ? "" : "s" }}
      </v-chip>
      <v-chip size="small" variant="tonal" color="grey">
        {{ order.order_type ?? "dine_in" }}
      </v-chip>
    </div>

    <div class="waiter-card__items">
      <div
        v-for="item in order.items ?? []"
        :key="item.order_item_id ?? item.id ?? item.name"
        class="waiter-card__item"
      >
        <strong>{{ item.quantity }}x</strong>
        <span>{{ item.name }}</span>
      </div>
    </div>

    <div
      v-if="order.special_instructions || order.notes"
      class="waiter-card__note"
    >
      {{ order.special_instructions || order.notes }}
    </div>

    <v-btn
      v-if="actionLabel"
      block
      rounded="lg"
      size="large"
      class="waiter-card__action"
      :color="actionColor"
      :disabled="disabled"
      @click="emit('action', order.id)"
    >
      {{ actionLabel }}
    </v-btn>

    <div v-else class="waiter-card__done">
      <v-icon size="16">mdi-check-circle</v-icon>
      Delivered
    </div>
  </article>
</template>

<style scoped>
.waiter-card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  padding: 18px;
  display: grid;
  gap: 14px;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
}

.waiter-card__head,
.waiter-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.waiter-card__table {
  font-size: 18px;
  font-weight: 800;
  color: #122118;
}

.waiter-card__order {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.waiter-card__time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #516059;
  font-size: 13px;
  font-weight: 700;
}

.waiter-card__items {
  display: grid;
  gap: 8px;
}

.waiter-card__item {
  display: flex;
  gap: 8px;
  color: #334155;
  font-size: 14px;
}

.waiter-card__note {
  padding: 10px 12px;
  border-radius: 14px;
  background: #fff7e8;
  border: 1px dashed rgba(194, 133, 46, 0.4);
  color: #8a5a15;
  font-size: 13px;
}

.waiter-card__action {
  letter-spacing: 0.02em;
  font-weight: 700;
}

.waiter-card__done {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border-radius: 14px;
  background: #eef6f0;
  color: #234228;
  font-weight: 700;
}
</style>
