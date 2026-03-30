<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute }         from 'vue-router'
import { useMenuStore }     from '@/stores/menu.store'
import { useCartStore }     from '@/stores/cart.store'
import { tableApi, kdsApi } from '@/api/order.api'

const menuStore = useMenuStore()
const cartStore = useCartStore()
const route     = useRoute()

// ── View state ─────────────────────────────────────────────────────────────
const currentView = ref('menu') // 'menu' | 'cart'

// ── Menu state ─────────────────────────────────────────────────────────────
const searchQuery    = ref('')
const activeCategory = ref('All')
const resolvingToken = ref(true)
const tokenError     = ref(false)
const fallbackImg    = 'https://images.unsplash.com/photo-1548943487-a2e4142f6ab3?q=80&w=600&auto=format&fit=crop'

// ── Cart / order state ─────────────────────────────────────────────────────
const isPlacingOrder       = ref(false)
const showSuccess          = ref(false)
const activeOrdersAhead    = ref(0)
const estimatedWait        = ref(null)
const confirmedWaitMinutes = ref(0)
const countdownSeconds     = ref(0)
const orderError           = ref('')   // shows API errors to the user
let   countdownTimer       = null

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
  const token = route.params.token
  try {
    const { data } = await tableApi.getByToken(token)
    cartStore.setTableId(data.table_id, data.table_number)
  } catch {
    tokenError.value     = true
    resolvingToken.value = false
    return
  }
  resolvingToken.value = false
  await menuStore.fetchCategories()
  await menuStore.fetchMenuItems()
  await fetchQueueDepth()
})

onUnmounted(() => {
  cartStore.leaveTableChannel()
  stopCountdown()
})

// ── Categories & items ─────────────────────────────────────────────────────
const categories = computed(() => {
  const all    = { category_id: 'All', category_name: 'All', icon: 'mdi-silverware-fork-knife' }
  const mapped = menuStore.categories.map(c => ({ ...c, icon: 'mdi-tag-outline' }))
  return [all, ...mapped]
})

const filteredItems = computed(() => {
  let list = menuStore.menuItems.filter(i => i.status)
  if (activeCategory.value !== 'All') {
    list = list.filter(i => String(i.category_id) === String(activeCategory.value))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.description && i.description.toLowerCase().includes(q))
    )
  }
  return list
})

// ── Menu actions ───────────────────────────────────────────────────────────
function addToCart(item, event) {
  cartStore.addToCart(item)
  if (event?.currentTarget) {
    const el = event.currentTarget
    el.classList.add('bouncing')
    setTimeout(() => el.classList.remove('bouncing'), 300)
  }
}

function goToCart() { currentView.value = 'cart' }

function goToMenu() {
  showSuccess.value = false
  orderError.value  = ''
  currentView.value = 'menu'
  stopCountdown()
}

// ── Queue / wait ───────────────────────────────────────────────────────────
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

// ── Place order ────────────────────────────────────────────────────────────
async function placeOrder() {
  if (!cartStore.items.length) return
  if (!cartStore.tableId) {
    orderError.value = 'Table information is missing. Please scan the QR code again.'
    return
  }

  isPlacingOrder.value       = true
  orderError.value           = ''
  confirmedWaitMinutes.value = estimatedWait.value ?? 15

  // ⚠️ Set showSuccess BEFORE the store clears the cart.
  // The watch on cartStore.items.length fires synchronously when clearCart()
  // runs inside the store. If showSuccess is still false at that moment,
  // the watch redirects back to 'menu' before we can show the success screen.
  // Pre-setting it here prevents that race condition.
  showSuccess.value = true

  try {
    const result = await cartStore.placeOrder({
      order_type: 'dine_in',
      table_id:   cartStore.tableId,
    })

    if (result.success) {
      if (result.data?.estimated_wait_minutes) {
        confirmedWaitMinutes.value = result.data.estimated_wait_minutes
      }
      startCountdown(confirmedWaitMinutes.value)
    } else {
      // Order failed — hide the overlay and show the error
      showSuccess.value = false
      orderError.value  = result.message || 'Something went wrong. Please try again.'
    }
  } catch (err) {
    showSuccess.value = false
    orderError.value  = err?.message || 'Unexpected error. Please try again.'
  } finally {
    isPlacingOrder.value = false
  }
}

// ── Countdown ──────────────────────────────────────────────────────────────
function startCountdown(minutes) {
  stopCountdown()
  const safeMinutes = Number.isFinite(minutes) ? minutes : 0
  countdownSeconds.value = Math.max(0, Math.round(safeMinutes * 60))
  if (countdownSeconds.value <= 0) return
  countdownTimer = setInterval(() => {
    if (countdownSeconds.value > 0) countdownSeconds.value -= 1
    else stopCountdown()
  }, 1000)
}

function stopCountdown() {
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
}

const countdownDisplay = computed(() => {
  const mins = Math.floor(countdownSeconds.value / 60)
  const secs = countdownSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const isCountingDown = computed(() => countdownSeconds.value > 0)

// ── Order status ───────────────────────────────────────────────────────────
const statusStep = computed(() => {
  const s = cartStore.lastOrder?.order_status
  if (s === 'confirmed') return 2
  if (s === 'preparing') return 3
  if (['ready', 'served', 'completed'].includes(s)) return 4
  return 1
})

const statusText = computed(() => {
  const s = cartStore.lastOrder?.order_status
  if (s === 'received')  return 'Kitchen received your order'
  if (s === 'confirmed') return 'Chef confirmed – starting soon'
  if (s === 'preparing') return 'Cooking now'
  if (s === 'ready')     return 'Ready to serve'
  if (s === 'served')    return 'Served'
  if (s === 'completed') return 'Completed'
  if (s === 'cancelled') return 'Order cancelled'
  return 'Order sent – preparing your food soon'
})

// ── Watches ────────────────────────────────────────────────────────────────
watch(
  () => cartStore.items.length,
  (len) => {
    if (len === 0 && currentView.value === 'cart' && !showSuccess.value) {
      currentView.value = 'menu'
    }
  }
)
</script>

<template>
  <div class="mobile-layout">

    <!-- ── Invalid token ─────────────────────────────────────────────────── -->
    <div v-if="tokenError" class="error-center">
      <v-icon size="64" color="grey">mdi-qrcode-off</v-icon>
      <div class="text-h6 font-weight-bold text-grey-darken-3 mt-4">Invalid QR Code</div>
    </div>

    <template v-else>

      <!-- ══════════════════════════════════════════════════════════════════
           MENU VIEW
      ═══════════════════════════════════════════════════════════════════ -->
      <template v-if="currentView === 'menu'">

        <!-- Sticky header -->
        <div class="sticky-header">
          <div class="d-flex align-center justify-space-between px-4 header-inner">
            <div class="d-flex align-center ga-2">
              <v-avatar size="36" class="brand-avatar pa-0 overflow-hidden">
                <v-img src="/logo.png" alt="Mlup Dong" cover />
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-black text-grey-darken-4">Mlup Dong</div>
                <div class="text-caption text-grey-darken-1">Table Menu</div>
              </div>
            </div>
            <v-chip color="#e7f1e7" variant="flat"
              class="font-weight-bold text-green-darken-4 rounded-xl" size="small">
              <v-icon start size="14">mdi-table-furniture</v-icon>
              <span v-if="resolvingToken">...</span>
              <span v-else>Table {{ cartStore.tableNumber }}</span>
            </v-chip>
          </div>

          <div class="px-4 pb-2">
            <v-text-field
              v-model="searchQuery"
              placeholder="Search for food, drinks..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined" density="comfortable"
              hide-details rounded="xl"
              bg-color="#ffffff" color="#215732"
              class="search-input search-card" clearable
            />
          </div>

          <div class="category-scroll px-4 pb-4 header-categories">
            <v-btn
              v-for="cat in categories" :key="cat.category_id"
              rounded="xl"
              :variant="activeCategory === cat.category_id ? 'flat' : 'outlined'"
              :color="activeCategory === cat.category_id ? '#2f6b3c' : '#ffffff'"
              class="mr-2 text-none category-btn flex-shrink-0"
              :class="activeCategory === cat.category_id ? 'text-white' : 'text-grey-darken-3'"
              elevation="0" height="38"
              @click="activeCategory = cat.category_id"
            >
              <v-icon start size="18"
                :color="activeCategory === cat.category_id ? 'white' : 'grey-darken-1'">
                {{ cat.icon }}
              </v-icon>
              {{ cat.category_name }}
            </v-btn>
          </div>
        </div>
        <div class="header-spacer" />

        <!-- Content -->
        <div class="main-content-bg pt-2">

          <!-- Featured card -->
          <div class="px-4 pb-5" v-if="filteredItems.length">
            <v-card class="feature-card rounded-2xl overflow-hidden" elevation="10">
              <div class="feature-img">
                <v-img :src="filteredItems[0]?.image || fallbackImg" height="190" cover />
                <div class="price-pill">
                  ${{ parseFloat(filteredItems[0]?.price || 0).toFixed(2) }}
                </div>
              </div>
              <div class="pa-4 feature-body">
                <div class="text-subtitle-1 font-weight-black text-grey-darken-4 mb-1 feature-title">
                  {{ filteredItems[0]?.name || 'Signature Dish' }}
                </div>
                <div class="text-caption text-grey-darken-1 mb-3 line-clamp-2 feature-desc">
                  {{ filteredItems[0]?.description || 'A fresh and flavorful choice from our chef.' }}
                </div>
                <div class="d-flex align-center justify-space-between feature-actions">
                  <div class="rating-row text-caption text-grey-darken-1">
                    <v-icon size="14" color="#f59e0b" class="mr-1">mdi-star</v-icon>
                    4.9 <span class="ml-1">(120+ reviews)</span>
                  </div>
                  <v-btn icon color="#2f6b3c" size="36"
                    class="elevation-4 btn-add-animated feature-add"
                    @click="addToCart(filteredItems[0], $event)">
                    <v-icon color="#ffffff" size="20">mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-card>
          </div>

          <!-- Skeletons -->
          <div v-if="resolvingToken || menuStore.loading" class="px-4 mt-4">
            <v-card v-for="i in 4" :key="i" class="mb-4 rounded-xl elevation-1 bg-white">
              <v-skeleton-loader type="image" height="100" class="rounded-t-xl" />
              <div class="pa-3">
                <v-skeleton-loader type="list-item-two-line" />
              </div>
            </v-card>
          </div>

          <!-- Menu items list -->
          <div v-else-if="filteredItems.length" class="px-4 pb-32 fade-in">
            <h2 class="text-h6 font-weight-black mb-4 text-grey-darken-4">Popular Dishes</h2>
            <v-card
              v-for="item in filteredItems" :key="item.id"
              class="popular-card rounded-xl pa-3 mb-4 d-flex align-stretch bg-white"
              v-ripple
            >
              <v-img
                :src="item.image || fallbackImg"
                width="110" height="110"
                class="rounded-xl mr-4 flex-shrink-0 bg-grey-lighten-4" cover
              />
              <div class="flex-grow-1 py-1 pr-1 d-flex flex-column justify-space-between">
                <div>
                  <div class="font-weight-bold mb-1 line-clamp-2 text-grey-darken-4"
                    style="font-size:16px;line-height:1.25">
                    {{ item.name }}
                  </div>
                  <div class="text-caption text-grey-darken-1 mb-2 line-clamp-1">
                    {{ item.description || 'Taste the best from our chef.' }}
                  </div>
                </div>
                <div class="d-flex align-center justify-space-between mt-auto pt-1">
                  <div class="font-weight-black text-subtitle-1 text-green-darken-4">
                    ${{ parseFloat(item.price || 0).toFixed(2) }}
                  </div>
                  <v-btn icon color="#215732" size="36"
                    class="elevation-2 btn-add-animated"
                    @click="addToCart(item, $event)">
                    <v-icon color="#ffffff" size="20">mdi-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </v-card>
          </div>

          <!-- Empty search -->
          <div v-else-if="!menuStore.loading && searchQuery"
            class="d-flex flex-column align-center py-12 ga-3">
            <v-icon size="48" color="grey">mdi-magnify-close</v-icon>
            <div class="text-body-2 text-grey">No items found</div>
          </div>
        </div>

        <!-- Floating cart pill -->
        <v-fade-transition>
          <div v-if="cartStore.cartCount > 0" class="fixed-bottom-cart px-4 pb-6">
            <v-card
              class="cart-pill rounded-pill pa-3 px-5 d-flex align-center"
              color="#215732" elevation="8" v-ripple
              @click="goToCart"
            >
              <div class="position-relative mr-5 cart-icon-box">
                <v-icon color="white" size="28">mdi-shopping-outline</v-icon>
                <div :key="cartStore.cartCount" class="cart-badge scale-pop">
                  {{ cartStore.cartCount }}
                </div>
              </div>
              <div class="text-white flex-grow-1">
                <div class="text-caption font-weight-medium" style="opacity:.85;line-height:1.2">
                  {{ cartStore.cartCount }} Items
                </div>
                <div class="font-weight-bold text-subtitle-1" style="line-height:1.2">View Order</div>
              </div>
              <div class="text-white text-h6 font-weight-black d-flex align-center">
                ${{ cartStore.cartTotal.toFixed(2) }}
                <v-icon size="20" class="ml-2" style="opacity:.8">mdi-chevron-right</v-icon>
              </div>
            </v-card>
          </div>
        </v-fade-transition>

      </template>

      <!-- ══════════════════════════════════════════════════════════════════
           CART VIEW
      ═══════════════════════════════════════════════════════════════════ -->
      <template v-else-if="currentView === 'cart'">
        <div class="cart-layout pb-24 fade-in">

          <!-- Header -->
          <div class="d-flex align-center bg-white pt-4 pb-3 px-4 cart-sticky-header justify-space-between">
            <v-btn icon="mdi-chevron-left" variant="flat" size="small"
              color="#f3f5f7" class="border-subtle"
              @click="goToMenu" />
            <div class="text-center">
              <div class="text-subtitle-1 font-weight-black text-grey-darken-4">Order Summary</div>
              <div class="text-caption font-weight-bold text-green-darken-3 text-uppercase"
                style="font-size:10px;letter-spacing:1.5px">
                Mlup Dong – Table {{ cartStore.tableNumber || '??' }}
              </div>
            </div>
            <v-btn icon="mdi-dots-vertical" variant="flat" size="small"
              color="#f3f5f7" class="border-subtle" />
          </div>

          <!-- Cart items -->
          <div class="px-4 pt-6">
            <div class="mb-4 d-flex align-center justify-space-between">
              <span class="text-subtitle-2 font-weight-black text-grey-darken-3">
                MY TRAY ({{ cartStore.cartCount }})
              </span>
              <v-btn variant="text" size="x-small" color="red-darken-1"
                class="font-weight-bold" @click="cartStore.clearCart">
                Clear All
              </v-btn>
            </div>

            <v-card
              v-for="item in cartStore.items" :key="item.id"
              class="cart-item-card rounded-2xl pa-3 mb-4 d-flex align-stretch border-subtle"
              elevation="0"
            >
              <v-img
                :src="item.image || fallbackImg"
                width="88" height="88"
                class="rounded-xl mr-4 flex-shrink-0 border-subtle" cover
              />
              <div class="flex-grow-1 d-flex flex-column justify-center py-1">
                <div class="d-flex justify-space-between align-start mb-1">
                  <span class="font-weight-black text-grey-darken-4"
                    style="font-size:15px;line-height:1.2">
                    {{ item.name }}
                  </span>
                  <v-icon size="18" color="grey-lighten-1" class="ml-2" style="cursor:pointer"
                    @click="cartStore.removeFromCart(item.id)">
                    mdi-close-circle-outline
                  </v-icon>
                </div>
                <div class="text-caption text-grey-darken-1 mb-3">
                  Fresh ingredients – Best quality
                </div>
                <div class="d-flex justify-space-between align-center mt-auto">
                  <div class="font-weight-black text-green-darken-4 text-subtitle-1">
                    ${{ item.price.toFixed(2) }}
                  </div>
                  <div class="qty-pill d-flex align-center rounded-pill px-1 border-subtle py-1 bg-slate-50">
                    <v-btn icon size="24" variant="flat" color="white"
                      class="border-subtle" :disabled="item.quantity <= 1"
                      @click="cartStore.updateQuantity(item.id, item.quantity - 1)">
                      <v-icon size="14" color="grey-darken-3">mdi-minus</v-icon>
                    </v-btn>
                    <div class="px-4 font-weight-black text-body-2">{{ item.quantity }}</div>
                    <v-btn icon size="24" variant="flat" color="#215732" class="elevation-1"
                      @click="cartStore.updateQuantity(item.id, item.quantity + 1)">
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
                <div class="text-subtitle-1 font-weight-black text-grey-darken-4">
                  Note to the Chef
                </div>
              </div>
              <v-textarea
                v-model="cartStore.specialInstructions"
                placeholder="e.g. No onions, extra spicy, or allergy details..."
                variant="filled" bg-color="#f8fafb"
                rounded="xl" hide-details auto-grow rows="3"
                color="#215732" flat
              />
            </v-card>
          </div>

          <!-- Checkout panel -->
          <v-slide-y-reverse-transition>
            <div v-if="cartStore.items.length > 0 && !showSuccess"
              class="checkout-panel rounded-t-3xl pt-7 pb-9 px-6">

              <!-- Estimated wait -->
              <v-card class="wait-time-card rounded-xl pa-4 mb-5 d-flex align-center ga-3"
                color="#f0f7f2" elevation="0">
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

              <!-- ── Error alert ──────────────────────────────────────────── -->
              <v-alert
                v-if="orderError"
                type="error"
                variant="tonal"
                rounded="xl"
                closable
                class="mb-4 text-body-2 font-weight-bold"
                @click:close="orderError = ''"
              >
                {{ orderError }}
              </v-alert>

              <!-- Billing -->
              <div class="billing-details mb-7">
                <div class="d-flex justify-space-between mb-3 px-1">
                  <span class="text-body-2 text-grey-darken-1 font-weight-bold">Subtotal</span>
                  <span class="text-body-2 font-weight-black">
                    ${{ cartStore.cartSubtotal.toFixed(2) }}
                  </span>
                </div>
                <div class="d-flex justify-space-between mb-3 px-1">
                  <span class="text-body-2 text-grey-darken-1 font-weight-bold">Service Tax (10%)</span>
                  <span class="text-body-2 font-weight-black">
                    ${{ cartStore.cartTax.toFixed(2) }}
                  </span>
                </div>
                <v-divider class="my-4" style="border-style:dashed;border-color:#cbd5e1" />
                <div class="d-flex justify-space-between align-center px-1">
                  <span class="text-h6 font-weight-black text-grey-darken-4">Total Amount</span>
                  <span class="text-h5 font-weight-black text-green-darken-4">
                    ${{ cartStore.cartTotal.toFixed(2) }}
                  </span>
                </div>
              </div>

              <v-btn
                color="#215732" rounded="xl" block size="x-large"
                class="font-weight-black elevation-8 checkout-btn py-6"
                :loading="isPlacingOrder"
                :disabled="isPlacingOrder"
                @click="placeOrder"
              >
                <span class="mr-2">CONFIRM & PLACE ORDER</span>
                <v-icon size="22" class="pulse-icon">mdi-silverware-variant</v-icon>
              </v-btn>

              <div class="text-center mt-5">
                <v-chip size="x-small" variant="flat" color="#f0f4f2"
                  class="text-grey-darken-1 font-weight-bold px-4">
                  <v-icon start size="12">mdi-lock-outline</v-icon> SECURE ORDERING
                </v-chip>
              </div>
            </div>
          </v-slide-y-reverse-transition>

          <!-- ── Success overlay ─────────────────────────────────────────── -->
          <v-overlay
            v-model="showSuccess"
            class="align-center justify-center"
            scrim="#133021"
            :persistent="true"
            :z-index="200"
          >
            <v-card class="pa-0 text-center rounded-3xl overflow-hidden glass-success" width="340">
              <div class="pa-10 d-flex flex-column align-center">

                <!-- Check icon -->
                <div class="success-icon-box mb-6">
                  <v-icon color="#00e676" size="50">mdi-check-decagram</v-icon>
                </div>

                <h2 class="text-h5 font-weight-black mb-2 text-white">Order Received!</h2>
                <p class="text-body-2 text-green-lighten-4 mb-4">
                  Your order has been sent to the kitchen. Please relax and stay seated.
                </p>

                <!-- Wait card -->
                <v-card class="rounded-xl pa-4 mb-4 w-100"
                  color="rgba(255,255,255,0.12)" elevation="0">
                  <div class="d-flex align-center justify-center ga-3">
                    <v-icon color="#00e676" size="22">mdi-clock-check-outline</v-icon>
                    <div class="text-white">
                      <div class="text-caption" style="opacity:.75">Estimated wait</div>
                      <div class="text-h6 font-weight-black">~{{ confirmedWaitMinutes }} min</div>
                    </div>
                  </div>
                </v-card>

                <!-- Status + countdown card -->
                <v-card class="rounded-xl pa-4 mb-4 w-100 status-card"
                  color="rgba(255,255,255,0.14)" elevation="0">
                  <div class="d-flex align-center justify-space-between">
                    <div class="text-left">
                      <div class="text-caption text-green-lighten-4" style="opacity:.8">
                        Kitchen status
                      </div>
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
                  <div class="text-caption text-green-lighten-4 mt-2" style="opacity:.8">
                    Estimated time based on current kitchen queue.
                  </div>
                </v-card>

                <!-- Order number -->
                <div v-if="cartStore.lastOrder" class="text-caption text-green-lighten-3 mb-6">
                  Order {{ cartStore.lastOrder.order_number }}
                </div>

                <!-- Back to menu button -->
                <v-btn
                  block rounded="xl" size="large"
                  class="back-to-menu-btn font-weight-black"
                  @click="goToMenu"
                >
                  Back to Menu
                </v-btn>

              </div>
            </v-card>
          </v-overlay>

        </div>
      </template>

    </template>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

/* ── Shell ─────────────────────────────────────────────────────────────── */
.mobile-layout {
  font-family: 'Manrope', sans-serif;
  max-width: 480px;
  margin: 0 auto;
  background: #f6f7fb;
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

/* ── Menu: sticky header ───────────────────────────────────────────────── */
.sticky-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  max-width: 480px;
  margin: 0 auto;
  z-index: 30;
  background: #f6f7fb;
  padding-top: 16px;
  padding-bottom: 8px;
  box-shadow: 0 6px 16px rgba(0,0,0,.08);
  border-bottom: 1px solid #eef2f0;
}
.header-inner      { padding-bottom: 10px; }
.header-spacer     { height: 212px; }
.header-categories { padding-bottom: 10px; }

/* ── Brand avatar ──────────────────────────────────────────────────────── */
.brand-avatar {
  border-radius: 50% !important;
  overflow: hidden !important;
  box-shadow: 0 0 0 2px rgba(255,255,255,.6), 0 4px 14px rgba(47,107,60,.3);
  flex-shrink: 0;
}

/* ── Search ────────────────────────────────────────────────────────────── */
.search-card :deep(.v-field) {
  background: #ffffff !important;
  box-shadow: 0 8px 18px rgba(0,0,0,.08) !important;
  border: 1px solid #eef2f0 !important;
  border-radius: 20px !important;
}
.search-input :deep(.v-field__outline) { border: none !important; }
.search-input :deep(.v-field) {
  box-shadow: 0 2px 10px rgba(0,0,0,.03) !important;
  border: 1px solid #e8edea;
}

/* ── Categories ────────────────────────────────────────────────────────── */
.category-scroll {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.category-scroll::-webkit-scrollbar { display: none; }
.category-btn {
  border-color: #e8edea !important;
  font-weight: 700;
  letter-spacing: 0;
  transition: all .2s;
  padding: 0 16px;
  box-shadow: 0 4px 10px rgba(0,0,0,.06);
  border-radius: 999px !important;
}

/* ── Main content ──────────────────────────────────────────────────────── */
.main-content-bg {
  background: transparent;
  position: relative;
  z-index: 5;
  min-height: calc(100vh - 80px);
}

/* ── Feature card ──────────────────────────────────────────────────────── */
.feature-card {
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 12px 24px rgba(0,0,0,.12) !important;
  border-radius: 24px !important;
}
.feature-card :deep(img) { border-radius: 24px 24px 0 0; }
.feature-img   { position: relative; }
.price-pill {
  position: absolute;
  top: 10px; right: 10px;
  background: #ffffff;
  color: #111827;
  font-weight: 800;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  box-shadow: 0 6px 16px rgba(0,0,0,.18);
}
.rating-row    { display: flex; align-items: center; }
.feature-body  { padding: 16px 18px 18px 18px !important; }
.feature-title { font-size: 16px; }
.feature-desc  { font-size: 12px; line-height: 1.4; }
.feature-actions { margin-top: 2px; }
.feature-add {
  border-radius: 50% !important;
  box-shadow: 0 8px 18px rgba(47,107,60,.35) !important;
}

/* ── Popular cards ─────────────────────────────────────────────────────── */
.popular-card {
  box-shadow: 0 8px 16px rgba(0,0,0,.08) !important;
  border: 1px solid rgba(0,0,0,.04);
  transition: transform .2s;
  border-radius: 20px !important;
}
.popular-card:active { transform: scale(.98); }

/* ── Floating cart pill ────────────────────────────────────────────────── */
.position-relative { position: relative; z-index: 10; }
.fixed-bottom-cart {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  max-width: 480px;
  margin: 0 auto;
  z-index: 100;
  background: linear-gradient(to top, rgba(250,251,252,1) 40%, rgba(250,251,252,0));
}
.cart-pill {
  box-shadow: 0 10px 40px rgba(33,87,50,.35) !important;
  cursor: pointer;
  transition: transform .2s;
}
.cart-pill:active { transform: scale(.97); }
.cart-icon-box { display: flex; align-items: center; justify-content: center; }
.cart-badge {
  position: absolute;
  top: -6px; right: -8px;
  background: #ffb300;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  width: 22px; height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,.25);
}

/* ── Cart view ─────────────────────────────────────────────────────────── */
.cart-layout {
  background: #f6f7fb;
  min-height: 100vh;
}
.cart-sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 6px 16px rgba(0,0,0,.06);
  border-bottom: 1px solid #eef2f0;
}
.cart-item-card {
  background: #fff !important;
  transition: transform .2s;
  box-shadow: 0 8px 20px rgba(0,0,0,.06);
}
.cart-item-card:active { transform: scale(.98); }
.border-subtle { border: 1px solid #edf1f5 !important; }
.bg-slate-50   { background: #f8fafc !important; }
.qty-pill      { height: 36px; }
.icon-circle {
  width: 36px; height: 36px;
  background: #f0f7f2;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Checkout panel ────────────────────────────────────────────────────── */
.checkout-panel {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  max-width: 480px;
  margin: 0 auto;
  background: white;
  z-index: 100;
  border-radius: 28px 28px 0 0;
  box-shadow: 0 -18px 40px rgba(0,0,0,.08) !important;
}
.wait-time-card { border: 1px solid #c6e9d3 !important; }
.checkout-btn {
  background: linear-gradient(135deg, #215732 0%, #153820 100%) !important;
}

/* ── Success overlay ───────────────────────────────────────────────────── */
.glass-success {
  background: rgba(33,87,50,.92) !important;
  backdrop-filter: blur(14px) !important;
  border: 1px solid rgba(255,255,255,.12) !important;
}
.success-icon-box {
  width: 100px; height: 100px;
  background: rgba(255,255,255,.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,.2);
}
.status-card { border: 1px solid rgba(255,255,255,.18) !important; }

/* ── Back to menu button ───────────────────────────────────────────────── */
.back-to-menu-btn {
  background-color: #ffffff !important;
  color: #1a4a2e !important;
  font-size: 15px !important;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 14px rgba(0,0,0,.15) !important;
}
.back-to-menu-btn:hover {
  background-color: #f0f7f2 !important;
}

/* ── Countdown ─────────────────────────────────────────────────────────── */
.countdown-badge {
  min-width: 74px;
  text-align: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 14px;
  background: rgba(255,255,255,.16);
  color: #e6ffef;
  border: 1px solid rgba(255,255,255,.25);
  transition: all .3s ease;
}
.countdown-badge.active {
  background: rgba(0,230,118,.18);
  color: #baffd8;
  border-color: rgba(0,230,118,.4);
}

/* ── Progress dots ─────────────────────────────────────────────────────── */
.progress-dots { display: flex; gap: 6px; }
.dot {
  width: 18px; height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,.18);
  transition: all .3s ease;
}
.dot.active {
  background: #00e676;
  box-shadow: 0 0 10px rgba(0,230,118,.6);
}

/* ── Animations ────────────────────────────────────────────────────────── */
.scale-pop { animation: pop .4s cubic-bezier(.175,.885,.32,1.275); }
@keyframes pop {
  0%   { transform: scale(0) }
  50%  { transform: scale(1.3) }
  100% { transform: scale(1) }
}
.btn-add-animated { transition: transform .15s ease; }
.bouncing         { animation: bounce .3s ease; }
@keyframes bounce {
  0%,100% { transform: scale(1) }
  50%     { transform: scale(.7) }
}
.fade-in { animation: fadeIn .4s ease; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px) }
  to   { opacity: 1; transform: translateY(0) }
}
.pulse-icon { animation: pulse 2s infinite linear; }
@keyframes pulse {
  0%,100% { transform: scale(1);   opacity: 1 }
  50%     { transform: scale(1.1); opacity: .8 }
}

/* ── Utilities ─────────────────────────────────────────────────────────── */
.line-clamp-1 { display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden; }
.line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
.rounded-2xl  { border-radius: 18px !important; }
.rounded-3xl  { border-radius: 24px !important; }
.rounded-t-3xl {
  border-top-left-radius: 32px !important;
  border-top-right-radius: 32px !important;
}
.w-100 { width: 100%; }
.pb-24 { padding-bottom: 160px; }
.pb-32 { padding-bottom: 200px; }
</style>