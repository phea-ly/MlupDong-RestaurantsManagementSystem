<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useKdsStore } from '@/stores/kds.store';
import { useTableStore } from '@/stores/table.store';
import api from '@/api/api';

const kdsStore = useKdsStore();
const tableStore = useTableStore();

const liveOrders = computed(() => {
  // We want to show individual orders as separate cards
  return kdsStore.orders
    .filter(order => !['cancelled', 'served', 'completed'].includes(order.order_status))
    .map(order => {
      const tableInfo = tableStore.tables.find(t => t.table_id === order.table_id) || {};
      return {
        id: order.id,
        order_number: order.order_number || `ORD-${order.id}`,
        table_number: tableInfo.table_number || order.table_number || '?',
        status: order.order_status,
        created_at: order.created_at,
        time_display: calcTimer(order.created_at),
        items: (order.items || []).map(i => ({
          name: i.name,
          quantity: i.quantity,
          note: i.note
        }))
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

function calcTimer(createdAt) {
  if (!createdAt) return '00:00';
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getStatusColor(status) {
  switch (status) {
    case 'ready': return '#00ff00';
    case 'preparing': return '#fb8c00';
    case 'confirmed': return '#fb8c00';
    default: return '#718076';
  }
}

async function markAsServed(orderId) {
  try {
    await api.patch(`/kds/orders/${orderId}/status`, { status: 'completed' });
  } catch(e) {
    console.error('Failed to mark as served:', e);
  }
}

onMounted(() => {
  if (!tableStore.tables.length) tableStore.init();
  kdsStore.init();
});

onUnmounted(() => {
  kdsStore.cleanup();
});
</script>

<template>
  <div class="pa-10 d-flex flex-column h-100 overflow-y-auto" style="background-color: #0b110c;">
    
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-h4 font-weight-black text-white mb-2" style="letter-spacing: -1.5px;">Live Orders</h1>
      <div class="d-flex align-center">
         <div class="live-dot mr-3"></div>
         <span class="text-subtitle-1 text-grey-darken-1 font-weight-bold uppercase-ls">Active Station Monitoring</span>
      </div>
    </div>

    <!-- Order Grid -->
    <div class="order-grid">
      <template v-if="liveOrders.length">
        <v-card 
          v-for="order in liveOrders" 
          :key="order.id"
          class="order-card-refined mb-6"
          elevation="0"
          width="100%"
          max-width="480"
        >
          <!-- Top Section -->
          <div class="pa-5 d-flex justify-space-between align-start">
            <div>
              <div class="text-h5 font-weight-black text-white mb-1">Table {{ order.table_number }}</div>
              <div class="text-caption text-grey-darken-1 font-weight-bold ls-1">{{ order.order_number }}</div>
            </div>
            <div class="text-right">
               <v-chip 
                 size="x-small" 
                 :color="getStatusColor(order.status)" 
                 variant="flat" 
                 class="text-black font-weight-black mb-2 rounded-lg"
                 style="text-transform: uppercase;"
               >
                 {{ order.status }}
               </v-chip>
               <div class="d-flex align-center justify-end text-white font-weight-bold text-body-2">
                 <v-icon size="16" class="mr-1" color="grey">mdi-clock-outline</v-icon>
                 {{ order.time_display }}
               </div>
            </div>
          </div>

          <v-divider :thickness="2" color="rgba(255,255,255,0.05)" class="mx-5"></v-divider>

          <!-- Middle Section: Items -->
          <div class="pa-5">
            <div v-for="(item, idx) in order.items" :key="idx" class="d-flex align-start mb-3">
               <span class="text-orange font-weight-black text-body-1 mr-3">{{ item.quantity }}×</span>
               <div>
                 <div class="text-body-1 font-weight-bold text-white mb-0">{{ item.name }}</div>
                 <div v-if="item.note" class="text-caption text-grey-darken-1 font-weight-medium">{{ item.note }}</div>
               </div>
            </div>
          </div>

          <!-- Bottom Section: Action -->
          <div class="pa-5 pt-0">
             <v-btn 
               block 
               height="52" 
               :color="order.status === 'ready' ? '#00ff00' : '#fb8c00'" 
               class="text-black font-weight-black rounded-lg text-button" 
               elevation="0"
               @click="markAsServed(order.id)"
             >
               {{ order.status === 'ready' ? 'FINISH & SERVE' : 'MARK AS SERVED' }}
             </v-btn>
          </div>
        </v-card>
      </template>

      <!-- Empty State -->
      <div v-else class="w-100 d-flex flex-column align-center justify-center py-16" style="opacity: 0.2;">
         <v-icon size="120" color="#2e3a33" class="mb-4">mdi-tray-minus</v-icon>
         <div class="text-h4 font-weight-black text-white">No Pending Orders</div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 32px;
  align-items: start;
}

.order-card-refined {
  background-color: #141a16 !important;
  border: 2px solid #1c241e !important;
  border-radius: 20px !important;
  transition: transform 0.2s, border-color 0.2s;
}

.order-card-refined:hover {
  border-color: #fb8c0066 !important;
  transform: translateY(-4px);
}

.text-orange { color: #fb8c00 !important; }
.uppercase-ls { text-transform: uppercase; letter-spacing: 2px; font-size: 11px !important; }
.ls-1 { letter-spacing: 1px !important; }

.live-dot {
  width: 10px; height: 10px;
  background-color: #fb8c00;
  border-radius: 50%;
  box-shadow: 0 0 10px #fb8c00;
  animation: pulse-orange 2s infinite;
}

@keyframes pulse-orange {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 15px #fb8c00; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.text-button { letter-spacing: 1px !important; }
</style>



