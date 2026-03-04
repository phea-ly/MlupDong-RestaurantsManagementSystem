<script setup>
const revenueCards = [
  { label: 'Daily Income', value: '$1,250.00', note: 'Compared to yesterday', change: '+12.5%' },
  { label: 'Monthly Income', value: '$38,400.00', note: 'Compared to last month', change: '-2.4%', negative: true },
  { label: 'Yearly Income', value: '$420,000.00', note: 'Projected by end of Dec', change: '+15.8%' },
]
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
