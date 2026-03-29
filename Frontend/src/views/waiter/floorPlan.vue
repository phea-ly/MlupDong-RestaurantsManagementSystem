<script setup>
import { ref, computed, onMounted } from 'vue';
import { useTableStore } from '@/stores/table.store';
import { useKdsStore } from '@/stores/kds.store';

const emit = defineEmits(['start-order']);

const tableStore = useTableStore();
const kdsStore = useKdsStore();

const selectedCategory = ref('All Zones');
const zones = computed(() => {
   const locs = [];
   tableStore.tables.forEach(t => {
     if (t.location && !locs.includes(t.location)) locs.push(t.location);
   });
   return ['All Zones', ...(locs.length ? locs : ['Indoor', 'Patio', 'Bar'])];
});

async function fetchData() {
  await Promise.all([
    tableStore.fetchTables(),
    kdsStore.init()
  ]);
}

function checkOccupied(tableId) {
  // Check kdsStore for any active (non-completed) orders for this table
  return kdsStore.orders.some(o => 
    o.table_id === tableId && 
    !['cancelled', 'served', 'completed'].includes(o.order_status)
  );
}

const displayTables = computed(() => {
  const source = tableStore.tables;
  if (selectedCategory.value === 'All Zones') return source;
  return source.filter(t => (t.location || 'Indoor') === selectedCategory.value);
});

function handleTableClick(table) {
  // Waiters can click any table to show menu, 
  // but usually they start orders for available tables
  emit('start-order', table.table_id);
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="pa-8 d-flex flex-column h-100 overflow-y-auto" style="background-color: #edf2f1;">
    
    <!-- Header -->
    <v-row class="mb-4 align-center" justify="space-between" no-gutters>
      <v-col cols="12" md="auto" class="mb-4 mb-md-0">
        <h1 class="text-h4 font-weight-black text-black mb-2" style="letter-spacing: -1px;">Interactive Floor Plan</h1>
        <p class="text-subtitle-1 text-grey-darken-1 font-weight-medium">
          {{ tableStore.tables.length }} Total Units <span class="mx-2">&bull;</span> {{ tableStore.tables.filter(t => checkOccupied(t.table_id)).length }} Occupied
        </p>
      </v-col>
      
      <v-col cols="12" md="auto">
        <!-- Legend -->
        <v-sheet color="white" class="d-flex align-center pa-3 px-5 rounded-pill border-light mr-md-6" elevation="0">
          <span class="legend-dot bg-primary mr-3"></span> <span class="text-caption text-grey-darken-3 mr-6 font-weight-bold ls-1">AVAILABLE</span>
          <span class="legend-dot bg-grey-darken-1 mr-3"></span> <span class="text-caption text-grey-darken-3 font-weight-bold ls-1">IN SERVICE</span>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Filter Tabs -->
    <div class="d-flex mb-8 align-center gap-4 filter-scroll" style="overflow-x: auto;">
      <v-chip-group v-model="selectedCategory" mandatory color="primary" selected-class="bg-primary text-white elevation-2">
        <v-chip
          v-for="(zone, i) in zones" :key="i"
          :value="zone"
          class="font-weight-bold text-body-1 px-6 mr-3"
          variant="flat"
          :color="selectedCategory === zone ? '#0f9d58': 'white'"
          size="large"
          style="height: 48px; border-radius: 24px; border: 1px solid rgba(0,0,0,0.05);"
          :class="selectedCategory !== zone ? 'text-grey-darken-2' : ''"
        >
          {{ zone }}
        </v-chip>
      </v-chip-group>
    </div>

    <!-- Map Grid -->
    <v-row v-if="!tableStore.loading" class="mt-2">
      <template v-for="table in displayTables" :key="table.table_id">
         <v-col cols="12" sm="6" md="4" lg="3" xl="2">
            <v-card 
               class="table-map-node d-flex flex-column align-center justify-center position-relative cursor-pointer hover-card rounded-xl"
               :class="checkOccupied(table.table_id) ? 'node-occupied' : 'node-available'"
               height="180" elevation="2"
               @click="handleTableClick(table)"
            >
               <!-- Subtle glow for available tables -->
               <div v-if="!checkOccupied(table.table_id)" class="card-ready-glow-insert-light"></div>

               <!-- Inner Border overlay based on status -->
               <div class="inner-border-frame w-100 h-100 position-absolute rounded-xl" :class="checkOccupied(table.table_id) ? 'border-occupied' : 'border-available'"></div>

               <!-- Table Number -->
               <div class="text-h3 font-weight-black mb-1 line-height-1 mt-2 z-index-2"
                 :class="checkOccupied(table.table_id) ? 'text-grey-darken-2' : 'text-primary'"
                 style="letter-spacing: -2px;"
               >
                 {{ String(table.table_number).padStart(2, '0') }}
               </div>
               
               <div class="text-caption font-weight-bold text-uppercase ls-1 mb-3 z-index-2"
                 :class="checkOccupied(table.table_id) ? 'text-grey-darken-1' : 'text-primary'"
                 style="opacity: 0.8;"
               >
                 {{ table.location || 'Indoor' }}
               </div>

               <!-- Seats Info -->
               <v-chip size="small" :color="checkOccupied(table.table_id) ? '#f1f5f9' : '#eaf5f0'" 
                  class="font-weight-black mt-auto mb-4 text-caption px-4 border-thin z-index-2">
                  <v-icon size="14" class="mr-1" :color="checkOccupied(table.table_id) ? '#94a3b8' : '#0f9d58'">mdi-account-group</v-icon>
                  <span :class="checkOccupied(table.table_id) ? 'text-grey-darken-1' : 'text-primary'">{{ table.capacity }} Seats</span>
               </v-chip>

               <!-- Occupied Overlay (if busy) -->
               <transition name="fade">
                <div v-if="checkOccupied(table.table_id)" class="position-absolute d-flex flex-column align-center justify-center w-100 h-100 occupied-overlay-light rounded-xl z-index-3">
                    <v-icon size="36" color="#0f9d58" class="mb-2">mdi-silverware-clean</v-icon>
                    <div class="text-grey-darken-4 font-weight-black text-body-1 text-uppercase position-relative" style="letter-spacing: 2px;">In Service</div>
                </div>
               </transition>
            </v-card>
         </v-col>
      </template>

      <!-- Empty State if no tables -->
      <v-col v-if="!displayTables.length" cols="12" class="text-center py-12">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-table-off</v-icon>
        <div class="text-h6 text-grey-darken-1 font-weight-medium">No tables found in this zone</div>
      </v-col>
    </v-row>

    <!-- Skeleton Loading -->
    <v-row v-else class="mt-2">
       <v-col v-for="i in 10" :key="i" cols="12" sm="6" md="4" lg="3" xl="2">
          <v-card height="180" color="white" class="rounded-xl border-light" elevation="2">
             <div class="w-100 h-100 d-flex align-center justify-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
             </div>
          </v-card>
       </v-col>
    </v-row>

  </div>
</template>

<style scoped>
/* Typography & Core Colors */
.text-primary { color: #0f9d58 !important; }
.bg-primary { background-color: #0f9d58 !important; color: white !important; }

.legend-dot {
  display: inline-block;
  width: 12px; height: 12px;
  border-radius: 50%;
}

.border-light { border: 1px solid rgba(0,0,0,0.05) !important; }
.border-thin { border: 1px solid rgba(0,0,0,0.03) !important; }

/* Table Node Base Styles */
.node-occupied {
  background-color: #f8fafc !important;
}
.node-available {
  background-color: #ffffff !important;
}

.border-available {
  border: 2px solid rgba(15, 157, 88, 0.2) !important;
}
.border-occupied {
  border: 2px dashed rgba(0, 0, 0, 0.1) !important;
}

.card-ready-glow-insert-light {
   position: absolute;
   bottom: 0px;
   width: 100%;
   height: 20%;
   background: #0f9d58;
   filter: blur(30px);
   opacity: 0.1;
   pointer-events: none;
}

/* Operational Overlays */
.occupied-overlay-light {
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  transition: all 0.3s;
}

/* Animations & Interactions */
.hover-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.hover-card:hover {
  transform: translateY(-4px);
}
.hover-card.node-available:hover {
  box-shadow: 0 12px 24px rgba(15, 157, 88, 0.1) !important;
}

/* Aux Utilities */
.ls-1 { letter-spacing: 1px !important; }
.line-height-1 { line-height: 1.2 !important; }
.cursor-pointer { cursor: pointer; }

.z-index-2 { z-index: 2; position: relative; }
.z-index-3 { z-index: 3; position: relative; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

