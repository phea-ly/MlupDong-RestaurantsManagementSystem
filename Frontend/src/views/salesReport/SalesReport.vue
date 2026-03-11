<script setup>
import { computed, ref } from 'vue'
import { useI18n } from '@/composables/useI18n'

const activeTab = ref('today')
const searchQuery = ref('')
const { locale } = useI18n()
const isKhmer = computed(() => locale.value === 'km')
const tr = (en, km) => (isKhmer.value ? km : en)

const tabs = computed(() => [
  { value: 'today', label: tr('Today', 'ថ្ងៃនេះ') },
  { value: 'yesterday', label: tr('Yesterday', 'ម្សិលមិញ') },
  { value: 'last7days', label: tr('Last 7 Days', '7 ថ្ងៃចុងក្រោយ') },
  { value: 'custom', label: tr('Custom', 'កំណត់ផ្ទាល់ខ្លួន') },
])

const summaryStats = computed(() => [
  { label: 'Total Revenue', value: '$12,840.00', trend: '+12.5%', sub: 'vs yesterday', up: true, icon: 'mdi-cash-multiple' },
  { label: 'Total Orders', value: '342', trend: '+5.2%', sub: 'vs yesterday', up: true, icon: 'mdi-receipt-text-outline' },
  { label: 'Average Order', value: '$37.54', trend: '+1.8%', sub: 'vs yesterday', up: true, icon: 'mdi-clipboard-list-outline' },
  { label: 'Net Profit', value: '$8,210.00', trend: '+10.4%', sub: 'vs yesterday', up: true, icon: 'mdi-arrow-top-right' },
].map((row) => ({
  ...row,
  label: {
    'Total Revenue': tr('Total Revenue', 'ចំណូលសរុប'),
    'Total Orders': tr('Total Orders', 'ការបញ្ជាទិញសរុប'),
    'Average Order': tr('Average Order', 'មធ្យមភាគក្នុងមួយបញ្ជាទិញ'),
    'Net Profit': tr('Net Profit', 'ចំណេញសុទ្ធ'),
  }[row.label] || row.label,
  sub: tr('vs yesterday', 'ប្រៀបនឹងម្សិលមិញ'),
})))

const topCategories = computed(() => (
  isKhmer.value
    ? [
      { name: 'ម្ហូបចម្បង', pct: 45 },
      { name: 'ភេសជ្ជៈ', pct: 32 },
      { name: 'បង្អែម', pct: 18 },
      { name: 'ម្ហូបកំដរ', pct: 5 },
    ]
    : [
      { name: 'Main Course', pct: 45 },
      { name: 'Drinks', pct: 32 },
      { name: 'Desserts', pct: 18 },
      { name: 'Appetizers', pct: 5 },
    ]
))

const salesLog = computed(() => (
  isKhmer.value
    ? [
      { date: '24 តុលា, 14:22', id: 'ORD-9421', items: 'សាច់គោស្តេក, ស្រាក្រហម, សាឡាដ', payment: 'វីសា **** 4421', payIcon: 'mdi-credit-card-outline', amount: '$84.50' },
      { date: '24 តុលា, 13:58', id: 'ORD-9420', items: 'ប៉ាស្តាមាន់, តែទឹកកក', payment: 'សាច់ប្រាក់', payIcon: 'mdi-cash', amount: '$32.00' },
      { date: '24 តុលា, 13:45', id: 'ORD-9419', items: 'ភីហ្សាបន្លែ, នំប៉័ងខ្ទឹម, កូកាកូឡា x2', payment: 'Apple Pay', payIcon: 'mdi-cellphone', amount: '$45.20' },
      { date: '24 តុលា, 13:30', id: 'ORD-9418', items: 'ប៊ឺហ្គឺពិសេស, ដំឡូងបំពង, សេក', payment: 'វីសា **** 1022', payIcon: 'mdi-credit-card-outline', amount: '$24.90' },
    ]
    : [
      { date: 'Oct 24, 14:22', id: 'ORD-9421', items: 'Beef Steak, Red Wine, Caesar Salad', payment: 'Visa **** 4421', payIcon: 'mdi-credit-card-outline', amount: '$84.50' },
      { date: 'Oct 24, 13:58', id: 'ORD-9420', items: 'Chicken Pasta, Iced Tea', payment: 'Cash', payIcon: 'mdi-cash', amount: '$32.00' },
      { date: 'Oct 24, 13:45', id: 'ORD-9419', items: 'Veggie Pizza, Garlic Bread, Coke x2', payment: 'Apple Pay', payIcon: 'mdi-cellphone', amount: '$45.20' },
      { date: 'Oct 24, 13:30', id: 'ORD-9418', items: 'Cheeseburger Deluxe, Fries, Shake', payment: 'Visa **** 1022', payIcon: 'mdi-credit-card-outline', amount: '$24.90' },
    ]
))

const chartPoints = '50,90 120,70 200,75 290,50 380,35 460,25 550,15'
</script>

<template>
  <div class="sales-report">
    <!-- Tabs + Export -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex ga-1 tab-group">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-btn', activeTab === tab.value ? 'tab-active' : '']"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <v-icon v-if="tab.value === 'custom'" size="14" class="ml-1">mdi-calendar-outline</v-icon>
        </button>
      </div>
      <v-btn color="#0f9e5f" rounded="lg" prepend-icon="mdi-download-outline">
        {{ tr('Export Report', 'នាំចេញរបាយការណ៍') }}
      </v-btn>
    </div>

    <!-- Summary Cards -->
    <v-row class="mb-3">
      <v-col v-for="stat in summaryStats" :key="stat.label" cols="12" md="3">
        <v-card rounded="xl" elevation="0" class="stat-card pa-5">
          <div class="d-flex justify-space-between align-start">
            <p class="stat-label">{{ stat.label }}</p>
            <v-icon color="#e0ebe6" size="22">{{ stat.icon }}</v-icon>
          </div>
          <p class="stat-value">{{ stat.value }}</p>
          <div class="d-flex align-center ga-1">
            <span :class="['trend', stat.up ? 'trend-up' : 'trend-down']">{{ stat.trend }}</span>
            <span class="stat-sub">{{ stat.sub }}</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Revenue Trends + Top Categories -->
    <v-row class="mb-3">
      <v-col cols="12" md="7">
        <v-card rounded="xl" elevation="0" class="stat-card pa-5" style="height:100%">
          <div class="d-flex justify-space-between align-center mb-1">
            <div>
              <p class="section-title">{{ tr('Revenue Trends', 'និន្នាការចំណូល') }}</p>
              <p class="section-sub">{{ tr('Earnings performance over the last 7 days', 'លទ្ធផលចំណូលក្នុង 7 ថ្ងៃចុងក្រោយ') }}</p>
            </div>
            <v-btn variant="outlined" rounded="lg" size="small" append-icon="mdi-chevron-down">{{ tr('Weekly', 'ប្រចាំសប្តាហ៍') }}</v-btn>
          </div>
          <svg width="100%" height="160" viewBox="0 0 600 110" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0f9e5f" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="#0f9e5f" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <polygon :points="chartPoints + ' 550,110 50,110'" fill="url(#areaGrad)" />
            <polyline :points="chartPoints" fill="none" stroke="#0f9e5f" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
          </svg>
          <div class="d-flex justify-space-between px-1 mt-1">
            <span v-for="d in (isKhmer ? ['ច','អ','ព','ព្រ','សុ','សៅ','អា'] : ['MON','TUE','WED','THU','FRI','SAT','SUN'])" :key="d" class="chart-label">{{ d }}</span>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="xl" elevation="0" class="stat-card pa-5" style="height:100%">
          <p class="section-title mb-4">{{ tr('Top Categories', 'ប្រភេទលក់ដាច់') }}</p>
          <div v-for="cat in topCategories" :key="cat.name" class="mb-4">
            <div class="d-flex justify-space-between mb-1">
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-pct">{{ cat.pct }}%</span>
            </div>
            <div class="progress-bg">
              <div class="progress-fill" :style="{ width: cat.pct + '%' }"></div>
            </div>
          </div>
          <div class="insight-box pa-3 mt-2">
            <p class="insight-text">{{ tr('"Main courses are up 12% compared to last week. Consider a dessert promo to boost secondary sales."', '"ម្ហូបចម្បងកើនឡើង 12% ប្រៀបនឹងសប្តាហ៍មុន។ សូមពិចារណាប្រូម៉ូសិនបង្អែមដើម្បីបង្កើនការលក់បន្ថែម។"') }}</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Detailed Sales Log -->
    <v-row>
      <v-col cols="12">
        <v-card rounded="xl" elevation="0" class="stat-card pa-5">
          <div class="d-flex justify-space-between align-center mb-4">
            <p class="section-title">{{ tr('Detailed Sales Log', 'កំណត់ត្រាលក់លម្អិត') }}</p>
            <v-text-field
              v-model="searchQuery"
              :placeholder="tr('Search orders...', 'ស្វែងរកការបញ្ជាទិញ...')"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              style="max-width: 220px"
            />
          </div>
          <v-table density="comfortable" class="sales-table">
            <thead>
              <tr>
                <th>{{ tr('DATE', 'កាលបរិច្ឆេទ') }}</th>
                <th>{{ tr('ORDER ID', 'លេខបញ្ជាទិញ') }}</th>
                <th>{{ tr('ITEMS', 'មុខម្ហូប') }}</th>
                <th>{{ tr('PAYMENT METHOD', 'វិធីសាស្ត្រទូទាត់') }}</th>
                <th>{{ tr('TOTAL AMOUNT', 'ទឹកប្រាក់សរុប') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in salesLog" :key="row.id">
                <td class="row-date">{{ row.date }}</td>
                <td class="row-id">#{{ row.id }}</td>
                <td class="row-items">{{ row.items }}</td>
                <td>
                  <div class="d-flex align-center ga-1">
                    <v-icon size="15" color="#9aabbd">{{ row.payIcon }}</v-icon>
                    <span class="row-payment">{{ row.payment }}</span>
                  </div>
                </td>
                <td class="row-amount">{{ row.amount }}</td>
              </tr>
            </tbody>
          </v-table>
          <div class="d-flex justify-space-between align-center mt-4">
            <span class="showing-text">{{ tr('Showing 4 of 342 orders', 'បង្ហាញ 4 នៃ 342 ការបញ្ជាទិញ') }}</span>
            <div class="d-flex align-center ga-2">
              <v-btn variant="outlined" size="small" rounded="lg">{{ tr('Prev', 'មុន') }}</v-btn>
              <v-btn color="#0f9e5f" size="small" rounded="lg" flat>1</v-btn>
              <v-btn variant="outlined" size="small" rounded="lg">2</v-btn>
              <v-btn variant="outlined" size="small" rounded="lg">{{ tr('Next', 'បន្ទាប់') }}</v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.stat-card { background: #fff; border: 1px solid #e4eaec; }

.tab-group { background: #f0f4f2; padding: 4px; border-radius: 10px; }
.tab-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #7a899f;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.tab-active { background: #fff; color: #1a2e48; font-weight: 800; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

.stat-label { font-size: 13px; font-weight: 600; color: #7a899f; margin: 0 0 6px; }
.stat-value { font-size: 26px; font-weight: 900; color: #1a2e48; margin: 4px 0; letter-spacing: -0.5px; }
.stat-sub { font-size: 12px; color: #9aabbd; }
.trend { font-size: 12px; font-weight: 800; }
.trend-up { color: #0f9e5f; }
.trend-down { color: #d32f2f; }

.section-title { font-size: 15px; font-weight: 800; color: #1a2e48; margin: 0 0 2px; }
.section-sub { font-size: 12px; color: #9aabbd; margin: 0; }
.chart-label { font-size: 11px; color: #9aabbd; font-weight: 600; }

.cat-name { font-size: 13px; font-weight: 600; color: #1a2e48; }
.cat-pct { font-size: 13px; font-weight: 800; color: #1a2e48; }
.progress-bg { height: 5px; background: #edf2f1; border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; background: #0f9e5f; border-radius: 99px; }

.insight-box { background: #f7faf9; border-radius: 10px; border: 1px solid #e0ebe6; }
.insight-text { font-size: 12px; color: #4b5d74; margin: 0; line-height: 1.6; font-style: italic; }

.sales-table th { font-size: 10px !important; font-weight: 800 !important; color: #9aabbd !important; letter-spacing: 0.08em; }
.row-date { font-size: 13px; color: #7a899f; }
.row-id { font-weight: 700; color: #0f9e5f; }
.row-items { font-size: 13px; color: #4b5d74; }
.row-payment { font-size: 13px; color: #4b5d74; }
.row-amount { font-weight: 800; color: #1a2e48; }
.showing-text { font-size: 12px; color: #9aabbd; }
</style>
