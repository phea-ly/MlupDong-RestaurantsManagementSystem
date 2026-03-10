<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const activeFilter     = ref('all')
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const showEditDialog   = ref(false)
const newTableName     = ref('')
const deletingId       = ref(null)
const editingTable     = ref(null)
const editForm         = ref({ name: '', status: 'available' })
const { locale } = useI18n()
const isKhmer = computed(() => locale.value === 'km')
const tr = (en, km) => (isKhmer.value ? km : en)

const tables = ref([
  { id: 1, name: 'Table 01', status: 'available' },
  { id: 2, name: 'Table 02', status: 'occupied' },
  { id: 3, name: 'Table 03', status: 'available' },
  { id: 4, name: 'Table 04', status: 'available' },
  { id: 5, name: 'Table 05', status: 'occupied' },
])

// ── Computed ───────────────────────────────────────────
const filteredTables   = computed(() =>
  activeFilter.value === 'all'
    ? tables.value
    : tables.value.filter(t => t.status === activeFilter.value)
)
const allCount       = computed(() => tables.value.length)
const availableCount = computed(() => tables.value.filter(t => t.status === 'available').length)
const occupiedCount  = computed(() => tables.value.filter(t => t.status === 'occupied').length)

// ── Create ─────────────────────────────────────────────
function openCreate() {
  newTableName.value     = ''
  showCreateDialog.value = true
}

function createTable() {
  if (!newTableName.value.trim()) return
  tables.value.push({
    id:     Date.now(),
    name:   newTableName.value.trim(),
    status: 'available',
  })
  showCreateDialog.value = false
}

// ── Edit ───────────────────────────────────────────────
function openEdit(table) {
  editingTable.value     = table
  editForm.value         = { name: table.name, status: table.status }
  showEditDialog.value   = true
}

function saveEdit() {
  if (!editingTable.value || !editForm.value.name.trim()) return
  editingTable.value.name   = editForm.value.name.trim()
  editingTable.value.status = editForm.value.status
  showEditDialog.value = false
}

// ── Delete ─────────────────────────────────────────────
function confirmDelete(id) {
  deletingId.value       = id
  showDeleteDialog.value = true
}

function handleDelete() {
  tables.value           = tables.value.filter(t => t.id !== deletingId.value)
  showDeleteDialog.value = false
  deletingId.value       = null
}

// ── QR Download (placeholder) ──────────────────────────
function downloadQR(table) {
  const svg    = generateQRSvg(table.name)
  const blob   = new Blob([svg], { type: 'image/svg+xml' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = `${table.name.replace(/\s+/g, '-')}-QR.svg`
  a.click()
  URL.revokeObjectURL(url)
}

function exportAllQR() {
  tables.value.forEach(t => downloadQR(t))
}

function statusLabel(status) {
  if (status === 'available') return tr('AVAILABLE', 'ទំនេរ')
  return tr('OCCUPIED', 'កំពុងប្រើ')
}

// ── QR SVG generator ──────────────────────────────────
function generateQRSvg(label = '') {
  return `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='110' viewBox='0 0 100 110'>
    <rect width='100' height='100' fill='#f7faf9'/>
    <rect x='10' y='10' width='28' height='28' rx='2' fill='none' stroke='#122039' stroke-width='3'/>
    <rect x='16' y='16' width='16' height='16' rx='1' fill='#122039'/>
    <rect x='62' y='10' width='28' height='28' rx='2' fill='none' stroke='#122039' stroke-width='3'/>
    <rect x='68' y='16' width='16' height='16' rx='1' fill='#122039'/>
    <rect x='10' y='62' width='28' height='28' rx='2' fill='none' stroke='#122039' stroke-width='3'/>
    <rect x='16' y='68' width='16' height='16' rx='1' fill='#122039'/>
    <rect x='62' y='62' width='8' height='8' fill='#122039'/>
    <rect x='74' y='62' width='8' height='8' fill='#122039'/>
    <rect x='62' y='74' width='8' height='8' fill='#122039'/>
    <rect x='74' y='74' width='8' height='8' fill='#122039'/>
    <rect x='86' y='62' width='4' height='4' fill='#122039'/>
    <rect x='86' y='74' width='4' height='4' fill='#122039'/>
    <rect x='44' y='10' width='6' height='6' fill='#122039'/>
    <rect x='44' y='22' width='6' height='6' fill='#122039'/>
    <rect x='44' y='44' width='6' height='6' fill='#122039'/>
    <rect x='44' y='56' width='6' height='6' fill='#122039'/>
    <text x='50' y='108' font-size='9' font-family='sans-serif' font-weight='700' fill='#9aabbd' text-anchor='middle'>${label}</text>
  </svg>`
}
</script>

<template>
  <div>

    <!-- ── Action Bar ── -->
    <div class="action-bar">

      <!-- Filter tabs -->
      <div class="tab-group">
        <button
          class="tab-btn" :class="{ active: activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >{{ tr('All Tables', 'តុទាំងអស់') }} ({{ allCount }})</button>
        <button
          class="tab-btn" :class="{ active: activeFilter === 'available' }"
          @click="activeFilter = 'available'"
        >{{ tr('Available', 'ទំនេរ') }} ({{ availableCount }})</button>
        <button
          class="tab-btn" :class="{ active: activeFilter === 'occupied' }"
          @click="activeFilter = 'occupied'"
        >{{ tr('Occupied', 'កំពុងប្រើ') }} ({{ occupiedCount }})</button>
      </div>

      <div style="margin-left:auto" class="d-flex align-center ga-2">
        <span class="last-updated">
          <v-icon size="13" color="#9aabbd">mdi-clock-outline</v-icon>
          {{ tr('Last updated: Just now', 'បានធ្វើបច្ចុប្បន្នភាព: មុននេះបន្តិច') }}
        </span>
        <button class="btn-outline" @click="exportAllQR">
          <v-icon size="16">mdi-download-outline</v-icon>
          {{ tr('Export All QR', 'នាំចេញ QR ទាំងអស់') }}
        </button>
        <button class="btn-add" @click="openCreate">
          <v-icon size="17" color="#063824">mdi-plus</v-icon>
          {{ tr('Create Table', 'បង្កើតតុ') }}
        </button>
      </div>

    </div>

    <!-- ── Table Grid ── -->
    <div class="table-grid">

      <div v-for="table in filteredTables" :key="table.id" class="table-card">

        <!-- Card header -->
        <div class="card-top">
          <p class="table-name">{{ table.name }}</p>
          <span
            class="status-chip"
            :class="table.status === 'available' ? 'chip-available' : 'chip-occupied'"
          >{{ statusLabel(table.status) }}</span>
        </div>

        <!-- QR Code -->
        <div class="qr-box" v-html="generateQRSvg(table.name)"></div>

        <!-- Download QR -->
        <button class="btn-download" @click="downloadQR(table)">
          <v-icon size="15">mdi-download-outline</v-icon>
          {{ tr('Download QR', 'ទាញយក QR') }}
        </button>

        <!-- Actions -->
        <div class="card-actions">
          <button class="act-btn edit" @click="openEdit(table)">
            <v-icon size="15">mdi-pencil-outline</v-icon>
            {{ tr('Edit', 'កែប្រែ') }}
          </button>
          <button class="act-btn del" @click="confirmDelete(table.id)">
            <v-icon size="15">mdi-trash-can-outline</v-icon>
            {{ tr('Delete', 'លុប') }}
          </button>
        </div>

      </div>

      <!-- Add new card -->
      <div class="table-card add-card" @click="openCreate">
        <v-icon size="36" color="#c8d4dc">mdi-plus-circle-outline</v-icon>
        <p class="add-label">{{ tr('Add New Table', 'បន្ថែមតុថ្មី') }}</p>
      </div>

    </div>

    <!-- Empty state -->
    <div v-if="filteredTables.length === 0" class="empty-state">
      <v-icon size="40" color="#d1dce4">mdi-table-furniture</v-icon>
      <p class="empty-title">{{ tr('No tables found', 'មិនមានតុ') }}</p>
      <p class="empty-sub">{{ tr('Try a different filter or create a new table.', 'សូមប្តូរតម្រង ឬ បង្កើតតុថ្មី។') }}</p>
    </div>

    <!-- ── Print CTA ── -->
    <div class="print-card">
      <div class="d-flex align-center ga-3">
        <div class="print-icon">
          <v-icon color="#0f9e5f" size="22">mdi-printer-outline</v-icon>
        </div>
        <div>
          <p class="print-title">{{ tr('Ready to Print?', 'រួចរាល់សម្រាប់បោះពុម្ព?') }}</p>
          <p class="print-sub">{{ tr('Download all your table QR codes as a high-quality PDF for professional printing.', 'ទាញយក QR កូដតុទាំងអស់ជាឯកសារ PDF គុណភាពខ្ពស់ សម្រាប់បោះពុម្ព។') }}</p>
        </div>
      </div>
      <button class="btn-print" @click="exportAllQR">
        <v-icon size="16" color="#063824">mdi-file-pdf-box</v-icon>
        {{ tr('Generate Print-Ready PDF', 'បង្កើត PDF សម្រាប់បោះពុម្ព') }}
      </button>
    </div>

    <!-- ── Create Table Dialog ── -->
    <v-dialog v-model="showCreateDialog" max-width="420" rounded="xl">
      <v-card rounded="xl" class="pa-6" elevation="0">
        <p class="dialog-title mb-5">{{ tr('Create New Table', 'បង្កើតតុថ្មី') }}</p>
        <div class="mb-4">
          <label class="form-label">{{ tr('Table Name', 'ឈ្មោះតុ') }}</label>
          <input
            class="form-input"
            v-model="newTableName"
            :placeholder="tr('e.g. Table 06', 'ឧ. តុ 06')"
            @keyup.enter="createTable"
          />
        </div>
        <div class="d-flex justify-end ga-2">
          <button class="btn-cancel" @click="showCreateDialog = false">{{ tr('Cancel', 'បោះបង់') }}</button>
          <button class="btn-save"   @click="createTable">{{ tr('Create Table', 'បង្កើតតុ') }}</button>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── Edit Table Dialog ── -->
    <v-dialog v-model="showEditDialog" max-width="420" rounded="xl">
      <v-card rounded="xl" class="pa-6" elevation="0">
        <p class="dialog-title mb-5">{{ tr('Edit Table', 'កែប្រែតុ') }}</p>
        <div class="mb-3">
          <label class="form-label">{{ tr('Table Name', 'ឈ្មោះតុ') }}</label>
          <input
            class="form-input"
            v-model="editForm.name"
            :placeholder="tr('e.g. Table 06', 'ឧ. តុ 06')"
          />
        </div>
        <div class="mb-4">
          <label class="form-label">{{ tr('Status', 'ស្ថានភាព') }}</label>
          <div class="filter-select">
            <select v-model="editForm.status">
              <option value="available">{{ tr('Available', 'ទំនេរ') }}</option>
              <option value="occupied">{{ tr('Occupied', 'កំពុងប្រើ') }}</option>
            </select>
            <v-icon size="16" color="#9aabbd">mdi-chevron-down</v-icon>
          </div>
        </div>
        <div class="d-flex justify-end ga-2">
          <button class="btn-cancel" @click="showEditDialog = false">{{ tr('Cancel', 'បោះបង់') }}</button>
          <button class="btn-save"   @click="saveEdit">{{ tr('Save Changes', 'រក្សាទុកការផ្លាស់ប្តូរ') }}</button>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── Delete Confirmation Dialog ── -->
    <v-dialog v-model="showDeleteDialog" max-width="400" rounded="xl">
      <v-card rounded="xl" class="pa-6" elevation="0">
        <div class="d-flex align-center ga-3 mb-4">
          <div class="delete-icon-wrap">
            <v-icon size="22" color="#ef4444">mdi-trash-can-outline</v-icon>
          </div>
          <p class="dialog-title">{{ tr('Delete Table', 'លុបតុ') }}</p>
        </div>
        <p class="dialog-body">
          {{ tr('Are you sure you want to delete this table? This action cannot be undone.', 'តើអ្នកប្រាកដទេថាចង់លុបតុនេះ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។') }}
        </p>
        <div class="d-flex justify-end ga-2 mt-5">
          <button class="btn-cancel" @click="showDeleteDialog = false">{{ tr('Cancel', 'បោះបង់') }}</button>
          <button class="btn-delete" @click="handleDelete">{{ tr('Delete', 'លុប') }}</button>
        </div>
      </v-card>
    </v-dialog>

  </div>
</template>

<style scoped>
/* ── Action Bar ── */
.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* Filter tabs */
.tab-group {
  display: flex;
  gap: 2px;
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 10px;
  padding: 4px;
}

.tab-btn {
  padding: 6px 16px;
  border-radius: 7px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  color: #6b7f96;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}
.tab-btn:hover  { background: #f0f7f4; color: #122039; }
.tab-btn.active { background: #122039; color: #fff; }

.last-updated {
  font-size: 12px;
  color: #9aabbd;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

/* Buttons */
.btn-outline {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid #dbe3e7;
  background: #fff;
  font-size: 13px;
  font-weight: 700;
  color: #3d5166;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-outline:hover { background: #f6f9f8; }
.btn-outline :deep(.v-icon) { color: #6b7f96; }

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 18px;
  border-radius: 8px;
  border: none;
  background: #14dc8b;
  color: #063824;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-add:hover { background: #0fcb7e; }

/* ── Table Grid ── */
.table-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.table-card {
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-card {
  border: 2px dashed #dbe3e7 !important;
  background: #f6f9f8 !important;
  align-items: center;
  justify-content: center;
  min-height: 230px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 8px;
}
.add-card:hover { border-color: #14dc8b !important; background: rgba(20,220,139,.04) !important; }

.add-label {
  font-size: 12px;
  font-weight: 800;
  color: #9aabbd;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 0;
}

/* Card top */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-name {
  font-size: 16px;
  font-weight: 900;
  color: #122039;
  margin: 0;
}

.status-chip {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.06em;
}
.chip-available { background: #d4f7e8; color: #0a7a4a; }
.chip-occupied  { background: #fef3c7; color: #92400e; }

/* QR box */
.qr-box {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f6f9f8;
  border: 1.5px dashed #dbe3e7;
  border-radius: 10px;
  padding: 14px;
}

/* Download QR button */
.btn-download {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #dbe3e7;
  background: #fff;
  font-size: 12px;
  font-weight: 700;
  color: #3d5166;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.btn-download:hover { background: #f6f9f8; border-color: #b0c4ce; }
.btn-download :deep(.v-icon) { color: #6b7f96; }

/* Card actions */
.card-actions {
  display: flex;
  justify-content: space-between;
}

.act-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 700;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  font-family: inherit;
  transition: all 0.15s;
}
.act-btn.edit { color: #3d5166; }
.act-btn.edit:hover { background: #f0f7f4; color: #0f9e5f; }
.act-btn.del  { color: #9aabbd; }
.act-btn.del:hover  { background: #fff1f2; color: #ef4444; }
.act-btn :deep(.v-icon) { color: inherit; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 60px 20px;
  text-align: center;
}
.empty-title { font-size: 16px; font-weight: 800; color: #122039; margin: 0; }
.empty-sub   { font-size: 13px; color: #9aabbd; margin: 0; }

/* ── Print Card ── */
.print-card {
  background: #f0faf5;
  border: 1px solid #c8ead8;
  border-radius: 14px;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.print-icon {
  width: 44px; height: 44px; border-radius: 10px;
  background: #e6f9f0;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.print-title { font-size: 14px; font-weight: 800; color: #122039; margin: 0 0 2px; }
.print-sub   { font-size: 12px; color: #6b7f96; margin: 0; }

.btn-print {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 20px;
  border-radius: 8px;
  border: none;
  background: #14dc8b;
  color: #063824;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-print:hover { background: #0fcb7e; }

/* ── Dialogs ── */
.dialog-title {
  font-size: 18px; font-weight: 900; color: #122039; margin: 0;
}
.dialog-body {
  font-size: 13.5px; color: #6b7f96; margin: 0; line-height: 1.6;
}

.form-label {
  font-size: 10px; font-weight: 800; color: #6b7f96;
  letter-spacing: 0.07em; text-transform: uppercase;
  display: block; margin-bottom: 5px;
}

.form-input {
  width: 100%; padding: 9px 12px;
  border: 1px solid #dbe3e7; border-radius: 8px;
  font-size: 13.5px; color: #122039; outline: none;
  font-family: inherit; box-sizing: border-box;
  transition: border-color 0.15s; background: #fff;
}
.form-input:focus { border-color: #14dc8b; }

.filter-select {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 8px;
  padding: 0 10px;
  height: 40px;
}
.filter-select select {
  border: none; outline: none; background: transparent;
  font-size: 13.5px; font-weight: 600; color: #122039;
  font-family: inherit; cursor: pointer;
  appearance: none; -webkit-appearance: none;
  width: 100%;
}

.btn-cancel {
  padding: 9px 18px; border-radius: 8px;
  border: 1px solid #dbe3e7; background: #fff;
  font-size: 13.5px; font-weight: 700; color: #3d5166;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.btn-cancel:hover { background: #f6f9f8; }

.btn-save {
  padding: 9px 20px; border-radius: 8px; border: none;
  background: #14dc8b; color: #063824;
  font-size: 13.5px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.btn-save:hover { background: #0fcb7e; }

.delete-icon-wrap {
  width: 42px; height: 42px; border-radius: 10px;
  background: #fff1f2; border: 1px solid #fca5a5;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.btn-delete {
  padding: 9px 18px; border-radius: 8px; border: none;
  background: #ef4444; color: #fff;
  font-size: 13.5px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.btn-delete:hover { background: #dc2626; }
</style>
