<script setup>
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useDashboardStore } from "@/stores";

const router = useRouter();
const dashboardStore = useDashboardStore();

const {
  activeRange,
  stats,
  quickActions,
  bestSelling,
  peakHours,
  orderSummary,
  orderHeaders,
  recentOrders,
  chartPoints,
  weekDays,
} = storeToRefs(dashboardStore);

const { goTo } = dashboardStore;
</script>

<template>
  <div>
    <!-- Header -->
    <v-card rounded="xl" elevation="0" border class="mb-4">
      <v-card-text class="d-flex align-center justify-space-between flex-wrap ga-3 px-5 py-4">
        <div>
          <div class="text-h6 font-weight-black">Welcome back, Admin</div>
          <div class="text-caption text-medium-emphasis">Overview of sales and operations today</div>
        </div>
        <div class="d-flex align-center ga-2">
          <v-btn
            v-for="action in quickActions"
            :key="action.label"
            rounded="lg"
            size="small"
            variant="tonal"
            :color="action.color"
            :prepend-icon="action.icon"
            @click="goTo(router, action.route)"
          >
            {{ action.label }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- KPI Cards -->
    <v-row class="mb-4">
      <v-col v-for="stat in stats" :key="stat.label" cols="12" md="3">
        <v-card rounded="xl" elevation="0" border class="kpi-card" @click="goTo(router, stat.route)">
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-3">
              <div>
                <div class="text-caption font-weight-black text-uppercase text-medium-emphasis mb-1">{{ stat.label }}</div>
                <div class="text-h5 font-weight-black">{{ stat.value }}</div>
                <div class="text-caption text-medium-emphasis mt-1">{{ stat.sub }}</div>
              </div>
              <v-avatar :color="stat.color" size="36" rounded="lg" variant="tonal">
                <v-icon size="18" color="white">{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
            <v-chip :color="stat.up ? 'success' : 'error'" variant="tonal" size="x-small">
              {{ stat.trend }} {{ stat.up ? 'UP' : 'DOWN' }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Order Statistics -->
    <v-card rounded="xl" elevation="0" border class="mb-4">
      <v-card-title class="d-flex align-center justify-space-between pt-5 px-5 flex-wrap ga-3">
        <div>
          <div class="text-subtitle-1 font-weight-black">Order Statistics</div>
          <div class="text-caption text-medium-emphasis">Total volume over the selected period</div>
        </div>
        <v-btn-toggle v-model="activeRange" rounded="lg" density="compact" color="var(--app-primary-600)" variant="outlined">
          <v-btn value="30days" size="small">Last 30 Days</v-btn>
          <v-btn value="7days" size="small">Last 7 Days</v-btn>
        </v-btn-toggle>
      </v-card-title>
      <v-card-text>
        <svg width="100%" height="160" viewBox="0 0 700 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--app-primary-600)" stop-opacity="0.15" />
              <stop offset="100%" stop-color="var(--app-primary-600)" stop-opacity="0" />
            </linearGradient>
          </defs>
          <polygon :points="chartPoints + ' 650,120 50,120'" fill="url(#lineGrad)" />
          <polyline :points="chartPoints" fill="none" stroke="var(--app-primary-600)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        </svg>
        <div class="d-flex justify-space-between px-2 mt-1">
          <span v-for="d in weekDays" :key="d" class="text-caption text-medium-emphasis">{{ d }}</span>
        </div>
        <v-divider class="my-4" />
        <div class="d-flex flex-wrap justify-space-between ga-4">
          <div v-for="item in orderSummary" :key="item.label">
            <div class="text-caption text-medium-emphasis">{{ item.label }}</div>
            <div class="text-h6 font-weight-black">{{ item.value }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.meta }}</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Best Selling + Peak Hours -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
            <span class="text-subtitle-1 font-weight-black">Best Selling Food and Drinks</span>
            <v-btn variant="text" color="var(--app-primary-600)" size="small" @click="goTo(router, '/home/menu')">View All</v-btn>
          </v-card-title>
          <v-card-text>
            <div v-for="item in bestSelling" :key="item.name" class="mb-4">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2 font-weight-medium">{{ item.name }}</span>
                <span class="text-body-2 font-weight-bold">{{ item.sold }} sold</span>
              </div>
              <v-progress-linear :model-value="item.pct" :color="item.color" rounded height="6" bg-color="grey-lighten-3" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
            <span class="text-subtitle-1 font-weight-black">Peak Hour Analysis</span>
            <v-chip size="small" variant="tonal">24H CYCLE</v-chip>
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-end ga-2 mb-2" style="height:100px">
              <div
                v-for="bar in peakHours" :key="bar.label"
                style="flex:1; background:var(--app-primary-600); border-radius:4px 4px 0 0; opacity:0.75; min-height:8px; transition:height 0.3s"
                :style="{ height: bar.height + '%' }"
              />
            </div>
            <div class="d-flex justify-space-between mb-4">
              <span v-for="bar in peakHours" :key="bar.label" class="text-caption text-medium-emphasis">{{ bar.label }}</span>
            </div>
            <v-alert type="success" variant="tonal" rounded="lg" density="compact">
              <span class="text-caption">
                Dinner service (6 PM - 8 PM) accounts for 42% of daily revenue.
                Consider increasing floor staff during this window.
              </span>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Orders -->
    <v-card rounded="xl" elevation="0" border>
      <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
        <span class="text-subtitle-1 font-weight-black">Recent High-Value Orders</span>
        <v-btn variant="outlined" rounded="lg" size="small" prepend-icon="mdi-filter-outline" @click="goTo(router, '/home/sales-report')">Filter</v-btn>
      </v-card-title>

      <v-data-table :headers="orderHeaders" :items="recentOrders" hide-default-footer items-per-page="-1">
        <template #item.id="{ item }">
          <span class="text-primary font-weight-bold">#{{ item.id }}</span>
        </template>

        <template #item.customer="{ item }">
          <div class="d-flex align-center ga-2">
            <v-avatar :color="item.color" variant="tonal" size="28" rounded="lg">
              <span class="text-caption font-weight-bold">{{ item.initials }}</span>
            </v-avatar>
            {{ item.customer }}
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="item.statusColor" size="small" rounded="lg" variant="tonal">
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.amount="{ item }">
          <span class="font-weight-black">{{ item.amount }}</span>
        </template>
      </v-data-table>

      <v-card-text class="text-center text-caption text-disabled">
        (c) 2024 Mlup Dong Restaurant Management System. All rights reserved.
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.kpi-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}
</style>


