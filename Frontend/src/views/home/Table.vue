<template>
  <div class="page">

    <!-- ── PAGE HEADER ─────────────────────────────── -->
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="page-icon">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        </div>
        <div>
          <h1 class="page-title">Table <span class="accent">Management</span></h1>
          <p class="page-sub">Generate QR codes and manage your restaurant floor layout</p>
        </div>
      </div>
      <div class="page-header-right">
        <button class="btn-ghost" @click="generateAll" :disabled="generatingAll || tables.length === 0">
          <span class="spin-sm" v-if="generatingAll"></span>
          <svg v-else viewBox="0 0 20 20" fill="currentColor" style="width:15px">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
          </svg>
          {{ generatingAll ? 'Generating…' : 'Bulk QR' }}
        </button>
        <button class="btn-primary" @click="openAddModal">
          <svg viewBox="0 0 20 20" fill="currentColor" style="width:15px"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>
          Add Table
        </button>
      </div>
    </div>

    <!-- ── STATS BAR ────────────────────────────────── -->
    <div class="stats-bar" v-if="!loading && !fetchError">
      <div class="stat-pill">
        <svg viewBox="0 0 20 20" fill="currentColor" class="stat-icon teal"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z"/></svg>
        <span class="stat-num">{{ tables.length }}</span>
        <span class="stat-label">Total Tables</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-pill">
        <svg viewBox="0 0 20 20" fill="currentColor" class="stat-icon green"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
        <span class="stat-num">{{ tables.filter(t => t.qr_code_path).length }}</span>
        <span class="stat-label">QR Active</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-pill">
        <svg viewBox="0 0 20 20" fill="currentColor" class="stat-icon orange"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
        <span class="stat-num">{{ tables.filter(t => !t.qr_code_path).length }}</span>
        <span class="stat-label">Need QR</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-pill">
        <svg viewBox="0 0 20 20" fill="currentColor" class="stat-icon blue"> <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
        <span class="stat-num">{{ tables.reduce((a, t) => a + (t.capacity || 0), 0) }}</span>
        <span class="stat-label">Total Seats</span>
      </div>
    </div>

    <!-- ── STATES ───────────────────────────────────── -->
    <div v-if="loading" class="state-box">
      <div class="pulse-rings"><div class="ring"></div><div class="ring"></div><div class="ring"></div></div>
      <p class="state-text">Loading tables…</p>
    </div>

    <div v-else-if="fetchError" class="state-box">
      <div class="state-icon-err">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:28px">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <p class="state-text-err">{{ fetchError }}</p>
      <button class="btn-primary" @click="fetchTables">Retry</button>
    </div>

    <div v-else-if="tables.length === 0" class="state-box">
      <div class="state-empty-visual">
        <svg viewBox="0 0 80 80" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="width:72px">
          <rect x="6" y="6" width="30" height="30" rx="5"/><rect x="44" y="6" width="30" height="30" rx="5"/>
          <rect x="6" y="44" width="30" height="30" rx="5"/><rect x="44" y="44" width="30" height="30" rx="5" stroke-dasharray="4 3"/>
        </svg>
      </div>
      <p class="state-title">No tables yet</p>
      <p class="state-text">Add your first table to get started</p>
      <button class="btn-primary" @click="openAddModal">
        <svg viewBox="0 0 20 20" fill="currentColor" style="width:14px"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>
        Add First Table
      </button>
    </div>

    <!-- ── GRID ────────────────────────────────────── -->
    <div v-else class="grid">
      <div v-for="table in tables" :key="table.id" class="card" :class="{ 'card-active': table.qr_code_path }">

        <!-- Card top row -->
        <div class="card-row">
          <div class="card-num-badge">T{{ table.table_number }}</div>
          <span class="status-chip" :class="table.qr_code_path ? 'chip-on' : 'chip-off'">
            <span class="chip-dot"></span>
            {{ table.qr_code_path ? 'Active' : 'Pending' }}
          </span>
        </div>

        <!-- Table Info -->
        <div class="card-info">
          <p class="card-name">Table <strong>{{ table.table_number }}</strong></p>
          <div class="card-meta">
            <span class="meta-tag">
              <svg viewBox="0 0 20 20" fill="currentColor" style="width:11px;opacity:.6"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
              {{ table.capacity }} seats
            </span>
            <span class="meta-tag" v-if="table.location">
              <svg viewBox="0 0 20 20" fill="currentColor" style="width:11px;opacity:.6"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
              {{ table.location }}
            </span>
          </div>
        </div>

        <!-- QR Display -->
        <div class="qr-box" @click="table.qr_code_path && openPreview(table)" :class="{ 'qr-box-clickable': table.qr_code_path }">
          <div v-if="table.qr_code_path" class="qr-inner">
            <div class="qr-frame">
              <img :src="'/' + table.qr_code_path" :alt="'QR ' + table.table_number" class="qr-img">
            </div>
            <div class="qr-overlay">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:22px">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
              <span>Preview</span>
            </div>
          </div>
          <div v-else class="qr-empty">
            <div class="qr-empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:36px;color:#94a3b8">
                <rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/>
                <rect x="4" y="13" width="7" height="7" rx="1.5"/>
                <rect x="13" y="16" width="4" height="4" rx="1"/><rect x="19" y="13" width="2" height="2" rx=".5"/>
                <rect x="17" y="19" width="4" height="2" rx=".5"/><rect x="13" y="13" width="2" height="1" rx=".5"/>
              </svg>
            </div>
            <p class="qr-empty-text">No QR code</p>
            <p class="qr-empty-sub">Click "Generate" to create</p>
          </div>
        </div>

        <!-- Card Actions -->
        <div class="card-actions">
          <button class="btn-gen" @click="generateQr(table)" :disabled="table._generating" :class="{ 'btn-gen-regen': table.qr_code_path }">
            <span class="spin-sm" v-if="table._generating"></span>
            <template v-else>
              <svg v-if="!table.qr_code_path" viewBox="0 0 20 20" fill="currentColor" style="width:13px"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>
              <svg v-else viewBox="0 0 20 20" fill="currentColor" style="width:13px"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>
            </template>
            {{ table._generating ? 'Generating…' : (table.qr_code_path ? 'Regenerate' : 'Generate QR') }}
          </button>
          <button class="btn-icon" @click="editTable(table)" title="Edit table">
            <svg viewBox="0 0 20 20" fill="currentColor" style="width:14px"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
          </button>
          <button class="btn-icon btn-icon-del" @click="deleteTable(table)" title="Delete table">
            <svg viewBox="0 0 20 20" fill="currentColor" style="width:14px"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
          </button>
        </div>

        <p class="card-error" v-if="table._error">{{ table._error }}</p>
      </div>
    </div>

    <!-- ── QR PREVIEW MODAL ─────────────────────────── -->
    <transition name="modal-fade">
      <div v-if="previewTable" class="overlay" @click.self="closePreview">
        <div class="qr-modal">
          <div class="qr-modal-left">
            <div class="qr-modal-badge">Table {{ previewTable.table_number }}</div>
            <div class="qr-modal-frame">
              <img :src="'/' + previewTable.qr_code_path" :alt="'QR Table ' + previewTable.table_number" class="qr-modal-img">
            </div>
            <div class="qr-modal-brand">
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" style="width:14px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              ML Up Dong Restaurant
            </div>
          </div>

          <div class="qr-modal-right">
            <div class="qr-modal-header">
              <div>
                <h2 class="qr-modal-title">QR Code Preview</h2>
                <p class="qr-modal-sub">Scan to access the digital menu</p>
              </div>
              <button class="close-btn" @click="closePreview">
                <svg viewBox="0 0 20 20" fill="currentColor" style="width:16px"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
              </button>
            </div>

            <div class="modal-info-block">
              <p class="modal-label">Table Details</p>
              <div class="modal-detail-row">
                <span class="detail-key">Number</span>
                <span class="detail-val">Table {{ previewTable.table_number }}</span>
              </div>
              <div class="modal-detail-row" v-if="previewTable.location">
                <span class="detail-key">Location</span>
                <span class="detail-val">{{ previewTable.location }}</span>
              </div>
              <div class="modal-detail-row">
                <span class="detail-key">Capacity</span>
                <span class="detail-val">{{ previewTable.capacity }} persons</span>
              </div>
            </div>

            <div class="modal-info-block">
              <p class="modal-label">Scan URL</p>
              <div class="url-box">{{ menuUrl(previewTable.qr_token) }}</div>
            </div>

            <div class="modal-steps-block">
              <p class="modal-label">How it works</p>
              <div class="modal-step"><span class="step-num">1</span>Customer opens camera app</div>
              <div class="modal-step"><span class="step-num">2</span>Aims at this QR code</div>
              <div class="modal-step"><span class="step-num">3</span>Browses menu & places order</div>
            </div>

            <div class="modal-footer">
              <a :href="'/' + previewTable.qr_code_path" :download="'table-' + previewTable.table_number + '-qr.svg'" class="btn-download">
                <svg viewBox="0 0 20 20" fill="currentColor" style="width:15px"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                Download QR
              </a>
              <button class="btn-regen-modal" @click="generateQr(previewTable); closePreview()">
                <svg viewBox="0 0 20 20" fill="currentColor" style="width:15px"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── ADD / EDIT MODAL ────────────────────────── -->
    <transition name="modal-fade">
      <div v-if="showFormModal" class="overlay" @click.self="closeFormModal">
        <div class="form-modal">
          <div class="form-modal-header">
            <div class="form-modal-icon">
              <svg viewBox="0 0 20 20" fill="currentColor" style="width:18px;color:white">
                <path v-if="!isEditing" fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
                <path v-else d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
            </div>
            <div>
              <h3 class="form-modal-title">{{ isEditing ? 'Edit Table' : 'Register New Table' }}</h3>
              <p class="form-modal-sub">{{ isEditing ? 'Update the details for this dining unit' : 'Fill in the details for your new dining unit' }}</p>
            </div>
            <button class="close-btn" @click="closeFormModal" style="margin-left:auto">
              <svg viewBox="0 0 20 20" fill="currentColor" style="width:16px"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="form-body">
            <div class="form-row-2">
              <div class="form-field">
                <label class="field-label">Table Number <span class="required">*</span></label>
                <input type="number" v-model.number="formTable.table_number" placeholder="e.g. 5" required min="1" class="field-input">
              </div>
              <div class="form-field">
                <label class="field-label">Capacity <span class="required">*</span></label>
                <input type="number" v-model.number="formTable.capacity" placeholder="e.g. 4" required min="1" class="field-input">
              </div>
            </div>

            <div class="form-field">
              <label class="field-label">Location / Area</label>
              <input type="text" v-model="formTable.location" placeholder="e.g. Indoor, Garden, VIP Lounge" class="field-input">
            </div>

            <div class="form-field">
              <label class="field-label">Availability</label>
              <div class="toggle-group">
                <label class="toggle-opt" :class="{ active: formTable.status === 'available' }">
                  <input type="radio" v-model="formTable.status" value="available" style="display:none">
                  <svg viewBox="0 0 20 20" fill="currentColor" style="width:14px"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                  Available
                </label>
                <label class="toggle-opt" :class="{ active: formTable.status === 'unavailable', 'active-off': formTable.status === 'unavailable' }">
                  <input type="radio" v-model="formTable.status" value="unavailable" style="display:none">
                  <svg viewBox="0 0 20 20" fill="currentColor" style="width:14px"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
                  Unavailable
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="closeFormModal">Cancel</button>
              <button type="submit" class="btn-submit" :disabled="submitting">
                <span class="spin-sm" v-if="submitting" style="border-top-color:white;border-color:rgba(255,255,255,.3)"></span>
                <span v-else>{{ isEditing ? 'Save Changes' : 'Register Table' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import api from '@/api/api';

const FRONTEND_URL = window.location.origin;

export default {
  name: 'TableManagement',
  data() {
    return {
      tables: [],
      loading: true,
      fetchError: null,
      generatingAll: false,
      previewTable: null,
      showFormModal: false,
      isEditing: false,
      submitting: false,
      formTable: { table_number: null, capacity: 4, location: '', status: 'available' },
    };
  },
  async created() {
    await this.fetchTables();
  },
  methods: {
    menuUrl(token) {
      return token ? `${FRONTEND_URL}/menu/${token}` : '(not generated yet)';
    },
    async fetchTables() {
      this.loading = true;
      this.fetchError = null;
      try {
        const res = await api.get('/tables');
        this.tables = res.data.map(t => ({
          ...t,
          id: t.table_id || t.id,
          qr_code_path: t.qr_code || t.qr_code_path,
          qr_token: t.qr_code_url || t.qr_token,
          _generating: false,
          _error: null,
        }));
      } catch (e) {
        console.error(e);
        this.fetchError = 'Failed to load tables. Is the backend running?';
      } finally {
        this.loading = false;
      }
    },
    async generateQr(table) {
      table._generating = true;
      table._error = null;
      try {
        const res = await api.post(`/tables/${table.table_id || table.id}/generate-qr`);
        const fresh = res.data;
        Object.assign(table, {
          ...fresh,
          id: fresh.table_id || fresh.id,
          qr_code_path: fresh.qr_code || fresh.qr_code_path,
          qr_token: fresh.qr_code_url || fresh.qr_token,
          _generating: false,
          _error: null,
        });
        // Add cache-bust to force image reload
        table.qr_code_path = table.qr_code_path + '?t=' + Date.now();
      } catch (err) {
        table._error = err.response?.data?.message || 'Generation failed.';
      } finally {
        table._generating = false;
      }
    },
    async generateAll() {
      this.generatingAll = true;
      try {
        await api.post('/tables/generate-all');
        await this.fetchTables();
      } catch {
        alert('Bulk generation failed.');
      } finally {
        this.generatingAll = false;
      }
    },
    openPreview(table) { this.previewTable = table; },
    closePreview()     { this.previewTable = null; },
    openAddModal() {
      this.isEditing = false;
      this.formTable = { table_number: null, capacity: 4, location: '', status: 'available' };
      this.showFormModal = true;
    },
    openEditModal(table) {
      this.isEditing = true;
      this.formTable = {
        id: table.table_id || table.id,
        table_number: table.table_number,
        capacity: table.capacity,
        location: table.location || '',
        status: table.status || 'available',
      };
      this.showFormModal = true;
    },
    closeFormModal() { this.showFormModal = false; },
    async submitForm() {
      this.submitting = true;
      try {
        if (this.isEditing) {
          await api.put(`/tables/${this.formTable.id}`, this.formTable);
        } else {
          await api.post('/tables', this.formTable);
        }
        await this.fetchTables();
        this.closeFormModal();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to save table.');
      } finally {
        this.submitting = false;
      }
    },
    editTable(table) { this.openEditModal(table); },
    deleteTable(table) {
      if (confirm(`Delete Table ${table.table_number}? This cannot be undone.`)) {
        api.delete(`/tables/${table.table_id || table.id}`)
          .then(() => this.fetchTables())
          .catch(() => alert('Delete failed.'));
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

/* ── Base ─────────────────────── */
.page {
  font-family: 'Inter', system-ui, sans-serif;
  padding: 2rem 2.5rem;
  background: #f8fafc;
  min-height: 100vh;
}

/* ── Header ───────────────────── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
}

.page-header-left { display: flex; align-items: center; gap: 1rem; }

.page-icon-wrap {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(34,197,94,.3);
  flex-shrink: 0;
}
.page-icon { width: 22px; color: white; }

.page-title {
  font-size: 1.75rem; font-weight: 800;
  color: #0f172a; margin: 0; letter-spacing: -0.5px;
}
.accent { color: #22c55e; }
.page-sub { color: #64748b; font-size: 0.875rem; margin: 2px 0 0; font-weight: 500; }

.page-header-right { display: flex; gap: 0.75rem; align-items: center; }

/* Buttons */
.btn-primary {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white; border: none; padding: 0.65rem 1.25rem;
  border-radius: 10px; font-weight: 600; font-size: 0.875rem;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(34,197,94,.3);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(34,197,94,.35); }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: white; color: #475569;
  border: 1px solid #e2e8f0; padding: 0.65rem 1.1rem;
  border-radius: 10px; font-weight: 600; font-size: 0.875rem;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.btn-ghost:hover:not(:disabled) { border-color: #cbd5e1; color: #1e293b; background: #f8fafc; }
.btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Stats Bar ────────────────── */
.stats-bar {
  display: flex; align-items: center; gap: 0;
  background: white; border-radius: 14px;
  border: 1px solid #e8f0fe;
  padding: 0.75rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 6px rgba(0,0,0,.04);
}
.stat-pill { display: flex; align-items: center; gap: 0.5rem; padding: 0 1.25rem; }
.stat-pill:first-child { padding-left: 0; }
.stat-pill:last-child { padding-right: 0; }
.stat-icon { width: 16px; flex-shrink: 0; }
.stat-icon.green { color: #22c55e; }
.stat-icon.teal  { color: #0ea5e9; }
.stat-icon.orange{ color: #f97316; }
.stat-icon.blue  { color: #818cf8; }
.stat-num { font-size: 1.2rem; font-weight: 800; color: #1e293b; }
.stat-label { font-size: 0.8rem; color: #94a3b8; font-weight: 500; }
.stat-divider { width: 1px; height: 32px; background: #f1f5f9; flex-shrink: 0; }

/* ── States ───────────────────── */
.state-box {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 5rem 2rem; gap: 0.75rem;
  background: white; border-radius: 20px;
  border: 1px solid #f1f5f9; text-align: center;
}
.state-text { color: #64748b; font-size: 0.95rem; margin: 0; }
.state-title { color: #1e293b; font-size: 1.1rem; font-weight: 700; margin: 0; }
.state-icon-err { color: #ef4444; margin-bottom: 0.5rem; }
.state-text-err { color: #ef4444; font-weight: 600; margin: 0; }
.state-empty-visual { margin-bottom: 0.5rem; }

/* Pulse rings */
.pulse-rings { position: relative; width: 56px; height: 56px; margin-bottom: 0.5rem; }
.ring { position: absolute; inset: 0; border: 2px solid #22c55e; border-radius: 50%; opacity: 0; animation: pulse-ring 2s ease-out infinite; }
.ring:nth-child(2) { animation-delay: 0.66s; }
.ring:nth-child(3) { animation-delay: 1.33s; }
@keyframes pulse-ring { 0% { transform: scale(.3); opacity: .8; } 100% { transform: scale(1.5); opacity: 0; } }

/* ── Grid ─────────────────────── */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

/* ── Card ─────────────────────── */
.card {
  background: white;
  border-radius: 20px;
  padding: 1.25rem;
  border: 1.5px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
  display: flex; flex-direction: column; gap: 0.875rem;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  position: relative; overflow: hidden;
}
.card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: #e2e8f0; transition: background 0.3s;
}
.card-active::before { background: linear-gradient(90deg, #22c55e, #16a34a); }
.card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,.08); border-color: #e2e8f0; }

/* Card row */
.card-row { display: flex; justify-content: space-between; align-items: center; }

.card-num-badge {
  background: #f1f5f9; color: #475569;
  font-size: 0.75rem; font-weight: 700;
  padding: 0.3rem 0.65rem; border-radius: 8px;
  letter-spacing: 0.3px;
}

.status-chip {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.72rem; font-weight: 700;
  padding: 0.3rem 0.7rem; border-radius: 20px;
  letter-spacing: 0.2px;
}
.chip-on { background: #dcfce7; color: #15803d; }
.chip-off { background: #fff7ed; color: #c2410c; }
.chip-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

/* Card info */
.card-info { display: flex; flex-direction: column; gap: 0.25rem; }
.card-name { font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0; }
.card-name strong { color: #22c55e; }
.card-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.meta-tag {
  display: inline-flex; align-items: center; gap: 0.3rem;
  font-size: 0.72rem; color: #94a3b8; font-weight: 500;
  background: #f8fafc; padding: 0.2rem 0.5rem; border-radius: 6px;
}

/* QR Box */
.qr-box {
  background: #f8fafc;
  border-radius: 14px;
  height: 190px;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  border: 1px solid #f1f5f9;
  transition: background 0.2s;
}
.qr-box-clickable { cursor: pointer; }
.qr-box-clickable:hover { background: #f1f5f9; }
.qr-box-clickable:hover .qr-overlay { opacity: 1; }

.qr-inner { position: relative; width: 140px; height: 140px; }
.qr-frame {
  width: 100%; height: 100%;
  background: white; border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,.08);
  display: flex; align-items: center; justify-content: center;
}
.qr-img { width: 100%; height: 100%; object-fit: contain; display: block; border-radius: 4px; }

.qr-overlay {
  position: absolute; inset: 0;
  background: rgba(15,23,42,.65);
  border-radius: 12px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0.35rem; opacity: 0;
  transition: opacity 0.2s;
  color: white; font-size: 0.75rem; font-weight: 600;
}

.qr-empty {
  display: flex; flex-direction: column;
  align-items: center; gap: 0.5rem;
}
.qr-empty-icon {
  width: 72px; height: 72px;
  background: white; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px dashed #cbd5e1;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
}
.qr-empty-text { font-size: 0.85rem; font-weight: 600; color: #64748b; margin: 0; }
.qr-empty-sub  { font-size: 0.75rem; color: #94a3b8; margin: 0; }

/* Card actions */
.card-actions { display: flex; gap: 0.5rem; align-items: center; }

.btn-gen {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.6rem; border-radius: 10px; font-size: 0.78rem; font-weight: 700;
  cursor: pointer; border: 1.5px solid #e2e8f0; background: white; color: #475569;
  transition: all 0.2s; letter-spacing: 0.2px;
}
.btn-gen:hover:not(:disabled) { background: #f8fafc; border-color: #22c55e; color: #16a34a; }
.btn-gen:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-gen-regen { border-color: #dcfce7; background: #f0fdf4; color: #15803d; }
.btn-gen-regen:hover:not(:disabled) { background: #dcfce7; border-color: #22c55e; }

.btn-icon {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
  color: #64748b; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.btn-icon:hover { background: #f1f5f9; color: #1e293b; border-color: #cbd5e1; }
.btn-icon-del:hover { background: #fef2f2; color: #ef4444; border-color: #fecaca; }

.card-error { font-size: 0.75rem; color: #ef4444; font-weight: 500; margin: 0; text-align: center; }

.spin-sm {
  width: 13px; height: 13px;
  border: 2px solid rgba(100,116,139,.25);
  border-top-color: #64748b;
  border-radius: 50%;
  animation: spin .7s linear infinite; display: inline-block; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── QR Preview Modal ─────────── */
.overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.6);
  backdrop-filter: blur(10px);
  z-index: 100; display: flex;
  align-items: center; justify-content: center;
  padding: 1.5rem;
}

.qr-modal {
  background: white; border-radius: 24px;
  display: flex; overflow: hidden;
  max-width: 720px; width: 100%;
  box-shadow: 0 32px 64px rgba(0,0,0,.2);
}

.qr-modal-left {
  background: linear-gradient(160deg, #f0fdf4, #dcfce7);
  padding: 3rem 2.5rem;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 1rem; border-right: 1px solid #e2e8f0;
  min-width: 280px;
}
.qr-modal-badge {
  background: white; color: #15803d;
  font-weight: 800; font-size: 0.8rem;
  padding: 0.4rem 1rem; border-radius: 20px;
  border: 1.5px solid #bbf7d0; letter-spacing: 0.3px;
}
.qr-modal-frame {
  background: white; padding: 1rem; border-radius: 18px;
  box-shadow: 0 8px 24px rgba(0,0,0,.1);
  border: 1px solid #e2e8f0;
}
.qr-modal-img { width: 200px; height: 200px; object-fit: contain; display: block; }
.qr-modal-brand {
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.75rem; color: #15803d; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.8px;
}

.qr-modal-right {
  flex: 1; padding: 2rem 2.25rem;
  display: flex; flex-direction: column; gap: 1.25rem;
  overflow-y: auto;
}
.qr-modal-header {
  display: flex; align-items: flex-start; gap: 1rem;
}
.qr-modal-title { font-size: 1.3rem; font-weight: 800; color: #0f172a; margin: 0; }
.qr-modal-sub { color: #64748b; font-size: 0.85rem; margin: 4px 0 0; }

.modal-info-block { display: flex; flex-direction: column; gap: 0.5rem; }
.modal-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin: 0; }
.modal-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: #f8fafc; border-radius: 8px; }
.detail-key { font-size: 0.8rem; color: #64748b; font-weight: 500; }
.detail-val { font-size: 0.85rem; color: #1e293b; font-weight: 600; }
.url-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.65rem 0.85rem; font-family: monospace; font-size: 0.78rem; color: #475569; word-break: break-all; }

.modal-steps-block { display: flex; flex-direction: column; gap: 0.4rem; }
.modal-step { display: flex; align-items: center; gap: 0.6rem; font-size: 0.83rem; color: #475569; }
.step-num {
  width: 22px; height: 22px; border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white; font-size: 0.72rem; font-weight: 700;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.modal-footer { display: flex; gap: 0.75rem; margin-top: auto; }
.btn-download {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  background: linear-gradient(135deg, #22c55e, #16a34a); color: white;
  padding: 0.75rem; border-radius: 12px; font-weight: 700; font-size: 0.875rem;
  cursor: pointer; text-decoration: none; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(34,197,94,.25);
}
.btn-download:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(34,197,94,.35); }
.btn-regen-modal {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: white; color: #475569;
  border: 1.5px solid #e2e8f0; padding: 0.75rem 1rem;
  border-radius: 12px; font-weight: 600; font-size: 0.875rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-regen-modal:hover { border-color: #22c55e; color: #15803d; background: #f0fdf4; }

.close-btn {
  background: #f1f5f9; border: none;
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #64748b; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.close-btn:hover { background: #e2e8f0; color: #1e293b; }

/* ── Form Modal ───────────────── */
.form-modal {
  background: white; border-radius: 24px;
  max-width: 460px; width: 100%;
  box-shadow: 0 32px 64px rgba(0,0,0,.18);
  overflow: hidden;
}
.form-modal-header {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.5rem 1.75rem; border-bottom: 1px solid #f1f5f9;
}
.form-modal-icon {
  width: 42px; height: 42px; border-radius: 12px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(34,197,94,.25); flex-shrink: 0;
}
.form-modal-title { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin: 0; }
.form-modal-sub { font-size: 0.8rem; color: #64748b; margin: 2px 0 0; }

.form-body { padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 1.1rem; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-field { display: flex; flex-direction: column; gap: 0.45rem; }
.field-label { font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
.required { color: #ef4444; }
.field-input {
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0; border-radius: 10px;
  font-size: 0.9rem; color: #1e293b; font-family: inherit;
  transition: all 0.2s; background: #fafafa;
}
.field-input:focus { outline: none; border-color: #22c55e; background: white; box-shadow: 0 0 0 3px rgba(34,197,94,.1); }

/* Toggle group */
.toggle-group { display: flex; gap: 0.65rem; }
.toggle-opt {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  padding: 0.6rem; border-radius: 10px; cursor: pointer;
  border: 1.5px solid #e2e8f0; color: #64748b;
  font-size: 0.83rem; font-weight: 600; transition: all 0.2s;
  background: #fafafa;
}
.toggle-opt.active { border-color: #22c55e; color: #15803d; background: #f0fdf4; }
.toggle-opt.active-off { border-color: #fca5a5; color: #dc2626; background: #fef2f2; }

.form-actions { display: flex; gap: 0.75rem; padding-top: 0.5rem; }
.btn-cancel {
  flex: 1; padding: 0.7rem; border-radius: 10px;
  border: 1.5px solid #e2e8f0; background: white; color: #475569;
  font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
}
.btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
.btn-submit {
  flex: 2; padding: 0.7rem; border-radius: 10px; border: none;
  background: linear-gradient(135deg, #22c55e, #16a34a); color: white;
  font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(34,197,94,.25);
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(34,197,94,.35); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Modal Animation ──────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.92) translateY(16px); }

/* ── Responsive ───────────────── */
@media (max-width: 640px) {
  .page { padding: 1.25rem; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .page-header-right { width: 100%; }
  .btn-primary, .btn-ghost { flex: 1; justify-content: center; }
  .stats-bar { flex-wrap: wrap; gap: 0.75rem; }
  .stat-divider { display: none; }
  .qr-modal { flex-direction: column; }
  .qr-modal-left { min-width: unset; border-right: none; border-bottom: 1px solid #e2e8f0; padding: 1.5rem; }
  .form-row-2 { grid-template-columns: 1fr; }
}
</style>
