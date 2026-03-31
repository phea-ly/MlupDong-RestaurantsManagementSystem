<script setup>
// src/views/customer/CartPage.vue — <script setup> section

import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMenuStore } from "@/stores/menu.store";
import { useCartStore } from "@/stores/cart.store";
import { tableApi, kdsApi } from "@/api/order.api";

const menuStore = useMenuStore();
const cartStore = useCartStore();
const route = useRoute();
const router = useRouter();

const resolvingToken = ref(true);
const tokenError = ref(false);
const isPlacingOrder = ref(false);
const showSuccess = ref(false);
const activeOrdersAhead = ref(0);
const estimatedWait = ref(null);
const confirmedWaitMinutes = ref(0);
const countdownSeconds = ref(0);
const orderError = ref("");
let countdownTimer = null;

const fallbackImg =
  "https://images.unsplash.com/photo-1548943487-a2e4142f6ab3?q=80&w=600";

// ── Track the order shown on success screen ──────────────────────────────

const trackedOrder = ref(null);

// Watch for status changes from WebSocket on the tracked order
watch(
  () => {
    if (!trackedOrder.value) return null;
    return cartStore.orders.find(
      (o) => o.order_id === trackedOrder.value.order_id,
    )?.order_status;
  },
  (newStatus) => {
    if (!newStatus || !trackedOrder.value) return;
    trackedOrder.value.order_status = newStatus;

    // Only start countdown when chef starts preparing (not at order placement)
    if (
      (newStatus === "confirmed" || newStatus === "preparing") &&
      !trackedOrder.value.prep_started
    ) {
      trackedOrder.value.prep_started = true;
      startCountdown(confirmedWaitMinutes.value);
    }

    // Stop countdown when ready
    if (newStatus === "ready" || newStatus === "completed") {
      stopCountdown();
    }
  },
);

const displayTableNumber = computed(() => {
  const num = String(cartStore.tableNumber || "??");
  if (num.length > 8 && num !== "??")
    return `${num.substring(0, 4)}...${num.slice(-4)}`;
  return num;
});

const countdownDisplay = computed(() => {
  const mins = Math.floor(countdownSeconds.value / 60);
  const secs = countdownSeconds.value % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
});

const isCountingDown = computed(() => countdownSeconds.value > 0);

const statusStep = computed(() => {
  const s = trackedOrder.value?.order_status;
  if (s === "confirmed") return 2;
  if (s === "preparing") return 3;
  if (["ready", "served", "completed"].includes(s)) return 4;
  return 1;
});

const statusText = computed(() => {
  const s = trackedOrder.value?.order_status;
  if (s === "new") return "Order received — waiting for chef";
  if (s === "received") return "Kitchen received your order";
  if (s === "confirmed") return "Chef confirmed — starting preparation";
  if (s === "preparing") return "Chef is cooking now 🔥";
  if (s === "ready") return "✅ Your food is ready!";
  if (s === "completed") return "Served — enjoy your meal!";
  if (s === "cancelled") return "Order was cancelled";
  return "Sent to kitchen...";
});

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  const token = route.params.token;
  if (cartStore.tableId) {
    resolvingToken.value = false;
    await fetchQueueDepth();
    return;
  }
  if (token) {
    try {
      const { data } = await tableApi.getByToken(token);
      cartStore.setTableId(data.table_id, data.table_number);
    } catch {
      tokenError.value = true;
      resolvingToken.value = false;
      return;
    }
  }
  resolvingToken.value = false;
  await fetchQueueDepth();
});

onUnmounted(() => {
  cartStore.leaveTableChannel();
  stopCountdown();
});

function goBackToMenu() {
  showSuccess.value = false;
  orderError.value = "";
  stopCountdown();
  router.back();
}

async function fetchQueueDepth() {
  try {
    const { data } = await kdsApi.getActiveOrders();
    activeOrdersAhead.value = data.filter((o) =>
      ["new", "received", "confirmed", "preparing"].includes(o.order_status),
    ).length;
    estimatedWait.value = cartStore.calcEstimatedWait(activeOrdersAhead.value);
  } catch {
    estimatedWait.value = 15;
  }
}

async function placeOrder() {
  if (!cartStore.items.length) return;
  if (!cartStore.tableId) {
    orderError.value =
      "Table information is missing. Please scan the QR code again.";
    return;
  }

  isPlacingOrder.value = true;
  orderError.value = "";
  confirmedWaitMinutes.value = estimatedWait.value ?? 15;
  showSuccess.value = true; // Show overlay before await

  try {
    const result = await cartStore.placeOrder({
      order_type: "dine_in",
      table_id: cartStore.tableId,
    });

    if (result.success) {
      if (result.data?.estimated_wait_minutes) {
        confirmedWaitMinutes.value = result.data.estimated_wait_minutes;
      }
      // Set trackedOrder to the newly placed order
      trackedOrder.value = cartStore.lastOrder;
      // NOTE: Do NOT start countdown here — it starts when chef confirms
    } else {
      showSuccess.value = false;
      orderError.value =
        result.message || "Something went wrong. Please try again.";
    }
  } catch (err) {
    showSuccess.value = false;
    orderError.value = err?.message || "Unexpected error. Please try again.";
  } finally {
    isPlacingOrder.value = false;
  }
}

function startCountdown(minutes) {
  stopCountdown();
  const safe = Number.isFinite(minutes) ? minutes : 0;
  countdownSeconds.value = Math.max(0, Math.round(safe * 60));
  if (countdownSeconds.value <= 0) return;
  countdownTimer = setInterval(() => {
    if (countdownSeconds.value > 0) countdownSeconds.value--;
    else stopCountdown();
  }, 1000);
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

watch(
  () => cartStore.items.length,
  (len) => {
    if (len === 0 && !showSuccess.value) goBackToMenu();
  },
);
</script>

<template>
  <div class="cart-layout">
    <!-- ── Invalid token ─────────────────────────────────────────────────── -->
    <div v-if="tokenError" class="error-center">
      <v-icon size="64" color="grey">mdi-qrcode-off</v-icon>
      <div class="text-h6 font-weight-bold text-grey-darken-3 mt-4">
        Invalid QR Code
      </div>
    </div>

    <template v-else>
      <!-- ── Sticky header ────────────────────────────────────────────────── -->
      <div class="sticky-header d-flex align-center px-4 py-3">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          size="small"
          color="#1c2e1a"
          @click="goBackToMenu"
        />
        <div class="d-flex flex-column ml-3 flex-grow-1">
          <div class="header-title" style="line-height: 1">Your Cart</div>
          <div
            class="font-weight-bold text-uppercase mt-1"
            style="font-size: 9px; color: #2f6b3c; letter-spacing: 1.5px"
          >
            Mlup Dong • Table {{ displayTableNumber }}
          </div>
        </div>
        <!-- Item count badge -->
        <v-chip
          v-if="cartStore.cartCount > 0"
          size="small"
          color="#2f6b3c"
          variant="tonal"
          class="font-weight-black"
        >
          {{ cartStore.cartCount }} item{{
            cartStore.cartCount !== 1 ? "s" : ""
          }}
        </v-chip>
      </div>

      <!-- ── Empty cart ────────────────────────────────────────────────────── -->
      <div
        v-if="cartStore.items.length === 0 && !showSuccess"
        class="empty-state d-flex flex-column align-center justify-center px-8"
      >
        <div
          class="empty-blob mb-8 d-flex align-center justify-center"
          style="
            width: 120px;
            height: 120px;
            background: rgba(47, 107, 60, 0.08);
            border-radius: 50%;
          "
        >
          <v-icon size="64" color="#2f6b3c">mdi-cart-outline</v-icon>
        </div>
        <h3 class="header-title text-center mb-2" style="font-size: 24px">
          Your Cart is Empty
        </h3>
        <p class="text-body-1 text-center mb-8" style="color: #7a8c76">
          Add something delicious to your tray!
        </p>
        <v-btn
          class="brand-btn text-white"
          rounded="pill"
          elevation="0"
          @click="goBackToMenu"
          height="54"
          width="100%"
          style="max-width: 280px"
        >
          <span style="letter-spacing: 1px; font-weight: 700; font-size: 14px"
            >BROWSE MENU</span
          >
        </v-btn>
      </div>

      <!-- ── Cart items ────────────────────────────────────────────────────── -->
      <div v-else-if="!showSuccess" class="px-4 pt-4 pb-cart fade-in">
        <!-- Clear all -->
        <div class="d-flex align-center justify-space-between mb-4 px-1">
          <span
            class="text-caption font-weight-black text-uppercase text-medium-emphasis"
            style="letter-spacing: 0.06em"
          >
            My Tray ({{ cartStore.cartCount }})
          </span>
          <v-btn
            variant="text"
            size="x-small"
            color="red-darken-1"
            class="font-weight-bold"
            @click="cartStore.clearCart"
          >
            Clear All
          </v-btn>
        </div>

        <!-- Item cards -->
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="cart-item-card mb-4"
        >
          <!-- Image -->
          <div class="cart-item-img-wrap">
            <v-img
              :src="item.image || fallbackImg"
              cover
              class="cart-item-img"
            />
            <div class="cart-item-img-shine" />
          </div>

          <!-- Info -->
          <div class="cart-item-info">
            <div class="d-flex justify-space-between align-start mb-1">
              <div class="cart-item-title pr-2">{{ item.name }}</div>
              <v-icon
                size="20"
                color="#a0b39c"
                style="cursor: pointer; margin-top: 2px; flex-shrink: 0"
                @click="cartStore.removeFromCart(item.id)"
              >
                mdi-close-circle
              </v-icon>
            </div>
            <div class="cart-item-desc mb-3">
              Fresh ingredients – Best quality
            </div>

            <!-- Per-item chef note -->
            <div class="item-note-wrap mt-2">
              <v-text-field
                v-model="item.note"
                :placeholder="`Note for ${item.name} (e.g. extra spicy)`"
                variant="outlined"
                density="compact"
                hide-details
                color="#2f6b3c"
                class="item-note-field"
                prepend-inner-icon="mdi-chef-hat"
                @input="cartStore.updateItemNote(item.id, item.note)"
              />
            </div>

            <div class="d-flex justify-space-between align-end mt-auto">
              <!-- Price -->
              <div class="cart-item-price">
                <span class="currency-symbol">$</span
                >{{ item.price.toFixed(2) }}
              </div>

              <!-- Qty pill -->
              <div class="qty-pill">
                <button
                  class="qty-btn"
                  :disabled="item.quantity <= 1"
                  @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                >
                  <v-icon size="14">mdi-minus</v-icon>
                </button>
                <div class="qty-val">{{ item.quantity }}</div>
                <button
                  class="qty-btn qty-btn--plus"
                  @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                >
                  <v-icon size="14">mdi-plus</v-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Chef note -->
        <div class="mt-6 mb-3 d-flex align-center px-1">
          <v-icon color="#2f6b3c" size="20" class="mr-2"
            >mdi-note-edit-outline</v-icon
          >
          <span
            class="text-brand-dark font-weight-bold"
            style="font-size: 13px"
          >
            Special Instructions for the Chef
          </span>
        </div>
        <v-textarea
          v-model="cartStore.specialInstructions"
          placeholder="Allergies, specific requests, or how you like your spice level..."
          variant="outlined"
          bg-color="white"
          hide-details
          auto-grow
          rows="3"
          color="#2f6b3c"
          class="instruction-textarea mb-4"
        />

        <!-- Estimated wait -->
        <div class="wait-card d-flex align-center ga-3 mb-2">
          <v-icon color="#2f6b3c" size="22">mdi-clock-outline</v-icon>
          <div>
            <div class="text-caption font-weight-bold" style="color: #5a6e57">
              Estimated wait
            </div>
            <div class="header-title" style="font-size: 16px; color: #2f6b3c">
              {{ estimatedWait ? `~${estimatedWait} min` : "Calculating..." }}
            </div>
          </div>
          <v-spacer />
          <div
            class="text-caption text-right"
            style="color: #9aab96; max-width: 80px; line-height: 1.3"
          >
            {{ activeOrdersAhead }} orders ahead
          </div>
        </div>

        <!-- Error -->
        <v-alert
          v-if="orderError"
          type="error"
          variant="tonal"
          rounded="xl"
          closable
          density="compact"
          class="mb-3 text-body-2 font-weight-bold"
          @click:close="orderError = ''"
        >
          {{ orderError }}
        </v-alert>
      </div>
      <!-- /cart items -->

      <!-- ── Checkout panel (fixed bottom) ──────────────────────────────────── -->
      <v-slide-y-reverse-transition>
        <div
          v-if="cartStore.items.length > 0 && !showSuccess"
          class="checkout-panel px-6 pt-5 pb-6"
        >
          <div class="d-flex justify-space-between mb-2">
            <span class="text-caption" style="color: #7a8c76">Subtotal</span>
            <span class="text-caption font-weight-bold text-brand-dark">
              ${{ cartStore.cartSubtotal.toFixed(2) }}
            </span>
          </div>
          <div class="d-flex justify-space-between mb-3">
            <span class="text-caption" style="color: #7a8c76">Tax (10%)</span>
            <span class="text-caption font-weight-bold text-brand-dark">
              ${{ cartStore.cartTax.toFixed(2) }}
            </span>
          </div>

          <div class="divider-dashed my-3" />

          <div class="d-flex justify-space-between align-center mb-5 mt-3">
            <span class="header-title" style="font-size: 18px"
              >Total Amount</span
            >
            <span class="price-text" style="font-size: 24px">
              ${{ cartStore.cartTotal.toFixed(2) }}
            </span>
          </div>

          <v-btn
            rounded="pill"
            block
            height="52"
            class="brand-btn text-white elevation-0 checkout-btn mb-3"
            :loading="isPlacingOrder"
            :disabled="isPlacingOrder"
            style="letter-spacing: 1px; font-weight: 600; font-size: 14px"
            @click="placeOrder"
          >
            <span>PLACE ORDER</span>
            <v-icon size="20" class="ml-3">mdi-rocket-launch-outline</v-icon>
          </v-btn>

          <div
            class="text-center text-uppercase"
            style="
              font-size: 9px;
              color: #9aab96;
              letter-spacing: 0.5px;
              font-weight: 600;
            "
          >
            By placing order you agree to our terms of service
          </div>
        </div>
      </v-slide-y-reverse-transition>

      <!-- ── Success overlay ──────────────────────────────────────────────── -->
      <v-overlay
        v-model="showSuccess"
        class="align-center justify-center px-5"
        scrim="rgba(244,242,236,0.96)"
        :persistent="true"
        :z-index="200"
      >
        <v-card
          class="pa-0 text-center overflow-hidden bg-white success-card"
          elevation="16"
        >
          <div class="pa-8 d-flex flex-column align-center">
            <!-- Check icon -->
            <div class="success-icon-box mb-5">
              <v-icon color="#2f6b3c" size="56"
                >mdi-check-circle-outline</v-icon
              >
            </div>

            <h2 class="header-title mb-2" style="font-size: 26px">
              Order Sent!
            </h2>
            <p
              class="text-body-2 mb-5"
              style="color: #7a8c76; line-height: 1.6"
            >
              Relax and sit tight while we prepare your meal.
            </p>

            <!-- Wait time -->
            <div class="wait-badge mb-5">
              <div
                class="text-caption font-weight-black text-uppercase"
                style="
                  opacity: 0.6;
                  font-size: 10px;
                  color: #1c2e1a;
                  letter-spacing: 0.08em;
                "
              >
                Estimated Wait
              </div>
              <div class="price-text" style="font-size: 40px; line-height: 1.1">
                ~{{ confirmedWaitMinutes
                }}<span style="font-size: 20px">m</span>
              </div>
            </div>

            <!-- Status + countdown card -->
            <div class="status-card mb-5 w-100">
              <div class="d-flex align-center justify-space-between mb-3">
                <div class="text-left">
                  <div
                    class="text-caption font-weight-black text-uppercase"
                    style="
                      font-size: 9px;
                      letter-spacing: 0.08em;
                      color: #5a6e57;
                      opacity: 0.8;
                    "
                  >
                    Kitchen Status
                  </div>
                  <div class="text-body-2 font-weight-bold text-brand-dark">
                    {{ statusText }}
                  </div>
                </div>
                <div
                  class="countdown-badge"
                  :class="{ active: isCountingDown }"
                >
                  {{ isCountingDown ? countdownDisplay : "--:--" }}
                </div>
              </div>

              <!-- Progress dots -->
              <div class="progress-dots">
                <span class="dot" :class="{ active: statusStep >= 1 }" />
                <span class="dot" :class="{ active: statusStep >= 2 }" />
                <span class="dot" :class="{ active: statusStep >= 3 }" />
                <span class="dot" :class="{ active: statusStep >= 4 }" />
              </div>
            </div>

            <!-- Order number -->
            <div
              v-if="cartStore.lastOrder"
              class="text-caption mb-5"
              style="color: #9aab96"
            >
              Order {{ cartStore.lastOrder.order_number }}
            </div>

            <v-btn
              block
              rounded="pill"
              size="large"
              class="brand-btn text-white elevation-0 text-none"
              style="font-weight: 700; letter-spacing: 0.5px"
              @click="goBackToMenu"
            >
              Back to Menu
            </v-btn>
          </div>
        </v-card>
      </v-overlay>

      <!-- In OrderCard.vue — inside the items list -->
      <div
        v-for="item in order.items"
        :key="item.order_item_id"
        class="kds-item"
      >
        <div class="kds-item__main">
          <span class="kds-item__qty">×{{ item.quantity }}</span>
          <span class="kds-item__name">{{ item.name }}</span>
          <span class="kds-item__price">${{ item.subtotal?.toFixed(2) }}</span>
        </div>

        <!-- Per-item note — highlighted for chef -->
        <div v-if="item.note" class="kds-item__note">
          <v-icon size="12" color="#f59e0b">mdi-note-alert</v-icon>
          <span>{{ item.note }}</span>
        </div>
      </div>

      <!-- Special instructions for the whole order -->
      <div v-if="order.special_instructions" class="kds-special-instructions">
        <v-icon size="14" color="#f59e0b">mdi-note-text</v-icon>
        <span>{{ order.special_instructions }}</span>
      </div>

      <!-- Action buttons — correct status flow -->
      <div class="kds-actions">
        <!-- Pending → Preparing -->
        <v-btn
          v-if="['new', 'received', 'confirmed'].includes(order.order_status)"
          color="teal"
          variant="flat"
          size="small"
          @click="$emit('prepare-food', order.id)"
        >
          <v-icon start size="14">mdi-fire</v-icon>
          Start Cooking
        </v-btn>

        <!-- Preparing → Ready -->
        <v-btn
          v-if="order.order_status === 'preparing'"
          color="success"
          variant="flat"
          size="small"
          @click="$emit('mark-ready', order.id)"
        >
          <v-icon start size="14">mdi-check</v-icon>
          Mark Ready
        </v-btn>

        <!-- Ready → Completed (waiter action) -->
        <v-btn
          v-if="order.order_status === 'ready'"
          color="grey"
          variant="outlined"
          size="small"
          @click="$emit('complete-order', order.id)"
        >
          <v-icon start size="14">mdi-silverware</v-icon>
          Served
        </v-btn>
      </div>
    </template>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap");

/* ── Shell ─────────────────────────────────────────────────────────────── */
.cart-layout {
  font-family: "DM Sans", sans-serif;
  background: #f4f2ec;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.error-center {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}


.kds-item__note {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 28px;
  margin-top: 2px;
  font-size: 11px;
  color: #f59e0b;
  font-weight: 600;
  background: rgba(245,158,11,.08);
  border-radius: 6px;
  padding: 3px 8px;
}

.kds-special-instructions {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 8px 0;
  padding: 8px 10px;
  background: rgba(245,158,11,.10);
  border: 1px dashed rgba(245,158,11,.3);
  border-radius: 8px;
  font-size: 12px;
  color: #b45309;
  font-weight: 500;
  line-height: 1.4;
}


/* ── Typography ─────────────────────────────────────────────────────────── */
.header-title {
  font-family: "Playfair Display", serif;
  font-weight: 700;
  color: #1c2e1a;
  font-size: 20px;
}

.price-text {
  font-family: "Playfair Display", serif;
  font-weight: 700;
  color: #2f6b3c;
  font-size: 18px;
}

.text-brand-dark {
  color: #1c2e1a !important;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 9px;
  color: #9aab96;
  font-weight: 600;
  letter-spacing: 0.03em;
}

/* ── Brand button ───────────────────────────────────────────────────────── */
.brand-btn {
  background: linear-gradient(135deg, #2f6b3c 0%, #1a4526 100%) !important;
  box-shadow: 0 4px 16px rgba(47, 107, 60, 0.25) !important;
}

/* ── Sticky header ──────────────────────────────────────────────────────── */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #f4f2ec;
  border-bottom: 1px solid rgba(47, 107, 60, 0.1);
  box-shadow: 0 4px 24px rgba(30, 50, 25, 0.04);
}

/* ── Empty state ────────────────────────────────────────────────────────── */
.empty-state {
  height: calc(100vh - 64px);
}

/* ── Cart item card ─────────────────────────────────────────────────────── */
.cart-item-card {
  display: flex;
  gap: 14px;
  background: #fff;
  border-radius: 20px;
  padding: 12px;
  align-items: stretch;
  border: 1px solid rgba(47, 107, 60, 0.06);
  box-shadow: 0 4px 18px rgba(30, 50, 25, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.cart-item-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(30, 50, 25, 0.06);
}

.cart-item-img-wrap {
  position: relative;
  flex-shrink: 0;
  width: 96px;
  height: 96px;
  border-radius: 14px;
  overflow: hidden;
  background: #f4f2ec;
}

.cart-item-img {
  width: 100%;
  height: 100%;
}

.cart-item-img-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.18) 0%,
    transparent 60%
  );
  pointer-events: none;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cart-item-title {
  font-family: "Playfair Display", serif;
  font-size: 16px;
  font-weight: 700;
  color: #1c2e1a;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cart-item-desc {
  font-size: 11px;
  color: #7a8c76;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cart-item-price {
  font-family: "Playfair Display", serif;
  font-size: 18px;
  font-weight: 700;
  color: #2f6b3c;
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.currency-symbol {
  font-family: "DM Sans", sans-serif;
  font-size: 13px;
  color: #5a6e57;
  font-weight: 600;
}

/* ── Qty pill ───────────────────────────────────────────────────────────── */
.qty-pill {
  display: flex;
  align-items: center;
  background: #f9f8f4;
  border: 1px solid rgba(47, 107, 60, 0.08);
  border-radius: 999px;
  padding: 3px;
  gap: 6px;
}

.qty-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid rgba(47, 107, 60, 0.1);
  color: #5a6e57;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-btn--plus {
  background: linear-gradient(135deg, #2f6b3c 0%, #1a4526 100%);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(47, 107, 60, 0.2);
}

.qty-val {
  font-weight: 700;
  font-size: 13px;
  color: #1c2e1a;
  min-width: 14px;
  text-align: center;
}

/* ── Chef note textarea ─────────────────────────────────────────────────── */
.instruction-textarea :deep(.v-field__outline) {
  --v-field-border-opacity: 0.1 !important;
}

.instruction-textarea :deep(.v-field) {
  border-radius: 12px !important;
  border: 1.5px solid rgba(47, 107, 60, 0.08) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02) !important;
  font-family: "DM Sans", sans-serif;
  font-size: 14px;
}

.instruction-textarea :deep(.v-field__outline::before),
.instruction-textarea :deep(.v-field__outline::after) {
  display: none !important;
}

/* ── Estimated wait card ────────────────────────────────────────────────── */
.wait-card {
  background: #f0f7f2;
  border: 1px solid #c6e9d3;
  border-radius: 14px;
  padding: 14px 16px;
}

/* ── Checkout panel ─────────────────────────────────────────────────────── */
.checkout-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  background: white;
  z-index: 100;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  box-shadow: 0 -4px 30px rgba(30, 50, 25, 0.08);
}

.divider-dashed {
  border-bottom: 1px dashed rgba(47, 107, 60, 0.15);
  height: 1px;
}

.checkout-btn {
  transition: transform 0.2s;
}

.checkout-btn:active {
  transform: scale(0.98);
}

/* ── Scroll padding so items aren't hidden behind checkout panel ─────────── */
.pb-cart {
  padding-bottom: 220px;
}

/* ── Success overlay card ───────────────────────────────────────────────── */
.success-card {
  border-radius: 28px !important;
  border: 1px solid rgba(47, 107, 60, 0.08);
  width: 100%;
  max-width: 360px;
}

.success-icon-box {
  width: 100px;
  height: 100px;
  background: rgba(47, 107, 60, 0.06);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(47, 107, 60, 0.12);
}

.wait-badge {
  background: #f0f7f2;
  border-radius: 16px;
  padding: 14px 28px;
  border: 1px solid #c6e9d3;
  width: 100%;
  text-align: center;
}

/* ── Status card inside success ─────────────────────────────────────────── */
.status-card {
  background: #f9f8f4;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(47, 107, 60, 0.08);
}

/* ── Countdown badge ────────────────────────────────────────────────────── */
.countdown-badge {
  min-width: 68px;
  text-align: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 14px;
  background: rgba(47, 107, 60, 0.08);
  color: #2f6b3c;
  border: 1px solid rgba(47, 107, 60, 0.15);
  font-family: "DM Sans", monospace;
  transition: all 0.3s ease;
}

.countdown-badge.active {
  background: rgba(47, 107, 60, 0.14);
  color: #1a4526;
  border-color: rgba(47, 107, 60, 0.3);
}

/* ── Progress dots ──────────────────────────────────────────────────────── */
.progress-dots {
  display: flex;
  gap: 6px;
}

.dot {
  flex: 1;
  height: 5px;
  border-radius: 999px;
  background: rgba(47, 107, 60, 0.12);
  transition: all 0.3s ease;
}

.dot.active {
  background: #2f6b3c;
  box-shadow: 0 0 8px rgba(47, 107, 60, 0.4);
}

/* ── Animations ─────────────────────────────────────────────────────────── */
.fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item-note-field :deep(.v-field) {
  border-radius: 10px !important;
  font-size: 12px;
  border: 1px dashed rgba(47, 107, 60, 0.25) !important;
}

.item-note-field :deep(.v-field__outline) {
  display: none !important;
}

.item-note-wrap {
  opacity: 0.85;
}

/* ── Utility ────────────────────────────────────────────────────────────── */
.w-100 {
  width: 100%;
}
</style>
