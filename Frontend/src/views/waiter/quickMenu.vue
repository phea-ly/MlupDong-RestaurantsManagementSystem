<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useMenuStore } from '@/stores/menu.store';
import { useTableStore } from '@/stores/table.store';
import { order as orderApiObj } from '@/api/order.api';

const props = defineProps({
  initialTableId: {
    type: [Number, String],
    default: null
  }
});

const emit = defineEmits(['reset-table']);

const menuStore = useMenuStore();
const tableStore = useTableStore();

const selectedCategoryId = ref('all');
const submitting = ref(false);
const posCart = ref([]);
const selectedTable = ref(null);

// Watch for prop changes (e.g. from Floor Plan)
watch(() => props.initialTableId, (newVal) => {
  if (newVal) selectedTable.value = newVal;
}, { immediate: true });

// Image resolution using store logic
function getImageUrl(path) {
  if (!path) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200';
  
  if (typeof menuStore.resolveImageUrl === 'function') {
    return menuStore.resolveImageUrl(path);
  }
  
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  const cleanPath = path.replace(/^\/+/, '').replace(/^storage\//, '');
  return `${apiBase.replace(/\/api$/, "")}/storage/${cleanPath}`;
}

const posMenuItems = computed(() => {
  return menuStore.menuItems
    .filter(i => i.status !== false)
    .map(i => ({
      ...i,
      image: getImageUrl(i.image),
      tag: i.is_popular ? 'POPULAR' : '',
      tagColor: '#00ff00',
      tagText: '#000'
    }));
});

const filteredItems = computed(() => {
  if (selectedCategoryId.value === 'all') return posMenuItems.value;
  return posMenuItems.value.filter(i => i.category_id === selectedCategoryId.value);
});

onMounted(async () => {
  await Promise.all([
    menuStore.init(),
    tableStore.init()
  ]);
  
  if (!selectedTable.value && tableStore.tables.length > 0) {
    selectedTable.value = tableStore.tables[0].table_id;
  }
});

// Cart Logic
const cartSubtotal = computed(() => posCart.value.reduce((acc, i) => acc + (i.price * i.quantity), 0));
const cartTax      = computed(() => cartSubtotal.value * 0.1);
const cartTotal    = computed(() => cartSubtotal.value + cartTax.value);

function increaseQty(item) { item.quantity++; }
function decreaseQty(item) {
  if (item.quantity > 1) item.quantity--;
  else posCart.value = posCart.value.filter(i => i.id !== item.id);
}

function addToCart(menuItem) {
  const existing = posCart.value.find(i => i.menuItemId === menuItem.id);
  if (existing) {
    existing.quantity++;
  } else {
    posCart.value.push({
      id: Date.now(),
      menuItemId: menuItem.id,
      name: menuItem.name,
      note: '',
      price: menuItem.price,
      quantity: 1
    });
  }
}

async function submitOrder() {
  if (posCart.value.length === 0) return;
  if (!selectedTable.value) {
    alert("Please select a table to assign this order to.");
    return;
  }
  
  submitting.value = true;
  const orderPayload = {
    table_id: selectedTable.value,
    order_type: 'dine_in',
    items: posCart.value.map(i => ({
      menu_item_id: i.menuItemId,
      quantity: i.quantity,
      note: i.note
    }))
  };

  try {
    await orderApiObj.create(orderPayload);
    posCart.value = [];
    emit('reset-table'); // Clear the pre-selected table in parent
    alert(`Order submitted successfully!`);
  } catch(e) {
    console.error(e);
    alert(e.response?.data?.message || "Failed to submit order.");
  } finally {
    submitting.value = false;
  }
}
</script>


<template>
  <div class="d-flex flex-row h-100 position-relative w-100">
    
    <!-- Left: Menu Grid -->
    <div class="flex-grow-1 h-100 pa-8 overflow-y-auto" style="background-color: #070a08;" v-if="!menuStore.loading">
      
      <!-- Category Filters -->
      <div class="d-flex mb-8 align-center gap-4 filter-scroll" style="overflow-x: auto;">
        <v-chip-group v-model="selectedCategoryId" mandatory color="#00ff00" selected-class="bg-neon-green text-black">
          <v-chip
            v-for="cat in menuStore.categoryTabs" :key="cat.value"
            :value="cat.value"
            class="font-weight-bold text-body-1 px-6 mr-4"
            variant="outlined"
            :color="selectedCategoryId === cat.value ? 'transparent': '#2e3a33'"
            size="large"
            style="height: 46px; border-radius: 23px;"
            :class="selectedCategoryId !== cat.value ? 'bg-dark-olive text-white' : ''"
          >
            <v-icon start size="18" v-if="cat.icon" class="mr-2">{{ cat.icon }}</v-icon>
            {{ cat.label }}
          </v-chip>
        </v-chip-group>
      </div>

      <!-- Items Grid -->
      <v-row v-if="filteredItems.length">
        <template v-for="item in filteredItems" :key="item.id">
          <v-col cols="12" sm="6" md="4" lg="3" xl="2">
            <v-card 
              color="#111713" 
              class="rounded-xl border-dark overflow-hidden item-card-hover h-100 d-flex flex-column cursor-pointer" 
              elevation="0"
              @click="addToCart(item)"
            >
              <div class="position-relative">
                <v-img :src="item.image" cover height="160" width="100%">
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-grey-darken-4">
                      <v-icon color="#2e3a33" size="40">mdi-silverware</v-icon>
                    </div>
                  </template>
                </v-img>
                <v-chip v-if="item.tag" :color="item.tagColor" size="small"
                  class="position-absolute font-weight-black rounded-sm elevation-2"
                  style="top: 12px; right: 12px;"
                  :style="{ color: item.tagText }"
                >
                  {{item.tag}}
                </v-chip>
              </div>
              
              <v-card-text class="pa-4 flex-grow-1 d-flex flex-column">
                <div class="font-weight-black text-h6 text-white mb-1 line-height-1">{{item.name}}</div>
                <div class="text-body-2 text-grey-darken-1 mb-4 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3em;">
                  {{item.description}}
                </div>
                <div class="d-flex justify-space-between align-center mt-auto">
                   <span class="font-weight-black text-neon-green text-h6">${{Number(item.price).toFixed(2)}}</span>
                   <v-btn icon="mdi-plus" color="#102613" size="small" class="add-btn-hover rounded" elevation="0"></v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </template>
      </v-row>
      <div v-else class="text-center mt-12 text-grey-darken-1 text-body-1 font-weight-bold">
        <v-icon size="48" color="#2e3a33" class="mb-4">mdi-food-off-outline</v-icon>
        <p>No items found in this category.</p>
      </div>
    </div>
    <div class="flex-grow-1 h-100 pa-8 d-flex align-center justify-center" style="background-color: #070a08;" v-else>
      <v-progress-circular indeterminate color="#00ff00" size="48"></v-progress-circular>
    </div>

    <!-- Right: Cart Panel -->
    <v-navigation-drawer location="right" width="380" permanent color="#0b0f0c" style="border-left: 1px solid #16241a;">
      <div class="d-flex flex-column h-100">
        <!-- Cart Header -->
        <div class="pa-6 pb-4">
           <div class="d-flex justify-space-between align-center mb-3">
              <div class="d-flex align-center">
                <span class="live-dot mr-3 mt-1" style="box-shadow: none; width:6px; height:6px;"></span>
                <div class="text-h5 font-weight-black text-white">Quick Cart</div>
              </div>
              <v-chip color="#00ff00" class="text-black font-weight-black text-caption rounded-lg text-uppercase" v-if="!selectedTable">
                Table #
              </v-chip>
           </div>
           
           <div class="d-flex align-center justify-space-between" v-if="tableStore.tables.length">
              <span class="text-caption text-grey-darken-1 font-weight-bold text-uppercase ls-1">ASSIGN TO:</span>
              <v-select
                v-model="selectedTable"
                :items="tableStore.tables"
                item-title="table_number"
                item-value="table_id"
                variant="solo-filled"
                bg-color="#121f15"
                color="white"
                density="compact"
                hide-details
                placeholder="Select Table"
                class="cart-table-select elevation-0"
                rounded="lg"
                style="max-width: 140px;"
              >
                <template #selection="{ item }">
                  <span class="text-white font-weight-bold text-body-2">TABLE {{item.title}}</span>
                </template>
              </v-select>
           </div>
        </div>

        <v-divider :thickness="1" color="#1c241e"></v-divider>

        <!-- Cart Items -->
        <div class="flex-grow-1 overflow-y-auto px-6 py-4 pb-6">
           <template v-if="posCart.length === 0">
             <div class="text-center text-grey-darken-2 mt-8 font-weight-bold text-caption text-uppercase ls-1">
               <v-icon size="40" class="mb-4 d-block mx-auto">mdi-cart-outline</v-icon>
               Cart is empty
             </div>
           </template>
           <template v-for="cItem in posCart" :key="cItem.id">
             <div class="d-flex align-center mb-6">
               <v-sheet color="#1c241e" width="44" class="rounded-pill py-2 d-flex flex-column align-center mr-5 border-cart-qty">
                 <v-icon size="20" color="#718076" class="cursor-pointer mb-2 hover-neon" @click="increaseQty(cItem)">mdi-chevron-up</v-icon>
                 <div class="font-weight-black text-white text-body-1">{{cItem.quantity}}</div>
                 <v-icon size="20" color="#718076" class="cursor-pointer mt-2 hover-neon" @click="decreaseQty(cItem)">
                   {{ cItem.quantity === 1 ? 'mdi-delete-outline' : 'mdi-chevron-down' }}
                 </v-icon>
               </v-sheet>
               <div class="d-flex flex-column flex-grow-1">
                  <div class="d-flex justify-space-between align-start mb-1">
                     <div class="font-weight-bold text-h6 text-white line-height-1 mr-2">{{cItem.name}}</div>
                     <div class="font-weight-black text-neon-green">${{(cItem.price * cItem.quantity).toFixed(2)}}</div>
                  </div>
                  <div class="text-caption text-grey-darken-1 font-weight-medium">
                    <v-text-field
                      v-model="cItem.note"
                      placeholder="Add note..."
                      variant="underlined"
                      density="compact"
                      hide-details
                      class="note-input"
                      color="white"
                    ></v-text-field>
                  </div>
               </div>
             </div>
             <v-divider :thickness="1" color="#1c241e" class="mb-6"></v-divider>
           </template>
        </div>

         <!-- Cart Footer -->
         <v-sheet color="#080c09" class="pa-6" style="border-top: 1px solid #16241a;">
            <v-row justify="space-between" align="center" class="mb-2" no-gutters>
              <v-col cols="auto" class="text-body-2 text-grey-darken-1 font-weight-medium">Subtotal</v-col>
              <v-col cols="auto" class="text-body-2 text-grey-darken-1 font-weight-medium">${{cartSubtotal.toFixed(2)}}</v-col>
            </v-row>
            <v-row justify="space-between" align="center" class="mb-4" no-gutters>
              <v-col cols="auto" class="text-body-2 text-grey-darken-1 font-weight-medium">Tax (10%)</v-col>
              <v-col cols="auto" class="text-body-2 text-grey-darken-1 font-weight-medium">${{cartTax.toFixed(2)}}</v-col>
            </v-row>
            <v-row justify="space-between" align="center" class="mb-6" no-gutters>
              <v-col cols="auto" class="text-h5 font-weight-black text-white">Total</v-col>
              <v-col cols="auto" class="text-h4 font-weight-black text-neon-green">${{cartTotal.toFixed(2)}}</v-col>
            </v-row>

            <v-btn 
              block height="60" color="#00ff00" elevation="0"
              class="order-btn-hover text-black font-weight-black text-button rounded-lg text-body-1"
              style="letter-spacing: 1px;"
              :loading="submitting"
              :disabled="submitting || posCart.length === 0"
              @click="submitOrder"
            >
              <v-icon start size="22">mdi-lightning-bolt</v-icon> CONFIRM ORDER
            </v-btn>
         </v-sheet>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<style scoped>
.bg-neon-green { background-color: #00ff00 !important; color: #000 !important; }
.bg-dark-olive { background-color: #1c2620 !important; }
.text-neon-green { color: #00ff00 !important; }

.border-dark { border: 1px solid #282f2a !important; }
.border-cart-qty { border: 1px solid #28332b !important; }

.cart-table-select :deep(.v-field) {
  border: 1px solid #1c2f1f;
  background-color: #050806 !important;
}
.cart-table-select :deep(.v-field__outline) { display: none; }
.cart-table-select :deep(.v-select__selection-text) {
  color: #00ff00 !important;
}

.note-input :deep(.v-field__input) {
  font-size: 12px;
  min-height: 20px;
  padding-top: 4px;
}
.note-input :deep(.v-field__outline) {
  color: #282f2a !important;
}

.ls-1 { letter-spacing: 1px !important; }
.line-height-1 { line-height: 1.2 !important; }
.cursor-pointer { cursor: pointer; }

/* Animations and interactions */
.order-btn-hover {
  transition: all 0.2s;
}
.order-btn-hover:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 0 15px rgba(0,255,0,0.4) !important;
}

.item-card-hover {
  transition: transform 0.2s, border-color 0.2s;
}
.item-card-hover:hover {
  transform: translateY(-4px);
  border-color: #3b82f6 !important;
}
.item-card-hover:hover .add-btn-hover {
  background-color: #00ff00 !important;
  color: #000 !important;
}
.add-btn-hover {
  transition: all 0.2s;
}

.hover-neon:hover { color: #00ff00 !important; }

.live-dot {
  display: inline-block;
  width: 8px; height: 8px;
  background-color: #00ff00;
  border-radius: 50%;
  box-shadow: 0 0 8px #00ff00;
}
</style>

