<script setup>
import { ref, computed } from 'vue'

const activeFilter = ref('all')
const showCreateDialog = ref(false)
const newTableName = ref('')

const tables = ref([
  { id: 1, name: 'Table 01', status: 'available' },
  { id: 2, name: 'Table 02', status: 'occupied' },
  { id: 3, name: 'Table 03', status: 'available' },
  { id: 4, name: 'Table 04', status: 'available' },
  { id: 5, name: 'Table 05', status: 'occupied' },
])

const filteredTables = computed(() => {
  if (activeFilter.value === 'all') return tables.value
  return tables.value.filter(t => t.status === activeFilter.value)
})

const allCount = computed(() => tables.value.length)
const availableCount = computed(() => tables.value.filter(t => t.status === 'available').length)
const occupiedCount = computed(() => tables.value.filter(t => t.status === 'occupied').length)

function createTable() {
  if (!newTableName.value) return
  tables.value.push({ id: Date.now(), name: newTableName.value, status: 'available' })
  newTableName.value = ''
  showCreateDialog.value = false
}

function deleteTable(id) {
  tables.value = tables.value.filter(t => t.id !== id)
}

function toggleStatus(table) {
  table.status = table.status === 'available' ? 'occupied' : 'available'
}

// Simple QR placeholder SVG
const qrSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>
  <rect width='80' height='80' fill='#f7faf9'/>
  <rect x='10' y='10' width='24' height='24' rx='2' fill='none' stroke='#1a2e48' stroke-width='3'/>
  <rect x='15' y='15' width='14' height='14' rx='1' fill='#1a2e48'/>
  <rect x='46' y='10' width='24' height='24' rx='2' fill='none' stroke='#1a2e48' stroke-width='3'/>
  <rect x='51' y='15' width='14' height='14' rx='1' fill='#1a2e48'/>
  <rect x='10' y='46' width='24' height='24' rx='2' fill='none' stroke='#1a2e48' stroke-width='3'/>
  <rect x='15' y='51' width='14' height='14' rx='1' fill='#1a2e48'/>
  <rect x='46' y='46' width='6' height='6' fill='#1a2e48'/>
  <rect x='56' y='46' width='6' height='6' fill='#1a2e48'/>
  <rect x='46' y='56' width='6' height='6' fill='#1a2e48'/>
  <rect x='56' y='56' width='6' height='6' fill='#1a2e48'/>
  <rect x='66' y='56' width='6' height='6' fill='#1a2e48'/>
  <rect x='66' y='46' width='6' height='6' fill='#1a2e48'/>
</svg>`
</script>

<template>
  <div>
    <!-- Create Table Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="400">
      <v-card rounded="xl" class="pa-6">
        <p class="dialog-title mb-4">Create New Table</p>
        <v-text-field
          v-model="newTableName"
          label="Table Name (e.g. Table 06)"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          class="mb-4"
        />
        <div class="d-flex ga-3 justify-end">
          <v-btn variant="outlined" rounded="lg" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="#0f9e5f" rounded="lg" flat @click="createTable">Create</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Filter Tabs + Actions -->
    <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-3">
      <div class="d-flex ga-1 tab-group">
        <button :class="['tab-btn', activeFilter === 'all' ? 'tab-active' : '']" @click="activeFilter = 'all'">
          All Tables ({{ allCount }})
        </button>
        <button :class="['tab-btn', activeFilter === 'available' ? 'tab-active' : '']" @click="activeFilter = 'available'">
          Available ({{ availableCount }})
        </button>
        <button :class="['tab-btn', activeFilter === 'occupied' ? 'tab-active' : '']" @click="activeFilter = 'occupied'">
          Occupied ({{ occupiedCount }})
        </button>
      </div>
      <div class="d-flex align-center ga-2">
        <span class="last-updated">⏱ Last updated: Just now</span>
        <v-btn variant="outlined" rounded="lg" size="small" prepend-icon="mdi-download-outline">Export All QR</v-btn>
        <v-btn color="#0f9e5f" rounded="lg" size="small" prepend-icon="mdi-plus" @click="showCreateDialog = true">Create Table</v-btn>
      </div>
    </div>

    <!-- Table Grid -->
    <v-row>
      <v-col v-for="table in filteredTables" :key="table.id" cols="12" sm="6" md="3">
        <v-card rounded="xl" elevation="0" class="table-card pa-4">
          <div class="d-flex justify-space-between align-center mb-3">
            <p class="table-name">{{ table.name }}</p>
            <v-chip
              :color="table.status === 'available' ? 'success' : 'warning'"
              size="x-small"
              rounded="lg"
              variant="tonal"
            >
              {{ table.status.toUpperCase() }}
            </v-chip>
          </div>

          <!-- QR Code placeholder -->
          <div class="qr-box mb-3" v-html="qrSvg"></div>

          <v-btn variant="outlined" block rounded="lg" size="small" prepend-icon="mdi-download-outline" class="mb-2">
            DOWNLOAD QR
          </v-btn>

          <div class="d-flex justify-space-between">
            <button class="action-btn edit-btn" @click="toggleStatus(table)">Edit</button>
            <button class="action-btn delete-btn" @click="deleteTable(table.id)">Delete</button>
          </div>
        </v-card>
      </v-col>

      <!-- Add New Table Card -->
      <v-col cols="12" sm="6" md="3">
        <v-card
          rounded="xl"
          elevation="0"
          class="table-card add-card pa-4 d-flex align-center justify-center"
          style="min-height: 220px; cursor: pointer; border-style: dashed;"
          @click="showCreateDialog = true"
        >
          <div class="text-center">
            <v-icon size="36" color="#b0bec5">mdi-plus-circle-outline</v-icon>
            <p class="add-label mt-2">ADD NEW TABLE</p>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Print CTA -->
    <v-card rounded="xl" elevation="0" class="print-card pa-4 mt-4">
      <div class="d-flex justify-space-between align-center">
        <div class="d-flex align-center ga-3">
          <v-avatar color="#e6f9f0" size="44" rounded="lg">
            <v-icon color="#0f9e5f">mdi-printer-outline</v-icon>
          </v-avatar>
          <div>
            <p class="print-title">Ready to Print?</p>
            <p class="print-sub">Download all your table QR codes as a high-quality PDF for professional printing.</p>
          </div>
        </div>
        <v-btn color="#0f9e5f" rounded="lg" flat>GENERATE PRINT-READY PDF</v-btn>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
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
}
.tab-active { background: #fff; color: #1a2e48; font-weight: 800; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

.last-updated { font-size: 12px; color: #9aabbd; }

.table-card { background: #fff; border: 1px solid #e4eaec; }
.add-card { border-color: #d0dce4 !important; background: #f7faf9 !important; }
.table-name { font-size: 16px; font-weight: 900; color: #1a2e48; margin: 0; }

.qr-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7faf9;
  border: 1.5px dashed #d0dce4;
  border-radius: 10px;
  padding: 12px;
}

.action-btn {
  font-size: 13px;
  font-weight: 700;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px 8px;
}
.edit-btn { color: #4b5d74; }
.delete-btn { color: #e53935; }

.add-label { font-size: 12px; font-weight: 800; color: #b0bec5; letter-spacing: 0.08em; margin: 0; }

.print-card { background: #f0faf5; border: 1px solid #c8ead8; }
.print-title { font-size: 14px; font-weight: 800; color: #1a2e48; margin: 0 0 2px; }
.print-sub { font-size: 12px; color: #7a899f; margin: 0; }

.dialog-title { font-size: 16px; font-weight: 800; color: #1a2e48; margin: 0; }
</style>