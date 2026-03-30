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
      tagColor: '#14b8a6',
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


<<template>
  <div class="d-flex flex-row h-100 position-relative w-100 bg-surface">
    
    <!-- Left: Menu Grid -->
    <div class="flex-grow-1 h-100 pa-8 overflow-y-auto" style="background-color: #edf2f1;" v-if="!menuStore.loading">
      
      <!-- Header -->
      <div class="mb-6 d-flex align-center justify-space-between">
         <div>
            <h1 class="text-h4 font-weight-black text-grey-darken-4 mb-1" style="letter-spacing: -1px;">Point of Sale</h1>
            <p class="text-body-2 text-grey-darken-1 font-weight-medium">Select items to add to the current order</p>
         </div>
      </div>

      <!-- Category Filters (Modern v-slide-group) -->
      <v-slide-group
        v-model="selectedCategoryId"
        mandatory
        show-arrows
        class="mb-8"
        selected-class="bg-black text-white elevation-4"
      >
        <v-slide-group-item v-for="cat in menuStore.categoryTabs" :key="cat.value" :value="cat.value" v-slot="{ isSelected, toggle, selectedClass }">
          <v-chip
            :class="['font-weight-bold', 'text-body-1', 'px-6', 'mr-3', selectedClass]"
            :variant="isSelected ? 'elevated' : 'flat'"
            :color="isSelected ? 'black' : 'white'"
            size="x-large"
            style="height: 48px; border-radius: 24px;"
            @click="toggle"
          >
            <v-icon start size="20" v-if="cat.icon" :class="isSelected ? 'text-neon-green' : 'text-grey-darken-2'">{{ cat.icon }}</v-icon>
            {{ cat.label }}
          </v-chip>
        </v-slide-group-item>
      </v-slide-group>

      <!-- Items Grid -->
      <v-row v-if="filteredItems.length">
        <template v-for="item in filteredItems" :key="item.id">
          <v-col cols="12" sm="6" md="4" lg="3" xl="2">
            <v-card 
              color="white" 
              class="rounded-xl overflow-hidden item-card-modern h-100 d-flex flex-column cursor-pointer" 
              elevation="1"
              @click="addToCart(item)"
              v-ripple
            >
              <div class="position-relative overflow-hidden img-wrapper">
                <v-img :src="item.image" cover height="180" width="100%" class="zoom-img">
                  <template v-slot:placeholder>
                    <div class="d-flex align-center justify-center fill-height bg-grey-lighten-2">
                      <v-icon color="grey" size="40">mdi-silverware</v-icon>
                    </div>
                  </template>
                </v-img>
                <v-chip v-if="item.tag" color="black" size="small"
                  class="position-absolute font-weight-bold rounded-lg elevation-4 text-neon-green"
                  style="top: 12px; right: 12px; letter-spacing: 0.5px"
                >
                  <v-icon size="14" start>mdi-star-four-points</v-icon>
                  {{item.tag}}
                </v-chip>
              </div>
              
              <v-card-text class="pa-5 flex-grow-1 d-flex flex-column">
                <div class="font-weight-bold text-h6 text-grey-darken-4 mb-2 line-height-1">{{item.name}}</div>
                <div class="text-caption text-grey-darken-1 mb-4 flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4em;">
                  {{item.description}}
                </div>
                <div class="d-flex justify-space-between align-center mt-auto">
                   <span class="font-weight-black text-grey-darken-4 text-h5">${{Number(item.price).toFixed(2)}}</span>
                   <v-btn icon="mdi-plus" color="black" class="text-neon-green add-btn-modern" size="small" elevation="2"></v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </template>
      </v-row>
      
      <!-- Empty Category State -->
      <div v-else class="text-center mt-16 text-grey-darken-1">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-food-off-outline</v-icon>
        <div class="text-h5 font-weight-bold text-grey">No items found</div>
        <p class="text-body-2">Try selecting a different category.</p>
      </div>
    </div>
    
    <!-- Loading State -->
    <div class="flex-grow-1 h-100 pa-8 d-flex align-center justify-center" style="background-color: #edf2f1;" v-else>
      <div class="text-center">
        <v-progress-circular indeterminate color="black" size="64" width="6" class="mb-4"></v-progress-circular>
        <div class="text-h6 font-weight-bold text-grey-darken-2">Loading Menu...</div>
      </div>
    </div>

    <!-- Right: High-end Cart Panel -->
    <v-navigation-drawer location="right" width="420" permanent color="white" class="cart-drawer elevation-2">
      <div class="d-flex flex-column h-100">
        <!-- Cart Header -->
        <div class="pa-6 pb-2">
           <div class="d-flex justify-space-between align-center mb-6">
              <div class="d-flex align-center">
                <v-icon color="#22c55e" class="mr-3" size="28">mdi-shopping-outline</v-icon>
                <div class="text-h4 font-weight-black text-black" style="letter-spacing: -1px;">Order</div>
              </div>
              <v-chip color="#edf2f1" class="text-black font-weight-black text-caption rounded-lg">
                {{ posCart.length }} Items
              </v-chip>
           </div>
           
           <!-- Table Assignment Strip -->
           <v-card color="#f8faf9" elevation="0" class="pa-2 rounded-xl border-light d-flex align-center justify-space-between pl-4">
              <div class="d-flex align-center">
                <v-icon color="grey-darken-2" size="20" class="mr-2">mdi-table-furniture</v-icon>
                <span class="text-caption text-grey-darken-2 font-weight-bold text-uppercase ls-1">Table</span>
              </div>
              <v-select
                v-model="selectedTable"
                :items="tableStore.tables"
                item-title="table_number"
                item-value="table_id"
                variant="solo-filled"
                bg-color="#f8fafc"
                color="primary"
                density="compact"
                hide-details
                placeholder="Unassigned"
                class="cart-table-select-light elevation-0 border-light"
                rounded="lg"
                style="max-width: 140px;"
                :menu-props="{ rounded: 'lg', elevation: 4 }"
              >
                <template #selection="{ item }">
                  <span class="text-primary font-weight-black text-body-1 ml-1" style="color: #0f9d58 !important;">Table {{ item.raw ? item.raw.table_number : item.title }}</span>
                </template>
              </v-select>
           </v-card>
        </div>

        <v-divider :thickness="2" color="rgba(0,0,0,0.03)" class="my-2"></v-divider>

        <!-- Cart Items -->
        <div class="flex-grow-1 overflow-y-auto px-6 py-2 pb-6 custom-scrollbar-light">
           <template v-if="posCart.length === 0">
             <div class="d-flex flex-column align-center justify-center h-100 text-grey-darken-2">
               <v-icon size="64" class="mb-4 opacity-30">mdi-cart-remove</v-icon>
               <div class="font-weight-bold text-h6 text-grey-darken-2">Cart is empty</div>
               <div class="text-caption">Add items from the menu to start.</div>
             </div>
           </template>

           <template v-for="cItem in posCart" :key="cItem.id">
             <v-card color="transparent" elevation="0" class="mb-5">
               <div class="d-flex align-center">
                 <!-- Quantity Controls -->
                 <v-sheet color="#f1f5f3" width="46" class="rounded-pill py-2 d-flex flex-column align-center mr-4 border-light">
                   <v-btn icon size="x-small" variant="text" color="grey-darken-1" class="hover-neon" @click="increaseQty(cItem)">
                     <v-icon>mdi-plus</v-icon>
                   </v-btn>
                   <div class="font-weight-black text-black text-body-1 my-1">{{cItem.quantity}}</div>
                   <v-btn icon size="x-small" variant="text" color="grey-darken-1" class="hover-neon" @click="decreaseQty(cItem)">
                     <v-icon>{{ cItem.quantity === 1 ? 'mdi-delete-outline' : 'mdi-minus' }}</v-icon>
                   </v-btn>
                 </v-sheet>
                 
                 <!-- Item Details -->
                 <div class="d-flex flex-column flex-grow-1">
                    <div class="d-flex justify-space-between align-start mb-1 gap-2">
                       <div class="font-weight-bold text-body-1 text-black line-height-1">{{cItem.name}}</div>
                       <div class="font-weight-black text-black text-body-1">${{(cItem.price * cItem.quantity).toFixed(2)}}</div>
                    </div>
                    <!-- Note Input -->
                    <div class="mt-1">
                      <v-text-field
                        v-model="cItem.note"
                        placeholder="Add preparation note..."
                        variant="plain"
                        density="compact"
                        hide-details
                        class="compact-note-input-light"
                        color="#14b8a6"
                        prepend-inner-icon="mdi-pencil-outline"
                      ></v-text-field>
                    </div>
                 </div>
               </div>
             </v-card>
           </template>
        </div>

         <!-- Checkout Footer -->
         <v-sheet color="#f8faf9" class="pa-6 relative" style="border-top: 1px solid rgba(0,0,0,0.05); border-radius: 32px 32px 0 0;">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2 text-grey-darken-2 font-weight-medium">Subtotal</span>
              <span class="text-body-1 text-black font-weight-bold">${{cartSubtotal.toFixed(2)}}</span>
            </div>
            <div class="d-flex justify-space-between align-center mb-4">
              <span class="text-body-2 text-grey-darken-2 font-weight-medium">Tax (10%)</span>
              <span class="text-body-1 text-black font-weight-bold">${{cartTax.toFixed(2)}}</span>
            </div>
            
            <v-divider class="mb-4" color="rgba(0,0,0,0.05)"></v-divider>

            <div class="d-flex justify-space-between align-end mb-6">
              <span class="text-h6 font-weight-black text-black">Total</span>
              <span class="text-h3 font-weight-black text-neon-green" style="letter-spacing: -1.5px;">${{cartTotal.toFixed(2)}}</span>
            </div>

            <v-btn 
              block height="64" color="#22c55e" elevation="2"
              class="order-btn-modern text-black font-weight-black text-button rounded-xl text-h6"
              style="letter-spacing: 0.5px;"
              :loading="submitting"
              :disabled="submitting || posCart.length === 0"
              @click="submitOrder"
            >
              <div class="d-flex align-center justify-space-between w-100 px-2">
                <span>PLACE ORDER</span>
                <v-icon size="28">mdi-arrow-right-circle</v-icon>
              </div>
            </v-btn>
         </v-sheet>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<style scoped>
/* Utility Colors */
.text-neon-green { color: #22c55e !important; }
.bg-neon-green { background-color: #22c55e !important; color: #000 !important; }

/* Item Card Aesthetics */
.item-card-modern {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid transparent;
}

.item-card-modern:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important;
  border-color: rgba(0,0,0,0.05);
}

.item-card-modern .img-wrapper .zoom-img {
  transition: transform 0.5s ease;
}

.item-card-modern:hover .img-wrapper .zoom-img {
  transform: scale(1.08);
}

.item-card-modern .add-btn-modern {
  transition: all 0.2s ease;
}

.item-card-modern:hover .add-btn-modern {
  background-color: #22c55e !important;
  color: black !important;
  transform: scale(1.1);
}

/* Cart Drawer Aesthetics */
.cart-drawer {
  box-shadow: -10px 0 30px rgba(0,0,0,0.05) !important;
}

.border-light { border: 1px solid rgba(0,0,0,0.05) !important; }

/* Checkout Button Modern */
.order-btn-modern {
  transition: all 0.3s ease;
}
.order-btn-modern:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 0, 0.4) !important;
}

/* Select Box Overrides */
.cart-table-select-light :deep(.v-field) {
  border: 1px solid rgba(0,0,0,0.05); /* very light border */
  background-color: #ffffff !important;
  border-radius: 8px;
}
.cart-table-select-light :deep(.v-field__outline) { display: none; }
.cart-table-select-light :deep(.v-select__selection-text) {
  color: #22c55e !important;
}

/* Note Input Overlay */
.compact-note-input-light :deep(.v-field__input) {
  font-size: 13px;
  min-height: 24px;
  padding: 0;
  color: #666;
}
.compact-note-input-light :deep(.v-field__prepend-inner) {
  padding-right: 6px;
  opacity: 0.5;
  color: #666;
}

/* Scrollbar customization for cart */
.custom-scrollbar-light::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar-light::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar-light::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.custom-scrollbar-light:hover::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
}

.ls-1 { letter-spacing: 1px !important; }
.line-height-1 { line-height: 1.2 !important; }
.cursor-pointer { cursor: pointer; }

/* Interactive colors */
.hover-neon { transition: color 0.2s; }
.hover-neon:hover { color: #22c55e !important; }
</style>

