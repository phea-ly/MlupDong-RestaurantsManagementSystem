<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute }         from 'vue-router'
import { useCartStore }                from '@/stores/cart.store'
import { kdsApi }                      from '@/api/order.api'

const router    = useRouter()
const route     = useRoute()
const cartStore = useCartStore()

const fallbackImg          = 'https://images.unsplash.com/photo-1548943487-a2e4142f6ab3?q=80&w=600&auto=format&fit=crop'
const isPlacingOrder       = ref(false)
const showSuccess          = ref(false)
const activeOrdersAhead    = ref(0)
const estimatedWait        = ref(null)
const confirmedWaitMinutes = ref(0)
const countdownSeconds     = ref(0)
let countdownTimer         = null

const displayTableNumber = computed(() => {
  const num = String(cartStore.tableNumber || '??')
  if (num.length > 8 && num !== '??') {
    return `${num.substring(0, 4)}...${num.slice(-4)}`
  }
  return num
})

onMounted(async () => {
  const token = route.params.token
  if (token && !cartStore.tableId) {
    cartStore.setTableId(token, token)
  }
  await fetchQueueDepth()
})

onUnmounted(() => {
  cartStore.leaveTableChannel()
  stopCountdown()
})

async function fetchQueueDepth() {
  try {
    const { data } = await kdsApi.getActiveOrders()
    activeOrdersAhead.value = data.filter(o =>
      ['new', 'received', 'confirmed', 'preparing'].includes(o.order_status)
    ).length
    estimatedWait.value = cartStore.calcEstimatedWait(activeOrdersAhead.value)
  } catch {
    estimatedWait.value = 15
  }
}

async function placeOrder() {
  if (!cartStore.items.length) return
  if (!cartStore.tableId) {
    alert('Table information is missing. Please scan the QR code again.')
    return
  }

  isPlacingOrder.value       = true
  confirmedWaitMinutes.value = estimatedWait.value ?? 15

  const result = await cartStore.placeOrder({
    order_type: 'dine_in',
    table_id:   cartStore.tableId,
  })

  isPlacingOrder.value = false

  if (result.success) {
    // Use server's wait estimate if provided
    if (result.data?.estimated_wait_minutes) {
      confirmedWaitMinutes.value = result.data.estimated_wait_minutes
    }
    showSuccess.value = true
  } else {
    alert('Error: ' + result.message)
  }
}

function goBackToMenu() {
  showSuccess.value = false
  router.replace({ name: 'customer-menu', params: { token: route.params.token } })
}

function startCountdown(minutes) {
  stopCountdown()
  const safeMinutes = Number.isFinite(minutes) ? minutes : 0
  countdownSeconds.value = Math.max(0, Math.round(safeMinutes * 60))
  if (countdownSeconds.value <= 0) return
  countdownTimer = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value -= 1
    } else {
      stopCountdown()
    }
  }, 1000)
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const countdownDisplay = computed(() => {
  const total = countdownSeconds.value
  const mins  = Math.floor(total / 60)
  const secs  = total % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const isCountingDown = computed(() => countdownSeconds.value > 0)

const statusStep = computed(() => {
  const status = cartStore.lastOrder?.order_status
  if (status === 'confirmed') return 2
  if (status === 'preparing') return 3
  if (status === 'ready' || status === 'served' || status === 'completed') return 4
  return 1
})

const statusText = computed(() => {
  const status = cartStore.lastOrder?.order_status
  if (status === 'received') return 'Kitchen received your order'
  if (status === 'confirmed') return 'Chef confirmed - starting soon'
  if (status === 'preparing') return 'Cooking now'
  if (status === 'ready') return 'Ready to serve'
  if (status === 'served') return 'Served'
  if (status === 'completed') return 'Completed'
  if (status === 'cancelled') return 'Order cancelled'
  return 'Order sent - waiting for kitchen'
})

watch(
  () => cartStore.lastOrder?.order_status,
  (status) => {
    if (status === 'confirmed' || status === 'preparing') {
      if (showSuccess.value && !isCountingDown.value) {
        const baseMinutes = confirmedWaitMinutes.value || cartStore.lastOrder?.estimated_wait_minutes || 15
        startCountdown(baseMinutes)
      }
    }
    if (status === 'ready' || status === 'served' || status === 'completed' || status === 'cancelled') {
      stopCountdown()
    }
  },
  { immediate: true }
)

watch(showSuccess, (val) => {
  if (!val) {
    stopCountdown()
    return
  }
  const status = cartStore.lastOrder?.order_status
  if ((status === 'confirmed' || status === 'preparing') && !isCountingDown.value) {
    const baseMinutes = confirmedWaitMinutes.value || cartStore.lastOrder?.estimated_wait_minutes || 15
    startCountdown(baseMinutes)
  }
})
</script>

<template>
  <div class="cart-layout pb-24 fade-in">

    <!-- Header -->
    <div class="d-flex align-center px-4 py-3 sticky-header elevation-0">
      <v-btn icon="mdi-arrow-left" variant="text" size="small" color="#1c2e1a" @click="$router.back()"></v-btn>
      <div class="d-flex flex-column ml-3 flex-grow-1">
        <div class="header-title" style="line-height: 1;">Your Cart</div>
        <div class="font-weight-bold text-uppercase mt-1" style="font-size: 9px; color: #2f6b3c; letter-spacing: 1.5px;">
          Mlup Dong • Table {{ displayTableNumber }}
        </div>
      </div>
    </div>

    <!-- Empty cart -->
    <div v-if="cartStore.items.length === 0 && !showSuccess" class="empty-state d-flex flex-column align-center justify-center px-8">
      <div class="empty-blob mb-8 d-flex align-center justify-center rounded-circle" style="width:120px; height:120px; background: rgba(47, 107, 60, 0.08);">
        <v-icon size="64" color="#2f6b3c">mdi-cart-outline</v-icon>
      </div>
      <h3 class="header-title text-center mb-2" style="font-size: 24px;">Your Cart is Empty</h3>
      <p class="text-body-1 text-center mb-8" style="color: #7a8c76;">Add something delicious to your tray!</p>
      <v-btn class="brand-btn text-white mt-2" rounded="pill" elevation="0" @click="goBackToMenu" height="54" width="100%" style="max-width: 280px; flex: 0 0 auto;">
        <span style="letter-spacing: 1px; font-weight: 700; font-size: 14px;">BROWSE MENU</span>
      </v-btn>
    </div>

    <!-- Cart items -->
    <div v-else-if="!showSuccess" class="px-4 pt-6">

      <v-card
        v-for="item in cartStore.items" :key="item.id"
        class="cart-item-card mb-4" elevation="0"
      >
        <div class="cart-item-img-wrap">
          <v-img :src="item.image || fallbackImg" cover class="cart-item-img" />
          <div class="cart-item-img-shine" />
        </div>

        <div class="cart-item-info">
          <div class="d-flex justify-space-between align-start mb-1">
            <div class="cart-item-title pr-2">{{ item.name }}</div>
            <v-icon size="20" color="#a0b39c" class="flex-shrink-0 opacity-80" style="cursor:pointer; margin-top:2px;" @click="cartStore.removeFromCart(item.id)">
              mdi-close-circle
            </v-icon>
          </div>
          
          <div class="cart-item-desc mb-3">
            Fresh ingredients - Best quality
          </div>

          <div class="d-flex justify-space-between align-end mt-auto">
            <div class="cart-item-price">
              <span class="currency-symbol">$</span>{{ item.price.toFixed(2) }}
            </div>
            
            <div class="qty-pill">
              <button class="qty-btn" :disabled="item.quantity <= 1" @click="cartStore.updateQuantity(item.id, item.quantity - 1)">
                <v-icon size="14">mdi-minus</v-icon>
              </button>
              <div class="qty-val">{{ item.quantity }}</div>
              <button class="qty-btn qty-btn--plus" @click="cartStore.updateQuantity(item.id, item.quantity + 1)">
                <v-icon size="14">mdi-plus</v-icon>
              </button>
            </div>
          </div>
        </div>
      </v-card>

      <!-- Chef note -->
      <div class="mt-8 mb-3 d-flex align-center px-1">
        <v-icon color="#2f6b3c" size="20" class="mr-2">mdi-note-edit-outline</v-icon>
        <span class="text-brand-dark font-weight-bold" style="font-size: 13px;">Special Instructions for the Chef</span>
      </div>
      <v-textarea
        v-model="cartStore.specialInstructions"
        placeholder="Allergies, specific requests, or how you like your spice level..."
        variant="outlined" bg-color="white"
        hide-details auto-grow rows="4" color="#2f6b3c"
        class="instruction-textarea mb-8"
      />
    </div>

    <!-- Checkout panel -->
    <v-slide-y-reverse-transition>
      <div v-if="cartStore.items.length > 0 && !showSuccess" class="checkout-panel bg-white pt-4 pb-4 px-6">
        
        <div class="d-flex justify-space-between mb-2">
          <span class="text-caption" style="color: #7a8c76;">Subtotal</span>
          <span class="text-caption font-weight-bold text-brand-dark">${{ cartStore.cartSubtotal.toFixed(2) }}</span>
        </div>
        <div class="d-flex justify-space-between mb-3">
          <span class="text-caption" style="color: #7a8c76;">Tax (10%)</span>
          <span class="text-caption font-weight-bold text-brand-dark">${{ cartStore.cartTax.toFixed(2) }}</span>
        </div>
        
        <div class="divider-dashed my-3"></div>
        
        <div class="d-flex justify-space-between align-center mb-5 mt-3">
          <span class="header-title" style="font-size: 18px;">Total Amount</span>
          <span class="price-text" style="font-size: 24px;">${{ cartStore.cartTotal.toFixed(2) }}</span>
        </div>

        <v-btn
          rounded="pill" 
          block 
          height="52"
          class="checkout-btn brand-btn text-white elevation-0 mb-3"
          :loading="isPlacingOrder"
          @click="placeOrder"
          style="letter-spacing: 1px; font-weight: 600; font-size: 14px;"
        >
          <span>PLACE ORDER</span>
          <v-icon size="20" class="ml-3">mdi-rocket-launch-outline</v-icon>
        </v-btn>

        <div class="text-center text-uppercase" style="font-size: 9px; color: #9aab96; letter-spacing: 0.5px; font-weight: 600;">
          By placing order you agree to our terms of service
        </div>
      </div>
    </v-slide-y-reverse-transition>

    <!-- Success overlay (Styled slightly to align) -->
    <v-overlay v-model="showSuccess" class="align-center justify-center px-4" scrim="rgba(244, 242, 236, 0.95)" persistent>
      <v-card class="pa-0 text-center rounded-3xl overflow-hidden bg-white mx-auto border-subtle" width="100%" max-width="360" elevation="12">
        <div class="pa-8 d-flex flex-column align-center">
          
          <div class="success-icon-box mb-6 position-relative">
            <v-icon color="#2f6b3c" size="64">mdi-check-circle-outline</v-icon>
          </div>
          
          <h2 class="header-title mb-2">Order Sent!</h2>
          <p class="text-body-2 mb-6" style="color: #7a8c76;">
            Relax and sit tight while we prepare your meal.
          </p>

          <div class="text-center mb-6">
            <div class="text-caption font-weight-bold text-uppercase" style="opacity:0.7; font-size: 10px; color: #1c2e1a;">Estimated wait</div>
            <div class="price-text" style="font-size: 36px; line-height: 1;">~{{ confirmedWaitMinutes }}m</div>
          </div>

          <v-card class="rounded-xl pa-5 mb-6 w-100 text-left border-subtle" color="#f9f8f4" elevation="0">
            <div class="d-flex align-center justify-space-between mb-2">
              <div>
                <div class="text-caption font-weight-bold text-uppercase" style="opacity:0.7; font-size: 10px; color: #1c2e1a;">Kitchen Status</div>
                <div class="text-body-2 font-weight-bold text-brand-dark">{{ statusText }}</div>
              </div>
            </div>
          </v-card>

          <v-btn block rounded="pill" size="large" class="brand-btn text-white elevation-0 text-none" @click="goBackToMenu" style="font-weight: 600;">
            Back to Menu
          </v-btn>
        </div>
      </v-card>
    </v-overlay>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

.cart-layout { 
  font-family: 'DM Sans', sans-serif; 
  background: #f4f2ec;
  max-width: 480px; 
  margin: 0 auto; 
  min-height: 100vh; 
  position: relative; 
  overflow-x: hidden; 
}

/* Typography styles matching menu */
.header-title {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  color: #1c2e1a;
  font-size: 20px;
}
.price-text {
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  color: #2f6b3c;
  font-size: 18px;
}
.text-brand-dark { color: #1c2e1a !important; }

/* Global Brand Button (Menu) */
.brand-btn {
  background: linear-gradient(135deg, #2f6b3c 0%, #1a4526 100%) !important;
  box-shadow: 0 4px 16px rgba(47,107,60,.2) !important;
}

/* Animations */
.fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* Header */
.sticky-header { 
  position: sticky; 
  top: 0; 
  z-index: 50; 
  background: #f4f2ec;
  border-bottom: 1px solid rgba(47,107,60,.10) !important;
  box-shadow: 0 4px 24px rgba(30,50,25,.03);
}

/* Empty State */
.empty-state { height: calc(100vh - 120px); }

/* Cart Items & Cards */
.cart-item-card { 
  display: flex;
  gap: 14px;
  background: #fff;
  border-radius: 20px;
  padding: 12px;
  align-items: stretch;
  border: 1px solid rgba(47,107,60,.06) !important;
  box-shadow: 0 4px 18px rgba(30,50,25,.04) !important;
  transition: transform .2s ease, box-shadow .2s ease;
}
.cart-item-card:active { 
  transform: scale(.98); 
  box-shadow: 0 2px 8px rgba(30,50,25,.06) !important; 
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
  background: linear-gradient(135deg, rgba(255,255,255,.18) 0%, transparent 60%);
  pointer-events: none;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cart-item-title {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 700;
  color: #1c2e1a;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cart-item-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: #7a8c76;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cart-item-price {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: #2f6b3c;
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.currency-symbol {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #5a6e57;
  font-weight: 600;
}

/* Custom Qty Pill */
.qty-pill {
  display: flex;
  align-items: center;
  background: #f9f8f4;
  border: 1px solid rgba(47,107,60,.08);
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
  border: 1px solid rgba(47,107,60,.1);
  color: #5a6e57;
  cursor: pointer;
  transition: all .2s;
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
  box-shadow: 0 4px 12px rgba(47,107,60,.2);
}

.qty-val {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  color: #1c2e1a;
  min-width: 14px;
  text-align: center;
}

/* Chef Note */
.instruction-textarea :deep(.v-field__outline) {
  --v-field-border-opacity: 0.1 !important;
}
.instruction-textarea :deep(.v-field) {
  border-radius: 12px !important;
  border: 1.5px solid rgba(47,107,60,.08) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,.02) !important;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
}
.instruction-textarea :deep(.v-field__outline::before),
.instruction-textarea :deep(.v-field__outline::after) {
  display: none !important;
}

/* Checkout Panel */
.checkout-panel { 
  position: fixed; 
  bottom: 0; left: 0; right: 0; 
  max-width: 480px; 
  margin: 0 auto; 
  background: white; 
  z-index: 100; 
  box-shadow: 0 -4px 30px rgba(30,50,25,.07) !important; 
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.divider-dashed { border-bottom: 1px dashed rgba(47,107,60,.15); height: 1px; }

.checkout-btn { transition: transform 0.2s; }
.checkout-btn:active { transform: scale(0.98); }

/* Utility constraints */
.pb-24 { padding-bottom: 220px; } 
</style>


