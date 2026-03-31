<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTableStore } from '@/stores/table.store'

const store = useTableStore()

const {
  loading, saving, deleting, generatingAll,
  generatingId, snackbar,
  search, selectedSection, sections,
  showAddDialog, showEditDialog, showDeleteDialog,
  editTableData, tableToPrint, newTable,
  filteredTables, dashboardStats,
} = storeToRefs(store)

const {
  getQrUrl,
  init, openAdd, addTable,
  openEdit, saveEdit,
  confirmDelete, handleDelete,
  generateQr, generateAll,
  downloadQr, printQr,
} = store

onMounted(init)
</script>

<template>
  <v-container fluid class="pa-0">

    <!-- ── Header ──────────────────────────────────────────────────────────── -->
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
      </div>
      <v-btn
        color="var(--app-primary)"
        rounded="lg"
        prepend-icon="mdi-plus"
        @click="openAdd"
      >
        <span style="color:white; font-weight:800">Register New Table</span>
      </v-btn>
    </div>

    <!-- ── Stats row ───────────────────────────────────────────────────────── -->
    <v-row class="mb-5">
      <v-col v-for="stat in dashboardStats" :key="stat.label" cols="6" sm="6" md="3">
        <v-card rounded="xl" elevation="0" border class="stat-card">
          <v-card-text class="d-flex align-center ga-4">
            <v-avatar :color="stat.bg" size="48" rounded="lg">
              <v-icon :color="stat.color" size="22">{{ stat.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="stat-label">{{ stat.label }}</div>
              <div class="text-h5 font-weight-black" :style="{ color: stat.color }">{{ stat.value }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Section filter ──────────────────────────────────────────────────── -->
    <v-sheet color="transparent" class="d-flex align-center mb-5 flex-wrap" style="gap:16px">
      <v-chip-group v-model="selectedSection" selected-class="active-filter-chip" mandatory>
        <v-chip
          v-for="s in sections" :key="s" :value="s"
          size="large" variant="flat"
          class="ma-1 font-weight-bold filter-chip"
        >{{ s }}</v-chip>
      </v-chip-group>
    </v-sheet>

    <!-- ── Loading ─────────────────────────────────────────────────────────── -->
    <v-row v-if="loading" class="mt-2">
      <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="card, list-item-two-line" rounded="xl" class="pa-4 bg-white" elevation="0" />
      </v-col>
    </v-row>

    <!-- ── Table cards ─────────────────────────────────────────────────────── -->
    <v-row v-else-if="filteredTables.length > 0" class="mt-2">
      <v-col
        v-for="(table, index) in filteredTables" :key="table.table_id"
        cols="12" sm="6" md="4" lg="3"
        class="stagger-col" :style="`animation-delay:${index * 60}ms`"
      >
        <v-card
          rounded="xl"
          elevation="0"
          border
          class="screenshot-card pa-6 d-flex flex-column"
        >
          <!-- Title + Status -->
          <div class="d-flex justify-space-between align-start mb-4">
            <div>
              <div class="unit-id-label">UNIT</div>
              <div class="text-h4 font-weight-black text-grey-darken-4">Table-{{ table.table_number }}</div>
            </div>
            <v-chip
              size="small"
              :class="table.qr_code ? 'chip-ready' : 'chip-pending'"
              class="font-weight-black px-3 py-4 text-uppercase text-caption status-badge"
              rounded="pill"
              elevation="0"
            >{{ table.qr_code ? 'READY' : 'PENDING' }}</v-chip>
          </div>

          <!-- Capacity & Location -->
          <div class="d-flex align-center mb-4 info-row" style="gap:16px; font-size:14px; opacity:.9">
            <span class="font-weight-bold text-grey-darken-2 d-flex align-center">
              <v-icon size="20" color="#94a3b8" class="mr-2">mdi-account-group</v-icon>
              {{ table.capacity }} Seats
            </span>
            <v-divider vertical class="mx-1 info-divider" />
            <span class="font-weight-bold text-grey-darken-2 d-flex align-center">
              <v-icon size="20" color="#94a3b8" class="mr-2">mdi-map-marker-radius</v-icon>
              {{ table.location || 'Indoor' }}
            </span>
          </div>

          <!-- QR Code -->
          <div class="qr-container d-flex align-center justify-center mb-6" style="aspect-ratio:1/1;">
            <div class="qr-inner-frame">
              <template v-if="table.qr_code">
                <v-img :src="getQrUrl(table.qr_code)" class="w-100 h-100 qr-image" cover>
                  <template #placeholder>
                    <div class="d-flex align-center justify-center fill-height">
                      <v-progress-circular indeterminate color="grey-lighten-4" />
                    </div>
                  </template>
                </v-img>
              </template>
              <template v-else>
                <div class="d-flex flex-column align-center empty-qr-state">
                  <div class="qr-placeholder-icon-wrap mb-3">
                    <v-icon size="40" color="#94a3b8" class="pulse-empty-icon">mdi-qrcode-scan</v-icon>
                  </div>
                  <span class="text-caption font-weight-black text-grey-darken-1 text-uppercase" style="letter-spacing:1px">
                    Unassigned
                  </span>
                </div>
              </template>
            </div>
          </div>

          <v-spacer />

          <!-- Actions -->
          <div class="d-flex align-center justify-space-between mb-5">
            <v-btn
              v-if="table.qr_code"
              elevation="0"
              class="text-none flex-grow-1 mr-3 text-left h-auto py-3 asset-btn deployed-state"
              @click="printQr(table)"
            >
              <v-icon size="24" color="#407709" class="mr-2">mdi-check-circle</v-icon>
              <div class="d-flex flex-column align-start">
                <span class="font-weight-black uppercase-mini" style="color:#5a9e12">ASSET</span>
                <span class="font-weight-black uppercase-main" style="color:#2d5505">DEPLOYED</span>
              </div>
            </v-btn>

            <v-btn
              v-else
              elevation="0"
              class="text-none flex-grow-1 mr-3 text-left h-auto py-3 generate-btn"
              :loading="generatingId === table.table_id"
              @click="generateQr(table.table_id)"
            >
              <v-icon size="24" color="#3b82f6" class="mr-2">mdi-plus-circle</v-icon>
              <div class="d-flex flex-column align-start">
                <span class="font-weight-black uppercase-mini text-blue-darken-1">GENERATE</span>
                <span class="font-weight-black uppercase-main text-blue-darken-3">ASSET</span>
              </div>
            </v-btn>

            <!-- Context menu -->
            <v-menu location="bottom end" transition="scale-transition">
              <template #activator="{ props }">
                <v-btn v-bind="props" elevation="0" class="mini-action-btn" height="48" width="48" min-width="48">
                  <v-icon size="20" color="#475569">mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list class="rounded-xl mt-1 pa-2 elevation-6" width="200">
                <v-list-item v-if="table.qr_code" class="rounded-lg mb-1 menu-item-hover" @click="downloadQr(table)">
                  <template #prepend>
                    <v-icon color="#3b82f6" class="mr-2" size="20">mdi-tray-arrow-down</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold text-body-2 text-grey-darken-3">Download QR</v-list-item-title>
                </v-list-item>
                <v-list-item class="rounded-lg mb-1 menu-item-hover" @click="openEdit(table)">
                  <template #prepend>
                    <v-icon color="#f59e0b" class="mr-2" size="20">mdi-pencil-outline</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold text-body-2 text-grey-darken-3">Edit Details</v-list-item-title>
                </v-list-item>
                <v-divider class="my-1" />
                <v-list-item class="rounded-lg mt-1 menu-item-hover-danger text-error" @click="confirmDelete(table.table_id)">
                  <template #prepend>
                    <v-icon color="error" class="mr-2" size="20">mdi-trash-can-outline</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold text-body-2">Delete Table</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <!-- Footer -->
          <div class="d-flex align-center font-weight-black footer-status-row">
            <div class="d-flex align-center sync-status mr-4">
              <v-icon size="8" class="mr-2 pulse-dot">mdi-circle</v-icon> SYNC ACTIVE
            </div>
            <v-spacer />
            <div class="d-flex align-center update-text" @click="generateQr(table.table_id)">
              <v-icon size="14" class="mr-1">mdi-refresh</v-icon> UPDATE
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Empty state ─────────────────────────────────────────────────────── -->
    <v-row v-else justify="center" class="mt-12 py-12">
      <v-col cols="12" md="6" class="text-center">
        <v-card rounded="xl" elevation="0" border class="pa-10 d-flex flex-column align-center">
          <v-icon size="80" color="#cbd5e1" class="mb-4">mdi-table-search</v-icon>
          <div class="text-h5 font-weight-black text-grey-darken-3 mb-2">No Units Found</div>
          <div class="text-body-1 text-grey-darken-1 mb-6">No tables match your current filter.</div>
          <v-btn
            color="primary" rounded="lg" elevation="0"
            class="text-none px-6 font-weight-bold"
            @click="search = ''; selectedSection = 'All Sections'"
          >
            Clear Filters
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Register Table dialog ────────────────────────────────────────────── -->
    <v-dialog v-model="showAddDialog" max-width="480">
      <v-card rounded="xl" elevation="0">
        <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
          <v-avatar color="success" variant="tonal" size="40" rounded="lg">
            <v-icon size="20">mdi-qrcode-scan</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">Register New Table</span>
        </v-card-title>
        <v-card-text class="px-6 pt-3">
          <v-text-field
            v-model="newTable.table_number"
            label="Unit Identifier (Number)"
            type="number"
            variant="outlined" rounded="lg" density="comfortable"
            prepend-inner-icon="mdi-pound"
            class="mb-2"
          />
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="newTable.capacity"
                label="Capacity"
                type="number"
                variant="outlined" rounded="lg" density="comfortable"
                prepend-inner-icon="mdi-account-group"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="newTable.location"
                :items="['Indoor', 'Patio', 'Bar']"
                label="Dining Zone"
                variant="outlined" rounded="lg" density="comfortable"
                prepend-inner-icon="mdi-map-marker"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" :disabled="saving" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn
            color="var(--app-primary)" rounded="lg"
            :loading="saving" @click="addTable"
          >
            <span style="color:#f0f7e6; font-weight:800">Register Table</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Edit dialog ──────────────────────────────────────────────────────── -->
    <v-dialog v-model="showEditDialog" max-width="480">
      <v-card v-if="editTableData" rounded="xl" elevation="0">
        <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
          <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
            <v-icon size="20">mdi-pencil-outline</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">Edit Unit #{{ editTableData.table_number }}</span>
        </v-card-title>
        <v-card-text class="px-6 pt-3">
          <v-text-field
            v-model="editTableData.table_number"
            label="Unit Identifier (Number)"
            type="number"
            variant="outlined" rounded="lg" density="comfortable"
            prepend-inner-icon="mdi-pound"
            class="mb-2"
          />
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="editTableData.capacity"
                label="Capacity"
                type="number"
                variant="outlined" rounded="lg" density="comfortable"
                prepend-inner-icon="mdi-account-group"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="editTableData.location"
                :items="['Indoor', 'Patio', 'Bar']"
                label="Dining Zone"
                variant="outlined" rounded="lg" density="comfortable"
                prepend-inner-icon="mdi-map-marker"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" :disabled="saving" @click="showEditDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" :loading="saving" @click="saveEdit">Save Details</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Delete confirm dialog ────────────────────────────────────────────── -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card rounded="xl" elevation="0">
        <v-card-text class="pa-6">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar color="red-lighten-5" rounded="lg" size="44" style="border:1px solid #fca5a5">
              <v-icon color="error" size="22">mdi-delete-outline</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-black">Delete Table</span>
          </div>
          <p class="text-body-2 text-medium-emphasis">
            This will permanently delete the table and its QR code. This action cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" :disabled="deleting" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" :loading="deleting" @click="handleDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Snackbar ─────────────────────────────────────────────────────────── -->
    <v-snackbar
      v-model="snackbar.show" :color="snackbar.color"
      location="bottom right" rounded="lg" :timeout="3000"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>

    <!-- ── Print section (hidden until printQr called) ──────────────────────── -->
    <div class="print-only-section">
      <template v-if="tableToPrint">
        <div class="print-container">
          <div class="print-header">Mlup Dong Restaurant</div>
          <div class="print-qr-card">
            <h1 class="print-table-number">Table {{ tableToPrint.table_number }}</h1>
            <div class="print-qr-wrapper">
              <img :src="getQrUrl(tableToPrint.qr_code)" class="print-qr-img" alt="QR Code" />
            </div>
            <p class="print-instruction">Scan to view menu &amp; order</p>
          </div>
        </div>
      </template>
    </div>

  </v-container>
</template>

<style scoped>
/* ── Stat cards ── */
.stat-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: rgba(0, 0, 0, .5);
}

.stat-card {
  transition: all .3s cubic-bezier(.4, 0, .2, 1);
}

.stat-card:hover {
  box-shadow: 0 10px 25px -5px rgba(64, 119, 9, .15) !important;
  transform: translateY(-2px);
}

/* ── Table cards ── */
.screenshot-card {
  background: #ffffff !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, .02) !important;
  transition: all .6s cubic-bezier(.16, 1, .3, 1);
  position: relative;
  overflow: hidden;
}

.screenshot-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 48px -12px rgba(15, 23, 42, .1) !important;
}

.screenshot-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: radial-gradient(circle at top right, rgba(64, 119, 9, .04), transparent 70%);
  opacity: 0;
  transition: opacity .6s ease;
  pointer-events: none;
}

.screenshot-card:hover::before {
  opacity: 1;
}

.unit-id-label {
  font-size: 10px;
  letter-spacing: .1em;
  color: #94a3b8;
  font-weight: 700;
}

.status-badge {
  font-size: 10px !important;
  letter-spacing: .05em;
}

.chip-ready {
  background: linear-gradient(135deg, #f2f8e8, #e2f0cc) !important;
  color: #2d5505 !important;
  border: 1px solid rgba(64, 119, 9, .15) !important;
}

.chip-pending {
  background: linear-gradient(135deg, #fffbeb, #fef3c7) !important;
  color: #92400e !important;
  border: 1px solid rgba(217, 119, 6, .1) !important;
}

.info-row .info-divider {
  border-color: #f1f5f9 !important;
}

/* ── QR area ── */
.qr-container {
  background: #f8fafc !important;
  border-radius: 16px !important;
  padding: 16px !important;
  border: 1px solid #f1f5f9 !important;
}

.qr-inner-frame {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, .03);
}

.qr-image {
  border-radius: 8px;
  transition: transform .3s ease;
}

.screenshot-card:hover .qr-image {
  transform: scale(1.05);
}

.qr-placeholder-icon-wrap {
  background: #f1f5f9;
  padding: 24px;
  border-radius: 100%;
  border: 2px dashed #cbd5e1;
}

.empty-qr-state {
  width: 100%;
  align-items: center;
}

/* ── Action buttons ── */
.asset-btn {
  background: #f2f8e8 !important;
  border: 1px solid #d4eaaa !important;
  border-radius: 12px !important;
  transition: all .3s ease;
}

.asset-btn:hover {
  background: #e2f0cc !important;
  transform: translateX(4px);
}

.generate-btn {
  background: #eff6ff !important;
  border: 1px solid #dbeafe !important;
  border-radius: 12px !important;
  transition: all .3s ease;
}

.generate-btn:hover {
  background: #dbeafe !important;
  transform: translateX(4px);
}

.mini-action-btn {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  transition: all .2s ease;
}

.mini-action-btn:hover {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

.uppercase-mini {
  font-size: 9px;
  line-height: 1;
  letter-spacing: .05em;
  opacity: .7;
}

.uppercase-main {
  font-size: 11px;
  line-height: 1.2;
  letter-spacing: .02em;
}

/* ── Card footer ── */
.footer-status-row {
  border-top: 1px dashed #f1f5f9;
  padding-top: 16px;
}

.sync-status {
  color: #407709;
  font-size: 11px;
  letter-spacing: .5px;
}

.update-text {
  color: #94a3b8;
  font-size: 11px;
  letter-spacing: .5px;
  cursor: pointer;
  transition: color .2s ease;
}

.update-text:hover {
  color: #0f172a !important;
}

/* ── Pulse animations ── */
.pulse-dot {
  animation: status-pulse 2s infinite;
}

@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .4; }
}

.deployed-state .v-icon {
  animation: check-pop .6s cubic-bezier(.175, .885, .32, 1.275) infinite alternate;
}

@keyframes check-pop {
  from { transform: scale(1); }
  to   { transform: scale(1.1); filter: drop-shadow(0 0 4px rgba(64, 119, 9, .4)); }
}

/* ── Filters ── */
.filter-chip {
  background: transparent !important;
  color: #64748b !important;
}

.filter-chip:hover {
  background: rgba(241, 245, 249, .8) !important;
  color: #0f172a !important;
}

.active-filter-chip {
  background: #407709 !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(64, 119, 9, .3) !important;
}

/* ── Stagger animation ── */
.stagger-col {
  animation: slideUpFade .6s cubic-bezier(.16, 1, .3, 1) backwards;
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30px) scale(.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Context menu ── */
.menu-item-hover { transition: all .2s ease; }
.menu-item-hover:hover { background: #f1f5f9; }
.menu-item-hover-danger { transition: all .2s ease; }
.menu-item-hover-danger:hover { background: #fef2f2; }

/* ── Print ── */
.print-only-section { display: none; }

@media print {
  :deep(.v-application) .v-row,
  :deep(.v-application) .v-dialog,
  .v-btn, header, nav, footer { display: none !important; }

  body, html { background: white !important; }

  .print-only-section {
    display: flex !important;
    position: fixed;
    inset: 0;
    align-items: center;
    justify-content: center;
    background: white !important;
    z-index: 99999;
  }

  .print-container { text-align: center; width: 100%; }

  .print-header {
    font-size: 24px;
    font-weight: 800;
    color: #407709;
    margin-bottom: 2cm;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .print-qr-card {
    display: inline-block;
    border: 2px solid #e2e8f0;
    border-radius: 40px;
    padding: 2cm 1.5cm;
    background: #fff;
  }

  .print-table-number {
    font-size: 64px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1;
    margin-bottom: 1cm;
    letter-spacing: -2px;
  }

  .print-qr-wrapper {
    display: inline-flex;
    padding: .5cm;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 32px;
    margin-bottom: 1cm;
  }

  .print-qr-img { width: 12cm; height: 12cm; object-fit: contain; }

  .print-instruction {
    font-size: 24px;
    color: #64748b;
    font-weight: 600;
    margin: 0;
  }
}
</style>