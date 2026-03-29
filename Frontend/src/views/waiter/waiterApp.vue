<script setup>
import { ref, computed } from 'vue';

// Import child components
import LiveOrder from './liveOrder.vue';
import QuickMenu from './quickMenu.vue';
import FloorPlan from './floorPlan.vue';

const currentView = ref('Live Orders');
const search = ref('');
const selectedTableId = ref(null);

const sidebarMenu = computed(() => [
  { icon: 'mdi-view-grid-outline', text: 'Floor Plan', id: 'Floor Plan' },
  { icon: 'mdi-check-circle-outline', text: 'Live Orders', id: 'Live Orders' },
  { icon: 'mdi-silverware-fork-knife', text: 'Quick Menu', id: 'Quick Menu' }
]);

// Helper to switch view with a pre-selected table
function startOrderWithTable(tableId) {
  selectedTableId.value = tableId;
  currentView.value = 'Quick Menu';
}
</script>

<template>
  
  <!-- NAVIGATION DRAWER: Persistent Sidebar -->
  <v-app class="app-background">
      <v-navigation-drawer permanent color="#ffffff" width="280" class="sidebar-drawer" border="0" elevation="0">
      
      <!-- Brand Area -->
      <div class="brand-wrap px-4 pt-6 pb-2">
        <v-avatar size="48" class="brand-avatar">
          <v-icon color="#1a6b4a" size="28">mdi-leaf</v-icon>
        </v-avatar>
        <div class="brand-text">
          <div class="brand-title">MLUP DONG</div>
          <div class="brand-subtitle">Service Station</div>
        </div>
      </div>

      <!-- Waiter Mode Indicator -->
      <div class="px-4 mt-3">
         <div class="d-flex align-center pa-4 rounded-xl" style="background-color: #f8fafc; border: 1px solid #f1f5f9;">
           <v-avatar size="36" color="#eaf5f0" class="mr-4">
              <v-icon size="22" color="#0d8465">mdi-account-tie</v-icon>
           </v-avatar>
           <div>
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; letter-spacing: 0.01em; margin-bottom: 2px;">Waiter Mode</div>
              <div style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Station 04</div>
           </div>
         </div>
      </div>

      <!-- Navigation Section -->
      <div class="section-label px-6 mt-8 mb-4">Main Menu</div>

      <v-list nav class="px-3 pb-0" bg-color="transparent">
        <v-list-item
          v-for="(item, i) in sidebarMenu"
          :key="i"
          @click="currentView = item.id"
          :prepend-icon="item.icon"
          :title="item.text"
          :active="currentView === item.id"
          rounded="xl"
          base-color="#64748b"
          class="nav-item mx-1"
        />
      </v-list>
      
      <v-spacer class="mt-8"></v-spacer>
      
    </v-navigation-drawer>

    <!-- MAIN CONTENT SHELL -->
    <v-main class="app-background">
      <!-- Dynamic View Rendering -->
      <transition name="fade-view" mode="out-in">
        <LiveOrder v-if="currentView === 'Live Orders'" />
        
        <QuickMenu 
          v-else-if="currentView === 'Quick Menu'" 
          :initial-table-id="selectedTableId"
          @reset-table="selectedTableId = null"
        />

        <FloorPlan 
          v-else-if="currentView === 'Floor Plan'" 
          @start-order="startOrderWithTable"
        />
      </transition>
    </v-main>
  </v-app>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

::v-deep(*) {
  font-family: 'Plus Jakarta Sans', sans-serif !important;
}

/* Core App */
.app-background { background-color: #ffffff !important; }

/* Drawer */
.sidebar-drawer {
  border-right: 1px solid #f3f4f6 !important;
}

/* Brand */
.brand-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}
.brand-avatar {
  flex-shrink: 0;
  background-color: #eaf5f0 !important;
}
.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.brand-title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: #0f172a;
}
.brand-subtitle {
  font-size: 11px;
  font-weight: 700;
  color: #0d8465;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 2px;
}

/* Section label */
.section-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
}

/* Nav item overrides */
:deep(.v-list-item-title) {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: inherit;
}

/* Prepend icon sizing */
:deep(.v-list-item__prepend .v-icon) {
  font-size: 20px !important;
  opacity: 0.9;
}

/* Active state — perfectly matches screenshot rich pastel green */
:deep(.v-list-item--active) {
  background-color: #dcfce7 !important;
  color: #065f46 !important;
}
:deep(.v-list-item--active .v-list-item-title) {
  font-weight: 700 !important;
  color: #065f46 !important;
}

/* Hover state */
:deep(.v-list-item:not(.v-list-item--active):hover) {
  background-color: #f8fafc !important;
  color: #0f172a !important;
}

/* Tighten internal padding */
:deep(.v-list-item) {
  min-height: 48px !important;
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  margin-bottom: 4px !important;
}

/* View Transition Animations */
.fade-view-enter-active, .fade-view-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-view-enter-from, .fade-view-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
</style>
