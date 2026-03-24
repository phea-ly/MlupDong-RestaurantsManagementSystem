<script setup>
import { onMounted, watch } from 'vue'
import { useRouter }        from 'vue-router'
import { storeToRefs }      from 'pinia'
import { useDashboardStore } from '@/stores/dashboard.store'

const router = useRouter()
const store  = useDashboardStore()

const {
  activeRange, stats, bestSelling, peakHours,
  orderSummary, recentOrders,
  loadingKpi, loadingChart, loadingBest,
  loadingPeak, loadingSummary, loadingOrders,
  quickActions, orderHeaders,
  chartPoints, weekDays, userName,
} = storeToRefs(store)

const { init, fetchChart, goTo } = store

onMounted(init)
watch(activeRange, fetchChart)
</script>

<template>
  <div>

    <!-- ── Welcome header ────────────────────────────────────────────────────── -->
    <v-card rounded="xl" elevation="0" border class="mb-4">
      <v-card-text class="d-flex align-center justify-space-between flex-wrap ga-3 px-5 py-4">
        <div>
          <div class="text-h6 font-weight-black">Welcome back, {{ userName }}</div>
          <div class="text-caption text-medium-emphasis">Overview of sales and operations today</div>
        </div>
        <div class="d-flex align-center ga-2">
          <v-btn
            v-for="action in quickActions"
            :key="action.label"
            rounded="lg" size="small" variant="tonal"
            :color="action.color"
            :prepend-icon="action.icon"
            @click="goTo(router, action.route)"
          >{{ action.label }}</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- ── KPI Cards ─────────────────────────────────────────────────────────── -->
    <v-row class="mb-4">
      <v-col
        v-for="(stat, i) in (loadingKpi ? Array(4).fill(null) : stats)"
        :key="i" cols="12" md="3"
      >
        <v-card v-if="!stat" rounded="xl" elevation="0" border>
          <v-card-text><v-skeleton-loader type="list-item-two-line" /></v-card-text>
        </v-card>

        <v-card
          v-else
          rounded="xl" elevation="0" border class="kpi-card"
          @click="goTo(router, stat.route)"
        >
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-3">
              <div>
                <div class="text-caption font-weight-black text-uppercase text-medium-emphasis mb-1">
                  {{ stat.label }}
                </div>
                <div class="text-h5 font-weight-black">{{ stat.value }}</div>
                <div class="text-caption text-medium-emphasis mt-1">{{ stat.sub }}</div>
              </div>
              <v-avatar :color="stat.color" size="36" rounded="lg" variant="tonal">
                <v-icon size="18">{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
            <v-chip :color="stat.up ? 'success' : 'error'" variant="tonal" size="x-small">
              <v-icon start size="12">{{ stat.up ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
              {{ stat.trend }} {{ stat.up ? 'UP' : 'DOWN' }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Order Statistics Chart ────────────────────────────────────────────── -->
    <v-card rounded="xl" elevation="0" border class="mb-4">
      <v-card-title class="d-flex align-center justify-space-between pt-5 px-5 flex-wrap ga-3">
        <div>
          <div class="text-subtitle-1 font-weight-black">Order Statistics</div>
        </div>
        <v-btn-toggle
          v-model="activeRange"
          rounded="lg" density="compact"
          color="var(--app-primary-600)" variant="outlined"
        >
          <v-btn value="30days" size="small">Last 30 Days</v-btn>
          <v-btn value="7days"  size="small">Last 7 Days</v-btn>
        </v-btn-toggle>
      </v-card-title>

      <v-card-text>
        <v-skeleton-loader v-if="loadingChart" type="image" height="160" />
        <template v-else>
          <svg width="100%" height="160" viewBox="0 0 700 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="var(--app-primary-600)" stop-opacity="0.15" />
                <stop offset="100%" stop-color="var(--app-primary-600)" stop-opacity="0"    />
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
        </template>

        <v-divider class="my-4" />

        <!-- Summary row below chart -->
        <div v-if="loadingSummary" class="d-flex flex-wrap ga-4">
          <v-skeleton-loader v-for="i in 3" :key="i" type="list-item-two-line" width="140" />
        </div>
        <div v-else class="d-flex flex-wrap justify-space-between ga-4">
          <div v-for="item in orderSummary" :key="item.label">
            <div class="text-caption text-medium-emphasis">{{ item.label }}</div>
            <div class="text-h6 font-weight-black">{{ item.value }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.meta }}</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- ── Best Selling + Peak Hours ────────────────────────────────────────── -->
    <v-row class="mb-4">

      <!-- Best Selling -->
      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
            <span class="text-subtitle-1 font-weight-black">Best Selling Food and Drinks</span>
            <v-btn variant="text" color="var(--app-primary-600)" size="small" @click="goTo(router, '/home/menu')">
              View All
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader v-if="loadingBest" type="list-item-three-line@5" />
            <template v-else>
              <div v-if="!bestSelling.length" class="text-caption text-medium-emphasis py-4 text-center">
                No sales data for the last 30 days.
              </div>
              <div v-for="item in bestSelling" :key="item.name" class="mb-4">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-body-2 font-weight-medium">{{ item.name }}</span>
                  <span class="text-body-2 font-weight-bold">{{ item.sold }} sold</span>
                </div>
                <v-progress-linear
                  :model-value="item.pct"
                  :color="item.color"
                  rounded height="6"
                  bg-color="grey-lighten-3"
                />
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Peak Hours -->
      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
            <span class="text-subtitle-1 font-weight-black">Peak Hour Analysis</span>
            <v-chip size="small" variant="tonal">24H CYCLE</v-chip>
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader v-if="loadingPeak" type="image" height="120" />
            <template v-else>
              <div class="d-flex align-end ga-2 mb-2" style="height:100px">
                <div
                  v-for="bar in peakHours" :key="bar.label"
                  class="peak-bar"
                  :style="{ height: (bar.height || 4) + '%' }"
                  :title="`${bar.label}: ${bar.count} orders`"
                />
              </div>
              <div class="d-flex justify-space-between mb-4">
                <span v-for="bar in peakHours" :key="bar.label" class="text-caption text-medium-emphasis">
                  {{ bar.label }}
                </span>
              </div>
            </template>
            <v-alert type="success" variant="tonal" rounded="lg" density="compact">
              <span class="text-caption">
                Dinner service (6 PM – 8 PM) accounts for a large share of daily revenue.
                Consider increasing floor staff during this window.
              </span>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>

    <!-- ── Recent Orders ──────────────────────────────────────────────────────── -->
    <v-card rounded="xl" elevation="0" border>
      <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
        <span class="text-subtitle-1 font-weight-black">Recent High-Value Orders</span>
        <v-btn
          variant="outlined" rounded="lg" size="small"
          prepend-icon="mdi-filter-outline"
          @click="goTo(router, '/home/sales-report')"
        >Filter</v-btn>
      </v-card-title>

      <v-data-table
        :headers="orderHeaders"
        :items="recentOrders"
        :loading="loadingOrders"
        hide-default-footer
        items-per-page="-1"
        density="comfortable"
      >
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #item.id="{ item }">
          <span class="text-primary font-weight-bold">{{ item.id }}</span>
        </template>

        <template #item.customer="{ item }">
          <div class="d-flex align-center ga-2">
            <v-avatar :color="item.color" variant="tonal" size="28" rounded="lg">
              <span class="text-caption font-weight-bold">{{ item.initials }}</span>
            </v-avatar>
            {{ item.customer }}
          </div>
        </template>

        <template #item.items="{ item }">
          <span
            class="text-body-2 text-medium-emphasis"
            style="display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;"
          >{{ item.items }}</span>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="item.statusColor" size="small" rounded="lg" variant="tonal">
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.amount="{ item }">
          <span class="font-weight-black">{{ item.amount }}</span>
        </template>

        <template #no-data>
          <div class="d-flex flex-column align-center ga-2 py-8">
            <v-icon size="40" color="grey-lighten-2">mdi-receipt-text-outline</v-icon>
            <span class="text-body-2 text-medium-emphasis">No orders yet today.</span>
          </div>
        </template>
      </v-data-table>

      <v-card-text class="text-center text-caption text-disabled">
        © {{ new Date().getFullYear() }} Mlup Dong Restaurant Management System. All rights reserved.
      </v-card-text>
    </v-card>

  </div>
</template>

<style scoped>
.kpi-card {
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
}
.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, .08);
}
.peak-bar {
  flex: 1;
  background: var(--app-primary-600);
  border-radius: 4px 4px 0 0;
  opacity: .75;
  min-height: 4px;
  transition: height .3s ease;
}
</style>