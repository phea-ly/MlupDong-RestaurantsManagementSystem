<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute }                   from 'vue-router'
import { useMenuStore }                          from '@/stores/menu.store'
import { useCartStore }                          from '@/stores/cart.store'
import { tableApi }                              from '@/api/order.api'

const menuStore = useMenuStore()
const cartStore = useCartStore()
const router    = useRouter()
const route     = useRoute()

const searchQuery    = ref('')
const activeCategory = ref('All')
const resolvingToken = ref(true)
const tokenError     = ref(false)
const fallbackImg    = 'https://images.unsplash.com/photo-1548943487-a2e4142f6ab3?q=80&w=600&auto=format&fit=crop'

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
})

onUnmounted(() => {
  cartStore.leaveTableChannel()
})

const categories = computed(() => {
  const all = { category_id: 'All', category_name: 'All', icon: 'mdi-silverware-fork-knife' }
  const mapped = menuStore.categories.map(c => ({
    ...c,
    icon: c.category_name?.toLowerCase().includes('drink')
      ? 'mdi-glass-cocktail'
      : c.category_name?.toLowerCase().includes('promo')
        ? 'mdi-star-circle'
        : 'mdi-food-variant',
  }))
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

function addToCart(item, event) {
  cartStore.addToCart(item)
  if (event?.currentTarget) {
    const el = event.currentTarget
    el.classList.add('bouncing')
    setTimeout(() => el.classList.remove('bouncing'), 300)
  }
}

function goToOrder() {
  router.push({ name: 'customer-order', params: { token: route.params.token } })
}
</script>

<template>
  <div class="mobile-layout">

    <!-- Invalid token -->
    <div v-if="tokenError" class="error-center">
      <v-icon size="64" color="grey">mdi-qrcode-off</v-icon>
      <div class="text-h6 font-weight-bold text-grey-darken-3 mt-4">Invalid QR Code</div>
    </div>

    <template v-else>

      <!-- Header -->
      <div class="sticky-header">
        <div class="d-flex align-center justify-space-between px-4 header-inner">
          <div class="d-flex align-center ga-2">
            <v-avatar color="#1f7a4f" rounded="pill" size="28" class="brand-avatar">
              <v-icon color="#ffffff" size="16">mdi-leaf</v-icon>
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-black text-grey-darken-4">Mlup Dong</div>
              <div class="text-caption text-grey-darken-1">Customer Menu</div>
            </div>
          </div>
          <v-chip color="#e7f1e7" variant="flat" class="font-weight-bold text-green-darken-4 rounded-lg" size="small">
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
            hide-details rounded="lg"
            bg-color="#ffffff" color="#215732"
            class="search-input search-card" clearable
          />
        </div>
        <div class="category-scroll px-4 pb-3 header-categories">
          <v-btn
            v-for="cat in categories" :key="cat.category_id"
            rounded="xl"
            :variant="activeCategory === cat.category_id ? 'flat' : 'outlined'"
            :color="activeCategory === cat.category_id ? '#2f6b3c' : '#ffffff'"
            class="mr-2 text-none category-btn flex-shrink-0"
            :class="[
              activeCategory === cat.category_id ? 'text-white' : 'text-grey-darken-3',
              activeCategory === cat.category_id ? 'is-active' : 'is-inactive'
            ]"
            elevation="0" height="32"
            @click="activeCategory = cat.category_id"
          >
            <v-icon size="16" :color="activeCategory === cat.category_id ? 'white' : 'grey-darken-1'">
              {{ cat.icon }}
            </v-icon>
            <span v-if="activeCategory === cat.category_id" class="ml-2">
              {{ cat.category_name }}
            </span>
          </v-btn>
          <v-btn
            icon
            variant="outlined"
            class="notify-btn flex-shrink-0"
            size="32"
            @click.stop
          >
            <v-icon size="16">mdi-bell-outline</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="header-spacer" />

      <!-- Content -->
      <div class="main-content-bg pt-2">

        <!-- Skeletons -->
        <div v-if="resolvingToken || menuStore.loading" class="px-4 mt-4">
          <v-card v-for="i in 4" :key="i" class="mb-4 rounded-xl elevation-1 bg-white">
            <v-skeleton-loader type="image" height="100" class="rounded-t-xl" />
            <div class="pa-3">
              <v-skeleton-loader type="list-item-two-line" />
            </div>
          </v-card>
        </div>

        <!-- Featured card -->
        <div class="px-4 pb-4" v-if="filteredItems.length">
          <v-card class="feature-card rounded-xl overflow-hidden bg-white" elevation="4">
            <div class="feature-img">
              <v-img
                :src="filteredItems[0]?.image || fallbackImg"
                height="180"
                cover
              />
              <div class="price-pill">${{ parseFloat(filteredItems[0]?.price || 0).toFixed(2) }}</div>
            </div>
            <div class="pa-4 feature-body">
              <div class="text-subtitle-1 font-weight-black text-grey-darken-4 mb-1">
                {{ filteredItems[0]?.name || 'Signature Dish' }}
              </div>
              <div class="text-caption text-grey-darken-1 mb-3 line-clamp-2">
                {{ filteredItems[0]?.description || 'A fresh and flavorful choice from our chef.' }}
              </div>
              <div class="d-flex align-center justify-space-between">
                <div class="text-caption text-grey-darken-1">
                  <v-icon size="14" color="#f59e0b" class="mr-1">mdi-star</v-icon>
                  4.9 <span class="ml-1">(120+ reviews)</span>
                </div>
              </div>
              <v-btn
                icon
                color="#2f6b3c"
                size="36"
                class="feature-add"
                @click="addToCart(filteredItems[0], $event)"
              >
                <v-icon size="18" color="white">mdi-plus</v-icon>
              </v-btn>
            </div>
          </v-card>
        </div>

        <!-- Menu items -->
        <div v-if="filteredItems.length" class="px-4 pb-24 fade-in">
          <div class="d-flex align-center justify-space-between mb-3">
            <h2 class="text-subtitle-1 font-weight-black text-grey-darken-4">Popular Dishes</h2>
          </div>

          <v-card
            v-for="item in filteredItems" :key="item.id"
            class="menu-card rounded-xl pa-3 mb-3 d-flex align-center bg-white"
            v-ripple
          >
            <v-img
              :src="item.image || fallbackImg"
              width="96" height="96"
              class="menu-thumb mr-3 flex-shrink-0 bg-grey-lighten-4" cover
            />
            <div class="flex-grow-1 py-1 pr-1">
              <div class="font-weight-bold mb-1 line-clamp-1 text-grey-darken-4" style="font-size:15px;">
                {{ item.name }}
              </div>
              <div class="text-caption text-grey-darken-1 line-clamp-1">
                {{ item.description || 'Taste the best from our chef.' }}
              </div>
              <div class="d-flex align-center justify-space-between mt-2">
                <div class="font-weight-black text-green-darken-4">
                  ${{ parseFloat(item.price || 0).toFixed(2) }}
                </div>
                <v-btn
                  icon
                  color="#e7f1e7"
                  size="28"
                  class="menu-add-circle"
                  @click="addToCart(item, $event)"
                >
                  <v-icon size="16" color="#2f6b3c">mdi-plus</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Empty search -->
        <div v-else-if="!menuStore.loading && searchQuery" class="d-flex flex-column align-center py-12 ga-3">
          <v-icon size="48" color="grey">mdi-magnify-close</v-icon>
          <div class="text-body-2 text-grey">No items found</div>
        </div>
      </div>

      <!-- Floating cart pill -->
      <v-fade-transition>
        <div v-if="cartStore.cartCount > 0" class="fixed-bottom-cart px-4 pb-6">
          <v-card
            class="cart-pill pa-3 px-4 d-flex align-center"
            color="#2f6b3c" elevation="8" v-ripple
            @click="goToOrder"
          >
            <div class="cart-icon-wrap mr-3">
              <v-icon color="white" size="20">mdi-cart-outline</v-icon>
              <div :key="cartStore.cartCount" class="cart-count scale-pop">{{ cartStore.cartCount }}</div>
            </div>
            <div class="text-white flex-grow-1">
              <div class="text-caption font-weight-medium" style="opacity:.85;line-height:1.1">
                {{ cartStore.cartCount }} Items Added
              </div>
              <div class="font-weight-bold text-body-2" style="line-height:1.2">View Order</div>
            </div>
            <div class="text-white text-right">
              <div class="text-caption" style="opacity:.85">Total</div>
              <div class="text-subtitle-1 font-weight-black">${{ cartStore.cartTotal.toFixed(2) }}</div>
            </div>
          </v-card>
        </div>
      </v-fade-transition>
    </template>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
.mobile-layout { font-family:'Manrope',sans-serif; max-width:390px; margin:0 auto; background:#ffffff; min-height:100vh; position:relative; overflow-x:hidden; }
.error-center  { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.position-relative { position:relative; z-index:10; }
.main-content-bg { background:transparent; position:relative; z-index:5; min-height:calc(100vh - 80px); }
.sticky-header { position:fixed; top:0; left:0; right:0; max-width:390px; margin:0 auto; z-index:30; background:#ffffff; padding-top:12px; padding-bottom:6px; box-shadow:0 6px 16px rgba(0,0,0,.06); border-bottom:1px solid #eef2f0; }
.header-inner { padding-bottom:10px; }
.header-spacer { height:170px; }
.header-categories { padding-bottom:10px; }
.brand-avatar { box-shadow:0 6px 14px rgba(31,122,79,.25); }
.search-card :deep(.v-field) { background:#ffffff !important; box-shadow:0 8px 18px rgba(0,0,0,.06) !important; border:1px solid #eef2f0 !important; border-radius:14px !important; }
.search-input :deep(.v-field__outline) { border:none !important; }
.search-input :deep(.v-field) { box-shadow:0 2px 10px rgba(0,0,0,.02) !important; border:1px solid #e3e8ee; }
.category-scroll { display:flex; overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none; }
.category-scroll::-webkit-scrollbar { display:none; }
.category-btn { border-color:#e3e8ee !important; font-weight:700; letter-spacing:0; transition:all .2s; padding:0 12px; box-shadow:0 4px 10px rgba(0,0,0,.05); border-radius:999px !important; font-size:12px; }
.category-btn.is-inactive { padding:0 10px; }
.category-btn.is-active { padding:0 14px; }
.notify-btn { border-color:#e3e8ee !important; border-radius:999px !important; color:#6b7280; }
.feature-card { border:1px solid rgba(0,0,0,.06); box-shadow:0 10px 24px rgba(0,0,0,.12) !important; }
.feature-card .text-grey-darken-1 { color:#111827 !important; }
.feature-body { position:relative; }
.feature-body .feature-add { position:absolute; right:14px; bottom:14px; }
.feature-img { position:relative; }
.price-pill { position:absolute; top:10px; right:10px; background:#ffffff; color:#111827; font-weight:800; font-size:12px; padding:6px 10px; border-radius:999px; box-shadow:0 6px 16px rgba(0,0,0,.18); }
.feature-add { border-radius:50% !important; box-shadow:0 8px 18px rgba(31,122,79,.35) !important; }
.menu-card { box-shadow:0 10px 24px rgba(0,0,0,.08) !important; border:1px solid rgba(0,0,0,.04); border-radius:16px !important; }
.menu-card .text-grey-darken-1 { color:#111827 !important; }
.menu-thumb { border-radius:8px !important; }
.menu-add-circle { border-radius:8px !important; box-shadow:0 6px 14px rgba(31,122,79,.18); }
.pb-24 { padding-bottom:140px; }
.fixed-bottom-cart { position:fixed; bottom:0; left:0; right:0; max-width:390px; margin:0 auto; z-index:100; background:linear-gradient(to top,rgba(255,255,255,1) 40%,rgba(255,255,255,0)); }
.cart-pill { box-shadow:0 10px 32px rgba(31,122,79,.3) !important; cursor:pointer; transition:transform .2s; border-radius:18px !important; }
.cart-icon-wrap { position:relative; width:34px; height:34px; border-radius:10px; background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; }
.cart-count { position:absolute; top:-6px; right:-6px; background:#ffb300; color:#fff; font-size:10px; font-weight:800; width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,.25); }
.cart-pill:active { transform:scale(.97); }
.cart-icon-box { display:flex; align-items:center; justify-content:center; }
.cart-badge { position:absolute; top:-6px; right:-8px; background:#ffb300; color:#fff; font-size:11px; font-weight:800; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,.25); }
.scale-pop { animation:pop .4s cubic-bezier(.175,.885,.32,1.275); }
@keyframes pop { 0%{transform:scale(0)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
.btn-add-animated { transition:transform .15s ease; }
.bouncing { animation:bounce .3s ease; }
@keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(.7)} }
.fade-in { animation:fadeIn .4s ease; }
@keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.line-clamp-1 { display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden; }
.line-clamp-2 { display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
</style>

