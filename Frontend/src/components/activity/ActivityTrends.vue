<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  trendData:   { type: Array,  default: () => [] }, // [{ label, count, icon }]
  topActions:  { type: Array,  default: () => [] }, // [{ label, count, pct, color }]
  recentDays:  { type: Object, default: () => ({}) }, // { 'YYYY-MM-DD': count }
})

const range = ref('Last 7 Days')
const rangeOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days']

// ── SVG line chart from recentDays ────────────────────────────────────────
const chartPoints = computed(() => {
  const entries = Object.entries(props.recentDays).slice(-7)
  if (!entries.length) return { activity: '', labels: [] }

  const values = entries.map(([, v]) => Number(v))
  const max    = Math.max(...values, 1)
  const W = 640, H = 140, padX = 40

  const pts = values.map((v, i) => {
    const x = padX + (i / (values.length - 1 || 1)) * (W - padX * 2)
    const y = H - (v / max) * (H - 20) - 10
    return `${x},${y}`
  })

  return {
    activity: pts.join(' '),
    fill:     pts.join(' ') + ` ${W - padX},${H} ${padX},${H}`,
    labels:   entries.map(([d]) => {
      const dt = new Date(d)
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }),
  }
})

// ── Heatmap (static pattern — replace with real data if available) ────────
const heatmap = [
  { day: 'Mon', values: [2, 3, 5, 7, 6, 4, 3, 2] },
  { day: 'Tue', values: [1, 2, 4, 5, 4, 2, 1, 1] },
  { day: 'Wed', values: [1, 1, 3, 5, 4, 3, 1, 0] },
  { day: 'Thu', values: [0, 1, 2, 3, 3, 2, 1, 0] },
  { day: 'Fri', values: [0, 1, 2, 3, 2, 1, 1, 0] },
  { day: 'Sat', values: [0, 0, 1, 2, 1, 1, 0, 0] },
  { day: 'Sun', values: [0, 0, 0, 1, 1, 0, 0, 0] },
]

function heatColor(v) {
  if (v >= 6) return '#1d4ed8'
  if (v >= 4) return '#3b82f6'
  if (v >= 2) return '#93c5fd'
  if (v >= 1) return '#dbeafe'
  return '#f1f5f9'
}

// ── Derived totals for the donut labels ───────────────────────────────────
const totalEvents  = computed(() => props.trendData.reduce((s, i) => s + i.count, 0))
const totalActions = computed(() => props.topActions.reduce((s, i) => s + i.count, 0))
const topAction    = computed(() => props.topActions[0])

const EVENT_COLORS  = ['#1d4ed8','var(--app-primary)','#a3e635','#f59e0b','#f97316','#ef4444','#a855f7','#06b6d4']
</script>

<template>
  <v-card rounded="xl" border flat class="mt-6">
    <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2 pt-5 px-5">
      <div>
        <div class="text-subtitle-1 font-weight-black">Activity Trends</div>
        <div class="text-caption text-medium-emphasis">Daily activity and distribution breakdown</div>
      </div>
      <v-select
        v-model="range"
        :items="rangeOptions"
        variant="outlined" density="compact" rounded="lg"
        hide-details style="max-width:180px"
      />
    </v-card-title>

    <v-card-text>

      <!-- Line chart -->
      <svg width="100%" height="160" viewBox="0 0 700 150" preserveAspectRatio="none">
        <defs>
          <linearGradient id="actFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
          </linearGradient>
        </defs>
        <polygon v-if="chartPoints.fill" :points="chartPoints.fill" fill="url(#actFill)" />
        <polyline
          v-if="chartPoints.activity"
          :points="chartPoints.activity"
          fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linejoin="round"
        />
        <!-- Fallback static line when no data -->
        <polyline
          v-else
          points="40,130 140,128 240,110 340,80 440,60 540,72 640,85"
          fill="none" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="6 4"
        />
      </svg>

      <!-- X-axis labels -->
      <div class="d-flex justify-space-between px-2 mb-5">
        <span
          v-for="label in (chartPoints.labels?.length ? chartPoints.labels : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])"
          :key="label"
          class="text-caption text-medium-emphasis"
        >{{ label }}</span>
      </div>

      <!-- Three cards row -->
      <v-row dense>

        <!-- Events by type -->
        <v-col cols="12" md="4">
          <v-card rounded="lg" border flat class="pa-4 h-100">
            <div class="text-subtitle-2 font-weight-black mb-3">Activity by Event Type</div>
            <div class="d-flex align-center ga-4">
              <v-progress-circular
                :model-value="totalEvents ? Math.round((trendData[0]?.count ?? 0) / totalEvents * 100) : 0"
                size="100" width="10" color="#1d4ed8"
              >
                <span class="text-caption font-weight-black">{{ totalEvents }}</span>
              </v-progress-circular>
              <div class="flex-grow-1">
                <div
                  v-for="(item, i) in trendData.slice(0, 6)" :key="item.label"
                  class="d-flex align-center ga-2 mb-1"
                >
                  <span class="dot" :style="{ background: EVENT_COLORS[i % EVENT_COLORS.length] }" />
                  <span class="text-caption flex-grow-1">{{ item.label }}</span>
                  <span class="text-caption font-weight-bold">{{ item.count }}</span>
                </div>
                <div v-if="!trendData.length" class="text-caption text-medium-emphasis">No data yet.</div>
              </div>
            </div>
            <div class="text-caption text-medium-emphasis mt-3">
              {{ trendData.length }} different event types recorded.
            </div>
          </v-card>
        </v-col>

        <!-- Action distribution -->
        <v-col cols="12" md="4">
          <v-card rounded="lg" border flat class="pa-4 h-100">
            <div class="text-subtitle-2 font-weight-black mb-3">Action Type Distribution</div>
            <div class="d-flex align-center ga-4">
              <v-progress-circular
                :model-value="topAction?.pct ?? 0"
                size="100" width="10" color="#3b82f6"
              >
                <span class="text-caption font-weight-black">{{ topAction?.pct ?? 0 }}%</span>
              </v-progress-circular>
              <div class="flex-grow-1">
                <div
                  v-for="item in topActions" :key="item.label"
                  class="mb-2"
                >
                  <div class="d-flex justify-space-between align-center mb-1">
                    <div class="d-flex align-center ga-1">
                      <span class="dot" :style="{ background: item.color === 'grey' ? '#9ca3af' : item.color }" />
                      <span class="text-caption">{{ item.label }}</span>
                    </div>
                    <span class="text-caption font-weight-bold">{{ item.count }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="item.pct"
                    :color="item.color"
                    height="4" rounded bg-color="grey-lighten-3"
                  />
                </div>
                <div v-if="!topActions.length" class="text-caption text-medium-emphasis">No data yet.</div>
              </div>
            </div>
            <div class="text-caption text-medium-emphasis mt-3">
              <template v-if="topAction">
                "{{ topAction.label }}" is most common with {{ topAction.count }} ({{ topAction.pct }}%).
              </template>
            </div>
          </v-card>
        </v-col>

        <!-- Peak activity heatmap -->
        <v-col cols="12" md="4">
          <v-card rounded="lg" border flat class="pa-4 h-100">
            <div class="text-subtitle-2 font-weight-black mb-3">Peak Activity Times</div>
            <div class="heatmap">
              <div class="heatmap-header">
                <span />
                <span v-for="h in ['0','3','6','9','12','15','18','21']" :key="h" class="text-caption text-medium-emphasis">{{ h }}</span>
              </div>
              <div v-for="row in heatmap" :key="row.day" class="heatmap-row">
                <span class="text-caption text-medium-emphasis">{{ row.day }}</span>
                <div class="heatmap-cells">
                  <span
                    v-for="(val, idx) in row.values" :key="idx"
                    class="heatmap-cell"
                    :style="{ background: heatColor(val) }"
                  />
                </div>
              </div>
            </div>
            <div class="text-caption text-medium-emphasis mt-3">
              Monday is typically the busiest day.
            </div>
          </v-card>
        </v-col>

      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }

.heatmap         { display: flex; flex-direction: column; gap: 5px; }
.heatmap-header  { display: grid; grid-template-columns: 32px repeat(8, 1fr); gap: 4px; }
.heatmap-row     { display: grid; grid-template-columns: 32px 1fr; gap: 6px; align-items: center; }
.heatmap-cells   { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
.heatmap-cell    { height: 14px; border-radius: 3px; border: 1px solid #e5e7eb; }
</style>