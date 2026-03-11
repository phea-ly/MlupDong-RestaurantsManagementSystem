<script setup>
import { computed, ref } from 'vue'
import { mdiCurrencyUsd, mdiCalendarMonth, mdiTrendingUp, mdiFilter } from '@mdi/js'
import { useI18n } from '@/composables/useI18n'

const activeRange = ref('7days')
const { locale } = useI18n()
const isKhmer = computed(() => locale.value === 'km')
const tr = (en, km) => (isKhmer.value ? km : en)

const stats = computed(() => [
  {
    label: tr('DAILY INCOME', 'ចំណូលប្រចាំថ្ងៃ'),
    value: '$1,250.00',
    sub: tr('Compared to yesterday ($1,110.00)', 'ប្រៀបធៀបនឹងម្សិលមិញ ($1,110.00)'),
    trend: '+12.5%',
    up: true,
    icon: mdiCurrencyUsd,
  },
  {
    label: tr('MONTHLY INCOME', 'ចំណូលប្រចាំខែ'),
    value: '$38,400.00',
    sub: tr('Compared to last month ($39,340.00)', 'ប្រៀបធៀបនឹងខែមុន ($39,340.00)'),
    trend: '-2.4%',
    up: false,
    icon: mdiCalendarMonth,
  },
  {
    label: tr('YEARLY INCOME', 'ចំណូលប្រចាំឆ្នាំ'),
    value: '$420,000.00',
    sub: tr('Projected $450k by end of Dec', 'ព្យាករណ៍ $450k ត្រឹមចុងខែធ្នូ'),
    trend: '+15.8%',
    up: true,
    icon: mdiTrendingUp,
  },
])

const bestSelling = computed(() => (
  isKhmer.value
    ? [
      { name: 'អាម៉ុកត្រីពិសេស', sold: 452, pct: 100 },
      { name: 'កាហ្វេទឹកដូងទឹកកក', sold: 310, pct: 69 },
      { name: 'មឹកម្រេចកំពត', sold: 285, pct: 63 },
      { name: 'បាយដំណើបស្វាយ', sold: 215, pct: 48 },
      { name: 'តែអំពិលក្រឡុក', sold: 198, pct: 44 },
    ]
    : [
      { name: 'Signature Fish Amok', sold: 452, pct: 100 },
      { name: 'Iced Coconut Coffee', sold: 310, pct: 69 },
      { name: 'Kampot Pepper Squid', sold: 285, pct: 63 },
      { name: 'Mango Sticky Rice', sold: 215, pct: 48 },
      { name: 'Tamarind Shaked Tea', sold: 198, pct: 44 },
    ]
))

const peakHours = [
  { label: '8 AM', height: 30, labelKm: '8 ព្រឹក' },
  { label: '10 AM', height: 45, labelKm: '10 ព្រឹក' },
  { label: '12 PM', height: 85, labelKm: '12 ថ្ងៃ' },
  { label: '2 PM', height: 55, labelKm: '2 រសៀល' },
  { label: '4 PM', height: 40, labelKm: '4 ល្ងាច' },
  { label: '6 PM', height: 95, labelKm: '6 ល្ងាច' },
  { label: '8 PM', height: 75, labelKm: '8 យប់' },
]

const recentOrders = computed(() => (
  isKhmer.value
    ? [
      { id: 'MD-9284', initials: 'RC', color: '#e8f5e9', textColor: '#2e7d32', customer: 'រិទ្ធី ចាន់', items: 'អាម៉ុកត្រី x2, ស្រាបៀរកម្ពុជា x4', status: 'រួចរាល់', statusColor: 'success', amount: '$124.50' },
      { id: 'MD-9283', initials: 'SM', color: '#fff3e0', textColor: '#e65100', customer: 'សុខា មាស', items: 'គោឡុកឡាក់ x3, ទឹកផ្លែឈើស្រស់ x3', status: 'កំពុងចម្អិន', statusColor: 'warning', amount: '$86.20' },
      { id: 'MD-9281', initials: 'JP', color: '#e3f2fd', textColor: '#1565c0', customer: 'ចន ភៀស', items: 'ឈុតសមុទ្រពិសេស x1', status: 'រួចរាល់', statusColor: 'success', amount: '$55.00' },
    ]
    : [
      { id: 'MD-9284', initials: 'RC', color: '#e8f5e9', textColor: '#2e7d32', customer: 'Rithy Chann', items: 'Fish Amok x2, Cambodia Beer x4', status: 'COMPLETED', statusColor: 'success', amount: '$124.50' },
      { id: 'MD-9283', initials: 'SM', color: '#fff3e0', textColor: '#e65100', customer: 'Sokha Meas', items: 'Beef Lok Lak x3, Fresh Juices x3', status: 'PREPARING', statusColor: 'warning', amount: '$86.20' },
      { id: 'MD-9281', initials: 'JP', color: '#e3f2fd', textColor: '#1565c0', customer: 'John Pierce', items: 'Signature Seafood Platter x1', status: 'COMPLETED', statusColor: 'success', amount: '$55.00' },
    ]
))

// Simple SVG line chart points
const chartPoints = '50,80 150,60 250,65 350,45 450,30 550,20 650,25'
</script>

<template>
  <div class="dashboard">
    <!-- Stat Cards -->
    <v-row class="mb-2">
      <v-col v-for="stat in stats" :key="stat.label" cols="12" md="4">
        <v-card rounded="xl" elevation="0" class="stat-card pa-5">
          <div class="d-flex justify-space-between align-start">
            <div>
              <p class="stat-label">{{ stat.label }}</p>
              <p class="stat-value">{{ stat.value }}</p>
              <p class="stat-sub">{{ stat.sub }}</p>
            </div>
            <div :class="['trend-badge', stat.up ? 'trend-up' : 'trend-down']">
              {{ stat.trend }} {{ stat.up ? '↑' : '↓' }}
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Order Statistics Chart -->
    <v-row class="mb-2">
      <v-col cols="12">
        <v-card rounded="xl" elevation="0" class="stat-card pa-5">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <p class="section-title">{{ tr('Order Statistics', 'ស្ថិតិបញ្ជាទិញ') }}</p>
              <p class="section-sub">{{ tr('Total volume over the last 7 days', 'បរិមាណសរុបក្នុង 7 ថ្ងៃចុងក្រោយ') }}</p>
            </div>
            <div class="d-flex ga-2">
              <v-btn
                :variant="activeRange === '30days' ? 'flat' : 'outlined'"
                rounded="lg"
                size="small"
                :color="activeRange === '30days' ? '#0f9e5f' : ''"
                @click="activeRange = '30days'"
              >{{ tr('Last 30 Days', '30 ថ្ងៃចុងក្រោយ') }}</v-btn>
              <v-btn
                :variant="activeRange === '7days' ? 'flat' : 'outlined'"
                rounded="lg"
                size="small"
                :color="activeRange === '7days' ? '#0f9e5f' : ''"
                @click="activeRange = '7days'"
              >{{ tr('Last 7 Days', '7 ថ្ងៃចុងក្រោយ') }}</v-btn>
            </div>
          </div>
          <!-- SVG Line Chart -->
          <svg width="100%" height="160" viewBox="0 0 700 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0f9e5f" stop-opacity="0.15"/>
                <stop offset="100%" stop-color="#0f9e5f" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <polygon
              :points="chartPoints + ' 650,120 50,120'"
              fill="url(#lineGrad)"
            />
            <polyline
              :points="chartPoints"
              fill="none"
              stroke="#0f9e5f"
              stroke-width="2.5"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
          </svg>
          <div class="chart-labels d-flex justify-space-between px-2 mt-1">
            <span v-for="d in (isKhmer ? ['ច','អ','ព','ព្រ','សុ','សៅ','អា'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])" :key="d" class="chart-label">{{ d }}</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Best Selling + Peak Hour -->
    <v-row class="mb-2">
      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" class="stat-card pa-5" style="height:100%">
          <div class="d-flex justify-space-between align-center mb-4">
            <p class="section-title">{{ tr('Best Selling Food/Drinks', 'ម្ហូប/ភេសជ្ជៈលក់ដាច់') }}</p>
            <a class="view-all">{{ tr('View All', 'មើលទាំងអស់') }}</a>
          </div>
          <div v-for="item in bestSelling" :key="item.name" class="mb-3">
            <div class="d-flex justify-space-between mb-1">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-sold">{{ item.sold }} {{ tr('sold', 'បានលក់') }}</span>
            </div>
            <div class="progress-bg">
              <div class="progress-fill" :style="{ width: item.pct + '%' }"></div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" class="stat-card pa-5" style="height:100%">
          <div class="d-flex justify-space-between align-center mb-4">
            <p class="section-title">{{ tr('Peak Hour Analysis', 'វិភាគម៉ោងមមាញឹក') }}</p>
            <span class="cycle-badge">{{ tr('24H CYCLE', 'វដ្ត 24 ម៉ោង') }}</span>
          </div>
          <!-- Bar chart -->
          <div class="bar-chart d-flex align-end ga-2 mb-2" style="height:100px">
            <div
              v-for="bar in peakHours"
              :key="bar.label"
              class="bar-item"
              :style="{ height: bar.height + '%' }"
            ></div>
          </div>
          <div class="d-flex justify-space-between">
            <span v-for="bar in peakHours" :key="bar.label" class="chart-label">{{ isKhmer ? bar.labelKm : bar.label }}</span>
          </div>
          <div class="observation-box mt-3 pa-3">
            <div class="d-flex align-start ga-2">
              <v-icon color="#0f9e5f" size="16">mdi-map-marker-outline</v-icon>
              <div>
                <p class="obs-title">{{ tr('Observation', 'ការសង្កេត') }}</p>
                <p class="obs-text">{{ tr('Dinner service (6 PM - 8 PM) accounts for 42% of daily revenue. Consider increasing floor staff during this window.', 'ការលក់ពេលល្ងាច (6PM - 8PM) ស្មើ 42% នៃចំណូលប្រចាំថ្ងៃ។ គួរបន្ថែមបុគ្គលិកក្នុងម៉ោងនេះ។') }}</p>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent High-Value Orders -->
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" elevation="0" class="stat-card pa-5">
          <div class="d-flex justify-space-between align-center mb-4">
            <p class="section-title">{{ tr('Recent High-Value Orders', 'ការបញ្ជាទិញតម្លៃខ្ពស់ថ្មីៗ') }}</p>
            <v-btn variant="outlined" rounded="lg" size="small" prepend-icon="mdi-filter-outline">{{ tr('Filter', 'តម្រង') }}</v-btn>
          </div>
          <v-table density="comfortable" class="orders-table">
            <thead>
              <tr>
                <th>{{ tr('ORDER ID', 'លេខបញ្ជាទិញ') }}</th>
                <th>{{ tr('CUSTOMER', 'អតិថិជន') }}</th>
                <th>{{ tr('ITEMS', 'មុខម្ហូប') }}</th>
                <th>{{ tr('STATUS', 'ស្ថានភាព') }}</th>
                <th>{{ tr('AMOUNT', 'ចំនួនទឹកប្រាក់') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id">
                <td class="order-id">#{{ order.id }}</td>
                <td>
                  <div class="d-flex align-center ga-2">
                    <v-avatar size="28" :color="order.color">
                      <span :style="{ color: order.textColor, fontSize: '11px', fontWeight: 800 }">{{ order.initials }}</span>
                    </v-avatar>
                    {{ order.customer }}
                  </div>
                </td>
                <td class="order-items">{{ order.items }}</td>
                <td>
                  <v-chip :color="order.statusColor" size="small" rounded="lg" variant="tonal">
                    {{ order.status }}
                  </v-chip>
                </td>
                <td class="order-amount">{{ order.amount }}</td>
              </tr>
            </tbody>
          </v-table>
          <p class="footer-copy mt-4 text-center">{{ tr('© 2023 Mlup Dong Restaurant Management System. All rights reserved.', '© 2023 ប្រព័ន្ធគ្រប់គ្រងភោជនីយដ្ឋាន Mlup Dong។ រក្សាសិទ្ធិគ្រប់យ៉ាង។') }}</p>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.dashboard { padding-bottom: 12px; }

.stat-card {
  background: #ffffff;
  border: 1px solid #e4eaec;
}

.stat-label {
  font-size: 10px;
  font-weight: 800;
  color: #7a899f;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 6px;
}

.stat-value {
  font-size: 28px;
  font-weight: 900;
  color: #1a2e48;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}

.stat-sub {
  font-size: 12px;
  color: #9aabbd;
  margin: 0;
}

.trend-badge {
  font-size: 12px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 8px;
  white-space: nowrap;
}
.trend-up { background: #e6f9f0; color: #0f9e5f; }
.trend-down { background: #fdecea; color: #d32f2f; }

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: #1a2e48;
  margin: 0 0 2px;
}
.section-sub {
  font-size: 12px;
  color: #9aabbd;
  margin: 0;
}

.chart-label {
  font-size: 11px;
  color: #9aabbd;
  font-weight: 600;
}

.view-all {
  font-size: 12px;
  font-weight: 700;
  color: #0f9e5f;
  cursor: pointer;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a2e48;
}
.item-sold {
  font-size: 13px;
  font-weight: 700;
  color: #1a2e48;
}

.progress-bg {
  height: 5px;
  background: #edf2f1;
  border-radius: 99px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #0f9e5f;
  border-radius: 99px;
}

.cycle-badge {
  font-size: 10px;
  font-weight: 800;
  background: #edf2f1;
  color: #4b5d74;
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.bar-chart { width: 100%; }
.bar-item {
  flex: 1;
  background: #0f9e5f;
  border-radius: 4px 4px 0 0;
  opacity: 0.7;
  min-height: 8px;
}

.observation-box {
  background: #f7faf9;
  border-radius: 10px;
  border: 1px solid #e0ebe6;
}
.obs-title {
  font-size: 12px;
  font-weight: 800;
  color: #1a2e48;
  margin: 0 0 2px;
}
.obs-text {
  font-size: 12px;
  color: #7a899f;
  margin: 0;
  line-height: 1.5;
}

.orders-table th {
  font-size: 10px !important;
  font-weight: 800 !important;
  color: #9aabbd !important;
  letter-spacing: 0.08em;
}
.order-id { font-weight: 700; color: #0f9e5f; }
.order-items { font-size: 13px; color: #4b5d74; }
.order-amount { font-weight: 800; color: #1a2e48; }

.footer-copy {
  font-size: 12px;
  color: #b0bec5;
  margin: 0;
}
</style>
