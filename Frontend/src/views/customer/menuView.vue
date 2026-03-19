<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useMenuStore } from "@/stores/menu.store";
import { useCartStore } from "@/stores/cart.store";

const menuStore = useMenuStore();
const cartStore = useCartStore();
const route = useRoute();

const searchQuery = ref("");
const activeCategory = ref("All");

// Get token from route params
const tableToken = computed(() => route.params.token);

// Fetch table details based on token
const tableInfo = ref(null);

onMounted(async () => {
  await menuStore.fetchCategories();
  await menuStore.fetchMenuItems();

  // If token exists, fetch table info
  if (tableToken.value) {
    try {
      // Find table by QR code URL token
      const response = await api.get(`/tables/by-token/${tableToken.value}`);
      tableInfo.value = response.data;
    } catch (error) {
      console.error("Failed to fetch table info:", error);
    }
  }
});

const categories = computed(() => {
  const allCat = {
    category_id: "All",
    category_name: "All",
    icon: "mdi-silverware-fork-knife",
  };
  const mapped = menuStore.categories.map((c) => ({
    ...c,
    icon: "mdi-tag-outline",
  }));
  return [allCat, ...mapped];
});

const filteredItems = computed(() => {
  // Only show active items to customers
  let items = menuStore.menuItems.filter((i) => i.status);

  if (activeCategory.value !== "All") {
    items = items.filter(
      (i) => String(i.category_id) === String(activeCategory.value),
    );
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q)),
    );
  }

  return items;
});

const featuredItem = computed(() =>
  filteredItems.value.length ? filteredItems.value[0] : null,
);
const popularDishes = computed(() =>
  filteredItems.value.length > 1 ? filteredItems.value.slice(1) : [],
);

const fallbackImg =
  "https://images.unsplash.com/photo-1548943487-a2e4142f6ab3?q=80&w=600&auto=format&fit=crop";

// Cart logic handled by store now
function addToCart(item, event) {
  cartStore.addToCart(item);

  // Animate the button pop
  if (event && event.currentTarget) {
    const el = event.currentTarget;
    // Add temporary class
    el.classList.add("bouncing");
    setTimeout(() => {
      el.classList.remove("bouncing");
    }, 300);
  }
}
</script>

<template>
  <div class="mobile-layout">
    <!-- Premium top accent background -->
    <div class="top-accent"></div>

    <!-- Header -->
    <div
      class="d-flex align-center justify-space-between pt-6 pb-2 px-4 position-relative"
    >
      <div class="d-flex align-center ga-3">
        <v-avatar color="#fff" rounded size="44" class="elevation-2">
          <v-icon color="#215732" size="28">mdi-leaf</v-icon>
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold text-white mb-1">
            Mlup Dong Restaurant
          </div>
          <div class="text-caption text-white opacity-90">
            Table Menu • Scan QR to Order
          </div>
          <div
            v-if="tableToken"
            class="text-caption text-white opacity-75 mt-1"
          >
            Token: {{ tableToken }}
          </div>
          <div v-if="tableInfo" class="text-caption text-white opacity-75 mt-1">
            Table {{ tableInfo.table_number }} • {{ tableInfo.location }} •
            {{ tableInfo.capacity }} Seats
          </div>
        </div>
      </div>
      <v-chip
        color="white"
        variant="elevated"
        class="font-weight-bold text-green-darken-4 elevation-2 rounded-xl"
        size="small"
      >
        <v-icon start size="14">mdi-table-furniture</v-icon>
        Table 05
      </v-chip>
    </div>

    <!-- Main Content bg block -->
    <div class="main-content-bg mt-3 rounded-t-xl pt-4">
      <!-- Search Bar -->
      <div class="px-4 pb-3">
        <v-text-field
          v-model="searchQuery"
          placeholder="Search for food, drinks..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          rounded="xl"
          bg-color="#f8faf9"
          color="#215732"
          class="search-input"
          clearable
        ></v-text-field>
      </div>

      <!-- Categories -->
      <div class="category-scroll px-4 pb-4">
        <v-btn
          v-for="cat in categories"
          :key="cat.category_id"
          rounded="xl"
          :variant="activeCategory === cat.category_id ? 'flat' : 'outlined'"
          :color="activeCategory === cat.category_id ? '#215732' : '#eef2f0'"
          class="mr-2 text-none category-btn"
          :class="
            activeCategory === cat.category_id
              ? 'text-white'
              : 'text-grey-darken-3'
          "
          @click="activeCategory = cat.category_id"
          elevation="0"
          height="38"
        >
          <v-icon
            start
            size="18"
            :color="
              activeCategory === cat.category_id ? 'white' : 'grey-darken-1'
            "
          >
            {{ cat.icon }}
          </v-icon>
          {{ cat.category_name }}
        </v-btn>
      </div>

      <!-- Loading State -->
      <div v-if="menuStore.loading" class="px-4 mt-4">
        <v-card
          v-for="i in 6"
          :key="i"
          class="mb-4 rounded-xl elevation-1 bg-white"
        >
          <v-skeleton-loader
            type="image"
            height="180"
            class="rounded-t-xl"
          ></v-skeleton-loader>
          <div class="pa-3">
            <v-skeleton-loader
              type="list-item-two-line"
              class="mb-2"
            ></v-skeleton-loader>
            <v-skeleton-loader
              type="text"
              width="60%"
              height="20"
              class="mb-1"
            ></v-skeleton-loader>
            <div class="d-flex align-center justify-space-between">
              <div
                class="d-flex align-center rating-pill pa-1 pr-3 rounded-pill"
              >
                <v-icon color="#FFB300" size="18" class="mr-1">mdi-star</v-icon>
                <span
                  class="font-weight-bold mr-1 text-grey-darken-3 text-caption"
                  >5.0</span
                >
                <span class="text-grey-darken-1 text-caption">(0 reviews)</span>
              </div>
              <v-btn
                icon
                color="#215732"
                size="44"
                class="text-white elevation-2 btn-add-animated"
                @click="addToCart(featuredItem, $event)"
              >
                <v-icon size="24">mdi-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>

      <!-- Popular Dishes -->
      <div v-if="popularDishes.length" class="px-4 pb-24 fade-in">
        <h2 class="text-h6 font-weight-black mb-4 text-grey-darken-4">
          Must Try
        </h2>

        <v-card
          v-for="item in popularDishes"
          :key="item.id"
          class="popular-card rounded-xl pa-3 mb-4 d-flex align-stretch bg-white"
          v-ripple
        >
          <v-img
            :src="item.image || fallbackImg"
            width="110"
            height="110"
            class="rounded-xl mr-4 flex-shrink-0 bg-grey-lighten-4"
            cover
          ></v-img>
          <div
            class="flex-grow-1 py-1 pr-1 d-flex flex-column justify-space-between"
          >
            <div>
              <div
                class="font-weight-bold mb-1 line-clamp-2 text-grey-darken-4"
                style="font-size: 16px; line-height: 1.25"
              >
                {{ item.name }}
              </div>
              <div
                class="text-caption text-grey-darken-1 mb-2 line-clamp-1"
                style="line-height: 1.3"
              >
                {{ item.description || "Taste the best from our chef." }}
              </div>
            </div>
            <div class="d-flex align-center justify-space-between mt-auto pt-1">
              <div
                class="font-weight-black text-subtitle-1 text-green-darken-4"
              >
                ${{ parseFloat(item.price || 0).toFixed(2) }}
              </div>
              <v-btn
                icon
                color="#215732"
                size="36"
                class="elevation-2 btn-add-animated"
                @click="addToCart(item, $event)"
              >
                <v-icon color="#ffffff" size="20">mdi-plus</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- Floating Cart -->
    <v-fade-transition>
      <div v-if="cartStore.cartCount > 0" class="fixed-bottom-cart px-4 pb-6">
        <v-card
          class="cart-pill rounded-pill pa-3 px-5 d-flex align-center"
          color="#215732"
          elevation="8"
          v-ripple
          @click="router.push('/customer-order')"
        >
          <div class="position-relative mr-5 cart-icon-box">
            <v-icon color="white" size="28">mdi-shopping-outline</v-icon>
            <!-- Cart counter pop animation dynamically triggers when length changes via :key -->
            <div :key="cartStore.cartCount" class="cart-badge scale-pop">
              {{ cartStore.cartCount }}
            </div>
          </div>
          <div class="text-white flex-grow-1">
            <div
              class="text-caption font-weight-medium"
              style="opacity: 0.85; line-height: 1.2"
            >
              {{ cartStore.cartCount }} Items
            </div>
            <div
              class="font-weight-bold text-subtitle-1"
              style="line-height: 1.2"
            >
              View Order
            </div>
          </div>
          <div
            class="text-white text-h6 font-weight-black text-right pt-1 d-flex align-center"
          >
            ${{ cartStore.cartTotal.toFixed(2) }}
            <v-icon size="20" class="ml-2" style="opacity: 0.8"
              >mdi-chevron-right</v-icon
            >
          </div>
        </v-card>
      </div>
    </v-fade-transition>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap");

.mobile-layout {
  font-family: "Manrope", sans-serif;
  max-width: 480px;
  margin: 0 auto;
  background-color: #f4f7f6;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.top-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 220px;
  background: linear-gradient(135deg, #1b4b2a 0%, #215732 100%);
  z-index: 0;
}

.position-relative {
  position: relative;
  z-index: 10;
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.main-content-bg {
  background-color: #fafbfc;
  position: relative;
  z-index: 5;
  min-height: calc(100vh - 80px);
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.06);
}

.line-height-1 {
  line-height: 1.2;
}

.search-input :deep(.v-field__outline) {
  border: none !important;
}

.search-input :deep(.v-field) {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03) !important;
  border: 1px solid #e8edea;
  transition: all 0.2s;
}

.search-input :deep(.v-field--focused) {
  border-color: #215732;
}

.category-scroll {
  display: flex;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-btn {
  border-color: #e8edea !important;
  font-weight: 700;
  letter-spacing: 0;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.category-btn:active {
  transform: scale(0.95);
}

.featured-card {
  box-shadow: 0 12px 30px rgba(33, 87, 50, 0.08) !important;
  border: 1px solid #f0f4f2;
}

.price-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background-color: rgba(255, 255, 255, 0.95);
  color: #1b4b2a;
  padding: 6px 14px;
  border-radius: 14px;
  font-size: 15px;
  backdrop-filter: blur(4px);
  z-index: 2;
}

.gradient-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 100%);
  z-index: 1;
  pointer-events: none;
}

.rating-pill {
  background-color: #f8faf9;
  border: 1px solid #e8edea;
}

.popular-card {
  box-shadow: 0 8px 24px rgba(149, 157, 165, 0.1) !important;
  border: 1px solid rgba(0, 0, 0, 0.02);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.popular-card:active {
  transform: scale(0.98);
}

.pb-24 {
  padding-bottom: 140px;
}

.fixed-bottom-cart {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  z-index: 100;
  background: linear-gradient(
    to top,
    rgba(250, 251, 252, 1) 40%,
    rgba(250, 251, 252, 0)
  );
}

.cart-pill {
  box-shadow: 0 10px 40px rgba(33, 87, 50, 0.35) !important;
  cursor: pointer;
  transition: transform 0.2s;
}

.cart-pill:active {
  transform: scale(0.97);
}

.cart-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background-color: #ffb300;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.scale-pop {
  animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(1.3);
  }

  100% {
    transform: scale(1);
  }
}

.btn-add-animated {
  transition: transform 0.15s ease;
}

.bouncing {
  animation: bounce 0.3s ease;
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.7);
  }
}

.fade-in {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
