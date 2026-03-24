<script setup>
import { ref, computed } from 'vue';

// Import child components
import LiveOrder from './liveOrder.vue';
import QuickMenu from './quickMenu.vue';
import Report from './report.vue';
import FloorPlan from './floorPlan.vue';

const currentView = ref('Quick Menu');
const search = ref('');

const sidebarMenu = computed(() => [
  { icon: 'mdi-view-grid-outline', text: 'Floor Plan', id: 'Floor Plan' },
  { icon: 'mdi-check-circle-outline', text: 'Live Orders', id: 'Live Orders' },
  { icon: 'mdi-silverware-fork-knife', text: 'Quick Menu', id: 'Quick Menu' },
  { icon: 'mdi-chart-box-outline', text: 'Reports', id: 'Reports' }
]);
</script>

<template>
  <v-app theme="dark">
    <!-- APP BAR -->
    <v-app-bar color="#050a06" height="70" flat style="border-bottom: 1px solid #16241a;">
      <div class="d-none d-md-flex align-center ml-2 pl-6" style="border-left: 1px solid #16241a; height: 100%;">
        <div style="line-height:1.1;">
          <div class="text-caption text-neon-green font-weight-bold">Mlup Dong</div>
          <div class="text-caption text-grey-darken-1 font-weight-bold text-uppercase ls-1">SERVICE STATION</div>
        </div>
      </div>
      
      <v-spacer></v-spacer>
      
      <div class="d-none d-md-flex align-center h-100 mr-8">
        <v-btn 
          variant="text" 
          height="100%" 
          min-width="120"
          :class="['font-weight-bold text-body-1', currentView === 'Floor Plan' ? 'text-neon-green custom-tab-active' : 'text-grey']"
          @click="currentView = 'Floor Plan'"
        >Floor Plan</v-btn>
        
        <v-btn 
          variant="text" 
          height="100%" 
          min-width="120"
          :class="['font-weight-bold text-body-1', currentView === 'Live Orders' ? 'text-neon-green custom-tab-active' : 'text-grey']"
          @click="currentView = 'Live Orders'"
        >Live Orders</v-btn>

        <v-btn 
          variant="text" 
          height="100%" 
          min-width="120"
          :class="['font-weight-bold text-body-1', currentView === 'Quick Menu' ? 'text-neon-green custom-tab-active' : 'text-grey']"
          @click="currentView = 'Quick Menu'"
        >Quick Menu</v-btn>
      </div>
      
      <div class="d-none d-sm-flex align-center mr-6" style="width: 300px;">
        <v-text-field
          v-model="search"
          placeholder="Search orders..."
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          bg-color="#121f15"
          color="white"
          rounded="pill"
          density="compact"
          hide-details
          class="custom-search"
        ></v-text-field>
      </div>
      
      <v-btn icon="mdi-bell" color="#00ff00" variant="text" size="small" class="mr-2"></v-btn>
      <v-btn icon="mdi-cog" color="#00ff00" variant="text" size="small" class="mr-4"></v-btn>
      <v-btn icon color="#00ff00" variant="text" size="small" class="mr-6 rounded-lg bg-dark-green border-neon-slim">
        <v-icon size="20">mdi-account-outline</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- NAVIGATION DRAWER -->
    <v-navigation-drawer permanent color="#111413" width="260" style="border-right: 1px solid #1c241e;">
      <v-list class="pt-6">
        <v-list-item class="mb-4 px-6 d-flex align-center">
          <template v-slot:prepend>
            <v-avatar color="#f9cb9c" size="48" class="mr-4">
               <v-icon size="30" color="#b45f06">mdi-face-woman-profile</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-black text-white text-body-1">Waiter Mode</v-list-item-title>
          <v-list-item-subtitle class="font-weight-bold text-grey-darken-1 text-uppercase ls-1">Station 04</v-list-item-subtitle>
        </v-list-item>

        <v-list-item
          v-for="(item, i) in sidebarMenu"
          :key="i"
          @click="currentView = item.id"
          class="sidebar-item mx-4 mb-2 rounded-lg"
          :class="{'bg-active-sidebar border-left-neon': currentView === item.id}"
          height="54"
        >
          <template v-slot:prepend>
             <v-icon size="22" :color="currentView === item.id ? '#00ff00' : '#718076'" class="mr-2">{{item.icon}}</v-icon>
          </template>
          <v-list-item-title class="font-weight-bold text-body-2" :class="currentView === item.id ? 'text-neon-green' : 'text-grey-lighten-1'">
            {{item.text}}
          </v-list-item-title>
        </v-list-item>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-6">
          <v-btn 
            block 
            color="#00ff00"
            height="56"
            class="text-black font-weight-black text-button rounded-lg order-btn-hover"
            elevation="0"
          >
            <v-icon start size="20">mdi-plus</v-icon> New Order
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- MAIN CONTENT SHELL -->
    <v-main style="background-color: #0b110c;">
      <!-- Dynamic View Rendering -->
      <LiveOrder v-if="currentView === 'Live Orders'" />
      
      <QuickMenu v-else-if="currentView === 'Quick Menu'" />

      <Report v-else-if="currentView === 'Reports'" />

      <!-- Placeholder Views -->
      <FloorPlan v-else-if="currentView === 'Floor Plan'" />

    </v-main>
  </v-app>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

::v-deep(*) {
  font-family: 'Plus Jakarta Sans', sans-serif !important;
}

/* Global Navigation Styles */
.text-neon-green { color: #00ff00 !important; }
.bg-dark-green { background-color: #133317 !important; }
.bg-active-sidebar { background-color: #162a1c !important; }
.border-left-neon { border-left: 3px solid #00ff00 !important; }
.border-neon-slim { border: 1px solid #164f1e !important; }

.ls-1 { letter-spacing: 1px !important; }

/* Custom Overrides for inputs and appbar tabs */
.custom-tab-active { border-bottom: 2px solid #00ff00 !important; }
.custom-search :deep(.v-field__outline) { display: none; }
.custom-search :deep(.v-field) {
  border: 1px solid #1c2f1f;
  border-radius: 50px;
}

/* Base Interactions */
.order-btn-hover { transition: all 0.2s; }
.order-btn-hover:hover {
  filter: brightness(1.1);
  box-shadow: 0 0 15px rgba(0,255,0,0.4) !important;
}
</style>
