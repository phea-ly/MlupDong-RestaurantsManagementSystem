<script setup>
import { computed, onMounted, ref } from 'vue'
import { getMenuItemsApi, getOrdersApi, getPaymentsApi } from '@/api/management.api'

const periodFilters = ['Today', 'Yesterday', 'Last 7 Days', 'Custom']
const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const loading = ref(false)
const orders = ref([])
const payments = ref([])
const menuItems = ref([])

function asCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

const totalRevenue = computed(() =>
  payments.value.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)
)
const totalOrders = computed(() => orders.value.length)
const averageOrder = computed(() => (totalOrders.value ? totalRevenue.value / totalOrders.value : 0))
const netProfit = computed(() => totalRevenue.value * 0.64)

const summaryCards = computed(() => [
  { label: 'Total Revenue', value: asCurrency(totalRevenue.value), change: 'Live from payments', icon: 'mdi-cash-multiple' },
  { label: 'Total Orders', value: String(totalOrders.value), change: 'Live order count', icon: 'mdi-receipt-text-outline' },
  { label: 'Average Order', value: asCurrency(averageOrder.value), change: 'Revenue / orders', icon: 'mdi-calculator-variant-outline' },
  { label: 'Net Profit', value: asCurrency(netProfit.value), change: 'Estimated 64% margin', icon: 'mdi-piggy-bank-outline' },
])

const categories = computed(() => {
  const items = menuItems.value
  if (!items.length) return []

  const grouped = {}
  items.forEach((item) => {
    const key = item.category?.category_name || 'Uncategorized'
    grouped[key] = (grouped[key] || 0) + 1
  })

  const total = items.length
  return Object.entries(grouped)
    .map(([name, count]) => ({ name, value: Math.round((count / total) * 100) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)
})

const logs = computed(() =>
  orders.value.slice(0, 8).map((order) => ({
    date: order.created_at ? new Date(order.created_at).toLocaleString() : '-',
    orderId: order.order_number || `#${order.order_id}`,
    items: `${order.order_items?.length || 0} item(s)`,
    method: order.payments?.[0]?.payment_method || 'Unknown',
    total: asCurrency(order.final_amount || order.total_amount || 0),
  }))
)

async function loadSalesData() {
  loading.value = true
  try {
    const [ordersRes, paymentsRes, menuRes] = await Promise.all([
      getOrdersApi(),
      getPaymentsApi(),
      getMenuItemsApi(),
    ])
    orders.value = Array.isArray(ordersRes.data) ? ordersRes.data : []
    payments.value = Array.isArray(paymentsRes.data) ? paymentsRes.data : []
    menuItems.value = Array.isArray(menuRes.data) ? menuRes.data : []
  } finally {
    loading.value = false
  }
}

onMounted(loadSalesData)
</script>

<template>
  <section class="sales-root">
    <div class="toolbar mb-4">
      <v-btn-toggle mandatory divided density="comfortable" class="filter-toggle" color="#16d886">
        <v-btn
          v-for="(period, index) in periodFilters"
          :key="period"
          :value="period"
          :class="{ 'text-green': index === 0 }"
          class="text-none"
          size="small"
        >
          {{ period }}
          <v-icon v-if="period === 'Custom'" size="13" class="ml-1">mdi-calendar-blank-outline</v-icon>
        </v-btn>
      </v-btn-toggle>

      <v-btn color="#13db88" rounded="lg" class="text-none font-weight-bold export-btn" prepend-icon="mdi-download">
        Export Report
      </v-btn>
    </div>

    <v-row dense class="mb-2">
      <v-col v-for="card in summaryCards" :key="card.label" cols="12" md="6" lg="3">
        <v-card rounded="lg" border class="pa-4 summary-card fill-height">
          <div class="d-flex justify-space-between align-center mb-3">
            <p class="card-label">{{ card.label }}</p>
            <v-icon size="14" color="#12cc7d">{{ card.icon }}</v-icon>
          </div>
          <p class="card-value">{{ card.value }}</p>
          <p class="card-change">{{ card.change }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense class="mb-3">
      <v-col cols="12" lg="9">
        <v-card rounded="lg" border class="pa-4 chart-card fill-height">
          <div class="d-flex justify-space-between align-center mb-1">
            <div>
              <p class="panel-title">Revenue Trends</p>
              <p class="panel-subtitle">Earnings performance over the last 7 days</p>
            </div>
            <v-btn size="x-small" rounded="pill" variant="tonal" class="text-none">Weekly</v-btn>
          </div>

          <div class="trend-wrap">
            <svg viewBox="0 0 700 250" preserveAspectRatio="none" aria-label="Revenue trend">
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#21dc8e" stop-opacity="0.30" />
                  <stop offset="100%" stop-color="#21dc8e" stop-opacity="0.04" />
                </linearGradient>
              </defs>
              <path d="M20 180 C90 165,120 186,170 140 C230 82,270 100,330 96 C370 94,390 70,430 68 C470 66,520 78,560 60 C590 88,620 100,680 145 L680 210 L20 210 Z" class="trend-area" />
              <path d="M20 180 C90 165,120 186,170 140 C230 82,270 100,330 96 C370 94,390 70,430 68 C470 66,520 78,560 60 C590 88,620 100,680 145" class="trend-line" />
            </svg>

            <div class="x-labels">
              <span v-for="label in weekLabels" :key="label">{{ label }}</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="3">
        <v-card rounded="lg" border class="pa-4 categories-card fill-height">
          <p class="panel-title mb-3">Top Categories</p>

          <div v-for="item in categories" :key="item.name" class="category-row">
            <div class="d-flex justify-space-between align-center mb-1">
              <p class="category-name">{{ item.name }}</p>
              <p class="category-value">{{ item.value }}%</p>
            </div>
            <div class="category-track">
              <div class="category-fill" :style="{ width: `${item.value}%` }"></div>
            </div>
          </div>

          <v-sheet rounded="md" class="mt-4 pa-3 insight-box">
            <p class="insight-text">
              "Main courses are up 12% compared to last week. Consider a dessert promo to boost secondary sales."
            </p>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="lg" border class="pa-0 table-card">
      <div class="d-flex justify-space-between align-center pa-4 pb-3 flex-wrap ga-2">
        <p class="panel-title">Detailed Sales Log</p>
        <v-text-field
          density="compact"
          variant="solo-filled"
          prepend-inner-icon="mdi-magnify"
          hide-details
          placeholder="Search orders..."
          class="search-input"
        />
      </div>

      <v-table density="comfortable" class="sales-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Order ID</th>
            <th>Items</th>
            <th>Payment Method</th>
            <th class="text-right">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in logs" :key="item.orderId">
            <td>{{ item.date }}</td>
            <td class="order-id">{{ item.orderId }}</td>
            <td class="items-col">{{ item.items }}</td>
            <td>{{ item.method }}</td>
            <td class="text-right amount-col">{{ item.total }}</td>
          </tr>
        </tbody>
      </v-table>

      <div class="d-flex justify-space-between align-center pa-4 pt-3 table-footer">
        <p class="footer-text">Showing 4 of 342 orders</p>
        <div class="d-flex align-center ga-2">
          <v-btn size="x-small" variant="tonal" class="text-none">Prev</v-btn>
          <v-btn size="x-small" color="#16d886">1</v-btn>
          <v-btn size="x-small" variant="tonal">2</v-btn>
          <v-btn size="x-small" variant="tonal" class="text-none">Next</v-btn>
        </div>
      </div>
    </v-card>
  </section>
</template>

<style scoped>
.sales-root {
  width: 100%;
  max-width: none;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-toggle {
  border: 1px solid #dce5ea;
  border-radius: 10px;
  background: #f7fafb;
}

.text-green {
  color: #14c878;
  font-weight: 700;
}

.export-btn {
  color: #063622;
}

.summary-card,
.chart-card,
.categories-card,
.table-card {
  background: #f9fbfb;
  border-color: #e2eaee !important;
}

.card-label {
  margin: 0;
  color: #8192a8;
  font-size: 11px;
  font-weight: 700;
}

.card-value {
  margin: 0;
  color: #102039;
  font-size: 38px;
  line-height: 1.05;
  font-weight: 900;
}

.card-change {
  margin: 6px 0 0;
  font-size: 11px;
  color: #14c878;
  font-weight: 700;
}

.panel-title {
  margin: 0;
  font-size: 18px;
  color: #182b45;
  font-weight: 900;
}

.panel-subtitle {
  margin: 2px 0 0;
  color: #8394a9;
  font-size: 12px;
}

.trend-wrap {
  margin-top: 10px;
  border-radius: 12px;
}

.trend-wrap svg {
  width: 100%;
  height: 250px;
}

.trend-area {
  fill: url(#trendFill);
}

.trend-line {
  fill: none;
  stroke: #14d987;
  stroke-width: 3;
  stroke-linecap: round;
}

.x-labels {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin-top: -8px;
  text-align: center;
  color: #9aabbe;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
}

.category-row {
  margin-bottom: 16px;
}

.category-row:last-of-type {
  margin-bottom: 0;
}

.category-name,
.category-value {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
}

.category-name {
  color: #394f6a;
}

.category-value {
  color: #263951;
}

.category-track {
  height: 7px;
  border-radius: 999px;
  background: #e4eaee;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #11d382 0%, #1ee395 100%);
}

.insight-box {
  background: #f2f7f8;
  border: 1px solid #e1e9ed;
}

.insight-text {
  margin: 0;
  color: #8a9bb0;
  font-size: 11px;
  line-height: 1.5;
}

.search-input {
  max-width: 250px;
}

.sales-table :deep(th) {
  background: #f2f6f8;
  color: #899bb0;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 800;
}

.sales-table :deep(td) {
  color: #1f3049;
  font-size: 12px;
}

.order-id {
  color: #12c975;
  font-weight: 800;
}

.items-col {
  color: #5f748c;
}

.amount-col {
  font-weight: 800;
}

.table-footer {
  border-top: 1px solid #e4ebef;
}

.footer-text {
  margin: 0;
  color: #8a9bb0;
  font-size: 11px;
}
</style>
