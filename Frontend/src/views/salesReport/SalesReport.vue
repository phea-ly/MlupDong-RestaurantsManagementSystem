<script>
import { defineStore } from "pinia";
import { ref } from "vue";

export const useSalesReportStore = defineStore("salesReport", () => {
  const activeTab   = ref("today");
  const searchQuery = ref("");

  const tabs = ref([
    { value: "today",     label: "Today"      },
    { value: "yesterday", label: "Yesterday"  },
    { value: "last7days", label: "Last 7 Days" },
    { value: "custom",    label: "Custom"     },
  ]);

  const summaryStats = ref([
    {
      label: "Total Revenue",
      value: "$12,840.00",
      trend: "+12.5%", sub: "vs yesterday", up: true,
      icon: "mdi-cash-multiple",        color: "success",
    },
    {
      label: "Total Orders",
      value: "342",
      trend: "+5.2%",  sub: "vs yesterday", up: true,
      icon: "mdi-receipt-text-outline", color: "blue",
    },
    {
      label: "Avg. Order",
      value: "$37.54",
      trend: "+1.8%",  sub: "vs yesterday", up: true,
      icon: "mdi-clipboard-list-outline", color: "orange",
    },
    {
      label: "Net Profit",
      value: "$8,210.00",
      trend: "+10.4%", sub: "vs yesterday", up: true,
      icon: "mdi-trending-up",          color: "purple",
    },
  ]);

  const topCategories = ref([
    { name: "Main Course", pct: 45, color: "success" },
    { name: "Drinks",      pct: 32, color: "blue"    },
    { name: "Desserts",    pct: 18, color: "orange"  },
    { name: "Appetizers",  pct:  5, color: "purple"  },
  ]);

  const salesHeaders = ref([
    { title: "Date",     key: "date"    },
    { title: "Order ID", key: "id"      },
    { title: "Items",    key: "items"   },
    { title: "Payment",  key: "payment" },
    { title: "Amount",   key: "amount", align: "end" },
  ]);

  const salesLog = ref([
    {
      date: "Oct 24, 14:22", id: "ORD-9421",
      items: "Beef Steak, Red Wine, Caesar Salad",
      payment: "Visa **** 4421", payIcon: "mdi-credit-card-outline", amount: "$84.50",
    },
    {
      date: "Oct 24, 13:58", id: "ORD-9420",
      items: "Chicken Pasta, Iced Tea",
      payment: "Cash", payIcon: "mdi-cash", amount: "$32.00",
    },
    {
      date: "Oct 24, 13:45", id: "ORD-9419",
      items: "Veggie Pizza, Garlic Bread, Coke x2",
      payment: "Apple Pay", payIcon: "mdi-cellphone", amount: "$45.20",
    },
    {
      date: "Oct 24, 13:30", id: "ORD-9418",
      items: "Cheeseburger Deluxe, Fries, Shake",
      payment: "Visa **** 1022", payIcon: "mdi-credit-card-outline", amount: "$24.90",
    },
  ]);

  const chartPoints = ref("50,90 120,70 200,75 290,50 380,35 460,25 550,15");
  const weekDays    = ref(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);

  return {
    activeTab,
    searchQuery,
    tabs,
    summaryStats,
    topCategories,
    salesHeaders,
    salesLog,
    chartPoints,
    weekDays,
  };
});
</script>

<script setup>
import { storeToRefs } from "pinia";

const salesReportStore = useSalesReportStore();

const {
  activeTab,
  searchQuery,
  tabs,
  summaryStats,
  topCategories,
  salesHeaders,
  salesLog,
  chartPoints,
  weekDays,
} = storeToRefs(salesReportStore);
</script>

<template>
  <div>
    <!-- ── Tabs + Export ── -->
    <div class="d-flex justify-space-between align-center flex-wrap ga-3 mb-5">
      <v-tabs v-model="activeTab" color="var(--app-primary-600)" bg-color="transparent">
        <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value" rounded="lg">
          {{ tab.label }}
          <v-icon v-if="tab.value === 'custom'" size="14" class="ml-1">mdi-calendar-outline</v-icon>
        </v-tab>
      </v-tabs>
      <v-btn color="var(--app-primary-600)" rounded="lg" prepend-icon="mdi-download-outline" variant="flat">
        Export Report
      </v-btn>
    </div>

    <!-- ── Summary Cards ── -->
    <v-row class="mb-5">
      <v-col v-for="stat in summaryStats" :key="stat.label" cols="12" sm="6" md="3">
        <v-card rounded="xl" elevation="0" border>
          <v-card-text>
            <div class="d-flex justify-space-between align-start mb-2">
              <span class="text-caption font-weight-bold text-uppercase text-medium-emphasis">{{ stat.label }}</span>
              <v-avatar :color="stat.color" variant="tonal" size="32" rounded="lg">
                <v-icon size="16">{{ stat.icon }}</v-icon>
              </v-avatar>
            </div>
            <div class="text-h5 font-weight-black mb-1">{{ stat.value }}</div>
            <div class="d-flex align-center ga-1">
              <v-chip :color="stat.up ? 'success' : 'error'" size="x-small" variant="tonal">
                {{ stat.trend }}
              </v-chip>
              <span class="text-caption text-medium-emphasis">{{ stat.sub }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Chart + Categories ── -->
    <v-row class="mb-5">
      <v-col cols="12" md="7">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
            <div>
              <div class="text-subtitle-1 font-weight-black">Revenue Trends</div>
              <div class="text-caption text-medium-emphasis">Earnings over the last 7 days</div>
            </div>
            <v-btn variant="outlined" rounded="lg" size="small" append-icon="mdi-chevron-down">Weekly</v-btn>
          </v-card-title>
          <v-card-text>
            <svg width="100%" height="160" viewBox="0 0 600 110" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stop-color="var(--app-primary-600)" stop-opacity="0.18" />
                  <stop offset="100%" stop-color="var(--app-primary-600)" stop-opacity="0"    />
                </linearGradient>
              </defs>
              <polygon :points="chartPoints + ' 550,110 50,110'" fill="url(#areaGrad)" />
              <polyline
                :points="chartPoints"
                fill="none"
                stroke="var(--app-primary-600)"
                stroke-width="2.5"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
            </svg>
            <div class="d-flex justify-space-between px-1 mt-1">
              <span v-for="d in weekDays" :key="d" class="text-caption text-medium-emphasis">{{ d }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="pt-5 px-5">
            <div class="text-subtitle-1 font-weight-black">Top Categories</div>
          </v-card-title>
          <v-card-text>
            <div v-for="cat in topCategories" :key="cat.name" class="mb-4">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2 font-weight-medium">{{ cat.name }}</span>
                <span class="text-body-2 font-weight-bold">{{ cat.pct }}%</span>
              </div>
              <v-progress-linear
                :model-value="cat.pct"
                :color="cat.color"
                rounded height="6"
                bg-color="grey-lighten-3"
              />
            </div>
            <v-alert type="info" variant="tonal" rounded="lg" density="compact" class="mt-3">
              <span class="text-caption font-style-italic">
                Main courses are up 12% vs last week. Consider a dessert promo to boost secondary sales.
              </span>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Sales Log ── -->
    <v-card rounded="xl" elevation="0" border>
      <v-card-title class="d-flex align-center justify-space-between pt-5 px-5 flex-wrap ga-3">
        <div class="text-subtitle-1 font-weight-black">Detailed Sales Log</div>
        <v-text-field
          v-model="searchQuery"
          placeholder="Search orders..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined" density="compact" rounded="lg" hide-details
          style="max-width:220px"
        />
      </v-card-title>

      <v-data-table
        :headers="salesHeaders"
        :items="salesLog"
        :search="searchQuery"
        items-per-page="5"
      >
        <template #item.id="{ item }">
          <span class="text-primary font-weight-bold">#{{ item.id }}</span>
        </template>
        <template #item.payment="{ item }">
          <div class="d-flex align-center ga-1">
            <v-icon size="15" color="medium-emphasis">{{ item.payIcon }}</v-icon>
            <span class="text-body-2">{{ item.payment }}</span>
          </div>
        </template>
        <template #item.amount="{ item }">
          <span class="font-weight-bold">{{ item.amount }}</span>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>