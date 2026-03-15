<script setup>
import { ref, computed } from 'vue'

// ── Stats ──────────────────────────────────────────────
const stats = ref({ total: 124, active: 118, inactive: 6, locations: 8 })

const pendingApprovals = ref([
  { name: 'Liam Connor', role: 'Server @ Downtown', initials: 'LC', color: '#818cf8' },
  { name: 'Anna Smith',  role: 'Chef @ Uptown',     initials: 'AS', color: '#f472b6' },
])

// ── Filters ────────────────────────────────────────────
const filters     = ref({ restaurant: 'All Locations', role: 'All Roles' })
const searchQuery = ref('')

const restaurantOptions = ['All Locations', 'Downtown Bistro', 'Uptown Grill', 'Riverside Café', 'Midtown Kitchen']
const roleOptions       = ['All Roles', 'ADMINISTRATOR', 'MANAGER', 'CHEF', 'SERVER', 'HOST']

// ── Users ──────────────────────────────────────────────
const avatarColors = ['#00C896', '#818cf8', '#f97316', '#f472b6', '#38bdf8', '#a3e635', '#fb923c', '#c084fc']

const users = ref([
  { id: '#USR-8821', name: 'John Doe',    initials: 'JD', color: '#00C896', email: 'john.doe@restomail.com',  restaurant: 'Downtown Bistro', role: 'ADMINISTRATOR', active: true,  created: 'Oct 12, 2023' },
  { id: '#USR-8822', name: 'Jane Smith',  initials: 'JS', color: '#818cf8', email: 'jane.s@restomail.com',    restaurant: 'Uptown Grill',    role: 'MANAGER',       active: true,  created: 'Nov 05, 2023' },
  { id: '#USR-8823', name: 'Marcus Chen', initials: 'MC', color: '#f97316', email: 'm.chen@restomail.com',    restaurant: 'Downtown Bistro', role: 'CHEF',          active: false, created: 'Dec 20, 2023' },
  { id: '#USR-8824', name: 'Sara Kim',    initials: 'SK', color: '#f472b6', email: 's.kim@restomail.com',     restaurant: 'Uptown Grill',    role: 'SERVER',        active: true,  created: 'Jan 09, 2024' },
  { id: '#USR-8825', name: 'Tom Rivera',  initials: 'TR', color: '#38bdf8', email: 't.rivera@restomail.com',  restaurant: 'Riverside Café',  role: 'MANAGER',       active: true,  created: 'Jan 15, 2024' },
  { id: '#USR-8826', name: 'Diana Patel', initials: 'DP', color: '#a3e635', email: 'd.patel@restomail.com',   restaurant: 'Midtown Kitchen', role: 'CHEF',          active: false, created: 'Feb 03, 2024' },
  { id: '#USR-8827', name: 'Leo Zhang',   initials: 'LZ', color: '#c084fc', email: 'l.zhang@restomail.com',   restaurant: 'Downtown Bistro', role: 'SERVER',        active: true,  created: 'Feb 18, 2024' },
  { id: '#USR-8828', name: 'Nina Rossi',  initials: 'NR', color: '#fb923c', email: 'n.rossi@restomail.com',   restaurant: 'Uptown Grill',    role: 'HOST',          active: true,  created: 'Mar 01, 2024' },
])

const filteredUsers = computed(() =>
  users.value.filter(u => {
    const matchRest   = filters.value.restaurant === 'All Locations' || u.restaurant === filters.value.restaurant
    const matchRole   = filters.value.role === 'All Roles'           || u.role === filters.value.role
    const q           = searchQuery.value.trim().toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    return matchRest && matchRole && matchSearch
  })
)

function deleteUser(user) {
  users.value = users.value.filter(u => u.id !== user.id)
  stats.value.total--
}

// ── Pagination ─────────────────────────────────────────
const page       = ref(1)
const totalPages = 13

const visiblePages = computed(() => {
  const cur = page.value
  if (cur <= 3)              return [1, 2, 3, '...', totalPages]
  if (cur >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages]
  return [1, '...', cur - 1, cur, cur + 1, '...', totalPages]
})

// ── Modal ──────────────────────────────────────────────
const modal = ref({ show: false, editing: false, editTarget: null, form: {} })

function openCreateModal() {
  modal.value = {
    show: true, editing: false, editTarget: null,
    form: { firstName: '', lastName: '', email: '', restaurant: 'Downtown Bistro', role: 'SERVER' }
  }
}

function editUser(user) {
  const [fn, ...ln] = user.name.split(' ')
  modal.value = {
    show: true, editing: true, editTarget: user,
    form: { firstName: fn, lastName: ln.join(' '), email: user.email, restaurant: user.restaurant, role: user.role }
  }
}

function saveUser() {
  const f        = modal.value.form
  const fullName = `${f.firstName} ${f.lastName}`.trim()
  const initials = ((f.firstName[0] || '') + (f.lastName[0] || '')).toUpperCase()
  if (modal.value.editing) {
    Object.assign(modal.value.editTarget, { name: fullName, initials, email: f.email, restaurant: f.restaurant, role: f.role })
  } else {
    users.value.push({
      id:         `#USR-${8820 + users.value.length + 1}`,
      name:       fullName, initials,
      color:      avatarColors[users.value.length % avatarColors.length],
      email:      f.email, restaurant: f.restaurant, role: f.role,
      active:     true,
      created:    new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    })
    stats.value.total++
  }
  modal.value.show = false
}

defineExpose({ openCreateModal })
</script>

<template>

  <!-- ── Top action bar ── -->
  <div class="action-bar">
    <div class="search-bar">
      <v-icon size="16" color="#9aabbd">mdi-magnify</v-icon>
      <input v-model="searchQuery" placeholder="Search across all locations..." />
    </div>
    <button class="btn-create" @click="openCreateModal">
      <v-icon size="17" color="#063824">mdi-account-multiple-plus</v-icon>
      Create Account
    </button>
  </div>

  <!-- ── Stat Cards ── -->
  <div class="stat-grid">

    <!-- Total Users -->
    <div class="stat-card">
      <div class="card-header">
        <span class="stat-label">Total Users</span>
        <v-icon size="20" color="#d1dce4">mdi-account-group-outline</v-icon>
      </div>
      <p class="stat-num">{{ stats.total }}</p>
      <p class="stat-change">+12% vs last month</p>
    </div>

    <!-- Status Distribution -->
    <div class="stat-card">
      <div class="card-header">
        <span class="stat-label">Status Distribution</span>
        <v-icon size="20" color="#d1dce4">mdi-chart-donut</v-icon>
      </div>
      <div class="d-flex align-end ga-4 mt-1">
        <div>
          <p class="stat-num text-active">{{ stats.active }}</p>
          <p class="stat-sub-label">Active</p>
        </div>
        <div>
          <p class="stat-num text-inactive">{{ stats.inactive }}</p>
          <p class="stat-sub-label">Inactive</p>
        </div>
      </div>
    </div>

    <!-- Locations Managed -->
    <div class="stat-card">
      <div class="card-header">
        <span class="stat-label">Locations Managed</span>
        <v-icon size="20" color="#d1dce4">mdi-map-marker-multiple-outline</v-icon>
      </div>
      <p class="stat-num">{{ stats.locations }}</p>
      <p class="stat-sub-label">Restaurants active</p>
    </div>

    <!-- Pending Approvals -->
    <div class="stat-card">
      <div class="card-header">
        <div class="d-flex align-center ga-2">
          <span class="pending-dot" />
          <span class="stat-label">Pending Approvals</span>
        </div>
        <div class="d-flex align-center ga-1">
          <span class="badge-green">{{ pendingApprovals.length }}</span>
          <span class="new-label">New</span>
        </div>
      </div>
      <div
        v-for="(p, i) in pendingApprovals" :key="p.name"
        class="pending-row" :class="{ 'mt-2 pt-2 border-top': i > 0 }"
      >
        <div class="p-avatar" :style="{ background: p.color }">{{ p.initials }}</div>
        <div>
          <p class="pending-name">{{ p.name }}</p>
          <p class="pending-role">{{ p.role }}</p>
        </div>
      </div>
    </div>

  </div>

  <!-- ── Filter Bar ── -->
  <div class="filter-bar">
    <span class="filter-label">RESTAURANT:</span>
    <div class="filter-select">
      <select v-model="filters.restaurant">
        <option v-for="o in restaurantOptions" :key="o">{{ o }}</option>
      </select>
      <v-icon size="18" color="#9aabbd">mdi-chevron-down</v-icon>
    </div>

    <span class="filter-label ml-2">ROLE:</span>
    <div class="filter-select">
      <select v-model="filters.role">
        <option v-for="o in roleOptions" :key="o">{{ o }}</option>
      </select>
      <v-icon size="18" color="#9aabbd">mdi-chevron-down</v-icon>
    </div>

    <v-spacer />

    <div class="sort-text">
      <v-icon size="15" color="#9aabbd">mdi-tune-variant</v-icon>
      Sorted by: <strong>Recently Created</strong>
    </div>
  </div>

  <!-- ── Table ── -->
  <div class="table-card">

    <!-- Head -->
    <div class="table-head">
      <div class="th" style="grid-area: identity">User Identity</div>
      <div class="th" style="grid-area: email">Email Address</div>
      <div class="th" style="grid-area: restaurant">Restaurant</div>
      <div class="th" style="grid-area: role">Role &amp; Rank</div>
      <div class="th" style="grid-area: status">Status</div>
      <div class="th" style="grid-area: created">Created At</div>
      <div class="th" style="grid-area: actions">Actions</div>
    </div>

    <!-- Rows -->
    <div v-for="user in filteredUsers" :key="user.id" class="table-row">

      <div class="d-flex align-center ga-2" style="grid-area: identity">
        <div class="u-avatar" :style="{ background: user.color }">{{ user.initials }}</div>
        <div>
          <p class="u-name">{{ user.name }}</p>
          <p class="u-id">{{ user.id }}</p>
        </div>
      </div>

      <p class="u-email"  style="grid-area: email">{{ user.email }}</p>
      <p class="u-rest"   style="grid-area: restaurant">{{ user.restaurant }}</p>

      <div style="grid-area: role">
        <span v-if="user.role === 'ADMINISTRATOR'" class="role-badge-admin">ADMINISTRATOR</span>
        <div v-else class="d-flex align-center ga-1 u-role">
          {{ user.role }}
          <v-icon size="14" color="#c0cdd7">mdi-chevron-down</v-icon>
        </div>
      </div>

      <div style="grid-area: status">
        <v-switch v-model="user.active" color="#14dc8b" hide-details density="compact" />
      </div>

      <p class="u-created" style="grid-area: created">{{ user.created }}</p>

      <div class="d-flex align-center ga-1" style="grid-area: actions">
        <button class="act-btn" @click="editUser(user)">
          <v-icon size="16">mdi-pencil-outline</v-icon>
        </button>
        <button class="act-btn del" @click="deleteUser(user)">
          <v-icon size="16">mdi-trash-can-outline</v-icon>
        </button>
      </div>

    </div>

    <!-- Pagination -->
    <div class="pagination">
      <p class="pag-info">
        Showing <strong>1</strong> to <strong>{{ filteredUsers.length }}</strong>
        of <strong>{{ stats.total }}</strong> total system users
      </p>
      <div class="d-flex align-center ga-1">
        <button class="pag-btn" :disabled="page <= 1" @click="page--">
          <v-icon size="15">mdi-chevron-left</v-icon>
        </button>
        <template v-for="p in visiblePages" :key="p">
          <button v-if="p !== '...'" class="pag-btn" :class="{ active: p === page }" @click="page = p">{{ p }}</button>
          <span v-else class="pag-dots">...</span>
        </template>
        <button class="pag-btn" :disabled="page >= totalPages" @click="page++">
          <v-icon size="15">mdi-chevron-right</v-icon>
        </button>
      </div>
    </div>

  </div>

  <!-- ── Create / Edit Modal ── -->
  <v-dialog v-model="modal.show" max-width="480" rounded="xl">
    <v-card class="pa-6" rounded="xl" elevation="0">
      <p class="modal-title">{{ modal.editing ? 'Edit Account' : 'Create New Account' }}</p>

      <div class="d-flex ga-3 mb-3">
        <div style="flex:1">
          <label class="form-label">First Name</label>
          <input class="form-input" v-model="modal.form.firstName" placeholder="John" />
        </div>
        <div style="flex:1">
          <label class="form-label">Last Name</label>
          <input class="form-input" v-model="modal.form.lastName" placeholder="Doe" />
        </div>
      </div>
      <div class="mb-3">
        <label class="form-label">Email Address</label>
        <input class="form-input" v-model="modal.form.email" placeholder="user@restomail.com" type="email" />
      </div>
      <div class="d-flex ga-3 mb-5">
        <div style="flex:1">
          <label class="form-label">Restaurant</label>
          <select class="form-input" v-model="modal.form.restaurant">
            <option v-for="r in restaurantOptions.slice(1)" :key="r">{{ r }}</option>
          </select>
        </div>
        <div style="flex:1">
          <label class="form-label">Role</label>
          <select class="form-input" v-model="modal.form.role">
            <option v-for="r in roleOptions.slice(1)" :key="r">{{ r }}</option>
          </select>
        </div>
      </div>
      <div class="d-flex justify-end ga-2">
        <button class="btn-cancel" @click="modal.show = false">Cancel</button>
        <button class="btn-save"   @click="saveUser">{{ modal.editing ? 'Save Changes' : 'Create Account' }}</button>
      </div>
    </v-card>
  </v-dialog>

</template>

<style scoped>
/* ── Top Action Bar ── */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 18px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 8px;
  padding: 0 12px;
  height: 38px;
  width: 260px;
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

.btn-create {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #14dc8b;
  color: #063824;
  font-weight: 700;
  font-size: 13px;
  padding: 0 18px;
  height: 38px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s;
}

.btn-create:hover { background: #0fcb7e; }

/* ── Stat Grid ── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 14px;
  padding: 18px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 11px;
  font-weight: 800;
  color: #9aabbd;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stat-num      { font-size: 28px; font-weight: 900; color: #122039; line-height: 1.1; margin: 0; }
.stat-change   { font-size: 12px; color: #0fcb7e; font-weight: 700; margin: 4px 0 0; }
.stat-sub-label{ font-size: 12px; color: #9aabbd; font-weight: 600; margin: 3px 0 0; }
.text-active   { color: #14dc8b !important; }
.text-inactive { color: #c8d4dc !important; }

/* Pending */
.pending-dot  { width: 8px; height: 8px; background: #14dc8b; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.badge-green  { background: #14dc8b; color: #063824; border-radius: 20px; padding: 1px 9px; font-size: 11px; font-weight: 800; }
.new-label    { font-size: 11px; color: #9aabbd; }
.pending-row  { display: flex; align-items: center; gap: 10px; }
.border-top   { border-top: 1px solid #dbe3e7; }
.p-avatar {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800; color: #fff;
}
.pending-name { font-size: 13px; font-weight: 700; color: #122039; margin: 0; line-height: 1.3; }
.pending-role { font-size: 11px; color: #9aabbd; margin: 0; }

/* ── Filter Bar ── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 12px;
  font-weight: 800;
  color: #6b7f96;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
}

.filter-select {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #dbe3e7;
  border-radius: 8px;
  padding: 0 10px 0 12px;
  height: 36px;
  gap: 4px;
  cursor: pointer;
}

.filter-select select {
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: #3d5166;
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  padding-right: 2px;
}

.sort-text {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7f96;
}

.sort-text strong {
  color: #122039;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-style: dotted;
}

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
  grid-template-columns: 180px 1fr 130px 150px 80px 100px 80px;
  grid-template-areas: "identity email restaurant role status created actions";
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

.u-avatar {
  width: 34px; height: 34px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; color: #fff; flex-shrink: 0;
}

.u-name    { font-size: 14px; font-weight: 700; color: #122039; margin: 0; line-height: 1.3; }
.u-id      { font-size: 11px; color: #9aabbd; margin: 0; }
.u-email   { font-size: 13px; color: #3d5166; margin: 0; }
.u-rest    { font-size: 13px; color: #3d5166; font-weight: 600; margin: 0; }
.u-role    { font-size: 13px; font-weight: 700; color: #3d5166; }
.u-created { font-size: 13px; color: #6b7f96; margin: 0; }

.role-badge-admin {
  display: inline-flex;
  background: #d4f7e8; color: #0a7a4a;
  border: 1px solid #86efca; border-radius: 6px;
  padding: 3px 9px; font-size: 11px; font-weight: 800; letter-spacing: 0.04em;
}

/* Action buttons */
.act-btn {
  width: 30px; height: 30px; border-radius: 7px;
  border: 1px solid #dbe3e7; background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #9aabbd; transition: all 0.15s;
}
.act-btn:hover          { border-color: #0f9e5f; background: #d4f7e8; color: #0f9e5f; }
.act-btn.del:hover      { border-color: #fca5a5; background: #fff1f2; color: #ef4444; }
.act-btn :deep(.v-icon) { color: inherit; }

/* ── Pagination ── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: 1px solid #dbe3e7;
}

.pag-info { font-size: 13px; color: #9aabbd; margin: 0; }
.pag-info strong { color: #3d5166; }

.pag-btn {
  min-width: 32px; height: 32px; border-radius: 7px;
  border: 1px solid #dbe3e7; background: #fff;
  font-size: 13px; font-weight: 700; color: #3d5166;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0 6px; transition: all 0.15s;
}
.pag-btn:hover:not(:disabled) { border-color: #14dc8b; color: #0a7a4a; }
.pag-btn.active { background: #14dc8b; color: #063824; border-color: #14dc8b; }
.pag-btn:disabled { opacity: 0.4; cursor: default; }
.pag-dots { color: #9aabbd; font-size: 14px; padding: 0 2px; }

/* ── Modal ── */
.modal-title {
  font-size: 19px; font-weight: 900; color: #122039; margin: 0 0 20px;
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

.btn-cancel {
  padding: 9px 18px; border-radius: 8px;
  border: 1px solid #dbe3e7; background: #fff;
  font-size: 13.5px; font-weight: 700; color: #3d5166;
  cursor: pointer; font-family: inherit;
}
.btn-save {
  padding: 9px 20px; border-radius: 8px; border: none;
  background: #14dc8b; color: #063824;
  font-size: 13.5px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: background 0.15s;
}
.btn-save:hover { background: #0fcb7e; }
</style>