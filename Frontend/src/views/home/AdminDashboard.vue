<script setup>
const incomeCards = [
  {
    label: 'Daily Income',
    value: '$1,250.00',
    note: 'Compared with yesterday',
    change: '+12.5 %',
    trend: 'up',
    icon: 'mdi-cash'
  },
  {
    label: 'Monthly Income',
    value: '$38,400.00',
    note: 'Compared with last month',
    change: '-2.4 %',
    trend: 'down',
    icon: 'mdi-calendar-month'
  },
  {
    label: 'Yearly Income',
    value: '$420,000.00',
    note: 'Projected till end of Dec',
    change: '+15.8 %',
    trend: 'up',
    icon: 'mdi-chart-line'
  }
]

const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const topSelling = [
  { name: 'Signature Fish Amok', sold: 452 },
  { name: 'Iced Coconut Coffee', sold: 310 },
  { name: 'Kampot Pepper Squid', sold: 285 },
  { name: 'Mango Sticky Rice', sold: 215 },
  { name: 'Tamarind Shaked Tea', sold: 198 }
]

const maxSold = Math.max(...topSelling.map((item) => item.sold))

const peakHours = [
  { time: '8 AM', value: 14 },
  { time: '10 AM', value: 28 },
  { time: '12 PM', value: 51 },
  { time: '2 PM', value: 60 },
  { time: '4 PM', value: 26 },
  { time: '6 PM', value: 44 },
  { time: '8 PM', value: 55 },
  { time: '9 PM', value: 48 }
]

const maxPeak = Math.max(...peakHours.map((item) => item.value))

const orders = [
  {
    id: '#MD-2284',
    customer: 'Rith Chamry',
    items: 'Fish Amok x2, Cambodia Beer x4',
    status: 'completed',
    amount: '$124.50'
  },
  {
    id: '#MD-2283',
    customer: 'Sokha Meas',
    items: 'Beef Lok Lak x3, Fresh Juices x3',
    status: 'preparing',
    amount: '$88.20'
  },
  {
    id: '#MD-2281',
    customer: 'John Pierce',
    items: 'Signature Seafood Platter x1',
    status: 'completed',
    amount: '$55.00'
  }
]

function soldWidth(sold) {
  return `${Math.round((sold / maxSold) * 100)}%`
}

function peakHeight(value) {
  return `${Math.round((value / maxPeak) * 100)}%`
}

function statusColor(status) {
  if (status === 'completed') {
    return '#d8f6e7'
  }

  return '#ffeecb'
}

function statusTextColor(status) {
  if (status === 'completed') {
    return '#0e9c5d'
  }

  return '#bc7f02'
}
</script>

<template>
  <section class="dashboard-root">
    <v-row dense class="mb-2">
      <v-col v-for="card in incomeCards" :key="card.label" cols="12" md="4">
        <v-card rounded="lg" border class="pa-4 metric-card fill-height">
          <div class="d-flex justify-space-between align-center mb-3">
            <div class="metric-icon" :class="{ 'metric-icon--negative': card.trend === 'down' }">
              <v-icon size="13">{{ card.icon }}</v-icon>
            </div>
            <span class="metric-change" :class="{ 'metric-change--negative': card.trend === 'down' }">
              {{ card.change }}
            </span>
          </div>
          <p class="metric-label">{{ card.label }}</p>
          <p class="metric-value">{{ card.value }}</p>
          <p class="metric-note">{{ card.note }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="lg" border class="pa-4 mb-3 stats-card">
      <div class="d-flex justify-space-between align-center mb-2 flex-wrap ga-2">
        <div>
          <p class="panel-title">Order Statistics</p>
          <p class="panel-subtitle">Total volume over the last 7 days</p>
        </div>
        <div class="d-flex ga-2">
          <v-chip size="small" class="range-chip">Last 30 Days</v-chip>
          <v-chip size="small" class="range-chip range-chip--active">Last 7 Days</v-chip>
        </div>
      </div>

      <div class="line-chart">
        <svg viewBox="0 0 860 220" preserveAspectRatio="none" aria-label="Order volume chart">
          <line x1="20" y1="180" x2="840" y2="180" class="axis-line" />
        </svg>
        <div class="x-labels">
          <span v-for="label in weekLabels" :key="label">{{ label }}</span>
        </div>
      </div>
    </v-card>

    <v-row dense class="mb-3">
      <v-col cols="12" lg="6">
        <v-card rounded="lg" border class="pa-4 panel-card fill-height">
          <div class="d-flex justify-space-between align-center mb-3">
            <p class="panel-title">Best Selling Food/Drinks</p>
            <a href="#" class="panel-link">View All</a>
          </div>

          <div v-for="item in topSelling" :key="item.name" class="selling-row">
            <div class="d-flex justify-space-between align-center mb-2">
              <p class="item-name">{{ item.name }}</p>
              <p class="item-value">{{ item.sold }} sold</p>
            </div>
            <div class="meter-track">
              <div class="meter-value" :style="{ width: soldWidth(item.sold) }"></div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card rounded="lg" border class="pa-4 panel-card fill-height">
          <div class="d-flex justify-space-between align-center mb-4">
            <p class="panel-title">Peak Hour Analysis</p>
            <p class="panel-subtitle text-uppercase">Service</p>
          </div>

          <div class="bar-wrap">
            <div v-for="point in peakHours" :key="point.time" class="bar-item">
              <div class="bar" :style="{ height: peakHeight(point.value) }"></div>
              <span class="bar-label">{{ point.time }}</span>
            </div>
          </div>

          <div class="observation-box mt-4">
            <p class="observation-title">Observation</p>
            <p class="observation-text">
              Dinner service is 32% above lunch average. Consider increasing floor staff during peak evening slots.
            </p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="lg" border class="pa-4">
      <div class="d-flex justify-space-between align-center mb-3 flex-wrap ga-2">
        <p class="panel-title">Recent High-Value Orders</p>
        <v-btn size="small" variant="tonal" rounded="lg" class="text-none filter-btn">Filter</v-btn>
      </div>

      <v-table density="comfortable" class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Items</th>
            <th>Status</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td class="order-id">{{ order.id }}</td>
            <td>{{ order.customer }}</td>
            <td class="order-items">{{ order.items }}</td>
            <td>
              <v-chip
                size="x-small"
                rounded="pill"
                class="font-weight-bold text-uppercase"
                :color="statusColor(order.status)"
                :text-color="statusTextColor(order.status)"
              >
                {{ order.status }}
              </v-chip>
            </td>
            <td class="text-right font-weight-bold">{{ order.amount }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </section>
</template>

<style scoped>
.dashboard-root {
  max-width: 1440px;
}

.metric-card,
.panel-card,
.stats-card {
  background: #f9fbfb;
  border-color: #e2eaee !important;
}

.metric-icon {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  color: #0eac67;
  background: #dcf8e9;
}

.metric-icon--negative {
  color: #d65a5a;
  background: #ffe7e7;
}

.metric-change {
  padding: 3px 9px;
  border-radius: 999px;
  background: #dcf8e9;
  color: #0eac67;
  font-size: 10px;
  font-weight: 800;
}

.metric-change--negative {
  background: #ffe7e7;
  color: #d65a5a;
}

.metric-label {
  margin: 0 0 6px;
  color: #7b8da3;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 800;
}

.metric-value {
  margin: 0;
  font-size: 33px;
  line-height: 1.1;
  font-weight: 900;
  color: #122039;
}

.metric-note {
  margin: 4px 0 0;
  font-size: 11px;
  color: #8a9cb0;
}

.panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
  color: #1a2a44;
}

.panel-subtitle {
  margin: 2px 0 0;
  font-size: 11px;
  color: #8b9caf;
}

.range-chip {
  background: #edf2f2;
  color: #5f6f85;
  font-weight: 700;
}

.range-chip--active {
  background: #1bde8e;
  color: #064228;
}

.line-chart {
  border: 1px solid #e6edf1;
  border-radius: 10px;
  padding: 8px 12px 10px;
  background: #fbfdfd;
  min-height: 220px;
}

.line-chart svg {
  width: 100%;
  height: 188px;
}

.axis-line {
  stroke: #22d587;
  stroke-width: 2;
}

.x-labels {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  color: #9aaabd;
  font-size: 10px;
  text-align: center;
}

.panel-link {
  font-size: 11px;
  color: #0cab66;
  text-decoration: none;
  font-weight: 700;
}

.selling-row {
  margin-bottom: 14px;
}

.selling-row:last-child {
  margin-bottom: 0;
}

.item-name,
.item-value {
  margin: 0;
  font-size: 12px;
}

.item-name {
  font-weight: 700;
  color: #22334d;
}

.item-value {
  color: #5e738c;
  font-weight: 700;
}

.meter-track {
  height: 5px;
  border-radius: 999px;
  background: #e4ece9;
  overflow: hidden;
}

.meter-value {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #11d483 0%, #20e595 100%);
}

.bar-wrap {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  min-height: 148px;
  padding-top: 6px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bar {
  width: 100%;
  max-width: 28px;
  min-height: 12px;
  border-radius: 5px 5px 0 0;
  background: linear-gradient(180deg, #27e497 0%, #16ce7f 100%);
}

.bar-label {
  font-size: 9px;
  color: #9bacbe;
}

.observation-box {
  border: 1px solid #dce8e5;
  border-radius: 10px;
  padding: 9px 10px;
  background: #f1f8f5;
}

.observation-title {
  margin: 0 0 3px;
  font-size: 11px;
  font-weight: 800;
  color: #1d3858;
}

.observation-text {
  margin: 0;
  font-size: 11px;
  color: #57718e;
}

.filter-btn {
  background: #ecf1f4;
  color: #6d8098;
}

.orders-table {
  border: 1px solid #e4ebef;
  border-radius: 10px;
  overflow: hidden;
}

.orders-table :deep(th) {
  background: #f3f7f8;
  color: #8899ad;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 800;
}

.orders-table :deep(td) {
  font-size: 12px;
  color: #1f3049;
}

.order-id {
  font-weight: 700;
}

.order-items {
  color: #71859c;
}
</style>
