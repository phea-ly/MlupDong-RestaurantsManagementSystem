<template>
  <div class="cart-layout pb-24 fade-in">

    <!-- Header -->
    <div class="d-flex align-center bg-white pt-5 pb-4 px-4 position-sticky top-0 sticky-header z-10 elevation-0 justify-space-between">
      <v-btn icon="mdi-chevron-left" variant="flat" size="small" color="#f8fafb" class="border-subtle" @click="router.back()" />
      <div class="text-center">
        <div class="text-subtitle-1 font-weight-black text-grey-darken-4 mb-0">Order Summary</div>
        <div class="text-caption font-weight-bold text-green-darken-3 text-uppercase letter-spacing-1" style="font-size:10px;">
          Mlup Dong • Table {{ cartStore.tableNumber || '??' }}
        </div>
      </div>
      <v-btn icon="mdi-dots-vertical" variant="flat" size="small" color="#f8fafb" class="border-subtle" />
    </div>

    <!-- Empty state -->
    <div v-if="cartStore.items.length === 0 && !showSuccess" class="empty-state-container d-flex flex-column align-center justify-center px-10">
      <div class="empty-cart-illustration mb-8">
        <v-icon size="80" color="#215732" class="opacity-10">mdi-shopping-outline</v-icon>
      </div>
      <h3 class="text-h5 font-weight-black text-grey-darken-4 mb-2">Cart is empty</h3>
      <p class="text-body-2 text-grey-darken-1 text-center mb-8">Looks like you haven't added any meals yet.</p>
      <v-btn color="#215732" rounded="xl" block size="large" class="font-weight-bold elevation-4" @click="goBackToMenu">
        Browse Our Menu
      </v-btn>
    </div>

    <div v-else-if="!showSuccess" class="px-4 pt-6">

      <!-- Items list -->
      <div class="mb-4 d-flex align-center justify-space-between">
        <span class="text-subtitle-2 font-weight-black text-grey-darken-3">MY TRAY ({{ cartStore.cartCount }})</span>
        <v-btn variant="text" size="x-small" color="red-darken-1" class="font-weight-bold" @click="cartStore.clearCart">
          Clear All
        </v-btn>
      </div>

      <v-card
        v-for="item in cartStore.items" :key="item.id"
        class="cart-item-card rounded-2xl pa-3 mb-4 d-flex align-stretch border-subtle"
        elevation="0"
      >
        <v-img
          :src="item.image || fallbackImg" width="90" height="90"
          class="rounded-xl mr-4 flex-shrink-0 bg-slate-50 border-subtle" cover
        />
        <div class="flex-grow-1 d-flex flex-column justify-center py-1">
          <div class="d-flex justify-space-between align-start mb-1">
            <span class="font-weight-black text-grey-darken-4" style="font-size:15px;line-height:1.2;">{{ item.name }}</span>
            <v-icon size="18" color="grey-lighten-1" class="ml-2 mt-n1" @click="cartStore.removeFromCart(item.id)">
              mdi-close-circle-outline
            </v-icon>
          </div>
          <div class="text-caption text-grey-darken-1 mb-3">Fresh ingredients • Best quality</div>
          <div class="d-flex justify-space-between align-center mt-auto">
            <div class="font-weight-black text-green-darken-4 text-subtitle-1">${{ item.price.toFixed(2) }}</div>
            <div class="qty-pill d-flex align-center rounded-pill px-1 border-subtle py-1 bg-slate-50">
              <v-btn
                icon size="24" variant="flat" color="white" class="border-subtle"
                :disabled="item.quantity <= 1"
                @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
              >
                <v-icon size="14" color="grey-darken-3">mdi-minus</v-icon>
              </v-btn>
              <div class="px-4 font-weight-black text-body-2">{{ item.quantity }}</div>
              <v-btn
                icon size="24" variant="flat" color="#215732" class="elevation-1"
                @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
              >
                <v-icon size="14" color="white">mdi-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </v-card>

      <!-- Chef note -->
      <v-card class="rounded-2xl pa-5 mb-8 border-subtle mt-8 bg-white shadow-soft" elevation="0">
        <div class="d-flex align-center mb-4">
          <div class="icon-circle mr-3">
            <v-icon color="#215732" size="20">mdi-chef-hat</v-icon>
          </div>
          <div class="text-subtitle-1 font-weight-black text-grey-darken-4">Note to the Chef</div>
        </div>
        <v-textarea
          v-model="cartStore.specialInstructions"
          placeholder="e.g. No onions, extra spicy, or allergy details..."
          variant="filled" bg-color="#f8fafb" rounded="xl"
          hide-details auto-grow rows="3" color="#215732" flat
        />
      </v-card>
    </div>

    <!-- Checkout panel -->
    <v-slide-y-reverse-transition>
      <div v-if="cartStore.items.length > 0 && !showSuccess" class="checkout-panel rounded-t-3xl pt-8 pb-10 px-6">

        <!-- Estimated wait time -->
        <v-card class="wait-time-card rounded-xl pa-4 mb-6 d-flex align-center ga-3" color="#f0f7f2" elevation="0">
          <v-icon color="#215732" size="28">mdi-clock-outline</v-icon>
          <div>
            <div class="text-caption text-grey-darken-1 font-weight-bold">Estimated wait time</div>
            <div class="text-h6 font-weight-black text-green-darken-4">
              {{ estimatedWait ? `~${estimatedWait} min` : 'Calculating...' }}
            </div>
          </div>
          <v-spacer />
          <div class="text-caption text-grey text-right" style="max-width:90px;line-height:1.3;">
            {{ activeOrdersAhead }} orders ahead
          </div>
        </v-card>

        <!-- Billing breakdown -->
        <div class="billing-details mb-8">
          <div class="d-flex justify-space-between mb-3 px-1">
            <span class="text-body-2 text-grey-darken-1 font-weight-bold">Subtotal</span>
            <span class="text-body-2 font-weight-black text-grey-darken-4">${{ cartStore.cartSubtotal.toFixed(2) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-3 px-1">
            <span class="text-body-2 text-grey-darken-1 font-weight-bold">Service Tax (10%)</span>
            <span class="text-body-2 font-weight-black text-grey-darken-4">${{ cartStore.cartTax.toFixed(2) }}</span>
          </div>
          <v-divider class="my-4 border-dashed border-opacity-25" />
          <div class="d-flex justify-space-between align-center px-1">
            <span class="text-h6 font-weight-black text-grey-darken-4">Total Amount</span>
            <span class="text-h5 font-weight-black text-green-accent-4">${{ cartStore.cartTotal.toFixed(2) }}</span>
          </div>
        </div>

        <v-btn
          color="#215732" rounded="xl" block size="x-large"
          class="font-weight-black elevation-8 checkout-btn py-7"
          :loading="isPlacingOrder"
          @click="placeOrder"
        >
          <span class="mr-2">CONFIRM & PLACE ORDER</span>
          <v-icon size="22" class="pulse-icon">mdi-silverware-variant</v-icon>
        </v-btn>

        <div class="text-center mt-5">
          <v-chip size="x-small" variant="flat" color="#f0f4f2" class="text-grey-darken-1 font-weight-bold px-4">
            <v-icon start size="12">mdi-lock-outline</v-icon> SECURE ORDERING
          </v-chip>
        </div>
      </div>
    </v-slide-y-reverse-transition>

    <!-- Success overlay -->
    <v-overlay v-model="showSuccess" class="align-center justify-center p-0" scrim="#133021" persistent>
      <v-card class="pa-0 text-center rounded-3xl overflow-hidden glass-success" width="340">
        <div class="pa-10 d-flex flex-column align-center">
          <div class="success-icon-box mb-6">
            <v-icon color="#00e676" size="50">mdi-check-decagram</v-icon>
          </div>
          <h2 class="text-h5 font-weight-black mb-2 text-white">Order Received!</h2>
          <p class="text-body-2 text-green-lighten-4 mb-4">
            Your order has been sent to the kitchen. Please relax and stay seated.
          </p>

          <!-- Confirmed wait time -->
          <v-card class="rounded-xl pa-4 mb-6 w-100" color="rgba(255,255,255,0.12)" elevation="0">
            <div class="d-flex align-center justify-center ga-2">
              <v-icon color="#00e676" size="22">mdi-clock-check-outline</v-icon>
              <div class="text-white">
                <div class="text-caption" style="opacity:0.75;">Estimated wait</div>
                <div class="text-h6 font-weight-black">~{{ confirmedWaitMinutes }} min</div>
              </div>
            </div>
          </v-card>

          <v-btn color="white" block rounded="xl" size="large" class="text-green-darken-4 font-weight-bold" @click="goBackToMenu">
            Back to Menu
          </v-btn>
        </div>
      </v-card>
    </v-overlay>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCartStore } from "@/stores/cart.store";
import { kdsApi } from "@/api/order.api";

const router    = useRouter();
const route     = useRoute();
const cartStore = useCartStore();

const fallbackImg          = "https://images.unsplash.com/photo-1548943487-a2e4142f6ab3?q=80&w=600&auto=format&fit=crop";
const isPlacingOrder       = ref(false);
const showSuccess          = ref(false);
const activeOrdersAhead    = ref(0);
const estimatedWait        = ref(null);
const confirmedWaitMinutes = ref(0);

onMounted(async () => {
  const token = route.params.token;
  if (token && !cartStore.tableId) {
    cartStore.setTableId(token, token);
  }

  await fetchQueueDepth();
});

async function fetchQueueDepth() {
  try {
    const { data } = await kdsApi.getActiveOrders();
    activeOrdersAhead.value = data.filter((o) =>
      ["new", "received", "confirmed", "preparing"].includes(o.order_status),
    ).length;
    estimatedWait.value = cartStore.calcEstimatedWait(activeOrdersAhead.value);
  } catch {
    estimatedWait.value = 15; // safe fallback if the KDS endpoint is unreachable
  }
}

async function placeOrder() {
  if (cartStore.items.length === 0) return;

  if (!cartStore.tableId) {
    alert("Table information is missing. Please scan the QR code again.");
    return;
  }

  isPlacingOrder.value       = true;
  confirmedWaitMinutes.value = estimatedWait.value ?? 15;

  const result = await cartStore.placeOrder({
    order_type: "dine_in",
    table_id:   cartStore.tableId,
  });

  isPlacingOrder.value = false;

  if (result.success) {
    showSuccess.value = true;
  } else {
    alert("Error: " + result.message);
  }
}

function goBackToMenu() {
  showSuccess.value = false;
  // Navigate back to the menu keeping the token in the URL
  router.replace({ name: "customer-menu", params: { token: route.params.token } });
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

.cart-layout {
  font-family: 'Outfit', sans-serif; max-width: 480px; margin: 0 auto;
  background-color: #fcfdfe; min-height: 100vh; position: relative; overflow-x: hidden;
}
.sticky-header { box-shadow: 0 4px 20px rgba(0,0,0,0.02) !important; border-bottom: 1px solid #f1f5f9; }
.empty-state-container { height: calc(100vh - 150px); }

.empty-cart-illustration {
  width: 140px; height: 140px; background: #f0f7f2;
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  display: flex; align-items: center; justify-content: center;
  animation: blobify 8s infinite ease-in-out;
}
@keyframes blobify {
  0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
  50%       { border-radius: 60% 40% 30% 70% / 50% 60% 40% 60%; }
}

.cart-item-card { background-color: white !important; transition: transform 0.2s ease; }
.cart-item-card:active { transform: scale(0.98); }
.border-subtle { border: 1px solid #f1f5f9 !important; }
.bg-slate-50   { background-color: #f8fafc !important; }
.qty-pill      { height: 36px; }
.icon-circle   { width: 36px; height: 36px; background-color: #f0f7f2; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.shadow-soft   { box-shadow: 0 10px 30px rgba(0,0,0,0.03) !important; }

.checkout-panel {
  position: fixed; bottom: 0; left: 0; right: 0;
  max-width: 480px; margin: 0 auto; background: white; z-index: 100;
  border-radius: 32px 32px 0 0;
  box-shadow: 0 -15px 50px rgba(0,0,0,0.07) !important;
}
.wait-time-card { border: 1px solid #c6e9d3 !important; }
.checkout-btn   { background: linear-gradient(135deg, #215732 0%, #153820 100%) !important; }
.pulse-icon     { animation: pulse 2s infinite linear; }
@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }

.glass-success {
  background: rgba(33, 87, 50, 0.9) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5) !important;
}
.success-icon-box {
  width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(255,255,255,0.2);
}

.fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.letter-spacing-1 { letter-spacing: 1.5px; }
.rounded-2xl   { border-radius: 18px !important; }
.rounded-3xl   { border-radius: 24px !important; }
.rounded-t-3xl { border-top-left-radius: 32px !important; border-top-right-radius: 32px !important; }
.border-dashed { border-style: dashed !important; border-color: #cbd5e1 !important; }
.w-100         { width: 100%; }
</style>