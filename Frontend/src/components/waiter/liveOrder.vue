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
    .sort((a, b) => {
      // Prioritize 'ready' status
      if (a.status === 'ready' && b.status !== 'ready') return -1;
      if (a.status !== 'ready' && b.status === 'ready') return 1;
      // Then sort by most recent
      return new Date(b.created_at) - new Date(a.created_at);
    });
});

function calcTimer(createdAt) {
  if (!createdAt) return '00:00';
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getStatusColorObj(status) {
  switch (status) {
    case 'ready': return { bg: '#eaf5f0', text: 'text-primary' }; // Light Green
    case 'preparing': return { bg: '#fff7ed', text: 'text-orange-darken-3' }; // Light Orange
    case 'confirmed': return { bg: '#f0f9ff', text: 'text-light-blue-darken-3' }; // Light Blue
    default: return { bg: '#f8fafc', text: 'text-grey-darken-2' }; // Grey
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
  <div class="d-flex flex-column h-100">
    
    <!-- Order Grid -->
    <v-row v-if="liveOrders.length" class="align-start">
      <v-col
        v-for="order in liveOrders" 
        :key="order.id"
        cols="12" sm="6" md="6" lg="4" xl="3"
        class="mb-6"
      >
        <v-card 
          class="order-card-refined h-100 d-flex flex-column"
          elevation="2"
        >
          <!-- Top Section -->
          <v-card-title class="pa-5 pb-3 d-flex justify-space-between align-start text-wrap">
            <div>
              <div class="text-h5 font-weight-black text-grey-darken-4 mb-1">Table {{ order.table_number }}</div>
              <div class="text-caption text-grey-darken-1 font-weight-bold ls-1">{{ order.order_number }}</div>
            </div>
            <div class="text-right d-flex flex-column align-end">
               <v-chip 
                 size="small" 
                 :color="getStatusColorObj(order.status).bg"
                 variant="flat" 
                 class="font-weight-black mb-2 rounded-lg border-light"
                 :class="getStatusColorObj(order.status).text"
                 style="text-transform: uppercase;"
               >
                 {{ order.status }}
               </v-chip>
               <div class="d-flex align-center text-grey-darken-2 font-weight-bold text-body-2 mt-1">
                 <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
                 {{ order.time_display }}
               </div>
            </div>
          </v-card-title>

          <v-divider :thickness="1" color="rgba(0,0,0,0.06)" class="mx-5 my-2"></v-divider>

          <!-- Middle Section: Items -->
          <v-card-text class="pa-5 pt-2 flex-grow-1">
            <div v-for="(item, idx) in order.items" :key="idx" class="d-flex align-start mb-3">
               <span class="font-weight-black text-body-1 mr-3 color-primary">{{ item.quantity }}×</span>
               <div>
                 <div class="text-body-1 font-weight-bold text-grey-darken-3 mb-0">{{ item.name }}</div>
                 <div v-if="item.note" class="text-caption text-grey-darken-1 font-weight-medium mt-1">
                   <v-icon size="12" class="mr-1">mdi-comment-text-outline</v-icon>{{ item.note }}
                 </div>
               </div>
            </div>
          </v-card-text>

          <!-- Bottom Section: Action -->
          <v-card-actions class="pa-5 pt-0 mt-auto">
             <v-btn 
               block 
               height="52" 
               :color="order.status === 'ready' ? '#0f9d58' : '#e65100'" 
               class="text-white font-weight-bold rounded-lg text-button" 
               elevation="0"
               variant="flat"
               @click="markAsServed(order.id)"
             >
               {{ order.status === 'ready' ? 'FINISH & SERVE' : 'MARK AS SERVED' }}
             </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else class="flex-grow-1 align-center justify-center py-16">
      <v-col cols="12" class="text-center" style="opacity: 0.6;">
         <v-icon size="100" color="grey-lighten-1" class="mb-4">mdi-tray-minus</v-icon>
         <div class="text-h5 font-weight-black text-grey-darken-2">No Pending Orders</div>
         <p class="text-body-2 mt-2">New orders will appear here automatically.</p>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.order-card-refined {
  background-color: #ffffff !important;
  border: 1px solid rgba(0,0,0,0.05) !important;
  border-radius: 20px !important;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.order-card-refined:hover {
  border-color: rgba(15, 157, 88, 0.3) !important;
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.06) !important;
}

.color-primary { color: #0f9d58 !important; }
.text-primary { color: #0f9d58 !important; }

.uppercase-ls { text-transform: uppercase; letter-spacing: 2px; font-size: 11px !important; }
.ls-1 { letter-spacing: 1px !important; }
.border-light { border: 1px solid rgba(0,0,0,0.05) !important; }

.live-dot {
  width: 10px; height: 10px;
  background-color: #0f9d58;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(15, 157, 88, 0.5);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 15px rgba(15, 157, 88, 0.6); }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.text-button { letter-spacing: 1px !important; }
</style>



