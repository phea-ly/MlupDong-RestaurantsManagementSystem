<script setup>
import { ref } from 'vue'

const activeRange = ref('7days')

const stats = [
  { label: 'DAILY INCOME',   value: '$1,250.00',   sub: 'Compared to yesterday ($1,110.00)',    trend: '+12.5%', up: true,  color: 'blue'    },
  { label: 'MONTHLY INCOME', value: '$38,400.00',  sub: 'Compared to last month ($39,340.00)',  trend: '-2.4%',  up: false, color: 'orange'  },
  { label: 'YEARLY INCOME',  value: '$420,000.00', sub: 'Projected $450k by end of Dec',        trend: '+15.8%', up: true,  color: 'success' },
]

const bestSelling = [
  { name: 'Signature Fish Amok',  sold: 452, pct: 100, color: 'success' },
  { name: 'Iced Coconut Coffee',  sold: 310, pct: 69,  color: 'blue'    },
  { name: 'Kampot Pepper Squid',  sold: 285, pct: 63,  color: 'orange'  },
  { name: 'Mango Sticky Rice',    sold: 215, pct: 48,  color: 'pink'    },
  { name: 'Tamarind Shaked Tea',  sold: 198, pct: 44,  color: 'teal'    },
]

const peakHours = [
  { label: '8 AM',  height: 30 },
  { label: '10 AM', height: 45 },
  { label: '12 PM', height: 85 },
  { label: '2 PM',  height: 55 },
  { label: '4 PM',  height: 40 },
  { label: '6 PM',  height: 95 },
  { label: '8 PM',  height: 75 },
]

const orderHeaders = [
  { title: 'Order ID',  key: 'id'       },
  { title: 'Customer',  key: 'customer' },
  { title: 'Items',     key: 'items'    },
  { title: 'Status',    key: 'status'   },
  { title: 'Amount',    key: 'amount', align: 'end' },
]

const recentOrders = [
  { id: 'MD-9284', initials: 'RC', color: 'success', customer: 'Rithy Chann',  items: 'Fish Amok x2, Cambodia Beer x4',     status: 'COMPLETED', statusColor: 'success', amount: '$124.50' },
  { id: 'MD-9283', initials: 'SM', color: 'orange',  customer: 'Sokha Meas',   items: 'Beef Lok Lak x3, Fresh Juices x3',   status: 'PREPARING', statusColor: 'warning', amount: '$86.20'  },
  { id: 'MD-9281', initials: 'JP', color: 'blue',    customer: 'John Pierce',  items: 'Signature Seafood Platter x1',        status: 'COMPLETED', statusColor: 'success', amount: '$55.00'  },
]

const chartPoints = '50,80 150,60 250,65 350,45 450,30 550,20 650,25'
const weekDays    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
</script>

<template>
  <div>
    <!-- ── Stat Cards ── -->
    <v-row class="mb-4">
      <v-col v-for="stat in stats" :key="stat.label" cols="12" md="4">
        <v-card rounded="xl" elevation="0" border>
          <v-card-text>
            <div class="d-flex justify-space-between align-start mb-3">
              <div>
                <div class="text-caption font-weight-black text-uppercase text-medium-emphasis mb-1">{{ stat.label }}</div>
                <div class="text-h5 font-weight-black">{{ stat.value }}</div>
                <div class="text-caption text-medium-emphasis mt-1">{{ stat.sub }}</div>
              </div>
              <v-chip :color="stat.up ? 'success' : 'error'" variant="tonal" size="small">
                {{ stat.trend }} {{ stat.up ? '↑' : '↓' }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Order Statistics ── -->
    <v-card rounded="xl" elevation="0" border class="mb-4">
      <v-card-title class="d-flex align-center justify-space-between pt-5 px-5 flex-wrap ga-3">
        <div>
          <div class="text-subtitle-1 font-weight-black">Order Statistics</div>
          <div class="text-caption text-medium-emphasis">Total volume over the selected period</div>
        </div>
        <v-btn-toggle v-model="activeRange" rounded="lg" density="compact" color="#0f9e5f" variant="outlined">
          <v-btn value="30days" size="small">Last 30 Days</v-btn>
          <v-btn value="7days"  size="small">Last 7 Days</v-btn>
        </v-btn-toggle>
      </v-card-title>
      <v-card-text>
        <svg width="100%" height="160" viewBox="0 0 700 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stop-color="#0f9e5f" stop-opacity="0.15"/>
              <stop offset="100%" stop-color="#0f9e5f" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polygon :points="chartPoints + ' 650,120 50,120'" fill="url(#lineGrad)" />
          <polyline :points="chartPoints" fill="none" stroke="#0f9e5f" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
        <div class="d-flex justify-space-between px-2 mt-1">
          <span v-for="d in weekDays" :key="d" class="text-caption text-medium-emphasis">{{ d }}</span>
        </div>
      </v-card-text>
    </v-card>

    <!-- ── Best Selling + Peak Hours ── -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
            <span class="text-subtitle-1 font-weight-black">Best Selling Food &amp; Drinks</span>
            <v-btn variant="text" color="#0f9e5f" size="small">View All</v-btn>
          </v-card-title>
          <v-card-text>
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
                style="flex:1; background:#0f9e5f; border-radius:4px 4px 0 0; opacity:0.75; min-height:8px; transition:height 0.3s"
                :style="{ height: bar.height + '%' }"
              />
            </div>
            <div class="d-flex justify-space-between mb-4">
              <span v-for="bar in peakHours" :key="bar.label" class="text-caption text-medium-emphasis">{{ bar.label }}</span>
            </div>
            <v-alert type="success" variant="tonal" rounded="lg" density="compact">
              <span class="text-caption">
                Dinner service (6 PM – 8 PM) accounts for 42% of daily revenue.
                Consider increasing floor staff during this window.
              </span>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Recent Orders ── -->
    <v-card rounded="xl" elevation="0" border>
      <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
        <span class="text-subtitle-1 font-weight-black">Recent High-Value Orders</span>
        <v-btn variant="outlined" rounded="lg" size="small" prepend-icon="mdi-filter-outline">Filter</v-btn>
      </v-card-title>

      <v-data-table
        :headers="orderHeaders"
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
        © 2024 Mlup Dong Restaurant Management System. All rights reserved.
      </v-card-text>
    </v-card>
  </div>
</template>