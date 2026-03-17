<script setup>
import { storeToRefs } from "pinia";
import { useTableStore } from "@/stores";

const tableStore = useTableStore();

const {
  activeFilter,
  showCreateDialog,
  showDeleteDialog,
  showEditDialog,
  newTableName,
  editForm,
  tables,
  filteredTables,
  allCount,
  availableCount,
  occupiedCount,
} = storeToRefs(tableStore);

const {
  openCreate,
  createTable,
  openEdit,
  saveEdit,
  confirmDelete,
  handleDelete,
  downloadQR,
  exportAllQR,
  generateQRSvg,
} = tableStore;
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
        >All Tables ({{ allCount }})</button>
        <button
          class="tab-btn" :class="{ active: activeFilter === 'available' }"
          @click="activeFilter = 'available'"
        >Available ({{ availableCount }})</button>
        <button
          class="tab-btn" :class="{ active: activeFilter === 'occupied' }"
          @click="activeFilter = 'occupied'"
        >Occupied ({{ occupiedCount }})</button>
      </div>

      <div style="margin-left:auto" class="d-flex align-center ga-2">
        <span class="last-updated">
          <v-icon size="13" color="#9aabbd">mdi-clock-outline</v-icon>
          Last updated: Just now
        </span>
        <button class="btn-outline" @click="exportAllQR">
          <v-icon size="16">mdi-download-outline</v-icon>
          Export All QR
        </button>
        <button class="btn-add" @click="openCreate">
          <v-icon size="17" color="#063824">mdi-plus</v-icon>
          Create Table
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
          >{{ table.status.toUpperCase() }}</span>
        </div>

        <!-- QR Code -->
        <div class="qr-box" v-html="generateQRSvg(table.name)"></div>

        <!-- Download QR -->
        <button class="btn-download" @click="downloadQR(table)">
          <v-icon size="15">mdi-download-outline</v-icon>
          Download QR
        </button>

        <!-- Actions -->
        <div class="card-actions">
          <button class="act-btn edit" @click="openEdit(table)">
            <v-icon size="15">mdi-pencil-outline</v-icon>
            Edit
          </button>
          <button class="act-btn del" @click="confirmDelete(table.id)">
            <v-icon size="15">mdi-trash-can-outline</v-icon>
            Delete
          </button>
        </div>

      </div>

      <!-- Add new card -->
      <div class="table-card add-card" @click="openCreate">
        <v-icon size="36" color="#c8d4dc">mdi-plus-circle-outline</v-icon>
        <p class="add-label">Add New Table</p>
      </div>

    </div>

    <!-- Empty state -->
    <div v-if="filteredTables.length === 0" class="empty-state">
      <v-icon size="40" color="#d1dce4">mdi-table-furniture</v-icon>
      <p class="empty-title">No tables found</p>
      <p class="empty-sub">Try a different filter or create a new table.</p>
    </div>

    <!-- ── Print CTA ── -->
    <div class="print-card">
      <div class="d-flex align-center ga-3">
        <div class="print-icon">
          <v-icon color="var(--app-primary-600)" size="22">mdi-printer-outline</v-icon>
        </div>
        <div>
          <p class="print-title">Ready to Print?</p>
          <p class="print-sub">Download all your table QR codes as a high-quality PDF for professional printing.</p>
        </div>
      </div>
      <button class="btn-print" @click="exportAllQR">
        <v-icon size="16" color="#063824">mdi-file-pdf-box</v-icon>
        Generate Print-Ready PDF
      </button>
    </div>

    <!-- ── Create Table Dialog ── -->
    <v-dialog v-model="showCreateDialog" max-width="420" rounded="xl">
      <v-card rounded="xl" class="pa-6" elevation="0">
        <p class="dialog-title mb-5">Create New Table</p>
        <div class="mb-4">
          <label class="form-label">Table Name</label>
          <input
            class="form-input"
            v-model="newTableName"
            placeholder="e.g. Table 06"
            @keyup.enter="createTable"
          />
        </div>
        <div class="d-flex justify-end ga-2">
          <button class="btn-cancel" @click="showCreateDialog = false">Cancel</button>
          <button class="btn-save"   @click="createTable">Create Table</button>
        </div>
      </v-card>
    </v-dialog>

    <!-- ── Edit Table Dialog ── -->
    <v-dialog v-model="showEditDialog" max-width="420" rounded="xl">
      <v-card rounded="xl" class="pa-6" elevation="0">
        <p class="dialog-title mb-5">Edit Table</p>
        <div class="mb-3">
          <label class="form-label">Table Name</label>
          <input
            class="form-input"
            v-model="editForm.name"
            placeholder="e.g. Table 06"
          />
        </div>
        <div class="mb-4">
          <label class="form-label">Status</label>
          <div class="filter-select">
            <select v-model="editForm.status">
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>
            <v-icon size="16" color="#9aabbd">mdi-chevron-down</v-icon>
          </div>
        </div>
        <div class="d-flex justify-end ga-2">
          <button class="btn-cancel" @click="showEditDialog = false">Cancel</button>
          <button class="btn-save"   @click="saveEdit">Save Changes</button>
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
          <p class="dialog-title">Delete Table</p>
        </div>
        <p class="dialog-body">
          Are you sure you want to delete this table? This action cannot be undone.
        </p>
        <div class="d-flex justify-end ga-2 mt-5">
          <button class="btn-cancel" @click="showDeleteDialog = false">Cancel</button>
          <button class="btn-delete" @click="handleDelete">Delete</button>
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
  background: var(--app-primary);
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
.add-card:hover { border-color: var(--app-primary) !important; background: rgba(20,220,139,.04) !important; }

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
.act-btn.edit:hover { background: #f0f7f4; color: var(--app-primary-600); }
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
  background: var(--app-primary);
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
.form-input:focus { border-color: var(--app-primary); }

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
  background: var(--app-primary); color: #063824;
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

