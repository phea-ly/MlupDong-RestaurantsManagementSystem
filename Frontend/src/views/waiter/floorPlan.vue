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
  <div class="pa-8 d-flex flex-column h-100 overflow-y-auto" style="background-color: #0b110c;">
    
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-8">
      <div>
        <h1 class="text-h4 font-weight-black text-white mb-2" style="letter-spacing: -1px;">Interactive Floor Plan</h1>
        <p class="text-subtitle-1 text-grey-lighten-1 font-weight-medium">
          {{ tableStore.tables.length }} Total Units &bull; {{ tableStore.tables.filter(t => checkOccupied(t.table_id)).length }} Occupied
        </p>
      </div>
      
      <div class="d-flex gap-4">
        <!-- Legend -->
        <div class="d-flex align-center mr-6 bg-legend pa-3 rounded-lg border-dark">
          <span class="legend-dot bg-neon-green mr-3"></span> <span class="text-caption text-white mr-6 font-weight-bold ls-1">AVAILABLE</span>
          <span class="legend-dot bg-grey-darken-1 mr-3"></span> <span class="text-caption text-white font-weight-bold ls-1">OCCUPIED</span>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="d-flex mb-8 align-center gap-4 filter-scroll" style="overflow-x: auto;">
      <v-chip-group v-model="selectedCategory" mandatory color="#00ff00" selected-class="bg-neon-green text-black">
        <v-chip
          v-for="(zone, i) in zones" :key="i"
          :value="zone"
          class="font-weight-bold text-body-1 px-6 mr-4 border-filter"
          variant="outlined"
          :color="selectedCategory === zone ? 'transparent': '#2e3a33'"
          size="large"
          style="height: 46px; border-radius: 23px;"
          :class="selectedCategory !== zone ? 'bg-dark-olive text-white' : ''"
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
               height="180" elevation="0"
               @click="handleTableClick(table)"
            >
               <!-- Subtle glow for available tables -->
               <div v-if="!checkOccupied(table.table_id)" class="card-ready-glow-insert"></div>

               <!-- Inner Border overlay based on status -->
               <div class="inner-border-frame w-100 h-100 position-absolute rounded-xl" :class="checkOccupied(table.table_id) ? 'border-darker' : 'border-neon'"></div>

               <!-- Table Number -->
               <div class="text-h3 font-weight-black mb-1 line-height-1 mt-2 z-index-2"
                 :class="checkOccupied(table.table_id) ? 'text-grey-lighten-1' : 'text-neon-green'"
                 style="letter-spacing: -2px;"
               >
                 {{ String(table.table_number).padStart(2, '0') }}
               </div>
               
               <div class="text-caption font-weight-bold text-uppercase ls-1 mb-3 z-index-2"
                 :class="checkOccupied(table.table_id) ? 'text-grey-darken-1' : 'text-dark-green'"
               >
                 {{ table.location || 'Indoor' }}
               </div>

               <!-- Seats Info -->
               <v-chip size="small" :color="checkOccupied(table.table_id) ? '#212623' : '#133317'" 
                  class="font-weight-black mt-auto mb-4 text-caption px-4 border-thin z-index-2">
                  <v-icon size="14" class="mr-1" :color="checkOccupied(table.table_id) ? '#718076' : '#278235'">mdi-account-group</v-icon>
                  <span :class="checkOccupied(table.table_id) ? 'text-grey' : 'text-neon-green'">{{ table.capacity }} Seats</span>
               </v-chip>

               <!-- Occupied Overlay (if occupied) -->
               <transition name="fade">
                <div v-if="checkOccupied(table.table_id)" class="position-absolute d-flex flex-column align-center justify-center w-100 h-100 occupied-overlay rounded-xl z-index-3">
                    <v-icon size="36" color="#ffffff" class="mb-2">mdi-silverware-fork-knife</v-icon>
                    <div class="text-white font-weight-black text-body-2 text-uppercase position-relative" style="letter-spacing: 2px;">In Service</div>
                    <div class="text-neon-green text-xs font-weight-black mt-2 text-uppercase bg-black rounded px-2 py-1">Busy</div>
                </div>
               </transition>
            </v-card>
         </v-col>
      </template>

      <!-- Empty State if no tables -->
      <v-col v-if="!displayTables.length" cols="12" class="text-center py-12">
        <v-icon size="64" color="#2e3a33" class="mb-4">mdi-table-off</v-icon>
        <div class="text-h6 text-grey-darken-1">No tables found in this zone.</div>
      </v-col>
    </v-row>

    <!-- Skeleton Loading -->
    <v-row v-else class="mt-2">
       <v-col v-for="i in 10" :key="i" cols="12" sm="6" md="4" lg="3" xl="2">
          <v-card height="180" color="#111713" class="rounded-xl border-dark" elevation="0">
             <div class="w-100 h-100 d-flex align-center justify-center">
                <v-progress-circular indeterminate color="#00ff00"></v-progress-circular>
             </div>
          </v-card>
       </v-col>
    </v-row>

  </div>
</template>

<style scoped>
.text-neon-green { color: #00ff00 !important; }
.bg-neon-green { background-color: #00ff00 !important; color: #000 !important; }
.text-dark-green { color: #278235 !important; }
.bg-dark-olive { background-color: #1c2620 !important; }

.legend-dot {
  display: inline-block;
  width: 12px; height: 12px;
  border-radius: 50%;
}

.bg-legend {
   background-color: #111413 !important;
}

.border-filter { border: 1px solid #2e3a33 !important; }
.border-thin { border: 1px solid rgba(255,255,255,0.05) !important; }

.node-occupied {
  background-color: #1a1e1c !important;
}

.node-available {
  background-color: #0b1f11 !important;
  box-shadow: inset 0 0 40px rgba(0, 255, 0, 0.05) !important;
}

.border-neon {
  border: 2px solid #164f1e !important;
}

.border-dark { border: 1px solid #282f2a !important; }
.border-darker { border: 2px solid #262e29 !important; }

.card-ready-glow-insert {
   position: absolute;
   bottom: 0px;
   width: 80%;
   height: 20%;
   background: #00ff00;
   filter: blur(40px);
   opacity: 0.15;
   pointer-events: none;
}

.occupied-overlay {
  background-color: rgba(11, 14, 12, 0.85);
  backdrop-filter: blur(3px);
  transition: all 0.3s;
}

.hover-card {
  transition: transform 0.2s, background-color 0.2s;
}
.hover-card:hover {
  transform: translateY(-4px);
}
.hover-card.node-available:hover {
  background-color: #102e19 !important;
}

.ls-1 { letter-spacing: 1px !important; }
.text-xs { font-size: 10px !important; }
.line-height-1 { line-height: 1.2 !important; }

.z-index-2 { z-index: 2; position: relative; }
.z-index-3 { z-index: 3; position: relative; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

