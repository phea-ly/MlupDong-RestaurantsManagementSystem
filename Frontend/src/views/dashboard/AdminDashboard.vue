<script>
import { defineStore } from "pinia";
import { ref } from "vue";

export const useDashboardStore = defineStore("dashboard", () => {
  const activeRange = ref("7days");

  const stats = ref([
    {
      label: "dashboard.total_revenue",
      value: "$420,000",
      sub: "dashboard.revenue_sub",
      trend: "+15.8%",
      up: true,
      color: "var(--app-primary-600)",
      icon: "mdi-chart-line",
      route: "/home/sales-report",
    },
    {
      label: "dashboard.orders_today",
      value: "128",
      subKey: "dashboard.orders_sub",
      subCount: 18,
      trend: "+8.1%",
      up: true,
      color: "#3b82f6",
      icon: "mdi-receipt-text-outline",
      route: "/home/sales-report",
    },
    {
      label: "dashboard.avg_ticket",
      value: "$32.40",
      sub: "dashboard.avg_sub",
      trend: "-1.2%",
      up: false,
      color: "#f59e0b",
      icon: "mdi-currency-usd",
      route: "/home/sales-report",
    },
    {
      label: "dashboard.new_guests",
      value: "46",
      sub: "dashboard.guests_sub",
      trend: "+5.6%",
      up: true,
      color: "#a855f7",
      icon: "mdi-account-plus-outline",
      route: "/home/user",
    },
  ]);

  const quickActions = ref([
    { label: "dashboard.add_item", icon: "mdi-plus", color: "var(--app-primary)", route: "/home/menu" },
    { label: "dashboard.new_order", icon: "mdi-silverware-fork-knife", color: "#3b82f6", route: "/home/table" },
    { label: "dashboard.view_reports", icon: "mdi-chart-box-outline", color: "#f59e0b", route: "/home/sales-report" },
  ]);

  const bestSelling = ref([
    { name: "Signature Fish Amok", sold: 452, pct: 100, color: "success" },
    { name: "Iced Coconut Coffee", sold: 310, pct: 69, color: "blue" },
    { name: "Kampot Pepper Squid", sold: 285, pct: 63, color: "orange" },
    { name: "Mango Sticky Rice", sold: 215, pct: 48, color: "pink" },
    { name: "Tamarind Shaked Tea", sold: 198, pct: 44, color: "teal" },
  ]);

  const peakHours = ref([
    { label: "8 AM", height: 30 },
    { label: "10 AM", height: 45 },
    { label: "12 PM", height: 85 },
    { label: "2 PM", height: 55 },
    { label: "4 PM", height: 40 },
    { label: "6 PM", height: 95 },
    { label: "8 PM", height: 75 },
  ]);

  const orderSummary = ref([
    { label: "dashboard.total_orders", value: "2,480", meta: "+12% vs last month" },
    { label: "dashboard.refund_rate", value: "0.7%", meta: "-0.3% trend" },
    { label: "dashboard.repeat_guests", value: "38%", meta: "+4% last 30 days" },
  ]);

  const orderHeaders = ref([
    { title: "dashboard.order_id", key: "id" },
    { title: "dashboard.customer", key: "customer" },
    { title: "dashboard.items", key: "items" },
    { title: "dashboard.status", key: "status" },
    { title: "dashboard.amount", key: "amount", align: "end" },
  ]);

  const recentOrders = ref([
    {
      id: "MD-9284",
      initials: "RC",
      color: "success",
      customer: "Rithy Chann",
      items: "Fish Amok x2, Cambodia Beer x4",
      status: "COMPLETED",
      statusColor: "success",
      amount: "$124.50",
    },
    {
      id: "MD-9283",
      initials: "SM",
      color: "orange",
      customer: "Sokha Meas",
      items: "Beef Lok Lak x3, Fresh Juices x3",
      status: "PREPARING",
      statusColor: "warning",
      amount: "$86.20",
    },
    {
      id: "MD-9281",
      initials: "JP",
      color: "blue",
      customer: "John Pierce",
      items: "Signature Seafood Platter x1",
      status: "COMPLETED",
      statusColor: "success",
      amount: "$55.00",
    },
  ]);

  const chartPoints = ref("50,80 150,60 250,65 350,45 450,30 550,20 650,25");
  const weekDays = ref(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

  function goTo(router, route) {
    if (!route) return;
    router.push(route);
  }

  return {
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
    goTo,
  };
});
</script>

<script setup>
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

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
          <div class="text-h6 font-weight-black">{{ $t('dashboard.welcome', { name: 'Admin' }) }}</div>
          <div class="text-caption text-medium-emphasis">{{ $t('dashboard.overview') }}</div>
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
            {{ $t(action.label) }}
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
                <div class="text-caption font-weight-black text-uppercase text-medium-emphasis mb-1">{{ $t(stat.label) }}</div>
                <div class="text-h5 font-weight-black">{{ stat.value }}</div>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ stat.subKey ? $t(stat.subKey, { count: stat.subCount }) : $t(stat.sub) }}
                </div>
              </div>
              <v-avatar :color="stat.color" size="36" rounded="lg" variant="tonal">
                <v-icon size="18">{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
            <v-chip :color="stat.up ? 'success' : 'error'" variant="tonal" size="x-small">
              <v-icon start size="12">{{ stat.up ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
              {{ stat.trend }} {{ stat.up ? $t('dashboard.up') : $t('dashboard.down') }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Order Statistics -->
    <v-card rounded="xl" elevation="0" border class="mb-4">
      <v-card-title class="d-flex align-center justify-space-between pt-5 px-5 flex-wrap ga-3">
        <div>
          <div class="text-subtitle-1 font-weight-black">{{ $t('dashboard.order_stats') }}</div>
          <div class="text-caption text-medium-emphasis">{{ $t('dashboard.stats_sub') }}</div>
        </div>
        <v-btn-toggle
          v-model="activeRange"
          rounded="lg"
          density="compact"
          color="var(--app-primary-600)"
          variant="outlined"
        >
          <v-btn value="30days" size="small">{{ $t('dashboard.last_30') }}</v-btn>
          <v-btn value="7days" size="small">{{ $t('dashboard.last_7') }}</v-btn>
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
          <polyline
            :points="chartPoints"
            fill="none"
            stroke="var(--app-primary-600)"
            stroke-width="2.5"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </svg>
        <div class="d-flex justify-space-between px-2 mt-1">
          <span v-for="d in weekDays" :key="d" class="text-caption text-medium-emphasis">{{ d }}</span>
        </div>
        <v-divider class="my-4" />
        <div class="d-flex flex-wrap justify-space-between ga-4">
          <div v-for="item in orderSummary" :key="item.label">
            <div class="text-caption text-medium-emphasis">{{ $t(item.label) }}</div>
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
            <span class="text-subtitle-1 font-weight-black">{{ $t('dashboard.best_selling') }}</span>
            <v-btn variant="text" color="var(--app-primary-600)" size="small" @click="goTo(router, '/home/menu')">{{ $t('dashboard.view_all') }}</v-btn>
          </v-card-title>
          <v-card-text>
            <div v-for="item in bestSelling" :key="item.name" class="mb-4">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2 font-weight-medium">{{ item.name }}</span>
                <span class="text-body-2 font-weight-bold">{{ $t('dashboard.sold', { count: item.sold }) }}</span>
              </div>
              <v-progress-linear
                :model-value="item.pct"
                :color="item.color"
                rounded
                height="6"
                bg-color="grey-lighten-3"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
            <span class="text-subtitle-1 font-weight-black">{{ $t('dashboard.peak_hour') }}</span>
            <v-chip size="small" variant="tonal">24H CYCLE</v-chip>
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-end ga-2 mb-2" style="height: 100px">
              <div
                v-for="bar in peakHours"
                :key="bar.label"
                class="peak-bar"
                :style="{ height: bar.height + '%' }"
              />
            </div>
            <div class="d-flex justify-space-between mb-4">
              <span v-for="bar in peakHours" :key="bar.label" class="text-caption text-medium-emphasis">
                {{ bar.label }}
              </span>
            </div>
            <v-alert type="success" variant="tonal" rounded="lg" density="compact">
              <span class="text-caption">
                {{ $t('dashboard.peak_alert') }}
              </span>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Orders -->
    <v-card rounded="xl" elevation="0" border>
      <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
        <span class="text-subtitle-1 font-weight-black">{{ $t('dashboard.recent_orders') }}</span>
        <v-btn
          variant="outlined"
          rounded="lg"
          size="small"
          prepend-icon="mdi-filter-outline"
          @click="goTo(router, '/home/sales-report')"
        >
          {{ $t('dashboard.filter') }}
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="orderHeaders.map(h => ({ ...h, title: $t(h.title) }))"
        :items="recentOrders"
        hide-default-footer
        items-per-page="-1"
      >
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

.peak-bar {
  flex: 1;
  background: var(--app-primary-600);
  border-radius: 4px 4px 0 0;
  opacity: 0.75;
  min-height: 8px;
  transition: height 0.3s ease;
}
</style>