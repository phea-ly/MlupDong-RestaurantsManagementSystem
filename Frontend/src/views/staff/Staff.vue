<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const search         = ref('')
const showAddDialog  = ref(false)
const showEditDialog = ref(false)
const editTarget     = ref(null)
const { locale } = useI18n()
const isKhmer = computed(() => locale.value === 'km')
const tr = (en, km) => (isKhmer.value ? km : en)

const newStaff = ref({ name: '', email: '', role: '', status: 'Active' })
const editForm = ref({ name: '', email: '', role: '', status: 'Active' })

const staffList = ref([
  { id: 1, name: 'Marcus Nguyen', email: 'marcus@mlupdong.com',  role: 'CHEF',   dateJoined: 'Oct 12, 2022', status: 'Active',   initials: 'MN', color: '#e8f5e9', textColor: '#2e7d32' },
  { id: 2, name: 'Sarah Jenkins', email: 'sarah.j@mlupdong.com', role: 'ADMIN',  dateJoined: 'Jan 05, 2021', status: 'Active',   initials: 'SJ', color: '#fce4ec', textColor: '#c62828' },
  { id: 3, name: 'David Chen',    email: 'david@mlupdong.com',   role: 'WAITER', dateJoined: 'Mar 22, 2023', status: 'Inactive', initials: 'DC', color: '#fff3e0', textColor: '#e65100' },
  { id: 4, name: 'Jordan Lee',    email: 'j.lee@mlupdong.com',   role: 'CHEF',   dateJoined: 'Jun 15, 2022', status: 'Active',   initials: 'JL', color: '#fce4ec', textColor: '#ad1457' },
  { id: 5, name: 'Maya Patel',    email: 'maya.p@mlupdong.com',  role: 'WAITER', dateJoined: 'Nov 30, 2023', status: 'Active',   initials: 'MP', color: '#e8eaf6', textColor: '#283593' },
])

const filteredStaff = computed(() =>
  staffList.value.filter(s =>
    s.name.toLowerCase().includes(search.value.toLowerCase()) ||
    s.role.toLowerCase().includes(search.value.toLowerCase()) ||
    s.email.toLowerCase().includes(search.value.toLowerCase())
  )
)

const activeCount  = computed(() => staffList.value.filter(s => s.status === 'Active').length)
const kitchenCount = computed(() => staffList.value.filter(s => s.role === 'CHEF').length)
const serviceCount = computed(() => staffList.value.filter(s => s.role === 'WAITER').length)

// ── Add ────────────────────────────────────────────────
function openAddDialog() {
  newStaff.value = { name: '', email: '', role: 'CHEF', status: 'Active' }
  showAddDialog.value = true
}

function addStaff() {
  if (!newStaff.value.name.trim()) return
  const parts    = newStaff.value.name.trim().split(/\s+/)
  const initials = parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
  staffList.value.push({
    id:         Date.now(),
    name:       newStaff.value.name.trim(),
    email:      newStaff.value.email.trim(),
    role:       newStaff.value.role.toUpperCase(),
    status:     newStaff.value.status,
    dateJoined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    initials,
    color:    '#e8f5e9',
    textColor:'#2e7d32',
  })
  showAddDialog.value = false
}

// ── Edit ───────────────────────────────────────────────
function openEditDialog(member) {
  editTarget.value = member
  editForm.value   = { name: member.name, email: member.email, role: member.role, status: member.status }
  showEditDialog.value = true
}

function saveEdit() {
  if (!editTarget.value) return
  Object.assign(editTarget.value, {
    name:   editForm.value.name.trim(),
    email:  editForm.value.email.trim(),
    role:   editForm.value.role.toUpperCase(),
    status: editForm.value.status,
  })
  const parts    = editTarget.value.name.split(/\s+/)
  editTarget.value.initials = parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
  showEditDialog.value = false
}

// ── Delete ─────────────────────────────────────────────
function deleteStaff(id) {
  staffList.value = staffList.value.filter(s => s.id !== id)
}

// ── Role chip color ────────────────────────────────────
function roleColor(role) {
  const map = { CHEF: '#e8f5e9', ADMIN: '#ede7f6', WAITER: '#e0f2f1', MANAGER: '#e3f2fd' }
  return map[role] || '#f5f5f5'
}
function roleTextColor(role) {
  const map = { CHEF: '#2e7d32', ADMIN: '#4527a0', WAITER: '#00695c', MANAGER: '#1565c0' }
  return map[role] || '#555'
}

function roleLabel(role) {
  const map = {
    CHEF: tr('CHEF', 'ចុងភៅ'),
    ADMIN: tr('ADMIN', 'រដ្ឋបាល'),
    WAITER: tr('WAITER', 'អ្នកបម្រើ'),
    MANAGER: tr('MANAGER', 'អ្នកគ្រប់គ្រង'),
  }
  return map[role] || role
}

function statusLabel(status) {
  return status === 'Active' ? tr('Active', 'កំពុងប្រើ') : tr('Inactive', 'មិនដំណើរការ')
}

function formatDate(value) {
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return value
  return dt.toLocaleDateString(isKhmer.value ? 'km-KH' : 'en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

// ── Pagination ─────────────────────────────────────────
const page      = ref(1)
const perPage   = 8
const totalPages = computed(() => Math.max(1, Math.ceil(filteredStaff.value.length / perPage)))
const pagedStaff = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredStaff.value.slice(start, start + perPage)
})
</script>

<template>

  <!-- ── Top Action Bar ── -->
  <div class="action-bar">
    <div class="search-bar">
      <v-icon size="17" color="#9aabbd">mdi-magnify</v-icon>
      <input v-model="search" :placeholder="tr('Search staff by name or role...', 'ស្វែងរកបុគ្គលិកតាមឈ្មោះ ឬ តួនាទី...')" />
    </div>
    <button class="btn-filter" @click="() => {}">
      <v-icon size="16">mdi-filter-outline</v-icon>
      {{ tr('Filters', 'តម្រង') }}
    </button>
    <button class="btn-export" @click="() => {}">
      <v-icon size="16">mdi-download-outline</v-icon>
      {{ tr('Export', 'នាំចេញ') }}
    </button>
    <button class="btn-add" @click="openAddDialog">
      <v-icon size="17" color="#063824">mdi-plus</v-icon>
      {{ tr('Add Staff', 'បន្ថែមបុគ្គលិក') }}
    </button>
  </div>

  <!-- ── Staff Table ── -->
  <div class="table-card mb-4">

    <div class="table-head">
      <div class="th">{{ tr('Name', 'ឈ្មោះ') }}</div>
      <div class="th">{{ tr('Role', 'តួនាទី') }}</div>
      <div class="th">{{ tr('Date Joined', 'ថ្ងៃចូលបម្រើ') }}</div>
      <div class="th">{{ tr('Status', 'ស្ថានភាព') }}</div>
      <div class="th">{{ tr('Actions', 'សកម្មភាព') }}</div>
    </div>

    <div v-for="member in pagedStaff" :key="member.id" class="table-row">

      <!-- Name -->
      <div class="d-flex align-center ga-3">
        <v-avatar :color="member.color" size="38" rounded="lg">
          <span :style="{ color: member.textColor, fontSize: '13px', fontWeight: 800 }">{{ member.initials }}</span>
        </v-avatar>
        <div>
          <p class="member-name">{{ member.name }}</p>
          <p class="member-email">{{ member.email }}</p>
        </div>
      </div>

      <!-- Role -->
      <div>
        <span class="role-chip" :style="{ background: roleColor(member.role), color: roleTextColor(member.role) }">
          {{ roleLabel(member.role) }}
        </span>
      </div>

      <!-- Date Joined -->
      <p class="date-cell">{{ formatDate(member.dateJoined) }}</p>

      <!-- Status -->
      <div class="d-flex align-center ga-1">
        <span class="status-dot" :style="{ background: member.status === 'Active' ? '#0f9e5f' : '#b0bec5' }" />
        <span :class="member.status === 'Active' ? 'status-active' : 'status-inactive'">{{ statusLabel(member.status) }}</span>
      </div>

      <!-- Actions -->
      <div class="d-flex align-center ga-1">
        <button class="act-btn" @click="openEditDialog(member)" :title="tr('Edit', 'កែប្រែ')">
          <v-icon size="17">mdi-playlist-edit</v-icon>
        </button>
        <button class="act-btn del" @click="deleteStaff(member.id)" :title="tr('Delete', 'លុប')">
          <v-icon size="17">mdi-delete-outline</v-icon>
        </button>
      </div>

    </div>

    <!-- Empty state -->
    <div v-if="pagedStaff.length === 0" class="empty-state">
      <v-icon size="36" color="#d1dce4">mdi-account-search-outline</v-icon>
      <p>{{ tr('No staff found', 'មិនមានបុគ្គលិក') }}</p>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <span class="showing-text">
        {{ tr('Showing', 'កំពុងបង្ហាញ') }} {{ filteredStaff.length === 0 ? 0 : (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, filteredStaff.length) }}
        {{ tr('of', 'នៃ') }} {{ filteredStaff.length }} {{ tr('staff members', 'បុគ្គលិក') }}
      </span>
      <div class="d-flex align-center ga-1">
        <button class="pag-btn" :disabled="page <= 1" @click="page--">
          <v-icon size="15">mdi-chevron-left</v-icon>
        </button>
        <button
          v-for="p in totalPages" :key="p"
          class="pag-btn" :class="{ active: p === page }"
          @click="page = p"
        >{{ p }}</button>
        <button class="pag-btn" :disabled="page >= totalPages" @click="page++">
          <v-icon size="15">mdi-chevron-right</v-icon>
        </button>
      </div>
    </div>

  </div>

  <!-- ── Summary Cards ── -->
  <div class="summary-grid">

    <div class="summary-card">
      <v-avatar color="#e6f9f0" size="44" rounded="lg">
        <v-icon color="#0f9e5f" size="22">mdi-account-check-outline</v-icon>
      </v-avatar>
      <div>
        <p class="summary-label">{{ tr('Active Staff', 'បុគ្គលិកកំពុងប្រើ') }}</p>
        <p class="summary-value">{{ activeCount }}</p>
      </div>
    </div>

    <div class="summary-card">
      <v-avatar color="#e8f0fe" size="44" rounded="lg">
        <v-icon color="#3c6bc4" size="22">mdi-silverware-fork-knife</v-icon>
      </v-avatar>
      <div>
        <p class="summary-label">{{ tr('Kitchen Team', 'ក្រុមចុងភៅ') }}</p>
        <p class="summary-value">{{ kitchenCount }}</p>
      </div>
    </div>

    <div class="summary-card">
      <v-avatar color="#e6f9f0" size="44" rounded="lg">
        <v-icon color="#0f9e5f" size="22">mdi-map-marker-outline</v-icon>
      </v-avatar>
      <div>
        <p class="summary-label">{{ tr('Service Team', 'ក្រុមបម្រើ') }}</p>
        <p class="summary-value">{{ serviceCount }}</p>
      </div>
    </div>

  </div>

  <!-- ── Add Staff Dialog ── -->
  <v-dialog v-model="showAddDialog" max-width="440" rounded="xl">
    <v-card rounded="xl" class="pa-6" elevation="0">
      <p class="dialog-title mb-5">{{ tr('Add New Staff', 'បន្ថែមបុគ្គលិកថ្មី') }}</p>
      <div class="mb-3">
        <label class="form-label">{{ tr('Full Name', 'ឈ្មោះពេញ') }}</label>
        <input class="form-input" v-model="newStaff.name" :placeholder="tr('e.g. Marcus Nguyen', 'ឧ. ម៉ាកុស ង្វៀន')" />
      </div>
      <div class="mb-3">
        <label class="form-label">{{ tr('Email', 'អ៊ីមែល') }}</label>
        <input class="form-input" v-model="newStaff.email" :placeholder="tr('e.g. marcus@mlupdong.com', 'ឧ. marcus@mlupdong.com')" type="email" />
      </div>
      <div class="d-flex ga-3 mb-3">
        <div style="flex:1">
          <label class="form-label">{{ tr('Role', 'តួនាទី') }}</label>
          <select class="form-input" v-model="newStaff.role">
            <option value="CHEF">{{ tr('Chef', 'ចុងភៅ') }}</option>
            <option value="WAITER">{{ tr('Waiter', 'អ្នកបម្រើ') }}</option>
            <option value="ADMIN">{{ tr('Admin', 'រដ្ឋបាល') }}</option>
            <option value="MANAGER">{{ tr('Manager', 'អ្នកគ្រប់គ្រង') }}</option>
          </select>
        </div>
        <div style="flex:1">
          <label class="form-label">{{ tr('Status', 'ស្ថានភាព') }}</label>
          <select class="form-input" v-model="newStaff.status">
            <option value="Active">{{ tr('Active', 'កំពុងប្រើ') }}</option>
            <option value="Inactive">{{ tr('Inactive', 'មិនដំណើរការ') }}</option>
          </select>
        </div>
      </div>
      <div class="d-flex justify-end ga-2 mt-4">
        <button class="btn-cancel" @click="showAddDialog = false">{{ tr('Cancel', 'បោះបង់') }}</button>
        <button class="btn-save" @click="addStaff">{{ tr('Add Staff', 'បន្ថែមបុគ្គលិក') }}</button>
      </div>
    </v-card>
  </v-dialog>

  <!-- ── Edit Staff Dialog ── -->
  <v-dialog v-model="showEditDialog" max-width="440" rounded="xl">
    <v-card rounded="xl" class="pa-6" elevation="0">
      <p class="dialog-title mb-5">{{ tr('Edit Staff', 'កែប្រែបុគ្គលិក') }}</p>
      <div class="mb-3">
        <label class="form-label">{{ tr('Full Name', 'ឈ្មោះពេញ') }}</label>
        <input class="form-input" v-model="editForm.name" :placeholder="tr('Full name', 'ឈ្មោះពេញ')" />
      </div>
      <div class="mb-3">
        <label class="form-label">{{ tr('Email', 'អ៊ីមែល') }}</label>
        <input class="form-input" v-model="editForm.email" :placeholder="tr('Email', 'អ៊ីមែល')" type="email" />
      </div>
      <div class="d-flex ga-3 mb-3">
        <div style="flex:1">
          <label class="form-label">{{ tr('Role', 'តួនាទី') }}</label>
          <select class="form-input" v-model="editForm.role">
            <option value="CHEF">{{ tr('CHEF', 'ចុងភៅ') }}</option>
            <option value="WAITER">{{ tr('WAITER', 'អ្នកបម្រើ') }}</option>
            <option value="ADMIN">{{ tr('ADMIN', 'រដ្ឋបាល') }}</option>
            <option value="MANAGER">{{ tr('MANAGER', 'អ្នកគ្រប់គ្រង') }}</option>
          </select>
        </div>
        <div style="flex:1">
          <label class="form-label">{{ tr('Status', 'ស្ថានភាព') }}</label>
          <select class="form-input" v-model="editForm.status">
            <option value="Active">{{ tr('Active', 'កំពុងប្រើ') }}</option>
            <option value="Inactive">{{ tr('Inactive', 'មិនដំណើរការ') }}</option>
          </select>
        </div>
      </div>
      <div class="d-flex justify-end ga-2 mt-4">
        <button class="btn-cancel" @click="showEditDialog = false">{{ tr('Cancel', 'បោះបង់') }}</button>
        <button class="btn-save" @click="saveEdit">{{ tr('Save Changes', 'រក្សាទុកការផ្លាស់ប្តូរ') }}</button>
      </div>
    </v-card>
  </v-dialog>

</template>

<style scoped>
/* ── Action Bar ── */
.action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 8px;
  padding: 0 14px;
  height: 38px;
  flex: 1;
  min-width: 200px;
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #3d5166;
  font-family: inherit;
  width: 100%;
}

.search-bar input::placeholder { color: #9aabbd; }

.btn-filter,
.btn-export {
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
  transition: background 0.15s;
  white-space: nowrap;
}
.btn-filter:hover,
.btn-export:hover { background: #f6f9f8; }

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

/* ── Table ── */
.table-card {
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 14px;
  overflow: hidden;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1fr 130px 140px 120px 90px;
  padding: 12px 20px;
  align-items: center;
}

.table-head {
  background: #f6f9f8;
  border-bottom: 1px solid #dbe3e7;
}

.th {
  font-size: 10px;
  font-weight: 800;
  color: #9aabbd;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.table-row {
  border-bottom: 1px solid #dbe3e7;
  transition: background 0.12s;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover      { background: #f6f9f8; }

.member-name  { font-size: 14px; font-weight: 700; color: #122039; margin: 0; }
.member-email { font-size: 12px; color: #9aabbd; margin: 0; }

.role-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.date-cell { font-size: 13px; color: #4b5d74; margin: 0; }

.status-dot     { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.status-active  { font-size: 13px; font-weight: 600; color: #0f9e5f; }
.status-inactive{ font-size: 13px; font-weight: 600; color: #9aabbd; }

/* Action buttons */
.act-btn {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid #dbe3e7; background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #9aabbd; transition: all 0.15s;
}
.act-btn :deep(.v-icon) { color: inherit; }
.act-btn:hover     { border-color: #0f9e5f; background: #d4f7e8; color: #0f9e5f; }
.act-btn.del:hover { border-color: #fca5a5; background: #fff1f2; color: #ef4444; }

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 20px;
  color: #9aabbd;
  font-size: 13px;
  font-weight: 600;
}

/* ── Pagination ── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid #dbe3e7;
}

.showing-text { font-size: 12px; color: #9aabbd; }

.pag-btn {
  min-width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid #dbe3e7; background: #fff;
  font-size: 13px; font-weight: 700; color: #3d5166;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0 6px; transition: all 0.15s;
}
.pag-btn:hover:not(:disabled) { border-color: #14dc8b; color: #0a7a4a; }
.pag-btn.active  { background: #14dc8b; color: #063824; border-color: #14dc8b; }
.pag-btn:disabled{ opacity: 0.4; cursor: default; }

/* ── Summary Cards ── */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.summary-card {
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 14px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.summary-label { font-size: 10px; font-weight: 800; color: #9aabbd; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 4px; }
.summary-value { font-size: 26px; font-weight: 900; color: #122039; margin: 0; line-height: 1; }

/* ── Dialogs ── */
.dialog-title { font-size: 18px; font-weight: 900; color: #122039; margin: 0; }

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

.btn-cancel {
  padding: 9px 18px; border-radius: 8px;
  border: 1px solid #dbe3e7; background: #fff;
  font-size: 13.5px; font-weight: 700; color: #3d5166;
  cursor: pointer; font-family: inherit;
}
.btn-save {
  padding: 9px 20px; border-radius: 8px; border: none;
  background: #14dc8b; color: #063824;
  font-size: 13.5px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.btn-save:hover { background: #0fcb7e; }
</style>
