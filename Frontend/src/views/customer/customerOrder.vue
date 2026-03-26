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
const countdownTotal       = ref(0)
let countdownTimer         = null

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
  countdownTotal.value   = countdownSeconds.value
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
const countdownProgress = computed(() => {
  if (!countdownTotal.value) return 0
  return Math.max(0, Math.min(1, countdownSeconds.value / countdownTotal.value))
})

const statusStep = computed(() => {
  const status = cartStore.lastOrder?.order_status
  if (status === 'confirmed') return 2
  if (status === 'preparing') return 3
  if (status === 'ready' || status === 'served' || status === 'completed') return 4
  return 1
})

const statusLabels = computed(() => ([
  { key: 'pending',   label: 'Pending'  },
  { key: 'cooking',   label: 'Cooking'  },
  { key: 'ready',     label: 'Ready'    },
  { key: 'served',    label: 'Served'   },
]))

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
    <div class="d-flex align-center bg-white pt-4 pb-3 px-4 sticky-header justify-space-between">
      <v-btn icon="mdi-chevron-left" variant="flat" size="small" color="#f3f5f7" class="border-subtle" @click="$router.back()" />
      <div class="text-center">
        <div class="text-subtitle-1 font-weight-black text-grey-darken-4">Order Summary</div>
        <div class="text-caption font-weight-bold text-green-darken-3 text-uppercase" style="font-size:10px;letter-spacing:1.5px">
          Mlup Dong - Table {{ cartStore.tableNumber || '??' }}
        </div>
      </div>
      <v-btn icon="mdi-dots-vertical" variant="flat" size="small" color="#f3f5f7" class="border-subtle" />
    </div>

    <!-- Empty cart -->
    <div v-if="cartStore.items.length === 0 && !showSuccess" class="empty-state d-flex flex-column align-center justify-center px-10">
      <div class="empty-blob mb-8">
        <v-icon size="80" color="#215732" style="opacity:.1">mdi-shopping-outline</v-icon>
      </div>
      <h3 class="text-h5 font-weight-black text-grey-darken-4 mb-2">Cart is empty</h3>
      <p class="text-body-2 text-grey-darken-1 text-center mb-8">Looks like you haven't added any meals yet.</p>
      <v-btn color="#215732" rounded="xl" block size="large" class="font-weight-bold elevation-4" @click="goBackToMenu">
        Browse Our Menu
      </v-btn>
    </div>

    <!-- Cart items -->
    <div v-else-if="!showSuccess" class="px-4 pt-6">

      <div class="mb-4 d-flex align-center justify-space-between">
        <span class="text-subtitle-2 font-weight-black text-grey-darken-3">
          MY TRAY ({{ cartStore.cartCount }})
        </span>
        <v-btn variant="text" size="x-small" color="red-darken-1" class="font-weight-bold" @click="cartStore.clearCart">
          Clear All
        </v-btn>
      </div>

      <v-card
        v-for="item in cartStore.items" :key="item.id"
        class="cart-item-card rounded-2xl pa-3 mb-4 d-flex align-stretch border-subtle" elevation="0"
      >
        <v-img :src="item.image || fallbackImg" width="88" height="88" class="rounded-xl mr-4 flex-shrink-0 border-subtle" cover />
        <div class="flex-grow-1 d-flex flex-column justify-center py-1">
          <div class="d-flex justify-space-between align-start mb-1">
            <span class="font-weight-black text-grey-darken-4" style="font-size:15px;line-height:1.2">{{ item.name }}</span>
            <v-icon size="18" color="grey-lighten-1" class="ml-2" style="cursor:pointer" @click="cartStore.removeFromCart(item.id)">
              mdi-close-circle-outline
            </v-icon>
          </div>
          <div class="text-caption text-grey-darken-1 mb-3">Fresh ingredients - Best quality</div>
          <div class="d-flex justify-space-between align-center mt-auto">
            <div class="font-weight-black text-green-darken-4 text-subtitle-1">${{ item.price.toFixed(2) }}</div>
            <div class="qty-pill d-flex align-center rounded-pill px-1 border-subtle py-1 bg-slate-50">
              <v-btn icon size="24" variant="flat" color="white" class="border-subtle"
                :disabled="item.quantity <= 1"
                @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
              >
                <v-icon size="14" color="grey-darken-3">mdi-minus</v-icon>
              </v-btn>
              <div class="px-4 font-weight-black text-body-2">{{ item.quantity }}</div>
              <v-btn icon size="24" variant="flat" color="#215732" class="elevation-1"
                @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
              >
                <v-icon size="14" color="white">mdi-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </v-card>

      <!-- Chef note -->
      <v-card class="rounded-2xl pa-5 mb-8 border-subtle mt-6 bg-white" elevation="0">
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
      <div v-if="cartStore.items.length > 0 && !showSuccess" class="checkout-panel rounded-t-3xl pt-7 pb-9 px-6">

        <!-- Estimated wait -->
        <v-card class="wait-time-card rounded-xl pa-4 mb-5 d-flex align-center ga-3" color="#f0f7f2" elevation="0">
          <v-icon color="#215732" size="28">mdi-clock-outline</v-icon>
          <div>
            <div class="text-caption text-grey-darken-1 font-weight-bold">Estimated wait time</div>
            <div class="text-h6 font-weight-black text-green-darken-4">
              {{ estimatedWait ? `~${estimatedWait} min` : 'Calculating...' }}
            </div>
          </div>
          <v-spacer />
          <div class="text-caption text-grey text-right" style="max-width:90px;line-height:1.3">
            {{ activeOrdersAhead }} orders ahead
          </div>
        </v-card>

        <!-- Billing -->
        <div class="billing-details mb-7">
          <div class="d-flex justify-space-between mb-3 px-1">
            <span class="text-body-2 text-grey-darken-1 font-weight-bold">Subtotal</span>
            <span class="text-body-2 font-weight-black">${{ cartStore.cartSubtotal.toFixed(2) }}</span>
          </div>
          <div class="d-flex justify-space-between mb-3 px-1">
            <span class="text-body-2 text-grey-darken-1 font-weight-bold">Service Tax (10%)</span>
            <span class="text-body-2 font-weight-black">${{ cartStore.cartTax.toFixed(2) }}</span>
          </div>
          <v-divider class="my-4" style="border-style:dashed;border-color:#cbd5e1" />
          <div class="d-flex justify-space-between align-center px-1">
            <span class="text-h6 font-weight-black text-grey-darken-4">Total Amount</span>
            <span class="text-h5 font-weight-black text-green-darken-4">${{ cartStore.cartTotal.toFixed(2) }}</span>
          </div>
        </div>

        <v-btn
          color="#215732" rounded="xl" block size="x-large"
          class="font-weight-black elevation-8 checkout-btn py-6"
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
    <v-overlay v-model="showSuccess" class="align-center justify-center" scrim="#133021" persistent>
      <v-card class="pa-0 text-center rounded-3xl overflow-hidden glass-success" width="340">
        <div class="pa-10 d-flex flex-column align-center">
          <div class="success-icon-box mb-6">
            <v-icon color="#00e676" size="50">mdi-check-decagram</v-icon>
          </div>
          <h2 class="text-h5 font-weight-black mb-2 text-white">Order Received!</h2>
          <p class="text-body-2 text-green-lighten-4 mb-4">
            Your order has been sent to the kitchen. Please relax and stay seated.
          </p>

          <v-card class="rounded-xl pa-4 mb-4 w-100" color="rgba(255,255,255,0.12)" elevation="0">
            <div class="d-flex align-center justify-center ga-4">
              <div
                class="wait-ring"
                :class="{ active: isCountingDown }"
                :style="{ '--p': countdownProgress }"
              >
                <div class="wait-ring-inner">
                  <div class="text-caption" style="opacity:.75">Live</div>
                  <div class="text-subtitle-1 font-weight-black">{{ isCountingDown ? countdownDisplay : '--:--' }}</div>
                </div>
              </div>
              <div class="text-white text-left">
                <div class="text-caption" style="opacity:.75">Estimated wait</div>
                <div class="text-h6 font-weight-black">~{{ confirmedWaitMinutes }} min</div>
                <div class="text-caption" style="opacity:.7">Updates live</div>
              </div>
            </div>
          </v-card>

          <v-card class="rounded-xl pa-4 mb-4 w-100 status-card" color="rgba(255,255,255,0.14)" elevation="0">
            <div class="d-flex align-center justify-space-between">
              <div class="text-left">
                <div class="text-caption text-green-lighten-4" style="opacity:.8">Kitchen status</div>
                <div class="text-body-2 text-white font-weight-bold">{{ statusText }}</div>
              </div>
              <div class="countdown-badge" :class="{ active: isCountingDown }">
                {{ isCountingDown ? countdownDisplay : '--:--' }}
              </div>
            </div>
            <div class="progress-dots mt-3">
              <span class="dot" :class="{ active: statusStep >= 1 }"></span>
              <span class="dot" :class="{ active: statusStep >= 2 }"></span>
              <span class="dot" :class="{ active: statusStep >= 3 }"></span>
              <span class="dot" :class="{ active: statusStep >= 4 }"></span>
            </div>
            <div class="status-steps mt-3">
              <div
                v-for="(s, idx) in statusLabels" :key="s.key"
                class="status-step"
                :class="{ active: statusStep >= (idx + 1) }"
              >
                {{ s.label }}
              </div>
            </div>
            <div class="text-caption text-green-lighten-4 mt-2" style="opacity:.8">
              Countdown starts when the chef confirms cooking.
            </div>
          </v-card>

          <!-- Show order number if available -->
          <div v-if="cartStore.lastOrder" class="text-caption text-green-lighten-3 mb-6">
            Order {{ cartStore.lastOrder.order_number }}
          </div>

          <v-btn color="white" block rounded="xl" size="large" class="text-green-darken-4 font-weight-bold" @click="goBackToMenu">
            Back to Menu
          </v-btn>
        </div>
      </v-card>
    </v-overlay>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
.cart-layout { font-family:'Outfit',sans-serif; max-width:480px; margin:0 auto; background:#f6f7fb; min-height:100vh; position:relative; overflow-x:hidden; }
.sticky-header { position:sticky; top:0; z-index:10; box-shadow:0 6px 16px rgba(0,0,0,.06); border-bottom:1px solid #eef2f0; }
.empty-state { height:calc(100vh - 150px); }
.empty-blob { width:140px; height:140px; background:#f0f7f2; border-radius:40% 60% 70% 30%/40% 50% 60% 50%; display:flex; align-items:center; justify-content:center; animation:blobify 8s infinite ease-in-out; }
@keyframes blobify { 0%,100%{border-radius:40% 60% 70% 30%/40% 50% 60% 50%} 50%{border-radius:60% 40% 30% 70%/50% 60% 40% 60%} }
.cart-item-card { background:#fff !important; transition:transform .2s; box-shadow:0 8px 20px rgba(0,0,0,.06); }
.cart-item-card:active { transform:scale(.98); }
.border-subtle { border:1px solid #edf1f5 !important; }
.bg-slate-50 { background:#f8fafc !important; }
.qty-pill { height:36px; }
.icon-circle { width:36px; height:36px; background:#f0f7f2; border-radius:12px; display:flex; align-items:center; justify-content:center; }
.checkout-panel { position:fixed; bottom:0; left:0; right:0; max-width:480px; margin:0 auto; background:white; z-index:100; border-radius:28px 28px 0 0; box-shadow:0 -18px 40px rgba(0,0,0,.08) !important; }
.wait-time-card { border:1px solid #c6e9d3 !important; }
.checkout-btn { background:linear-gradient(135deg,#215732 0%,#153820 100%) !important; }
.pulse-icon { animation:pulse 2s infinite linear; }
@keyframes pulse { 0%{transform:scale(1);opacity:1} 50%{transform:scale(1.1);opacity:.8} 100%{transform:scale(1);opacity:1} }
.glass-success { background:rgba(33,87,50,.92) !important; backdrop-filter:blur(14px) !important; border:1px solid rgba(255,255,255,.12) !important; }
.success-icon-box { width:100px; height:100px; background:rgba(255,255,255,.1); border-radius:50%; display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,.2); }
.status-card { border:1px solid rgba(255,255,255,.18) !important; }
.wait-ring { --size:72px; width:var(--size); height:var(--size); border-radius:50%; background:conic-gradient(#00e676 calc(var(--p) * 360deg), rgba(255,255,255,.16) 0); display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 6px rgba(255,255,255,.06) inset; transition:all .3s ease; }
.wait-ring.active { box-shadow:0 0 0 6px rgba(0,230,118,.15) inset, 0 0 18px rgba(0,230,118,.25); }
.wait-ring-inner { width:56px; height:56px; border-radius:50%; background:rgba(13,36,24,.65); display:flex; align-items:center; justify-content:center; flex-direction:column; border:1px solid rgba(255,255,255,.18); }
.countdown-badge { min-width:74px; text-align:center; padding:6px 10px; border-radius:999px; font-weight:800; font-size:14px; background:rgba(255,255,255,.16); color:#e6ffef; border:1px solid rgba(255,255,255,.25); }
.countdown-badge.active { background:rgba(0,230,118,.18); color:#baffd8; border-color:rgba(0,230,118,.4); }
.progress-dots { display:flex; gap:6px; }
.dot { width:18px; height:6px; border-radius:999px; background:rgba(255,255,255,.18); transition:all .2s ease; }
.dot.active { background:#00e676; box-shadow:0 0 10px rgba(0,230,118,.6); }
.status-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
.status-step { text-align:center; font-size:11px; padding:6px 4px; border-radius:999px; background:rgba(255,255,255,.08); color:rgba(255,255,255,.65); border:1px solid rgba(255,255,255,.14); font-weight:700; letter-spacing:.02em; }
.status-step.active { background:rgba(0,230,118,.18); color:#d9ffe9; border-color:rgba(0,230,118,.35); }
.fade-in { animation:fadeIn .4s ease-out; }
@keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.rounded-2xl { border-radius:18px !important; }
.rounded-3xl { border-radius:24px !important; }
.rounded-t-3xl { border-top-left-radius:32px !important; border-top-right-radius:32px !important; }
.w-100 { width:100%; }
.pb-24 { padding-bottom:160px; }
</style>


