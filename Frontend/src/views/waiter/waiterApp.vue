<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

// Import child components
import LiveOrder from './liveOrder.vue';
import QuickMenu from './quickMenu.vue';
import FloorPlan from './floorPlan.vue';

const router = useRouter();
const authStore = useAuthStore();

const currentView = ref('Live Orders');
const selectedTableId = ref(null);
const currentTime = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

// Update clock every minute
let timer;
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, 10000);
});
onUnmounted(() => clearInterval(timer));

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

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>

<template>
  <v-app class="app-background">
    <!-- NAVIGATION DRAWER: Persistent Sidebar -->
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
        >
          <template v-if="currentView === item.id" v-slot:append>
             <div class="active-indicator"></div>
          </template>
        </v-list-item>
      </v-list>
      
      <v-spacer></v-spacer>

      <!-- System Section -->
      <div class="px-3 pb-6">
        <div class="section-label px-3 mb-4">System</div>
        <v-list-item
          prepend-icon="mdi-logout-variant"
          title="Sign Out"
          @click="handleLogout"
          rounded="xl"
          base-color="#64748b"
          class="logout-item mx-1"
        />
      </div>
      
    </v-navigation-drawer>

    <!-- MAIN CONTENT SHELL -->
    <v-main class="app-background">
      <!-- Premium Top Header -->
      <header class="content-header px-8 d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <h1 class="view-title">{{ currentView }}</h1>
          <v-chip size="x-small" color="#0d8465" variant="flat" class="ml-4 px-2 font-weight-bold" style="letter-spacing: 0.05em;">LIVE</v-chip>
        </div>

        <div class="d-flex align-center">
          <div class="status-badge mr-6">
            <div class="status-dot"></div>
            <span>System Online</span>
          </div>
          <div class="clock-display">{{ currentTime }}</div>
        </div>
      </header>

      <!-- Dynamic View Rendering -->
      <div class="view-container">
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
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

::v-deep(*) {
  font-family: 'Plus Jakarta Sans', sans-serif !important;
}

/* Core App */
.app-background { background-color: #f8fafc !important; }

/* Drawer */
.sidebar-drawer {
  border-right: 1px solid #f1f5f9 !important;
  display: flex;
  flex-direction: column;
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

/* Waiter Card */
.waiter-card {
  background-color: #ffffff;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.waiter-name {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.01em;
  margin-bottom: 2px;
}
.waiter-station {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Section label */
.section-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #94a3b8;
}

/* Nav items */
.nav-item {
  min-height: 52px !important;
  margin-bottom: 6px !important;
  transition: all 0.2s ease;
}

:deep(.v-list-item-title) {
  font-size: 14px !important;
  font-weight: 600 !important;
}

/* Active Indicator */
.active-indicator {
  width: 4px;
  height: 20px;
  background-color: #059669;
  border-radius: 4px;
}

/* Active State */
:deep(.v-list-item--active) {
  background-color: #dcfce7 !important;
  color: #065f46 !important;
}

/* Logout Item */
.logout-item:hover {
  background-color: #fee2e2 !important;
  color: #dc2626 !important;
}

/* Header Styling */
.content-header {
  height: 80px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 10;
}

.view-title {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.clock-display {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  background: #f1f5f9;
  padding: 8px 16px;
  border-radius: 12px;
  min-width: 100px;
  text-align: center;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #e0f2fe;
  padding: 6px 12px;
  border-radius: 50px;
}
.status-badge span {
  font-size: 11px;
  font-weight: 800;
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.status-dot {
  width: 8px;
  height: 8px;
  background-color: #0ea5e9;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
}

/* Main View Container */
.view-container {
  padding: 24px;
  min-height: calc(100vh - 80px);
}

/* View Transition Animations */
.fade-view-enter-active, .fade-view-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-view-enter-from, .fade-view-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

