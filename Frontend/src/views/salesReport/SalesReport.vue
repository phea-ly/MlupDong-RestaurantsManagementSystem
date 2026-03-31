<script setup>
import { onMounted, watch } from 'vue'
import { storeToRefs }      from 'pinia'
import { useSalesReportStore } from '@/stores/salesReport.store'

const store = useSalesReportStore()

const {
  activeTab, searchQuery, dateFrom, dateTo,
  summaryStats, topCategories, salesLog, meta,
  loadingSummary, loadingChart, loadingCategories, loadingOrders,
  snackbar, tabs, salesHeaders,
  chartPoints, weekDayLabels,
} = storeToRefs(store)

const { init, fetchAll, fetchOrders } = store

onMounted(init)

// Re-fetch when tab changes
watch(activeTab, () => fetchAll())

// Re-search orders on input
watch(searchQuery, () => fetchOrders(1))
</script>

<template>
  <v-container fluid class="pa-0">

    <!-- ── Custom date range ──────────────────────────────────────────────────── -->
    <v-expand-transition>
      <v-card v-if="activeTab === 'custom'" rounded="xl" border flat class="mb-5 pa-4">
        <v-row dense align="center">
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="dateFrom"
              label="Date From" type="date"
              variant="outlined" rounded="lg" density="compact" hide-details
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="dateTo"
              label="Date To" type="date"
              variant="outlined" rounded="lg" density="compact" hide-details
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn
              color="var(--app-primary)" rounded="lg" elevation="0"
              :disabled="!dateFrom || !dateTo"
              @click="fetchAll"
            >
              <span style="color:#063824; font-weight:800">Apply</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-expand-transition>

    <!-- ── Summary Cards ─────────────────────────────────────────────────────── -->
    <v-row class="mb-5">
      <v-col
        v-for="(stat, i) in (loadingSummary ? Array(4).fill(null) : summaryStats)"
        :key="i" cols="12" sm="6" md="3"
      >
        <!-- Loading skeleton -->
        <v-card v-if="!stat" rounded="xl" elevation="0" border>
          <v-card-text>
            <v-skeleton-loader type="list-item-two-line" />
          </v-card-text>
        </v-card>

        <!-- Real stat -->
        <v-card v-else rounded="xl" elevation="0" border>
          <v-card-text>
            <div class="d-flex justify-space-between align-start mb-2">
              <span class="text-caption font-weight-bold text-uppercase text-medium-emphasis">
                {{ stat.label }}
              </span>
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

    <!-- ── Chart + Categories ────────────────────────────────────────────────── -->
    <v-row class="mb-5">

      <!-- Revenue Trends chart -->
      <v-col cols="12" md="7">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="d-flex justify-space-between align-center pt-5 px-5">
            <div>
              <div class="text-subtitle-1 font-weight-black">Revenue Trends</div>
              <div class="text-caption text-medium-emphasis">
                Earnings over the selected period
              </div>
            </div>
            <v-btn variant="outlined" rounded="lg" size="small" append-icon="mdi-chevron-down" color="#407709">
              Weekly
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader v-if="loadingChart" type="image" height="160" />
            <template v-else>
              <svg width="100%" height="160" viewBox="0 0 600 110" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stop-color="#407709" stop-opacity="0.18" />
                    <stop offset="100%" stop-color="#407709" stop-opacity="0"    />
                  </linearGradient>
                </defs>
                <polygon :points="chartPoints + ' 550,110 50,110'" fill="url(#areaGrad)" />
                <polyline
                  :points="chartPoints"
                  fill="none"
                  stroke="#407709"
                  stroke-width="2.5"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />
              </svg>
              <div class="d-flex justify-space-between px-1 mt-1">
                <span
                  v-for="d in weekDayLabels" :key="d"
                  class="text-caption text-medium-emphasis"
                >{{ d }}</span>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Top Categories -->
      <v-col cols="12" md="5">
        <v-card rounded="xl" elevation="0" border height="100%">
          <v-card-title class="pt-5 px-5">
            <div class="text-subtitle-1 font-weight-black">Top Categories</div>
          </v-card-title>
          <v-card-text>
            <v-skeleton-loader v-if="loadingCategories" type="list-item-three-line@4" />
            <template v-else>
              <div v-if="!topCategories.length" class="text-caption text-medium-emphasis py-4">
                No sales data for this period.
              </div>
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
              <v-alert
                v-if="topCategories.length"
                type="info" variant="tonal" rounded="lg" density="compact" class="mt-3"
              >
                <span class="text-caption">
                  {{ topCategories[0]?.name }} leads with {{ topCategories[0]?.pct }}% of sales.
                </span>
              </v-alert>
            </template>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>

    <!-- ── Sales Log ─────────────────────────────────────────────────────────── -->
    <v-card rounded="xl" elevation="0" border>
      <v-card-title class="d-flex align-center justify-space-between pt-5 px-5 flex-wrap ga-3">
        <div class="text-subtitle-1 font-weight-black">Detailed Sales Log</div>
        <v-text-field
          v-model="searchQuery"
          placeholder="Search orders..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined" density="compact" rounded="lg" hide-details
          style="max-width:220px"
          clearable
        />
      </v-card-title>

      <v-data-table
        :headers="salesHeaders"
        :items="salesLog"
        :loading="loadingOrders"
        hide-default-footer
        density="comfortable"
      >
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>

        <template #item.id="{ item }">
          <span class="text-primary font-weight-bold">{{ item.id }}</span>
        </template>

        <template #item.items="{ item }">
          <span
            class="text-body-2 text-medium-emphasis"
            style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;"
          >{{ item.items }}</span>
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

        <template #no-data>
          <div class="d-flex flex-column align-center ga-2 py-8">
            <v-icon size="40" color="grey-lighten-2">mdi-receipt-text-outline</v-icon>
            <span class="text-body-2 text-medium-emphasis">No orders found for this period.</span>
          </div>
        </template>
      </v-data-table>

      <!-- Pagination -->
      <v-divider v-if="meta.last_page > 1" />
      <div v-if="meta.last_page > 1" class="d-flex justify-center pa-3">
        <v-pagination
          :model-value="meta.current_page"
          :length="meta.last_page"
          :total-visible="7"
          rounded="lg"
          density="comfortable"
          @update:model-value="fetchOrders"
        />
      </div>
    </v-card>

    <!-- ── Snackbar ───────────────────────────────────────────────────────────── -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom right"
      :timeout="3000"
      rounded="lg"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>

  </v-container>
</template>