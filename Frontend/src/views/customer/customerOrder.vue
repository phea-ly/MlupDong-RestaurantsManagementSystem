<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@/stores/cart.store";
import { kdsApi, tableApi } from "@/api/order.api";
import {
  getCustomerProgressStep,
  getCustomerStatusText,
  PENDING_ORDER_STATUSES,
} from "@/utils/orderStatus";

/* ─── stores & routing ─── */
const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

/* ─── state ─── */
const resolvingToken = ref(true);
const tokenError = ref(false);
const isPlacingOrder = ref(false);
const orderError = ref("");
const estimatedWait = ref(15);
const activeOrdersAhead = ref(0);
const trackedOrderId = ref(null);
const now = ref(Date.now());

let ticker = null;

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1548943487-a2e4142f6ab3?q=80&w=600";

/* ─── computed ─── */
const hasCartItems = computed(() => cartStore.items.length > 0);
const displayTableNumber = computed(() => cartStore.tableNumber ?? "--");

const trackedOrder = computed(
  () =>
    cartStore.orders.find((o) => o.id === trackedOrderId.value) ??
    cartStore.activeOrders[0] ??
    cartStore.orderHistory[0] ??
    null,
);

const trackedOrderStep = computed(() =>
  getCustomerProgressStep(trackedOrder.value?.order_status),
);

const trackedOrderStatusText = computed(() =>
  getCustomerStatusText(trackedOrder.value?.order_status),
);

const trackedOrderCountdown = computed(() => {
  const order = trackedOrder.value;
  if (!order || !["confirmed", "preparing"].includes(order.order_status)) return null;

  const startTime = order.confirmed_at ?? order.created_at;
  if (!startTime) return null;

  const totalMs =
    Number(order.estimated_wait_minutes ?? estimatedWait.value ?? 15) * 60 * 1000;
  const seconds = Math.max(
    0,
    Math.floor((new Date(startTime).getTime() + totalMs - now.value) / 1000),
  );
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
});

/* ─── helpers ─── */
function currency(value) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function matchesCurrentTable(order) {
  if (cartStore.tableId && order.table_id) {
    return String(order.table_id) === String(cartStore.tableId);
  }
  const name = `${order.table_name ?? order.table_number ?? ""}`.toLowerCase();
  return name.includes(`${cartStore.tableNumber ?? ""}`.toLowerCase());
}

/* ─── data loading ─── */
async function resolveTable() {
  if (cartStore.tableId && cartStore.tableNumber) {
    cartStore.ensureTableChannel();
    resolvingToken.value = false;
    return true;
  }

  try {
    const { data } = await tableApi.getByToken(route.params.token);
    cartStore.setTableId(data.table_id, data.table_number);
    resolvingToken.value = false;
    return true;
  } catch {
    tokenError.value = true;
    resolvingToken.value = false;
    return false;
  }
}

async function loadOwnOrders() {
  try {
    const { data } = await kdsApi.getActiveOrders();
    const allOrders = Array.isArray(data) ? data : [];
    const existingIds = new Set(cartStore.orders.map((o) => o.id));

    cartStore.mergeOrders(
      allOrders.filter((o) => matchesCurrentTable(o) && existingIds.has(o.id ?? o.order_id)),
    );

    activeOrdersAhead.value = allOrders.filter((o) =>
      PENDING_ORDER_STATUSES.concat("preparing").includes(o.order_status),
    ).length;

    estimatedWait.value = cartStore.calcEstimatedWait(activeOrdersAhead.value);
  } catch {
    estimatedWait.value = 15;
  }

  trackedOrderId.value =
    trackedOrderId.value ??
    cartStore.activeOrders[0]?.id ??
    cartStore.orderHistory[0]?.id ??
    null;
}

/* ─── place order ─── */
async function placeOrder() {
  if (!cartStore.items.length) return;

  isPlacingOrder.value = true;
  orderError.value = "";

  const result = await cartStore.placeOrder({
    order_type: "dine_in",
    table_id: cartStore.tableId,
  });

  isPlacingOrder.value = false;

  if (!result.success) {
    orderError.value = result.message;
    return;
  }

  trackedOrderId.value = cartStore.lastOrder?.id ?? null;
  await loadOwnOrders();
}

function goToMenu() {
  router.push({ name: "customer-menu", params: { token: route.params.token } });
}

/* ─── lifecycle ─── */
onMounted(async () => {
  const resolved = await resolveTable();
  if (!resolved) return;

  await loadOwnOrders();
  ticker = setInterval(() => { now.value = Date.now(); }, 1000);
});

onUnmounted(() => {
  cartStore.leaveTableChannel();
  if (ticker) { clearInterval(ticker); ticker = null; }
});
</script>

<template>
  <div class="order-page">

    <!-- ── Invalid QR ── -->
    <div v-if="tokenError" class="center-state">
      <v-icon size="56" color="#bcc8b5">mdi-qrcode-off</v-icon>
      <h2>Invalid QR Code</h2>
      <p>Please scan a valid table QR code to continue.</p>
    </div>

    <template v-else>

      <!-- ── Header ── -->
      <header class="order-header">
        <button class="back-btn" @click="goToMenu">
          <v-icon size="20" color="#1a3d22">mdi-arrow-left</v-icon>
          <span>Back</span>
        </button>

        <div class="table-chip">
          <v-icon size="13">mdi-table-furniture</v-icon>
          Table {{ displayTableNumber }}
        </div>
      </header>

      <!-- ── Loading ── -->
      <div v-if="resolvingToken" class="center-state center-state--soft">
        <v-progress-circular indeterminate color="#2f6b3c" />
        <p>Loading your table...</p>
      </div>

      <template v-else>

        <!-- ── CART VIEW ── -->
        <main v-if="hasCartItems" class="cart-view">

          <!-- Cart Items -->
          <section class="cart-list">
            <article v-for="item in cartStore.items" :key="item.id" class="order-card">
              <v-img :src="item.image || FALLBACK_IMG" width="86" height="86" cover class="order-card__image" />

              <div class="order-card__content">
                <!-- Title + Remove -->
                <div class="order-card__top">
                  <span class="order-card__title">{{ item.name }}</span>
                  <button class="remove-btn" @click="cartStore.removeFromCart(item.id)">
                    <v-icon size="20" color="#e87070">mdi-close-circle-outline</v-icon>
                  </button>
                </div>

                <!-- Note -->
                <v-text-field
                  :model-value="item.note"
                  placeholder="add note"
                  variant="solo-filled"
                  flat
                  hide-details
                  density="comfortable"
                  class="note-field"
                  @update:model-value="cartStore.updateItemNote(item.id, $event)"
                />

                <!-- Price + Qty -->
                <div class="order-card__bottom">
                  <span class="order-card__price">{{ currency(item.price) }}</span>

                  <div class="qty-pill">
                    <button class="qty-btn" @click="cartStore.updateQuantity(item.id, item.quantity - 1)">
                      <v-icon size="14">mdi-minus</v-icon>
                    </button>
                    <span class="qty-value">{{ item.quantity }}</span>
                    <button class="qty-btn" @click="cartStore.updateQuantity(item.id, item.quantity + 1)">
                      <v-icon size="14">mdi-plus</v-icon>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <!-- Summary -->
          <section class="summary-card">
            <p class="summary-card__title">Order Summary</p>

            <div class="summary-row">
              <span>Subtotal</span>
              <strong>{{ currency(cartStore.cartSubtotal) }}</strong>
            </div>
            <div class="summary-row">
              <span>Delivery Fee</span>
              <strong>{{ currency(cartStore.cartTax) }}</strong>
            </div>
            <div class="summary-divider" />
            <div class="summary-row summary-row--total">
              <span>Total</span>
              <strong class="total-amount">{{ currency(cartStore.cartTotal) }}</strong>
            </div>
          </section>

          <!-- Error -->
          <v-alert v-if="orderError" type="error" variant="tonal" rounded="xl">
            {{ orderError }}
          </v-alert>

        </main>

        <!-- ── TRACKING VIEW ── -->
        <main v-else class="tracking-view">

          <section v-if="trackedOrder" class="tracking-card">
            <p class="tracking-card__eyebrow">Your Order Status</p>
            <p class="tracking-card__order-number">{{ trackedOrder.order_number }}</p>
            <p class="tracking-card__subtitle">{{ trackedOrderStatusText }}</p>

            <div class="tracking-status-row">
              <v-chip :color="cartStore.getStatusColor(trackedOrder.order_status)" variant="flat" size="small">
                {{ cartStore.getStatusLabel(trackedOrder.order_status) }}
              </v-chip>

              <span class="tracking-time">
                {{ trackedOrderCountdown ?? `~${trackedOrder.estimated_wait_minutes ?? estimatedWait} min` }}
              </span>
            </div>

            <!-- Progress Rail -->
            <div class="progress-rail">
              <div v-for="step in 3" :key="step" class="progress-step"
                :class="{ 'progress-step--active': trackedOrderStep >= step }" />
            </div>

            <div class="progress-labels">
              <span>Confirmed</span>
              <span>Preparing</span>
              <span>Ready</span>
            </div>

            <!-- Order Items -->
            <div class="tracking-items">
              <div v-for="item in trackedOrder.items ?? []" :key="item.order_item_id ?? item.id ?? item.name"
                class="tracking-item">
                <strong>{{ item.quantity }}x {{ item.name }}</strong>
                <p v-if="item.note" class="tracking-item__note">{{ item.note }}</p>
              </div>
            </div>
          </section>

          <!-- Multi-order history -->
          <section v-if="cartStore.orders.length > 1" class="history-card">
            <p class="history-card__title">Your Orders</p>
            <button v-for="order in cartStore.orders" :key="order.id" class="history-order"
              :class="{ 'history-order--active': trackedOrderId === order.id }" @click="trackedOrderId = order.id">
              <span>{{ order.order_number }}</span>
              <v-chip size="x-small" :color="cartStore.getStatusColor(order.order_status)" variant="tonal">
                {{ cartStore.getStatusLabel(order.order_status) }}
              </v-chip>
            </button>
          </section>

          <div v-if="!trackedOrder" class="center-state center-state--soft">
            <v-icon size="44" color="#bcc8b5">mdi-clipboard-text-outline</v-icon>
            <p>No order yet. Add menu items and place your order.</p>
          </div>
        </main>

      </template>

    </template>
  </div>

  <!-- ── Place Order Bar ── -->
  <transition name="bar-slide">
    <button v-if="hasCartItems" class="place-order-bar" :disabled="isPlacingOrder" @click="placeOrder">
      <div class="place-order-bar__icon-wrap">
        <v-icon size="22" color="white">mdi-cart-outline</v-icon>
        <span class="place-order-bar__badge">{{ cartStore.cartCount }}</span>
      </div>
      <span class="place-order-bar__label">
        <template v-if="isPlacingOrder">Placing…</template>
        <template v-else>Place Order</template>
      </span>
      <!-- spacer to visually center the label -->
      <div class="place-order-bar__spacer" />
    </button>
  </transition>
</template>

<style scoped>
/* ─── Root ─── */
.order-page {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8f7f2;
  color: #263328;
  padding: 18px 16px 140px;
  font-family: inherit;
}

/* ─── Header ─── */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.back-btn {
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #1a3d22;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  padding: 0;
}

.back-btn span {
  color: #1a3d22 !important;
}

.table-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 8px 14px;
  background: #e6f0dc;
  color: #466640;
  font-size: 12px;
  font-weight: 700;
}

/* ─── Views ─── */
.cart-view,
.tracking-view {
  display: grid;
  gap: 16px;
}

/* ─── Cart List ─── */
.cart-list {
  display: grid;
  gap: 14px;
}

/* ─── Order Card ─── */
.order-card {
  display: grid;
  grid-template-columns: 86px 1fr;
  gap: 14px;
  padding: 14px;
  align-items: center;
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 22px;
  box-shadow: 0 2px 12px rgba(16, 24, 18, 0.06);
}

.order-card__image {
  border-radius: 16px;
  flex-shrink: 0;
}

.order-card__content {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.order-card__top,
.order-card__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.order-card__title {
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1e2820;
}

.remove-btn {
  border: none;
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
}

/* Note field */
.note-field :deep(.v-field) {
  background: #f0f0ee;
  border-radius: 14px !important;
}

.note-field :deep(.v-field__outline) {
  display: none;
}

.note-field :deep(input) {
  font-size: 13px;
  color: #8b9790;
  text-align: center;
}

.note-field :deep(input::placeholder) {
  color: #a8b0ab;
  text-align: center;
}

.order-card__price {
  color: #2e6d40;
  font-size: 15px;
  font-weight: 800;
}

/* ─── Qty Pill ─── */
.qty-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #f2f3ef;
  border-radius: 999px;
  padding: 6px 10px;
}

.qty-btn {
  border: none;
  background: transparent;
  color: #4a5e4e;
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  width: 18px;
  height: 18px;
}

.qty-value {
  min-width: 16px;
  text-align: center;
  font-weight: 800;
  font-size: 14px;
  color: #1e2820;
}

/* ─── Summary Card ─── */
.summary-card {
  padding: 20px;
  background: #f5f5f3;
  border: 1px solid #eaeae6;
  border-radius: 22px;
}

.summary-card__title {
  font-size: 17px;
  font-weight: 800;
  margin: 0 0 16px;
  color: #1e2820;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: #6b7870;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-row strong {
  color: #2a352d;
  font-weight: 600;
}

.summary-divider {
  border-top: 1px solid #dcddd8;
  margin: 14px 0;
}

.summary-row--total {
  color: #1e2820;
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 0;
}

.total-amount {
  color: #2e6d40;
  font-size: 18px;
  font-weight: 800;
}

/* ─── Tracking Card ─── */
.tracking-card {
  padding: 20px;
  background: #fff;
  border: 1px solid #e7e8e1;
  border-radius: 22px;
  box-shadow: 0 6px 18px rgba(16, 24, 18, 0.08);
}

.tracking-card__eyebrow {
  color: #92a08f;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 700;
  margin: 0 0 8px;
}

.tracking-card__order-number {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}

.tracking-card__subtitle {
  margin: 6px 0 0;
  color: #6e7c73;
  font-size: 14px;
  line-height: 1.45;
}

.tracking-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.tracking-time {
  color: #2e6d40;
  font-size: 14px;
  font-weight: 800;
}

/* ─── Progress Rail ─── */
.progress-rail {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 18px 0 8px;
}

.progress-step {
  height: 8px;
  border-radius: 999px;
  background: #dfe9d9;
  transition: background 0.3s;
}

.progress-step--active {
  background: #2e6d40;
}

.progress-labels {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  color: #738076;
  font-size: 11px;
  margin-bottom: 18px;
  text-align: center;
}

/* ─── Tracking Items ─── */
.tracking-items {
  display: grid;
  gap: 10px;
}

.tracking-item {
  border-radius: 16px;
  padding: 12px 14px;
  background: #f6f7f3;
  border: 1px solid #ebeee7;
  font-size: 14px;
}

.tracking-item__note {
  margin: 4px 0 0;
  color: #8a6a38;
  font-size: 12px;
}

/* ─── History Card ─── */
.history-card {
  padding: 20px;
  background: #fff;
  border: 1px solid #e7e8e1;
  border-radius: 22px;
  box-shadow: 0 6px 18px rgba(16, 24, 18, 0.08);
}

.history-card__title {
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 14px;
}

.history-order {
  width: 100%;
  border: 1px solid #e5e8e1;
  background: #fff;
  border-radius: 18px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.15s, border-color 0.15s;
}

.history-order + .history-order {
  margin-top: 10px;
}

.history-order--active {
  background: #eff6ea;
  border-color: #cfe2c5;
}

/* ─── Center State ─── */
.center-state {
  display: grid;
  place-items: center;
  gap: 12px;
  text-align: center;
  padding: 48px 24px;
  color: #6b796d;
}

.center-state--soft {
  min-height: 200px;
}

/* ─── Place Order Bar ── */
.place-order-bar {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  width: min(100% - 32px, 408px);
  height: 64px;
  border: none;
  border-radius: 20px;
  background: #2d5f29;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 16px 36px rgba(30, 80, 28, 0.32);
  z-index: 30;
  cursor: pointer;
}

.place-order-bar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.place-order-bar__icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  display: grid;
  place-items: center;
  position: relative;
  flex-shrink: 0;
}

.place-order-bar__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  color: #2d5f29;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
}

.place-order-bar__label {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.place-order-bar__spacer {
  width: 40px;
  flex-shrink: 0;
}

/* ─── Bar transition ─── */
.bar-slide-enter-active,
.bar-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.bar-slide-enter-from,
.bar-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}
</style>
