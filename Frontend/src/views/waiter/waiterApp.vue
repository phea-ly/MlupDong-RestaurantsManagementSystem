<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

import LiveOrder from '../../components/waiter/liveOrder.vue';
import QuickMenu from '../../components/waiter/quickMenu.vue';
import FloorPlan from '../../components/waiter/floorPlan.vue';

const router = useRouter();
const authStore = useAuthStore();

const currentView = ref('Live Orders');
const selectedTableId = ref(null);
const currentTime = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

let timer;
onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, 10000);
});
onUnmounted(() => clearInterval(timer));

const sidebarMenu = computed(() => [
  { icon: 'mdi-view-grid-outline',     text: 'Floor Plan',  id: 'Floor Plan'  },
  { icon: 'mdi-check-circle-outline',  text: 'Live Orders', id: 'Live Orders' },
  { icon: 'mdi-silverware-fork-knife', text: 'Quick Menu',  id: 'Quick Menu'  }
]);

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

    <!-- ── Sidebar ── -->
    <v-navigation-drawer permanent color="#ffffff" width="280" class="sidebar-drawer" border="0" elevation="0">
      <div class="brand-wrap px-4 pt-6 pb-2">
        <v-avatar size="48" class="brand-avatar">
          <v-icon color="#1a6b4a" size="28">mdi-leaf</v-icon>
        </v-avatar>
        <div class="brand-text">
          <div class="brand-title">MLUP DONG</div>
          <div class="brand-subtitle">Service Station</div>
        </div>
      </div>

      <div class="section-label px-6 mt-8 mb-4">Main Menu</div>
      <v-list nav class="px-3 pb-0" bg-color="transparent">
        <v-list-item
          v-for="(item, i) in sidebarMenu" :key="i"
          @click="currentView = item.id"
          :prepend-icon="item.icon"
          :title="item.text"
          :active="currentView === item.id"
          rounded="xl" base-color="#64748b" class="nav-item mx-1"
        >
          <template v-if="currentView === item.id" v-slot:append>
            <div class="active-indicator"></div>
          </template>
        </v-list-item>
      </v-list>

      <v-spacer></v-spacer>
      <div class="px-3 pb-6">
        <div class="section-label px-3 mb-4">System</div>
        <v-list-item prepend-icon="mdi-logout-variant" title="Sign Out"
          @click="handleLogout" rounded="xl" base-color="#64748b" class="logout-item mx-1" />
      </div>
    </v-navigation-drawer>

    <!-- ── Main ── -->
    <v-main>
      <div class="main-shell">

        <!-- Header -->
        <header class="content-header px-8 d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <h1 class="view-title">{{ currentView }}</h1>
            <v-chip size="x-small" color="#0d8465" variant="flat" class="ml-4 px-2 font-weight-bold" style="letter-spacing:0.05em">LIVE</v-chip>
          </div>
          <div class="d-flex align-center">
            <div class="status-badge mr-6">
              <div class="status-dot"></div>
              <span>System Online</span>
            </div>
            <div class="clock-display">{{ currentTime }}</div>
          </div>
        </header>

        <!--
          view-area fills all remaining height via flex:1.
          v-show keeps all 3 components mounted so they never
          lose their state or size when switching tabs.
          NO transition, NO position:absolute — pure flex.
        -->
        <div class="view-area">

          <div v-show="currentView === 'Live Orders'" class="view-wrap view-wrap--padded">
            <LiveOrder />
          </div>

          <div v-show="currentView === 'Quick Menu'" class="view-wrap">
            <QuickMenu
              :initial-table-id="selectedTableId"
              @reset-table="selectedTableId = null"
            />
          </div>

          <div v-show="currentView === 'Floor Plan'" class="view-wrap view-wrap--padded">
            <FloorPlan @start-order="startOrderWithTable" />
          </div>

        </div>
      </div>
    </v-main>

  </v-app>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
::v-deep(*) { font-family: 'Plus Jakarta Sans', sans-serif !important; }

.app-background { background-color: #f8fafc !important; }

/* Force v-main to be a full-height flex column */
:deep(.v-main) {
  height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
}
:deep(.v-main__wrap) {
  flex: 1 !important;
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;       /* critical for flex children to shrink */
}

/* Shell fills v-main completely */
.main-shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Header — fixed height, never shrinks */
.content-header {
  height: 80px;
  flex-shrink: 0;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #f1f5f9;
  z-index: 10;
}

/* view-area fills everything below the header */
.view-area {
  flex: 1;
  min-height: 0;                  /* critical */
  display: flex;
  overflow: hidden;
}

/* Each view wrapper fills view-area fully */
.view-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  flex-shrink: 0;
}

/* LiveOrder & FloorPlan get padding + scroll */
.view-wrap--padded {
  padding: 24px;
  overflow-y: auto;
}

/* ── Sidebar ── */
.sidebar-drawer {
  border-right: 1px solid #f1f5f9 !important;
  display: flex;
  flex-direction: column;
}
.brand-wrap { display: flex; align-items: center; gap: 16px; }
.brand-avatar { flex-shrink: 0; background-color: #eaf5f0 !important; }
.brand-text { display: flex; flex-direction: column; line-height: 1.25; }
.brand-title { font-size: 16px; font-weight: 800; letter-spacing: 0.02em; color: #0f172a; }
.brand-subtitle { font-size: 11px; font-weight: 700; color: #0d8465; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
.section-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #94a3b8; }
.nav-item { min-height: 52px !important; margin-bottom: 6px !important; transition: all 0.2s ease; }
:deep(.v-list-item-title) { font-size: 14px !important; font-weight: 600 !important; }
.active-indicator { width: 4px; height: 20px; background-color: #059669; border-radius: 4px; }
:deep(.v-list-item--active) { background-color: #dcfce7 !important; color: #065f46 !important; }
.logout-item:hover { background-color: #fee2e2 !important; color: #dc2626 !important; }

/* ── Header elements ── */
.view-title { font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; }
.clock-display {
  font-size: 18px; font-weight: 700; color: #0f172a;
  background: #f1f5f9; padding: 8px 16px; border-radius: 12px;
  min-width: 100px; text-align: center;
}
.status-badge { display: flex; align-items: center; gap: 8px; background: #e0f2fe; padding: 6px 12px; border-radius: 50px; }
.status-badge span { font-size: 11px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.05em; }
.status-dot { width: 8px; height: 8px; background-color: #0ea5e9; border-radius: 50%; animation: pulse 2s infinite; }

@keyframes pulse {
  0%   { transform: scale(0.95); opacity: 0.5; }
  50%  { transform: scale(1.1);  opacity: 1;   }
  100% { transform: scale(0.95); opacity: 0.5; }
}
</style>