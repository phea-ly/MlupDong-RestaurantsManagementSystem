<script setup>
import { ref } from 'vue'

const range = ref('Last 7 Days')

const rangeOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days']

const linePoints = '40,140 140,138 240,130 340,90 440,50 540,68 640,82'
const userPoints = '40,150 140,150 240,140 340,110 440,80 540,95 640,70'

const eventTypes = [
  { label: 'Option', value: 360, color: '#1d4ed8' },
  { label: 'Post', value: 140, color: 'var(--app-primary-600)' },
  { label: 'Plugin', value: 80, color: '#a3e635' },
  { label: 'System', value: 50, color: '#f59e0b' },
  { label: 'Media', value: 35, color: '#f97316' },
  { label: 'User', value: 22, color: '#ef4444' },
]

const actionTypes = [
  { label: 'Updated', value: 374, color: '#3b82f6' },
  { label: 'Update', value: 118, color: '#22c55e' },
  { label: 'Status', value: 36, color: '#f59e0b' },
  { label: 'Published', value: 22, color: '#ef4444' },
  { label: 'Activated', value: 18, color: '#a855f7' },
]

const heatmap = [
  { day: 'Sunday', values: [0, 0, 0, 1, 2, 1, 0, 0] },
  { day: 'Monday', values: [2, 3, 4, 6, 7, 4, 3, 2] },
  { day: 'Tuesday', values: [1, 1, 2, 4, 5, 2, 1, 1] },
  { day: 'Wednesday', values: [0, 1, 1, 3, 5, 3, 1, 0] },
  { day: 'Thursday', values: [0, 0, 1, 2, 3, 1, 0, 0] },
  { day: 'Friday', values: [0, 0, 0, 1, 2, 1, 0, 0] },
  { day: 'Saturday', values: [0, 0, 0, 1, 2, 1, 0, 0] },
]

function heatColor(value) {
  if (value >= 6) return '#1d4ed8'
  if (value >= 4) return '#3b82f6'
  if (value >= 2) return '#93c5fd'
  if (value >= 1) return '#dbeafe'
  return '#f8fafc'
}
</script>

<template>
  <v-card rounded="xl" border flat class="mt-6">
    <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-2 pt-5 px-5">
      <div>
        <div class="text-subtitle-1 font-weight-black">Activity Trends</div>
        <div class="text-caption text-medium-emphasis">Daily activity and active users</div>
      </div>
      <v-select
        v-model="range"
        :items="rangeOptions"
        variant="outlined"
        density="compact"
        rounded="lg"
        hide-details
        style="max-width:180px"
      />
    </v-card-title>
    <v-card-text>
      <div class="text-caption text-medium-emphasis mb-4">
        97 events today so far. 604 events have been logged in the last 30 days. 604 events since Activity Log Pro was installed on June 16, 2025.
      </div>
      <svg width="100%" height="180" viewBox="0 0 700 170" preserveAspectRatio="none">
        <defs>
          <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
          </linearGradient>
        </defs>
        <polygon :points="linePoints + ' 640,170 40,170'" fill="url(#activityFill)" />
        <polyline :points="linePoints" fill="none" stroke="#3b82f6" stroke-width="2.5" />
        <polyline :points="userPoints" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="5 6" />
      </svg>
      <div class="d-flex justify-space-between px-2 mb-4">
        <span class="text-caption text-medium-emphasis">Jun 13</span>
        <span class="text-caption text-medium-emphasis">Jun 14</span>
        <span class="text-caption text-medium-emphasis">Jun 15</span>
        <span class="text-caption text-medium-emphasis">Jun 16</span>
        <span class="text-caption text-medium-emphasis">Jun 17</span>
        <span class="text-caption text-medium-emphasis">Jun 18</span>
        <span class="text-caption text-medium-emphasis">Jun 19</span>
      </div>

      <v-row dense>
        <v-col cols="12" md="4">
          <v-card rounded="lg" border flat class="pa-4">
            <div class="text-subtitle-2 font-weight-black mb-3">Activity by Event Type</div>
            <div class="d-flex align-center ga-4">
              <v-progress-circular size="110" width="12" model-value="62" color="#1d4ed8" />
              <div>
                <div v-for="item in eventTypes" :key="item.label" class="d-flex align-center ga-2 mb-1">
                  <span class="dot" :style="{ background: item.color }" />
                  <span class="text-caption">{{ item.label }}</span>
                </div>
              </div>
            </div>
            <div class="text-caption text-medium-emphasis mt-3">{{ eventTypes.length }} different event types have been recorded.</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card rounded="lg" border flat class="pa-4">
            <div class="text-subtitle-2 font-weight-black mb-3">Action Type Distribution</div>
            <div class="d-flex align-center ga-4">
              <v-progress-circular size="110" width="12" model-value="68" color="#3b82f6" />
              <div>
                <div v-for="item in actionTypes" :key="item.label" class="d-flex align-center ga-2 mb-1">
                  <span class="dot" :style="{ background: item.color }" />
                  <span class="text-caption">{{ item.label }}</span>
                </div>
              </div>
            </div>
            <div class="text-caption text-medium-emphasis mt-3">Updated is the most common action with 374 occurrences (68%).</div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card rounded="lg" border flat class="pa-4">
            <div class="text-subtitle-2 font-weight-black mb-3">Peak Activity Times</div>
            <div class="heatmap">
              <div class="heatmap-header">
                <span v-for="hour in ['0','2','4','6','8','10','12','14']" :key="hour" class="text-caption text-medium-emphasis">{{ hour }}</span>
              </div>
              <div class="heatmap-row" v-for="row in heatmap" :key="row.day">
                <span class="text-caption text-medium-emphasis">{{ row.day }}</span>
                <div class="heatmap-cells">
                  <span
                    v-for="(value, idx) in row.values"
                    :key="idx"
                    class="heatmap-cell"
                    :style="{ background: heatColor(value) }"
                  />
                </div>
              </div>
            </div>
            <div class="text-caption text-medium-emphasis mt-3">Monday is the busiest day with 54 events. 11:00 on Monday is the busiest time.</div>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.heatmap {
  display: grid;
  gap: 6px;
}
.heatmap-header {
  display: grid;
  grid-template-columns: 80px repeat(8, 1fr);
  gap: 4px;
  padding-left: 4px;
}
.heatmap-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 6px;
  align-items: center;
}
.heatmap-cells {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}
.heatmap-cell {
  height: 16px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}
</style>

