<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/api'

// -- State --
const tables = ref([])
const search = ref('')
const selectedSection = ref('All Sections')
const sections = ['All Sections', 'Indoor', 'Patio', 'Bar']
const loading = ref(false)

// Dialog states
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const newTable = ref({ table_number: '', capacity: 4, location: 'Indoor' })
const editTableData = ref(null)

// Print State
const tableToPrint = ref(null)

// -- Fetch Data --
async function fetchTables() {
  loading.value = true
  try {
    const res = await api.get('/tables')
    tables.value = res.data
  } catch (err) {
    console.error('Failed to fetch tables:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchTables)

// -- CRUD Logic --
function openAddDialog() {
  newTable.value = { table_number: tables.value.length + 1, capacity: 4, location: 'Indoor' }
  showAddDialog.value = true
}

async function addTable() {
  if (!newTable.value.table_number) {
    alert("Please enter a valid Table Identifier (Number)")
    return
  }
  try {
    await api.post('/tables', newTable.value)
    showAddDialog.value = false
    await fetchTables()
  } catch (err) {
    console.error('Failed to add table:', err)
    alert(err.response?.data?.message || 'Failed to add table')
  }
}

function openEditDialog(table) {
  editTableData.value = { ...table }
  showEditDialog.value = true
}

async function saveEdit() {
  if (!editTableData.value || !editTableData.value.table_number) {
    alert("Please enter a valid Table Identifier for the update")
    return
  }
  try {
    await api.put(`/tables/${editTableData.value.table_id}`, editTableData.value)
    showEditDialog.value = false
    await fetchTables()
  } catch (err) {
    console.error('Failed to update table:', err)
  }
}

async function deleteTable(id) {
  if (!confirm('Are you sure you want to delete this table?')) return
  try {
    await api.delete(`/tables/${id}`)
    await fetchTables()
  } catch (err) {
    console.error('Failed to delete table:', err)
  }
}

// -- QR Code Logic --
async function generateQr(tableId) {
  try {
    await api.post(`/tables/${tableId}/generate-qr`)
    await fetchTables() // Refresh list
  } catch (err) {
    console.error('Failed to generate QR:', err)
  }
}

async function generateAll() {
  if (!confirm('Generate QR codes for all tables?')) return
  try {
    loading.value = true
    await api.post('/tables/generate-all')
    await fetchTables()
  } catch (err) {
    console.error('Failed to generate all QR codes:', err)
  } finally {
    loading.value = false
  }
}

function getQrUrl(path) {
  if (!path) return null
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  const baseUrl = apiBase.replace(/\/api$/, '')
  return `${baseUrl}/${path}`
}

async function downloadQr(table) {
  try {
    // We use the new backend download endpoint which handles headers and CORS correctly
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
    const downloadUrl = `${apiBase.replace(/\/$/, '')}/tables/${table.table_id}/download-qr`

    // Create a temporary link and trigger browser's native download
    window.location.href = downloadUrl
  } catch (e) {
    console.error('Download failed', e)
    alert("Failed to download QR code. Please ensure it is generated first.")
  }
}

function printQr(table) {
  tableToPrint.value = table

  setTimeout(() => {
    window.print()
    setTimeout(() => {
      tableToPrint.value = null
    }, 500)
  }, 100)
}

// -- Computed --
const filteredTables = computed(() => {
  return tables.value.filter(t => {
    const matchesSearch = t.table_number.toString().includes(search.value) ||
      (t.location && t.location.toLowerCase().includes(search.value.toLowerCase()))
    const matchesSection = selectedSection.value === 'All Sections' || t.location === selectedSection.value
    return matchesSearch && matchesSection
  })
})

const dashboardStats = computed(() => {
  return [
    { label: 'TOTAL UNITS', value: tables.value.length, icon: 'mdi-table-furniture', color: '#0f172a', bg: '#f1f5f9' },
    { label: 'ASSETS READY', value: tables.value.filter(t => t.qr_code).length, icon: 'mdi-qrcode-check', color: '#16c65b', bg: '#f0fdf4' },
    { label: 'PENDING QRS', value: tables.value.filter(t => !t.qr_code).length, icon: 'mdi-clock-outline', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'TOTAL CAPACITY', value: tables.value.reduce((acc, t) => acc + (parseInt(t.capacity) || 0), 0), icon: 'mdi-account-group', color: '#6366f1', bg: '#eef2ff' },
  ]
})
</script>

<template>
  <v-container fluid class="page-container pa-6 pa-md-10" style="background-color: #fafbfc; min-height: 100vh;">
    <!-- Exact "Unit Deployment" Header Area -->
    <v-row class="mb-6 page-header-wrap" align="center">
      <v-col cols="12" md="7">
        <v-sheet color="transparent" class="d-flex align-center mb-1">
          <v-sheet color="transparent" class="text-h3 font-weight-black mr-3 title-gradient-black"
            tag="h1">Table</v-sheet>
          <v-sheet color="transparent" class="text-h3 font-weight-black title-gradient-green"
            tag="h1">Management</v-sheet>
        </v-sheet>
        <v-sheet tag="p" color="transparent" class="text-subtitle-1 font-weight-medium text-grey-darken-1 mb-0"
          style="letter-spacing: -0.2px;">
          Configure your restaurant layout and manage digital access points
        </v-sheet>
      </v-col>

      <v-col cols="12" md="5" class="d-flex justify-md-end align-center" style="gap: 12px;">
        <v-btn color="#16c65b" elevation="0" rounded="lg"
          class="pulse-btn text-none font-weight-bold px-6 text-white text-body-2 shadow-btn-green" height="48"
          prepend-icon="mdi-plus" @click="openAddDialog">
          Register New Table
        </v-btn>
        <v-btn variant="outlined" color="#cbd5e1" elevation="0" rounded="lg"
          class="text-none font-weight-bold px-6 bg-white text-grey-darken-3 text-body-2 hover-grey-btn" height="48"
          prepend-icon="mdi-refresh" @click="generateAll" :loading="loading">
          Bulk Generate QRs
        </v-btn>
      </v-col>
    </v-row>

    <!-- Quick Stats Row -->
    <v-row class="mb-10">
      <v-col v-for="stat in dashboardStats" :key="stat.label" cols="6" sm="6" md="3">
        <v-card class="stat-mini-card pa-4" elevation="0" border="1px solid #e2e8f0">
          <div class="d-flex align-center">
            <v-avatar :color="stat.bg" class="mr-3" size="44">
              <v-icon :color="stat.color" size="22">{{ stat.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption font-weight-bold text-grey-darken-1 mb-n1" style="letter-spacing: 0.5px;">{{
                stat.label }}</div>
              <div class="text-h5 font-weight-black" :style="{ color: stat.color }">{{ stat.value }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-sheet color="transparent" class="d-flex align-center mb-8 flex-wrap" style="gap: 16px;">
      <v-chip-group v-model="selectedSection" selected-class="active-filter-chip" mandatory>
        <v-chip v-for="s in sections" :key="s" :value="s" size="large" variant="flat"
          class="ma-1 font-weight-bold filter-chip">
          {{ s }}
        </v-chip>
      </v-chip-group>
    </v-sheet>

    <!-- Grid of Unit Cards -->
    <v-row v-if="loading" class="mt-2">
      <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="card, list-item-two-line" rounded="xl" class="pa-4 bg-white border-subtle"
          elevation="0"></v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-else-if="filteredTables.length > 0" class="mt-2" tag="div">
      <v-col v-for="(table, index) in filteredTables" :key="table.table_id" cols="12" sm="6" md="4" lg="3"
        class="stagger-col" :style="`animation-delay: ${index * 60}ms`">
        <v-card class="screenshot-card pa-6 text-left d-flex flex-column premium-hover-effect" elevation="0">

          <!-- Top Area: Unit Title & Ready Pill -->
          <v-sheet color="transparent" class="d-flex justify-space-between align-start mb-4">
            <v-sheet color="transparent">
              <v-sheet color="transparent" class="font-weight-bold text-grey-darken-1 mb-1 unit-id-label">UNIT</v-sheet>
              <v-sheet color="transparent"
                class="text-h4 font-weight-black text-grey-darken-4 mb-0 card-title-text">Table-{{ table.table_number
                }}</v-sheet>
            </v-sheet>
            <v-chip size="small" :class="table.qr_code ? 'chip-ready' : 'chip-pending'"
              class="font-weight-black px-3 py-4 text-uppercase text-caption status-badge" rounded="pill" elevation="0">
              {{ table.qr_code ? 'READY' : 'PENDING' }}
            </v-chip>
          </v-sheet>

          <!-- Capacity & Location Info -->
          <v-sheet color="transparent" class="d-flex align-center gap-4 mb-4 info-row"
            style="font-size: 14px; gap: 16px; opacity: 0.9">
            <span class="font-weight-bold text-grey-darken-2 d-flex align-center">
              <v-icon size="20" color="#94a3b8" class="mr-2">mdi-account-group</v-icon> {{ table.capacity }} Seats
            </span>
            <v-divider vertical class="mx-1 info-divider"></v-divider>
            <span class="font-weight-bold text-grey-darken-2 d-flex align-center">
              <v-icon size="20" color="#94a3b8" class="mr-2">mdi-map-marker-radius</v-icon> {{ table.location ||
                'Indoor' }}
            </span>
          </v-sheet>

          <!-- QR Code Area -->
          <v-sheet class="qr-container d-flex align-center justify-center mb-6 position-relative overflow-hidden"
            elevation="0" style="aspect-ratio: 1 / 1;">
            <div class="qr-inner-frame">
              <template v-if="table.qr_code">
                <v-img :src="getQrUrl(table.qr_code)"
                  class="bg-transparent w-100 h-100 qr-image align-center justify-center d-flex">
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey-lighten-4"></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </template>
              <template v-else>
                <v-sheet color="transparent" class="d-flex flex-column align-center empty-qr-state">
                  <div class="qr-placeholder-icon-wrap mb-3">
                    <v-icon size="40" color="#94a3b8" class="pulse-empty-icon">mdi-qrcode-scan</v-icon>
                  </div>
                  <v-sheet color="transparent" class="text-caption font-weight-black text-grey-darken-1 text-uppercase"
                    style="letter-spacing: 1px;">Unassigned</v-sheet>
                </v-sheet>
              </template>
            </div>
          </v-sheet>

          <v-spacer></v-spacer>

          <!-- Action Buttons Area: Asset Deployed + Edit/Trash -->
          <v-sheet color="transparent" class="d-flex align-center justify-space-between mb-5 action-area-wrap">
            <v-btn v-if="table.qr_code" elevation="0"
              class="text-none flex-grow-1 mr-3 text-left h-auto py-3 asset-btn deployed-state" @click="printQr(table)">
              <v-icon size="24" color="#10b981" class="mr-2">mdi-check-circle</v-icon>
              <v-sheet color="transparent" class="d-flex flex-column align-start">
                <v-sheet color="transparent"
                  class="font-weight-black uppercase-mini text-green-darken-1">ASSET</v-sheet>
                <v-sheet color="transparent"
                  class="font-weight-black uppercase-main text-green-darken-3">DEPLOYED</v-sheet>
              </v-sheet>
            </v-btn>

            <v-btn v-else elevation="0" class="text-none flex-grow-1 mr-3 text-left h-auto py-3 generate-btn"
              @click="generateQr(table.table_id)">
              <v-icon size="24" color="#3b82f6" class="mr-2">mdi-plus-circle</v-icon>
              <v-sheet color="transparent" class="d-flex flex-column align-start">
                <v-sheet color="transparent"
                  class="font-weight-black uppercase-mini text-blue-darken-1">GENERATE</v-sheet>
                <v-sheet color="transparent" class="font-weight-black uppercase-main text-blue-darken-3">ASSET</v-sheet>
              </v-sheet>
            </v-btn>

            <!-- Action Menu (1 icon with dropdown for Download, Edit, Delete) -->
            <v-menu location="bottom end" transition="scale-transition">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" elevation="0" class="mini-action-btn" height="48" width="48" min-width="48">
                  <v-icon size="20" color="#475569">mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list class="rounded-xl mt-1 pa-2 elevation-6 border-subtle" width="200">
                <v-list-item v-if="table.qr_code" @click="downloadQr(table)" class="rounded-lg mb-1 menu-item-hover">
                  <template v-slot:prepend>
                    <v-icon color="#3b82f6" class="mr-2" size="20">mdi-tray-arrow-down</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold text-body-2 text-grey-darken-3">Download
                    QR</v-list-item-title>
                </v-list-item>

                <v-list-item @click="openEditDialog(table)" class="rounded-lg mb-1 menu-item-hover">
                  <template v-slot:prepend>
                    <v-icon color="#f59e0b" class="mr-2" size="20">mdi-pencil-outline</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold text-body-2 text-grey-darken-3">Edit
                    Details</v-list-item-title>
                </v-list-item>

                <v-divider class="my-1 border-subtle"></v-divider>

                <v-list-item @click="deleteTable(table.table_id)"
                  class="rounded-lg mt-1 menu-item-hover-danger text-error">
                  <template v-slot:prepend>
                    <v-icon color="error" class="mr-2" size="20">mdi-trash-can-outline</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold text-body-2">Delete Table</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-sheet>

          <!-- Status Footer: Sync Active & Update -->
          <v-sheet color="transparent" class="d-flex align-center font-weight-black footer-status-row">
            <v-sheet color="transparent" class="d-flex align-center mr-4 sync-status"
              style="color: #10b981; font-size: 11px; cursor: default; letter-spacing: 0.5px;">
              <v-icon size="8" class="mr-2 pulse-dot">mdi-circle</v-icon> SYNC ACTIVE
            </v-sheet>
            <v-spacer></v-spacer>
            <v-sheet color="transparent" class="d-flex align-center text-grey-darken-1 update-text"
              style="font-size: 11px; cursor: pointer; letter-spacing: 0.5px;" @click="generateQr(table.table_id)">
              <v-icon size="14" class="mr-1">mdi-refresh</v-icon> UPDATE
            </v-sheet>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State for Search/No Data -->
    <v-row v-else justify="center" class="mt-12 py-12">
      <v-col cols="12" md="6" class="text-center">
        <v-sheet class="pa-10 bg-white rounded-xl border-dashed d-flex flex-column align-center"
          border="2px dashed #e2e8f0">
          <v-icon size="80" color="#cbd5e1" class="mb-4">mdi-table-search</v-icon>
          <div class="text-h5 font-weight-black text-grey-darken-3 mb-2">No Units Found</div>
          <div class="text-body-1 text-grey-darken-1 mb-6">Looks like we couldn't find any tables matching your
            criteria.
          </div>
          <v-btn color="primary" rounded="lg" elevation="0" class="text-none px-6 font-weight-bold"
            @click="search = ''; selectedSection = 'All Sections'">Clear All Filters</v-btn>
        </v-sheet>
      </v-col>
    </v-row>

    <!-- Refined Dialogs -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card rounded="xl" class="premium-dialog" elevation="24">
        <v-card-title class="d-flex align-center px-6 pt-6 pb-2">
          <v-avatar color="#e6f9f0" class="mr-3 text-success">
            <v-icon color="#16c65b">mdi-qrcode-scan</v-icon>
          </v-avatar>
          <v-sheet class="text-h5 font-weight-black title-black" color="transparent"
            style="letter-spacing: -0.5px">Register
            New Table</v-sheet>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="tonal" color="grey-darken-1" size="small" @click="showAddDialog = false"
            class="bg-grey-lighten-4 rounded-lg"></v-btn>
        </v-card-title>

        <v-card-text class="px-6 pt-4">
          <v-container class="pa-0">
            <v-row>
              <v-col cols="12">
                <span class="text-subtitle-2 font-weight-bold text-grey-darken-2 pl-2">Unit Identifier</span>
                <v-text-field v-model="newTable.table_number" type="number" variant="outlined" color="#16c65b"
                  rounded="lg" class="mt-1 modern-input" prepend-inner-icon="mdi-pound"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <span class="text-subtitle-2 font-weight-bold text-grey-darken-2 pl-2">Capacity</span>
                <v-text-field v-model="newTable.capacity" type="number" variant="outlined" color="#16c65b" rounded="lg"
                  class="mt-1 modern-input" prepend-inner-icon="mdi-account-group"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <span class="text-subtitle-2 font-weight-bold text-grey-darken-2 pl-2">Dining Zone</span>
                <v-select v-model="newTable.location" :items="['Indoor', 'Patio', 'Bar']" variant="outlined"
                  color="#16c65b" rounded="lg" class="mt-1 modern-input" prepend-inner-icon="mdi-map-marker"></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" class="text-none font-weight-bold px-4 hover-grey-btn" color="grey-darken-2" height="48"
            rounded="lg" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="#16c65b" class="text-none font-weight-bold px-8 text-white shadow-btn-green" height="48"
            rounded="lg" elevation="0" @click="addTable">Register Table</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card rounded="xl" class="premium-dialog" elevation="24" v-if="editTableData">
        <v-card-title class="d-flex align-center px-6 pt-6 pb-2">
          <v-avatar color="#eff6ff" class="mr-3 text-primary">
            <v-icon color="#3b82f6">mdi-pencil</v-icon>
          </v-avatar>
          <v-sheet class="text-h5 font-weight-black title-black" color="transparent" style="letter-spacing: -0.5px">Edit
            Unit #{{ editTableData.table_number }}</v-sheet>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="tonal" color="grey-darken-1" size="small" @click="showEditDialog = false"
            class="bg-grey-lighten-4 rounded-lg"></v-btn>
        </v-card-title>

        <v-card-text class="px-6 pt-4">
          <v-container class="pa-0">
            <v-row>
              <v-col cols="12">
                <span class="text-subtitle-2 font-weight-bold text-grey-darken-2 pl-2">Unit Identifier</span>
                <v-text-field v-model="editTableData.table_number" type="number" variant="outlined" color="#3b82f6"
                  rounded="lg" class="mt-1 modern-input" prepend-inner-icon="mdi-pound"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <span class="text-subtitle-2 font-weight-bold text-grey-darken-2 pl-2">Capacity</span>
                <v-text-field v-model="editTableData.capacity" type="number" variant="outlined" color="#3b82f6"
                  rounded="lg" class="mt-1 modern-input" prepend-inner-icon="mdi-account-group"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <span class="text-subtitle-2 font-weight-bold text-grey-darken-2 pl-2">Dining Zone</span>
                <v-select v-model="editTableData.location" :items="['Indoor', 'Patio', 'Bar']" variant="outlined"
                  color="#3b82f6" rounded="lg" class="mt-1 modern-input" prepend-inner-icon="mdi-map-marker"></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" class="text-none font-weight-bold px-4 hover-grey-btn" color="grey-darken-2" height="48"
            rounded="lg" @click="showEditDialog = false">Cancel</v-btn>
          <v-btn color="#3b82f6" class="text-none font-weight-bold px-8 text-white shadow-btn-subtle" height="48"
            rounded="lg" elevation="0" @click="saveEdit">Save Details</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Hidden Print Section (Optimized for Print Layout) -->
    <div class="print-only-section d-none">
      <template v-if="tableToPrint">
        <div class="print-container">
          <div class="print-header">
            Mlup Dong Restaurant
          </div>
          <div class="print-qr-card">
            <h1 class="print-table-number">Table {{ tableToPrint.table_number }}</h1>
            <div class="print-qr-wrapper">
              <img :src="getQrUrl(tableToPrint.qr_code)" class="print-qr-img" alt="Table QR Code" />
            </div>
            <p class="print-instruction">Scan to view menu & order</p>
          </div>
        </div>
      </template>
    </div>
  </v-container>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

::v-deep(*) {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.title-black {
  color: #0f172a !important;
  letter-spacing: -2px !important;
}

.title-green {
  color: #16c65b !important;
  letter-spacing: -2px !important;
}

/* 🌟 Premium Additional Styles 🌟 */

.page-header-wrap {
  position: relative;
  z-index: 2;
}

.title-gradient-black {
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px !important;
}

.title-gradient-green {
  background: linear-gradient(135deg, #16c65b 0%, #10b981 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -2px !important;
}

.stat-mini-card {
  background: white;
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid #f1f5f9 !important;
}

.stat-mini-card:hover {
  border-color: #dcfce7 !important;
  box-shadow: 0 10px 25px -5px rgba(22, 198, 91, 0.1) !important;
  transform: translateY(-2px);
}

.screenshot-card {
  background-color: #ffffff !important;
  border-radius: 32px !important;
  border: 1px solid #f1f5f9 !important;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.02) !important;
  padding: 24px !important;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.screenshot-card:hover {
  transform: translateY(-10px);
  box-shadow: 0px 30px 60px -15px rgba(15, 23, 42, 0.1) !important;
  border-color: #16c65b33 !important;
}

.screenshot-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 32px;
  background: radial-gradient(circle at top right, rgba(22, 198, 91, 0.03), transparent 70%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.screenshot-card:hover::before {
  opacity: 1;
}

.deployed-state .v-icon {
  animation: check-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite alternate;
}

@keyframes check-pop {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.1);
    filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.4));
  }
}

.footer-status-row {
  border-top: 1px dashed #f1f5f9;
  padding-top: 20px;
  background: linear-gradient(to bottom, transparent, rgba(248, 250, 252, 0.5));
  border-radius: 0 0 32px 32px;
}

.unit-id-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  color: #94a3b8 !important;
}

.card-title-text {
  letter-spacing: -0.5px;
}

.status-badge {
  font-size: 10px !important;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.05);
}

.chip-ready {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
  color: #166534 !important;
  border: 1px solid rgba(22, 163, 74, 0.1) !important;
}

.chip-pending {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%) !important;
  color: #92400e !important;
  border: 1px solid rgba(217, 119, 6, 0.1) !important;
}

.info-divider {
  border-color: #f1f5f9 !important;
}

.qr-container {
  background: #f8fafc !important;
  border-radius: 32px !important;
  padding: 16px !important;
  border: 1px solid #f1f5f9 !important;
}

.qr-inner-frame {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.03);
  position: relative;
}

.qr-image {
  border-radius: 12px;
  transition: transform 0.3s ease;
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

.uppercase-mini {
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.uppercase-main {
  font-size: 11px;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

.asset-btn {
  background-color: #f0fdf4 !important;
  border: 1px solid #dcfce7 !important;
  border-radius: 16px !important;
  transition: all 0.3s ease;
}

.asset-btn:hover {
  background-color: #dcfce7 !important;
  transform: translateX(4px);
}

.generate-btn {
  background-color: #eff6ff !important;
  border: 1px solid #dbeafe !important;
  border-radius: 16px !important;
  transition: all 0.3s ease;
}

.generate-btn:hover {
  background-color: #dbeafe !important;
  transform: translateX(4px);
}

.mini-action-btn {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 16px !important;
  transition: all 0.2s ease;
}

.mini-action-btn:hover {
  background-color: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

.footer-status-row {
  border-top: 1px solid #f8fafc;
  padding-top: 16px;
  margin-top: auto;
}

.border-subtle {
  border-color: rgba(0, 0, 0, 0.05) !important;
}

.border-dashed {
  border-style: dashed !important;
}

.shadow-sm {
  box-shadow: 0 4px 10px -2px rgba(0, 0, 0, 0.05) !important;
}

.pulse-dot {
  animation: status-pulse 1.5s infinite;
}

@keyframes status-pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.5);
    opacity: 0.4;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Menu Dropdown Polish */
.menu-item-hover {
  transition: all 0.2s ease;
}

.menu-item-hover:hover {
  background-color: #f1f5f9;
}

.menu-item-hover-danger {
  transition: all 0.2s ease;
}

.menu-item-hover-danger:hover {
  background-color: #fef2f2;
}

.premium-chip-group {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.filter-chip {
  background-color: transparent !important;
  color: #64748b !important;
}

.filter-chip:hover {
  background-color: rgba(241, 245, 249, 0.8) !important;
  color: #0f172a !important;
}

.active-filter-chip {
  background: #1e293b !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.25) !important;
}

/* Staggered load animation */
.stagger-col {
  animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes slideUpFade {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Update Interactions */
.update-text {
  transition: color 0.2s ease;
}

.update-text:hover {
  color: #0f172a !important;
}

.pulse-dot {
  animation: status-pulse 2s infinite;
}

@keyframes status-pulse {
  0% {
    opacity: 1;
    text-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
  }

  50% {
    opacity: 0.5;
    text-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
  }

  100% {
    opacity: 1;
    text-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
  }
}

/* Dialog Polish */
.premium-dialog {
  border: 1px solid rgba(226, 232, 240, 0.8) !important;
}

.modern-input :deep(.v-field) {
  background: #f8fafc !important;
  border-radius: 12px !important;
}

/* Print Overrides */
@media print {

  /* Hide the rest of the application completely */
  :deep(.v-application) .v-row,
  :deep(.v-application) .v-dialog,
  :deep(.v-application) .search-bar,
  .v-btn,
  header,
  nav,
  footer {
    display: none !important;
  }

  body,
  html,
  :deep(.v-application),
  :deep(.v-application__wrap) {
    background: white !important;
  }

  /* Take over the entire printable area */
  .print-only-section {
    display: flex !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    align-items: center;
    justify-content: center;
    background-color: white !important;
    z-index: 99999;
  }

  .print-container {
    text-align: center;
    width: 100%;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  .print-header {
    font-size: 24px;
    font-weight: 800;
    color: #16c65b;
    margin-bottom: 2cm;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .print-qr-card {
    display: inline-block;
    border: 2px solid #e2e8f0;
    border-radius: 40px;
    padding: 2cm 1.5cm;
    background: #ffffff;
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
    padding: 0.5cm;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 32px;
    margin-bottom: 1cm;
  }

  .print-qr-img {
    width: 12cm;
    height: 12cm;
    object-fit: contain;
  }

  .print-instruction {
    font-size: 24px;
    color: #64748b;
    font-weight: 600;
    margin: 0;
  }
}
</style>
