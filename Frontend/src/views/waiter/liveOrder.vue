<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/api/api';
import { order as orderApiObj } from '@/api/order.api';

const authStore = useAuthStore();
const loading = ref(true);
const rawOrders = ref([]);
const tables = ref([]);
const checkInterval = ref(null);

const tablesWithOrders = computed(() => {
  const tableMap = {};
  rawOrders.value.forEach(order => {
    if (order.order_status === 'cancelled' || order.order_status === 'served' || order.order_status === 'completed') return;
    if (!tableMap[order.table_id]) {
      const tableInfo = tables.value.find(t => t.table_id === order.table_id) || {};
      tableMap[order.table_id] = {
        table_id: order.table_id,
        table_number: tableInfo.table_number || order.table_id,
        waiter: authStore.user?.first_name ? `${authStore.user.first_name.toUpperCase()} ${authStore.user.last_name?.charAt(0)}.` : 'ALEX M.',
        guests: tableInfo.capacity || order.items?.length || 2,
        created_at: order.created_at,
        items: []
      };
    }
    (order.items || []).forEach(item => {
      tableMap[order.table_id].items.push({
        id: item.id || Math.random(),
        order_id: order.id,
        name: item.name || item.menu_item_name || 'Item',
        note: item.note || '',
        quantity: item.quantity,
        status: order.order_status === 'ready' ? 'READY' : (order.order_status === 'preparing' ? 'PREPARING' : 'PREPARING')
      });
    });
  });
  return Object.values(tableMap).sort((a,b) => b.items.filter(i => i.status === 'READY').length - a.items.filter(i => i.status === 'READY').length);
});

function getReadyCount(items) {
  return items.filter(i => i.status === 'READY').length;
}

function calcMinutes(createdAt) {
  if (!createdAt) return '12m';
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  return diffMins > 0 ? `${diffMins}m Open` : 'Just now';
}

async function markItemServed(orderId, itemId) {
  try {
    await api.patch(`/kds/orders/${orderId}/status`, { order_status: 'completed' })
         .catch(() => orderApiObj.update(orderId, { order_status: 'served' }));
    const ord = rawOrders.value.find(o => o.id === orderId);
    if (ord) ord.order_status = 'served';
  } catch(e) {
    console.error(e);
  }
}

async function fetchDataAll() {
  try {
    const [tablesRes, ordersRes] = await Promise.all([
      api.get('/tables'),
      api.get('/orders')
    ]);
    tables.value = tablesRes.data || [];
    rawOrders.value = ordersRes.data || [];
  } catch (e) {} finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchDataAll();
  checkInterval.value = setInterval(() => {
    api.get('/orders').then(res => rawOrders.value = res.data).catch(e=>{});
  }, 10000);
});

onUnmounted(() => {
  if (checkInterval.value) clearInterval(checkInterval.value);
});
</script>

<template>
  <div class="pa-8 d-flex flex-column h-100 overflow-y-auto">
    <!-- Main Header -->
    <div class="d-flex justify-space-between align-center mb-8">
      <div>
        <h1 class="text-h4 font-weight-black text-white mb-2" style="letter-spacing: -1px;">Active Station Service</h1>
        <p class="text-subtitle-1 text-grey-lighten-1 font-weight-medium">
          Station 04 &bull; {{ tablesWithOrders.length || 8 }} Active Tables &bull; {{ tablesWithOrders.reduce((acc, t) => acc + getReadyCount(t.items), 0) || 14 }} Ready for Service
        </p>
      </div>
      <v-chip color="#102613" variant="outlined" class="font-weight-bold text-caption rounded-pill px-4" style="border-color: #1c4021; color: #e2e8f0;">
        <span class="live-dot mr-2"></span> SYSTEM LIVE
      </v-chip>
    </div>

    <!-- Table Grid -->
    <div class="d-flex flex-wrap" style="gap: 24px;">
      <template v-if="!loading && tablesWithOrders.length">
        <template v-for="(table, idx) in tablesWithOrders" :key="table.table_id">
          <v-card 
            width="320" 
            color="#1c221e" 
            class="rounded-xl pa-5 d-flex flex-column flex-shrink-0"
            :class="getReadyCount(table.items) > 0 ? 'card-ready-glow border-top-neon' : 'border-dark'"
            elevation="0"
          >
            <!-- Card Header -->
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <h2 class="text-h5 font-weight-black text-white mb-1" style="letter-spacing: -0.5px;">TABLE {{ String(table.table_number).padStart(2, '0') }}</h2>
                <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase ls-1">
                  WAITER: {{table.waiter}} | {{table.guests}} GUESTS
                </div>
              </div>
              <div class="d-flex flex-column align-end">
                 <span class="text-caption font-weight-bold text-white mb-1">{{calcMinutes(table.created_at)}}</span>
                 <v-chip v-if="getReadyCount(table.items) > 0" color="#133317" size="small" class="text-neon-green font-weight-black text-caption rounded">
                   {{getReadyCount(table.items)}} READY
                 </v-chip>
              </div>
            </div>

            <!-- Items Loop -->
            <div class="flex-grow-1 d-flex flex-column" style="gap: 16px;">
              <template v-for="(item, i) in table.items" :key="item.id">
                
                <v-sheet v-if="item.status === 'READY'" color="#1c2a1e" class="pa-3 rounded-lg border-neon">
                  <div class="d-flex align-start mb-3">
                     <v-sheet color="#00ff00" class="mr-4 d-flex align-center justify-center rounded" height="36" width="36">
                       <span class="font-weight-black text-body-1 text-black">{{item.quantity}}</span>
                     </v-sheet>
                     <div class="flex-grow-1 pt-1">
                       <div class="font-weight-black text-h6 text-neon-green line-height-1 mb-1">{{item.name}}</div>
                     </div>
                     <div class="text-neon-green font-weight-bold text-caption mt-1">READY</div>
                  </div>
                  <v-btn block color="#00ff00" class="text-black font-weight-black rounded-lg" height="44" @click="markItemServed(item.order_id, item.id)" elevation="0">
                    <v-icon start color="black">mdi-check-circle</v-icon> MARK AS SERVED
                  </v-btn>
                </v-sheet>

                <v-sheet v-else color="#262c28" class="pa-3 rounded-lg d-flex align-start border-gray-item">
                   <v-sheet color="#2f3631" class="mr-4 d-flex align-center justify-center rounded border-gray-item" height="36" width="36">
                     <span class="font-weight-black text-body-1 text-grey-lighten-1">{{item.quantity}}</span>
                   </v-sheet>
                   <div class="flex-grow-1 pt-1">
                     <div class="font-weight-black text-h6 text-white mb-1 line-height-1">{{item.name}}</div>
                     <div v-if="item.note" class="text-caption font-weight-medium text-grey-darken-1 line-height-1 mt-1 pr-2">
                       {{item.note}}
                     </div>
                   </div>
                   <div class="font-weight-bold text-caption mt-1 text-uppercase" :class="item.status === 'SERVED' ? 'text-grey-darken-1' : 'text-neon-green'">
                     {{item.status}}
                   </div>
                </v-sheet>

              </template>
            </div>
            
            <div v-if="table.items.length > 2" class="mt-4 text-center">
               <div class="text-caption font-weight-black text-neon-green text-uppercase ls-1 cursor-pointer">
                 SHOW {{table.items.length - 2}} MORE ITEMS <v-icon size="14">mdi-chevron-down</v-icon>
               </div>
            </div>
          </v-card>
        </template>
      </template>

      <template v-else-if="loading">
         <v-card v-for="i in 4" :key="i" width="320" height="350" color="#111713" class="d-flex flex-column align-center justify-center rounded-xl border-dark" elevation="0">
            <v-progress-circular indeterminate color="#00ff00"></v-progress-circular>
         </v-card>
      </template>
      
      <!-- DUMMY CARDS FOR PARITY -->
      <template v-if="!loading && tablesWithOrders.length === 0">
         <v-card width="320" color="#1c221e" class="rounded-xl pa-5 d-flex flex-column card-ready-glow border-top-neon shrink-0" elevation="0">
            <div class="d-flex justify-space-between align-start mb-4">
              <div>
                <h2 class="text-h5 font-weight-black text-white mb-1" style="letter-spacing: -0.5px;">TABLE 12</h2>
                <div class="text-caption text-grey-darken-1 font-weight-medium text-uppercase ls-1">WAITER: ALEX M. | 4 GUESTS</div>
              </div>
              <div class="d-flex flex-column align-end">
                 <span class="text-caption font-weight-bold text-white mb-1">24m Open</span>
                 <v-chip color="#133317" size="small" class="text-neon-green font-weight-black text-caption rounded">2 READY</v-chip>
              </div>
            </div>
            
            <div class="flex-grow-1 d-flex flex-column" style="gap: 16px;">
              <v-sheet color="#262c28" class="pa-3 rounded-lg d-flex align-start border-gray-item">
                   <v-sheet color="#2f3631" class="mr-4 d-flex align-center justify-center rounded border-gray-item" height="36" width="36">
                     <span class="font-weight-black text-body-1 text-grey-lighten-1">1</span>
                   </v-sheet>
                   <div class="flex-grow-1 pt-1">
                     <div class="font-weight-black text-h6 text-white mb-1 line-height-1">Wagyu Ribeye Steak</div>
                     <div class="text-caption font-weight-medium text-grey-darken-1 line-height-1 mt-1 pr-2">Medium Rare, Extra Asparagus</div>
                   </div>
                   <div class="font-weight-bold text-caption mt-1 text-uppercase text-grey-lighten-1">PREPARING</div>
              </v-sheet>

              <v-sheet color="#1c2a1e" class="pa-3 rounded-lg border-neon">
                  <div class="d-flex align-start mb-3">
                     <v-sheet color="#00ff00" class="mr-4 d-flex align-center justify-center rounded" height="36" width="36">
                       <span class="font-weight-black text-body-1 text-black">2</span>
                     </v-sheet>
                     <div class="flex-grow-1 pt-1">
                       <div class="font-weight-black text-h6 text-neon-green line-height-1 mb-1">Truffle Pappardelle</div>
                       <div class="text-caption font-weight-medium text-dark-green line-height-1 pr-2 mt-1">Signature Sauce</div>
                     </div>
                     <div class="text-neon-green font-weight-bold text-caption mt-1">READY</div>
                  </div>
                  <v-btn block color="#00ff00" class="text-black font-weight-black rounded-lg" height="44" elevation="0">
                    <v-icon start color="black">mdi-check-circle-outline</v-icon> MARK AS SERVED
                  </v-btn>
              </v-sheet>
            </div>
         </v-card>
      </template>
    </div>
  </div>
</template>

<style scoped>
.text-neon-green { color: #00ff00 !important; }
.bg-dark-green { background-color: #133317 !important; }
.text-dark-green { color: #278235 !important; }

.border-top-neon { border-top: 3px solid #00ff00 !important; }
.border-neon { border: 1px solid #164f1e !important; }
.border-dark { border: 1px solid #282f2a !important; }
.border-gray-item { border: 1px solid #303732 !important; }

.ls-1 { letter-spacing: 1px !important; }
.line-height-1 { line-height: 1.2 !important; }
.cursor-pointer { cursor: pointer; }

.card-ready-glow {
  box-shadow: -10px 0 30px -15px rgba(0, 255, 0, 0.1) !important;
}

.live-dot {
  display: inline-block;
  width: 8px; height: 8px;
  background-color: #00ff00;
  border-radius: 50%;
  box-shadow: 0 0 8px #00ff00;
}
</style>
