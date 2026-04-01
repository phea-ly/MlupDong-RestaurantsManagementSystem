<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu.store'
import { useCartStore } from '@/stores/cart.store'
import { tableApi } from '@/api/order.api'

const menuStore = useMenuStore()
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const activeCategory = ref('All')
const resolvingToken = ref(true)
const tokenError = ref(false)
const heroVisible = ref(false)
const fallbackImg = 'https://images.unsplash.com/photo-1548943487-a2e4142f6ab3?q=80&w=600&auto=format&fit=crop'

onMounted(async () => {
  const token = route.params.token
  try {
    const { data } = await tableApi.getByToken(token)
    cartStore.setTableId(data.table_id, data.table_number)
  } catch {
    tokenError.value = true
    resolvingToken.value = false
    return
  }

  resolvingToken.value = false
  await menuStore.fetchCategories()
  await menuStore.fetchMenuItems()
  setTimeout(() => { heroVisible.value = true }, 80)
})

onUnmounted(() => {
  cartStore.leaveTableChannel()
})

const categories = computed(() => {
  const all = { category_id: 'All', category_name: 'All', icon: 'mdi-silverware-fork-knife' }
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

const heroItem = computed(() => filteredItems.value[0] || null)
const listItems = computed(() => filteredItems.value.slice(1))

function addToCart(item, event) {
  cartStore.addToCart(item)
  if (event?.currentTarget) {
    const el = event.currentTarget
    el.classList.add('btn-pop')
    setTimeout(() => el.classList.remove('btn-pop'), 400)
  }
}

function goToOrder() {
  router.push({ name: 'customer-order', params: { token: route.params.token } })
}
</script>

<template>
  <div class="root-wrap">
    <div class="mobile-shell">

      <!-- ── Invalid QR ── -->
      <div v-if="tokenError" class="err-screen">
        <div class="err-blob" />
        <v-icon size="56" color="#c8d8c4">mdi-qrcode-off</v-icon>
        <p class="err-title">Invalid QR Code</p>
        <p class="err-sub">Please scan the correct table QR to order.</p>
      </div>

      <template v-else>

        <!-- ══════════ STICKY HEADER ══════════ -->
        <header class="app-header">
          <div class="header-top">
            <!-- Brand -->
            <div class="brand">
              <div class="brand-mark">
                <v-icon color="#fff" size="15">mdi-leaf</v-icon>
              </div>
              <div>
                <div class="brand-name">Mlup Dong</div>
                <div class="brand-sub">Garden Kitchen</div>
              </div>
            </div>

            <!-- Table chip -->
            <div class="table-chip">
              <v-icon size="13" color="#2f6b3c">mdi-table-furniture</v-icon>
              <span v-if="resolvingToken">···</span>
              <span v-else>Table&nbsp;{{ cartStore.tableNumber }}</span>
            </div>
          </div>

          <!-- Search -->
          <div class="search-wrap">
            <v-text-field
              v-model="searchQuery"
              placeholder="Search dishes or drinks…"
              prepend-inner-icon="mdi-magnify"
              variant="solo"
              density="comfortable"
              hide-details
              rounded="xl"
              bg-color="#fff"
              color="#2f6b3c"
              class="search-field"
              clearable
            />
          </div>

          <!-- Categories -->
          <div class="cat-strip">
            <button
              v-for="cat in categories"
              :key="cat.category_id"
              class="cat-pill"
              :class="{ 'cat-pill--active': activeCategory === cat.category_id }"
              @click="activeCategory = cat.category_id"
            >
              <v-icon size="13" class="cat-icon">{{ cat.icon }}</v-icon>
              {{ cat.category_name }}
            </button>
          </div>
        </header>

        <div class="header-gap" />

        <!-- ══════════ MAIN SCROLL ══════════ -->
        <main class="scroll-body">

          <!-- ── Skeletons ── -->
          <template v-if="resolvingToken || menuStore.loading">
            <div class="skeleton-hero" />
            <div class="px-4 mt-5">
              <div v-for="i in 3" :key="i" class="skeleton-row mb-4" />
            </div>
          </template>

          <template v-else>

            <!-- ── Hero Feature Card ── -->
            <div v-if="heroItem" class="hero-section" :class="{ 'hero-visible': heroVisible }">
              <div class="hero-card">
                <div class="hero-img-wrap">
                  <v-img :src="heroItem.image || fallbackImg" cover height="210" class="hero-img" />
                  <!-- gradient overlay -->
                  <div class="hero-overlay" />
                  <!-- floating badge -->
                  <div class="hero-badge">Chef's Pick</div>
                  <!-- price pill -->
                  <div class="hero-price">${{ parseFloat(heroItem.price || 0).toFixed(2) }}</div>
                </div>

                <div class="hero-body">
                  <div class="hero-meta">
                    <div class="star-row">
                      <v-icon size="13" color="#f59e0b">mdi-star</v-icon>
                      <v-icon size="13" color="#f59e0b">mdi-star</v-icon>
                      <v-icon size="13" color="#f59e0b">mdi-star</v-icon>
                      <v-icon size="13" color="#f59e0b">mdi-star</v-icon>
                      <v-icon size="13" color="#f59e0b">mdi-star-half-full</v-icon>
                      <span class="star-label">4.9 · 120+ reviews</span>
                    </div>
                  </div>
                  <div class="prep-time-badge">
                    <v-icon size="11" color="#7a8c76">mdi-clock-outline</v-icon>
                    <span>~{{ heroItem.prep_time_minutes ?? 10 }}min</span>
                  </div>

                  <!-- ✅ Fixed: removed duplicate hero-name -->
                  <div class="hero-name">{{ heroItem.name }}</div>
                  <div class="hero-desc">{{ heroItem.description || 'A fresh, flavourful creation from our chef.' }}</div>

                  <div class="hero-foot">
                    <div class="hero-tags">
                      <span class="tag">Fresh</span>
                      <span class="tag">Chef Special</span>
                    </div>
                    <button class="add-btn add-btn--hero" @click="addToCart(heroItem, $event)">
                      <v-icon color="#fff" size="20">mdi-plus</v-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Section heading ── -->
            <div v-if="filteredItems.length" class="section-head px-4">
              <span class="section-label">Popular Dishes</span>
              <span class="section-count">{{ filteredItems.length }} items</span>
            </div>

            <!-- ── Item List ── -->
            <div v-if="listItems.length" class="item-list px-4 pb-36 fade-in">
              <div
                v-for="(item, idx) in listItems"
                :key="item.id"
                class="item-card"
                :style="{ animationDelay: idx * 50 + 'ms' }"
              >
                <div class="item-img-wrap">
                  <v-img :src="item.image || fallbackImg" cover width="104" height="104" class="item-img" />
                  <div class="item-img-shine" />
                </div>

                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-desc">{{ item.description || 'Taste the best from our chef.' }}</div>
                  <div class="prep-time-badge">
                    <v-icon size="11" color="#7a8c76">mdi-clock-outline</v-icon>
                    <span>~{{ item.prep_time_minutes ?? 10 }}min</span>
                  </div>

                  <div class="item-foot">
                    <div class="item-price">${{ parseFloat(item.price || 0).toFixed(2) }}</div>
                    <button class="add-btn" @click="addToCart(item, $event)">
                      <v-icon color="#fff" size="18">mdi-plus</v-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <!-- ✅ Fixed: closes item-list div -->

            <!-- ── Empty state ── -->
            <div v-if="!menuStore.loading && filteredItems.length === 0" class="empty-state">
              <v-icon size="48" color="#c5d5c0">mdi-leaf-off</v-icon>
              <p class="empty-title">Nothing found</p>
              <p class="empty-sub">Try a different category or search term.</p>
            </div>

          </template>
          <!-- ✅ Fixed: closes v-else template -->

        </main>

        <!-- ══════════ FLOATING CART ══════════ -->
        <transition name="cart-slide">
          <div v-if="cartStore.cartCount > 0" class="cart-bar" @click="goToOrder">
            <div class="cart-left">
              <div class="cart-icon-wrap">
                <v-icon color="#fff" size="22">mdi-shopping-outline</v-icon>
                <div :key="cartStore.cartCount" class="cart-count">{{ cartStore.cartCount }}</div>
              </div>
              <div>
                <div class="cart-items-txt">{{ cartStore.cartCount }} item{{ cartStore.cartCount > 1 ? 's' : '' }}</div>
                <div class="cart-view-txt">View Order</div>
              </div>
            </div>
            <div class="cart-right">
              <span class="cart-total">${{ cartStore.cartTotal.toFixed(2) }}</span>
              <v-icon color="rgba(255,255,255,.7)" size="18">mdi-chevron-right</v-icon>
            </div>
          </div>
        </transition>

      </template>
    </div>
  </div>
</template>

<style scoped>
/* ── Google Font ── */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

/* ════════════════════════════════
   ROOT / SHELL
════════════════════════════════ */
.root-wrap {
  background: #eae8e0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.mobile-shell {
  position: relative;
  width: 100%;
  max-width: 480px;
  min-height: 100vh;
  background: #f4f2ec;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
}

/* ── Prep time badge ── */
.prep-time-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(122, 140, 118, .10);
  border-radius: 999px;
  padding: 3px 8px;
  margin-bottom: 6px;
}

.prep-time-badge span {
  font-size: 10px;
  font-weight: 600;
  color: #7a8c76;
  letter-spacing: 0.02em;
}

/* ════════════════════════════════
   ERROR SCREEN
════════════════════════════════ */
.err-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  position: relative;
}

.err-blob {
  position: absolute;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, #d4e8d0 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.err-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  color: #2d3b29;
  margin: 0;
}

.err-sub {
  font-size: 13px;
  color: #7a8c76;
  margin: 0;
  text-align: center;
}

/* ════════════════════════════════
   HEADER
════════════════════════════════ */
.app-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  z-index: 50;
  background: #f4f2ec;
  border-bottom: 1px solid rgba(47, 107, 60, .10);
  box-shadow: 0 4px 24px rgba(30, 50, 25, .07);
  padding: 16px 0 0;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2f6b3c 0%, #1a4526 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(47, 107, 60, .30);
}

.brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 17px;
  font-weight: 700;
  color: #1c2e1a;
  line-height: 1.1;
}

.brand-sub {
  font-size: 10px;
  color: #7a8c76;
  font-weight: 500;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.table-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #e4ede5;
  color: #2f6b3c;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(47, 107, 60, .15);
  letter-spacing: .01em;
}

/* ── Search ── */
.search-wrap {
  padding: 0 14px 10px;
}

.search-field :deep(.v-field) {
  border-radius: 16px !important;
  background: #fff !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, .06) !important;
  border: 1.5px solid rgba(47, 107, 60, .10) !important;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
}

.search-field :deep(.v-field__outline) {
  display: none !important;
}

/* ── Category Pills ── */
.cat-strip {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding: 0 14px 14px;
  scrollbar-width: none;
}

.cat-strip::-webkit-scrollbar {
  display: none;
}

.cat-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  white-space: nowrap;
  padding: 7px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  border: 1.5px solid rgba(47, 107, 60, .18);
  background: transparent;
  color: #5a6e57;
  cursor: pointer;
  transition: all .22s ease;
  letter-spacing: .01em;
}

.cat-pill:hover {
  background: rgba(47, 107, 60, .06);
}

.cat-pill--active {
  background: #2f6b3c;
  color: #fff;
  border-color: #2f6b3c;
  box-shadow: 0 4px 14px rgba(47, 107, 60, .30);
}

.cat-icon {
  opacity: .75;
}

.cat-pill--active .cat-icon {
  opacity: 1;
}

.header-gap {
  height: 210px;
}

/* ════════════════════════════════
   SCROLL BODY
════════════════════════════════ */
.scroll-body {
  position: relative;
  z-index: 5;
}

/* ── Skeletons ── */
.skeleton-hero {
  margin: 0 16px 0;
  height: 320px;
  background: linear-gradient(90deg, #e2e0d8 25%, #ece9e1 50%, #e2e0d8 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 22px;
}

.skeleton-row {
  height: 108px;
  background: linear-gradient(90deg, #e2e0d8 25%, #ece9e1 50%, #e2e0d8 75%);
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 18px;
}

@keyframes shimmer {
  0% { background-position: 100% 0 }
  100% { background-position: -100% 0 }
}

/* ════════════════════════════════
   HERO CARD
════════════════════════════════ */
.hero-section {
  padding: 0 16px;
  opacity: 0;
  transform: translateY(18px);
  transition: opacity .5s ease, transform .5s ease;
}

.hero-section.hero-visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-card {
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(30, 50, 25, .13);
  border: 1px solid rgba(47, 107, 60, .06);
}

.hero-img-wrap {
  position: relative;
}

.hero-img {
  display: block;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 20, 8, .45) 0%, transparent 55%);
}

.hero-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(255, 255, 255, .92);
  backdrop-filter: blur(8px);
  color: #2f6b3c;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
  letter-spacing: .04em;
  text-transform: uppercase;
  box-shadow: 0 2px 12px rgba(0, 0, 0, .12);
}

.hero-price {
  position: absolute;
  bottom: 14px;
  left: 16px;
  color: #fff;
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 2px 12px rgba(0, 0, 0, .35);
}

.hero-body {
  padding: 16px 18px 20px;
}

.hero-meta {
  margin-bottom: 6px;
}

.star-row {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star-label {
  font-size: 11px;
  color: #7a8c76;
  font-weight: 500;
  margin-left: 6px;
}

.hero-name {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: #1c2e1a;
  line-height: 1.25;
  margin-bottom: 6px;
}

.hero-desc {
  font-size: 13px;
  color: #7a8c76;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 14px;
}

.hero-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-tags {
  display: flex;
  gap: 6px;
}

.tag {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  padding: 4px 10px;
  border-radius: 999px;
  background: #e8f0e8;
  color: #2f6b3c;
}

/* ════════════════════════════════
   ADD BUTTON
════════════════════════════════ */
.add-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2f6b3c 0%, #1a4526 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(47, 107, 60, .36);
  transition: transform .18s ease, box-shadow .18s ease;
  flex-shrink: 0;
}

.add-btn:hover {
  transform: scale(1.08);
}

.add-btn:active {
  transform: scale(.92);
}

.add-btn--hero {
  width: 44px;
  height: 44px;
  box-shadow: 0 8px 22px rgba(47, 107, 60, .40);
}

.add-btn.btn-pop {
  animation: btnPop .4s cubic-bezier(.175, .885, .32, 1.275);
}

@keyframes btnPop {
  0%   { transform: scale(1) }
  35%  { transform: scale(.65) }
  70%  { transform: scale(1.18) }
  100% { transform: scale(1) }
}

/* ════════════════════════════════
   SECTION HEADER
════════════════════════════════ */
.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 24px;
  padding-bottom: 12px;
}

.section-label {
  font-family: 'Playfair Display', serif;
  font-size: 19px;
  font-weight: 700;
  color: #1c2e1a;
}

.section-count {
  font-size: 12px;
  color: #9aab96;
  font-weight: 500;
}

/* ════════════════════════════════
   ITEM CARDS
════════════════════════════════ */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  display: flex;
  gap: 14px;
  background: #fff;
  border-radius: 20px;
  padding: 12px;
  align-items: center;
  border: 1px solid rgba(47, 107, 60, .05);
  box-shadow: 0 4px 18px rgba(30, 50, 25, .07);
  animation: slideUp .35s ease both;
  transition: transform .2s ease, box-shadow .2s ease;
}

.item-card:active {
  transform: scale(.98);
  box-shadow: 0 2px 8px rgba(30, 50, 25, .06);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(14px) }
  to   { opacity: 1; transform: translateY(0) }
}

.item-img-wrap {
  position: relative;
  flex-shrink: 0;
  border-radius: 14px;
  overflow: hidden;
}

.item-img {
  border-radius: 14px;
  display: block;
}

.item-img-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, .18) 0%, transparent 60%);
  pointer-events: none;
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-family: 'Playfair Display', serif;
  font-size: 15px;
  font-weight: 600;
  color: #1c2e1a;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-desc {
  font-size: 12px;
  color: #9aab96;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}

.item-price {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 700;
  color: #2f6b3c;
}

/* ════════════════════════════════
   EMPTY STATE
════════════════════════════════ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 64px 24px;
  text-align: center;
}

.empty-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: #2d3b29;
  margin: 0;
}

.empty-sub {
  font-size: 13px;
  color: #9aab96;
  margin: 0;
}

/* ════════════════════════════════
   CART BAR
════════════════════════════════ */
.cart-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 448px;
  background: linear-gradient(135deg, #2f6b3c 0%, #1a4526 100%);
  border-radius: 20px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  z-index: 100;
  box-shadow: 0 14px 48px rgba(47, 107, 60, .40);
  transition: transform .2s ease;
}

.cart-bar:active {
  transform: translateX(-50%) scale(.98);
}

.cart-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.cart-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -10px;
  background: #ffb300;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pop .4s cubic-bezier(.175, .885, .32, 1.275);
  box-shadow: 0 2px 8px rgba(0, 0, 0, .22);
}

@keyframes pop {
  0%   { transform: scale(0) }
  55%  { transform: scale(1.3) }
  100% { transform: scale(1) }
}

.cart-items-txt {
  font-size: 11px;
  color: rgba(255, 255, 255, .75);
  font-weight: 500;
  line-height: 1.2;
}

.cart-view-txt {
  font-size: 15px;
  color: #fff;
  font-weight: 700;
  line-height: 1.2;
  font-family: 'Playfair Display', serif;
}

.cart-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cart-total {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

/* ── Cart transition ── */
.cart-slide-enter-active {
  transition: opacity .3s ease, transform .3s cubic-bezier(.34, 1.56, .64, 1);
}

.cart-slide-leave-active {
  transition: opacity .2s ease, transform .2s ease;
}

.cart-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(30px);
}

.cart-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(30px);
}

/* ════════════════════════════════
   UTILITIES
════════════════════════════════ */
.fade-in {
  animation: fadeIn .4s ease;
}

@keyframes fadeIn {
  from { opacity: 0 }
  to   { opacity: 1 }
}

.pb-36 {
  padding-bottom: 100px;
}
</style>