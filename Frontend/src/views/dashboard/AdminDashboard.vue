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
          <v-btn v-for="action in quickActions" :key="action.label" rounded="lg" size="small" variant="tonal"
            :color="action.color" :prepend-icon="action.icon" @click="goTo(router, action.route)">{{ action.label
            }}</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- ── KPI Cards ─────────────────────────────────────────────────────────── -->
    <v-row class="mb-4">
      <v-col v-for="(stat, i) in loadingKpi ? Array(4).fill(null) : stats" :key="i" cols="12" md="3">
        <v-card v-if="!stat" rounded="xl" elevation="0" border>
          <v-card-text><v-skeleton-loader type="list-item-two-line" /></v-card-text>
        </v-card>

        <v-card v-else rounded="xl" elevation="0" border class="kpi-card" @click="goTo(router, stat.route)">
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
        <v-btn-toggle v-model="activeRange" rounded="lg" density="compact" color="var(--app-primary-600)"
          variant="outlined">
          <v-btn value="30days" size="small">Last 30 Days</v-btn>
          <v-btn value="7days" size="small">Last 7 Days</v-btn>
        </v-btn-toggle>
      </v-card-title>

      <v-card-text>
        <v-skeleton-loader v-if="loadingChart" type="image" height="160" />
        <template v-else>
          <svg width="100%" height="160" viewBox="0 0 700 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--app-primary-600)" stop-opacity="0.15" />
                <stop offset="100%" stop-color="var(--app-primary-600)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <polygon :points="chartPoints + ' 650,120 50,120'" fill="url(#lineGrad)" />
            <polyline :points="chartPoints" fill="none" stroke="var(--app-primary-600)" stroke-width="2.5"
              stroke-linejoin="round" stroke-linecap="round" />
          </svg>
          <div class="d-flex justify-space-between px-2 mt-1">
            <span v-for="d in weekDays" :key="d" class="text-caption text-medium-emphasis">{{ d }}</span>
          </div>
        </template>

        <v-divider class="my-4" />

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

      <!-- Best Selling — Line Chart -->
      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
            <span class="text-subtitle-1 font-weight-black">Best Selling Food and Drinks</span>
            <v-btn variant="text" color="var(--app-primary-600)" size="small" @click="goTo(router, '/home/menu')">
              View All
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader v-if="loadingBest" type="image" height="220" />
            <template v-else>
              <div v-if="!bestSelling.length" class="text-caption text-medium-emphasis py-4 text-center">
                No sales data for the last 30 days.
              </div>
              <canvas v-else ref="bestSellingCanvas" height="220" style="width:100%;display:block;" />
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Peak Hours — Bar Chart -->
      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
            <span class="text-subtitle-1 font-weight-black">Peak Hour Analysis</span>
            <v-chip size="small" variant="tonal">24H CYCLE</v-chip>
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader v-if="loadingPeak" type="image" height="360" />
            <div v-else style="position:relative; height:360px;">
              <canvas ref="peakHoursCanvas" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>

    <!-- ── Recent Orders ──────────────────────────────────────────────────────── -->
    <v-card rounded="xl" elevation="0" border>
      <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
        <span class="text-subtitle-1 font-weight-black">Recent High-Value Orders</span>
        <v-btn variant="outlined" rounded="lg" size="small" prepend-icon="mdi-filter-outline"
          @click="goTo(router, '/home/sales-report')">Filter</v-btn>
      </v-card-title>

      <v-data-table :headers="orderHeaders" :items="recentOrders" :loading="loadingOrders" hide-default-footer
        items-per-page="-1" density="comfortable">
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
          <span class="text-body-2 text-medium-emphasis"
            style="display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;">{{ item.items
            }}</span>
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

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard.store'
import Chart from 'chart.js/auto'

// ── 1. Router & Store ────────────────────────────────────────────────────────
const router = useRouter()
const store = useDashboardStore()

const {
  activeRange, stats, bestSelling, peakHours,
  orderSummary, recentOrders,
  loadingKpi, loadingChart, loadingBest,
  loadingPeak, loadingSummary, loadingOrders,
  quickActions, orderHeaders,
  chartPoints, weekDays, userName,
} = storeToRefs(store)

const { init, fetchChart, goTo } = store

// ── 2. Canvas refs ───────────────────────────────────────────────────────────
const bestSellingCanvas = ref(null)
const peakHoursCanvas = ref(null)
let bestSellingChart = null
let peakHoursChart = null

// ── 3. Helpers ───────────────────────────────────────────────────────────────
function getPrimary() {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--app-primary-600').trim() || '#6366f1'
}

// ── 4. Chart builders ────────────────────────────────────────────────────────
function buildBestSellingChart() {
  if (!bestSellingCanvas.value || !bestSelling.value.length) return
  bestSellingChart?.destroy()

  const primary = getPrimary()
  const ctx = bestSellingCanvas.value.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 0, 220)
  gradient.addColorStop(0, `${primary}26`)
  gradient.addColorStop(1, `${primary}00`)

  bestSellingChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: bestSelling.value.map(i => i.name),
      datasets: [{
        label: 'Units Sold',
        data: bestSelling.value.map(i => i.sold),
        fill: true,
        backgroundColor: gradient,
        borderColor: primary,
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: primary,
        pointHoverRadius: 6,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: 'rgba(0,0,0,0.45)', font: { size: 11 } },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          border: { display: false },
          ticks: { color: 'rgba(0,0,0,0.45)', font: { size: 11 } },
        },
      },
    },
  })
}

function buildPeakHoursChart() {
  if (!peakHoursCanvas.value) return
  peakHoursChart?.destroy()

  const primary = getPrimary()

  peakHoursChart = new Chart(peakHoursCanvas.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels: peakHours.value.map(b => b.label),
      datasets: [{
        label: 'Orders',
        data: peakHours.value.map(b => b.count),
        backgroundColor: `${primary}BF`,
        borderColor: primary,
        borderWidth: 1.5,
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: 'rgba(0,0,0,0.45)', font: { size: 11 } },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          border: { display: false },
          ticks: { color: 'rgba(0,0,0,0.45)', font: { size: 11 } },
        },
      },
    },
  })
}

// ── 5. Watchers & lifecycle ──────────────────────────────────────────────────
watch(activeRange, fetchChart)

watch(loadingBest, async (loading) => {
  if (!loading) { await nextTick(); buildBestSellingChart() }
})

watch(loadingPeak, async (loading) => {
  if (!loading) { await nextTick(); buildPeakHoursChart() }
})

onMounted(async () => {
  await init()
  await nextTick()
  if (!loadingBest.value) buildBestSellingChart()
  if (!loadingPeak.value) buildPeakHoursChart()
})

onBeforeUnmount(() => {
  bestSellingChart?.destroy()
  peakHoursChart?.destroy()
})
</script>

<style scoped>
.kpi-card {
  cursor: pointer;
  transition: transform .2s ease, box-shadow .2s ease;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, .08);
}
</style>