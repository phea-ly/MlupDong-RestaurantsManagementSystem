<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMenuStore } from "@/stores/menu.store";
import { useCartStore } from "@/stores/cart.store";
import { tableApi } from "@/api/order.api";

/* ─── stores & routing ─── */
const menuStore = useMenuStore();
const cartStore = useCartStore();
const route = useRoute();
const router = useRouter();

/* ─── state ─── */
const searchQuery = ref("");
const activeCategory = ref("All");
const resolvingToken = ref(true);
const tokenError = ref(false);

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1548943487-a2e4142f6ab3?q=80&w=600&auto=format&fit=crop";

/* ─── category pills ─── */
const CATEGORY_ICONS = ["mdi-silverware-fork-knife", "mdi-glass-cocktail"];

const categories = computed(() => [
  { category_id: "All", category_name: "All", icon: "mdi-fire-circle" },
  ...menuStore.categories.slice(0, 2).map((cat, i) => ({
    category_id: cat.category_id,
    category_name: cat.category_name,
    icon: CATEGORY_ICONS[i] ?? "mdi-food",
  })),
]);

/* ─── filtered menu items ─── */
const filteredItems = computed(() => {
  let items = menuStore.menuItems.filter((item) => item.status);

  if (activeCategory.value !== "All") {
    items = items.filter(
      (item) => String(item.category_id) === String(activeCategory.value),
    );
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q),
    );
  }

  return items;
});

const featuredItem = computed(() => filteredItems.value[0] ?? null);
const popularItems = computed(() => filteredItems.value.slice(1, 6));

/* ─── helpers ─── */
function currency(value) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function addToCart(item, event) {
  cartStore.addToCart(item);

  const btn = event?.currentTarget;
  if (btn) {
    btn.classList.add("btn-pop");
    setTimeout(() => btn.classList.remove("btn-pop"), 240);
  }
}

function goToOrder() {
  router.push({ name: "customer-order", params: { token: route.params.token } });
}

/* ─── lifecycle ─── */
onMounted(async () => {
  try {
    const { data } = await tableApi.getByToken(route.params.token);
    cartStore.setTableId(data.table_id, data.table_number);
  } catch {
    tokenError.value = true;
    resolvingToken.value = false;
    return;
  }

  await menuStore.fetchCategories();
  await menuStore.fetchMenuItems();
  resolvingToken.value = false;
});

onUnmounted(() => {
  cartStore.leaveTableChannel();
});
</script>

<template>
  <div class="menu-page">

    <!-- ── Invalid QR ── -->
    <div v-if="tokenError" class="empty-state">
      <v-icon size="56" color="#b7c6b2">mdi-qrcode-off</v-icon>
      <h2>Invalid QR Code</h2>
      <p>Please scan the correct table QR code.</p>
    </div>

    <template v-else>

      <!-- ── Top Bar ── -->
      <header class="topbar">
        <div class="brand">
          <div class="brand-icon">
            <v-icon size="16" color="white">mdi-leaf</v-icon>
          </div>
          <div>
            <div class="brand-name">Mlup Dong</div>
            <div class="brand-sub">Restaurant</div>
          </div>
        </div>

        <div class="table-chip">
          <v-icon size="13">mdi-table-furniture</v-icon>
          Table {{ cartStore.tableNumber ?? "--" }}
        </div>
      </header>

      <!-- ── Search ── -->
      <v-text-field
        v-model="searchQuery"
        placeholder="Search for food, drinks..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        hide-details
        rounded="xl"
        class="search-field mb-5"
      />

      <!-- ── Category Pills ── -->
      <div class="pill-row">
        <button
          v-for="cat in categories"
          :key="cat.category_id"
          class="pill"
          :class="{ 'pill--active': activeCategory === cat.category_id }"
          @click="activeCategory = cat.category_id"
        >
          <v-icon size="14">{{ cat.icon }}</v-icon>
          {{ cat.category_name }}
        </button>
      </div>

      <!-- ── Content ── -->
      <main class="content">

        <!-- skeleton -->
        <template v-if="resolvingToken || menuStore.loading">
          <div class="skeleton hero-skeleton" />
          <div v-for="n in 2" :key="n" class="skeleton row-skeleton" />
        </template>

        <template v-else>

          <!-- Hero Card -->
          <section v-if="featuredItem" class="hero-card">
            <div class="hero-card__image-wrap">
              <v-img
                :src="featuredItem.image || FALLBACK_IMG"
                height="200"
                cover
                class="hero-card__image"
              />
              <div class="hero-card__price-badge">
                {{ currency(featuredItem.price) }}
              </div>
            </div>

            <div class="hero-card__body">
              <p class="hero-card__title">{{ featuredItem.name }}</p>
              <p class="hero-card__desc">
                {{ featuredItem.description || "Fresh signature dish from our kitchen." }}
              </p>

              <div class="hero-card__footer">
                <div class="rating">
                  <v-icon size="12" color="#f7a928">mdi-star</v-icon>
                  <span class="rating__value">4.9</span>
                  <span class="rating__count">(120+ reviews)</span>
                </div>

                <button class="add-btn add-btn--circle" @click="addToCart(featuredItem, $event)">
                  <v-icon size="22" color="white">mdi-plus</v-icon>
                </button>
              </div>
            </div>
          </section>

          <!-- Popular Dishes -->
          <section class="popular">
            <h2 class="section-title">Popular Dishes</h2>

            <div v-if="popularItems.length" class="popular-list">
              <article v-for="item in popularItems" :key="item.id" class="popular-card">
                <v-img
                  :src="item.image || FALLBACK_IMG"
                  width="84"
                  height="84"
                  cover
                  class="popular-card__image"
                />

                <div class="popular-card__body">
                  <p class="popular-card__title">{{ item.name }}</p>
                  <p class="popular-card__desc">
                    {{ item.description || "Chef recommendation from our menu." }}
                  </p>

                  <div class="popular-card__footer">
                    <span class="popular-card__price">{{ currency(item.price) }}</span>
                    <button class="add-btn add-btn--square" @click="addToCart(item, $event)">
                      <v-icon size="18">mdi-plus</v-icon>
                    </button>
                  </div>
                </div>
              </article>
            </div>

            <div v-else class="empty-state empty-state--soft">
              <v-icon size="40" color="#bfd0bc">mdi-food-off</v-icon>
              <p>No dishes found.</p>
            </div>
          </section>

        </template>
      </main>

    </template>
  </div>

  <!-- ── Floating Cart Bar ── -->
  <transition name="cart-slide">
    <button v-if="cartStore.cartCount > 0" class="cart-bar" @click="goToOrder">
      <div class="cart-bar__left">
        <div class="cart-bar__icon-wrap">
          <v-icon size="20" color="white">mdi-cart-outline</v-icon>
          <span class="cart-bar__badge">{{ cartStore.cartCount }}</span>
        </div>

        <div class="cart-bar__labels">
          <div class="cart-bar__caption">{{ cartStore.cartCount }} Items Added</div>
          <div class="cart-bar__cta">View Order</div>
        </div>
      </div>

      <div class="cart-bar__right">
        <div class="cart-bar__caption">Total</div>
        <div class="cart-bar__total">{{ currency(cartStore.cartTotal) }}</div>
      </div>
    </button>
  </transition>
</template>

<style scoped>
/* ─── Root ─── */
.menu-page {
  width: 100%;
  max-width: 440px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 18px 16px 160px;
  background: linear-gradient(180deg, #f8f7f2 0%, #f4f2eb 100%);
  color: #263127;
  font-family: inherit;
}

/* ─── Top Bar ─── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: #356f31;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.brand-name {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.1;
}

.brand-sub {
  margin-top: 2px;
  font-size: 9px;
  letter-spacing: 0.04em;
  color: #a4ada2;
  font-weight: 500;
}

.table-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: 999px;
  background: #dfeccc;
  color: #5a7b4e;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ─── Search ─── */
.search-field :deep(.v-field) {
  background: #fff;
  border-radius: 20px !important;
  border: 1px solid #e6ebe3;
  box-shadow: inset 0 1px 3px rgba(16, 24, 18, 0.08);
}

.search-field :deep(input) {
  min-height: 46px;
}

/* ─── Category Pills ─── */
.pill-row {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 18px;
  scrollbar-width: none;
}

.pill-row::-webkit-scrollbar {
  display: none;
}

.pill {
  min-height: 44px;
  border: 1px solid #e2e5df;
  border-radius: 999px;
  background: #fff;
  color: #374151 !important;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(16, 24, 18, 0.06);
  cursor: pointer;
}

.pill :deep(.v-icon) {
  color: #374151 !important;
}

.pill--active {
  background: #356f31;
  color: #fff !important;
  border-color: #356f31;
  box-shadow: 0 10px 18px rgba(53, 111, 49, 0.24);
}

.pill--active :deep(.v-icon) {
  color: #fff !important;
}

.pill--icon {
  width: 44px;
  padding: 0;
  justify-content: center;
  flex-shrink: 0;
}

/* ─── Content ─── */
.content {
  display: grid;
  gap: 18px;
}

/* ─── Hero Card ─── */
.hero-card {
  background: #fff;
  border: 1px solid #e8e9e2;
  border-radius: 24px;
  box-shadow: 0 10px 24px rgba(19, 31, 20, 0.08);
  overflow: hidden;
}

.hero-card__image-wrap {
  position: relative;
}

.hero-card__image {
  border-radius: 0;
}

.hero-card__price-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.96);
  color: #222d24;
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 6px 14px rgba(17, 24, 18, 0.08);
}

.hero-card__body {
  padding: 20px 20px 18px;
}

.hero-card__title {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}

.hero-card__desc {
  margin: 8px 0 0;
  color: #849084;
  font-size: 14px;
  line-height: 1.45;
}

.hero-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
}

/* ─── Rating ─── */
.rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rating__value {
  font-size: 13px;
  font-weight: 700;
}

.rating__count {
  font-size: 12px;
  color: #9da99f;
}

/* ─── Add buttons ─── */
.add-btn {
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 0.16s ease;
  flex-shrink: 0;
}

.add-btn--circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #356f31;
  box-shadow: 0 12px 24px rgba(53, 111, 49, 0.28);
}

.add-btn--square {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: #356f31;
  color: #fff;
}

.add-btn--square :deep(.v-icon) {
  color: #fff !important;
}

.add-btn.btn-pop {
  animation: pop 0.24s ease;
}

@keyframes pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(0.86); }
  100% { transform: scale(1); }
}

/* ─── Popular Section ─── */
.section-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 12px;
}

.popular {
  display: grid;
  gap: 12px;
}

.popular-list {
  display: grid;
  gap: 14px;
}

.popular-card {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 14px;
  padding: 14px;
  align-items: center;
  background: #fff;
  border: 1px solid #e8e9e2;
  border-radius: 20px;
  box-shadow: 0 4px 14px rgba(19, 31, 20, 0.05);
}

.popular-card__image {
  border-radius: 14px;
  flex-shrink: 0;
}

.popular-card__body {
  min-width: 0;
}

.popular-card__title {
  font-size: 15px;
  font-weight: 800;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popular-card__desc {
  margin: 4px 0 0;
  color: #8b9790;
  font-size: 13px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.popular-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.popular-card__price {
  font-size: 15px;
  font-weight: 800;
  color: #2d6c42;
}

/* ─── Floating Cart Bar ── */
.cart-bar {
  position: fixed;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 6px);
  transform: translateX(-50%);
  width: min(100% - 32px, 420px);
  min-height: 70px;
  border: none;
  border-radius: 18px;
  background: #2d5f29;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  box-shadow: 0 20px 42px rgba(19, 31, 20, 0.28);
  z-index: 30;
  cursor: pointer;
  margin-bottom: 32px;
}

.cart-bar__left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.cart-bar__icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  display: grid;
  place-items: center;
  position: relative;
  flex-shrink: 0;
}

.cart-bar__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  color: #356f31;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
}

.cart-bar__labels {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.cart-bar__caption {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.3;
}

.cart-bar__cta {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
}

.cart-bar__total {
  font-size: 18px;
  font-weight: 800;
}

.cart-bar__right {
  text-align: right;
  flex-shrink: 0;
  min-width: 84px;
}

/* ─── Empty / Skeleton ─── */
.empty-state {
  min-height: 220px;
  display: grid;
  place-items: center;
  gap: 10px;
  text-align: center;
  padding: 24px;
  color: #6b796d;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid #e8e9e2;
  border-radius: 24px;
  box-shadow: 0 10px 24px rgba(19, 31, 20, 0.08);
}

.empty-state--soft {
  min-height: 140px;
}

.skeleton {
  border-radius: 22px;
  background: linear-gradient(90deg, #ecefe7, #f7f7f3, #ecefe7);
  background-size: 300% 100%;
  animation: shimmer 1.2s linear infinite;
}

.hero-skeleton {
  height: 340px;
}

.row-skeleton {
  height: 106px;
}

@keyframes shimmer {
  0%   { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* ─── Cart transition ─── */
.cart-slide-enter-active,
.cart-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.cart-slide-enter-from,
.cart-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(14px);
}
</style>
