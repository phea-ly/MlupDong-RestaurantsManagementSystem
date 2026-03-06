<script setup>
import { computed, onMounted, ref } from 'vue'
import { getPaymentsApi } from '@/api/management.api'

const payments = ref([])

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

const dailyIncome = computed(() =>
  payments.value
    .filter((p) => p.payment_date && new Date(p.payment_date).toDateString() === new Date().toDateString())
    .reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)
)

const monthlyIncome = computed(() => {
  const now = new Date()
  return payments.value
    .filter((p) => {
      if (!p.payment_date) return false
      const d = new Date(p.payment_date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)
})

const yearlyIncome = computed(() => {
  const year = new Date().getFullYear()
  return payments.value
    .filter((p) => p.payment_date && new Date(p.payment_date).getFullYear() === year)
    .reduce((sum, p) => sum + Number(p.amount_paid || 0), 0)
})

const revenueCards = computed(() => [
  { label: 'Daily Income', value: formatCurrency(dailyIncome.value), note: 'Live from payments', change: '+0.0%' },
  { label: 'Monthly Income', value: formatCurrency(monthlyIncome.value), note: 'Live from payments', change: '+0.0%' },
  { label: 'Yearly Income', value: formatCurrency(yearlyIncome.value), note: 'Live from payments', change: '+0.0%' },
])

async function loadData() {
  const response = await getPaymentsApi()
  payments.value = Array.isArray(response.data) ? response.data : []
}

onMounted(loadData)
</script>

<template>
  <v-row dense>
    <v-col v-for="card in revenueCards" :key="card.label" cols="12" md="4">
      <v-card rounded="lg" border class="pa-4 fill-height">
        <div class="d-flex justify-space-between mb-3">
          <v-chip size="small" color="#daf4e8" class="font-weight-bold">Income</v-chip>
          <v-chip
            size="small"
            :color="card.negative ? '#ffe7e7' : '#daf4e8'"
            :text-color="card.negative ? '#d95353' : '#13995a'"
            class="font-weight-bold"
          >
            {{ card.change }}
          </v-chip>
        </div>
        <p class="card-label">{{ card.label }}</p>
        <p class="text-h5 font-weight-bold mb-1">{{ card.value }}</p>
        <p class="muted">{{ card.note }}</p>
      </v-card>
    </v-col>
  </v-row>

  <v-card rounded="lg" border class="pa-4 mt-4">
    <div class="d-flex justify-space-between align-center mb-3">
      <p class="text-h6 font-weight-bold ma-0">Order Statistics</p>
      <div class="d-flex ga-2">
        <v-chip size="small">Last 30 Days</v-chip>
        <v-chip size="small" color="#12d685" class="font-weight-bold">Last 7 Days</v-chip>
      </div>
    </div>
    <div class="chart-grid">
      <svg viewBox="0 0 700 120" preserveAspectRatio="none">
        <polyline points="0,94 120,84 240,92 360,68 480,78 600,56 700,62" />
      </svg>
    </div>
  </v-card>
</template>

<style scoped>
.card-label {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #76879f;
}

.muted {
  margin: 0;
  color: #71839b;
  font-size: 12px;
}

.chart-grid {
  position: relative;
  height: 190px;
  border-radius: 12px;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent 42px,
    rgba(122, 141, 165, 0.22) 42px,
    rgba(122, 141, 165, 0.22) 43px
  );
}

svg {
  position: absolute;
  inset: 12px;
  width: calc(100% - 24px);
  height: calc(100% - 24px);
}

polyline {
  fill: none;
  stroke: #14d886;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
