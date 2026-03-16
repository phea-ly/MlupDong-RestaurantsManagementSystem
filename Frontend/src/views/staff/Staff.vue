<script setup>
import { ref, computed } from 'vue'

const search           = ref('')
const showAddDialog    = ref(false)
const showEditDialog   = ref(false)
const showDeleteDialog = ref(false)
const deletingId       = ref(null)
const editTarget       = ref(null)

const newStaff = ref({ name: '', email: '', role: 'CHEF', status: 'Active' })
const editForm = ref({ name: '', email: '', role: '', status: 'Active' })

const staffList = ref([
  { id: 1, name: 'Marcus Nguyen', email: 'marcus@mlupdong.com',  role: 'CHEF',    dateJoined: 'Oct 12, 2022', status: 'Active',   initials: 'MN', color: 'success'     },
  { id: 2, name: 'Sarah Jenkins', email: 'sarah.j@mlupdong.com', role: 'ADMIN',   dateJoined: 'Jan 05, 2021', status: 'Active',   initials: 'SJ', color: 'error'       },
  { id: 3, name: 'David Chen',    email: 'david@mlupdong.com',   role: 'WAITER',  dateJoined: 'Mar 22, 2023', status: 'Inactive', initials: 'DC', color: 'warning'     },
  { id: 4, name: 'Jordan Lee',    email: 'j.lee@mlupdong.com',   role: 'CHEF',    dateJoined: 'Jun 15, 2022', status: 'Active',   initials: 'JL', color: 'pink'        },
  { id: 5, name: 'Maya Patel',    email: 'maya.p@mlupdong.com',  role: 'WAITER',  dateJoined: 'Nov 30, 2023', status: 'Active',   initials: 'MP', color: 'deep-purple' },
])

const roleColors = { CHEF: 'success', ADMIN: 'deep-purple', WAITER: 'teal', MANAGER: 'blue' }

const headers = [
  { title: 'Staff Member', key: 'name',       sortable: true  },
  { title: 'Role',         key: 'role',       sortable: true  },
  { title: 'Date Joined',  key: 'dateJoined', sortable: false },
  { title: 'Status',       key: 'status',     sortable: true  },
  { title: 'Actions',      key: 'actions',    sortable: false, align: 'end' },
]

const activeCount  = computed(() => staffList.value.filter(s => s.status === 'Active').length)
const kitchenCount = computed(() => staffList.value.filter(s => s.role === 'CHEF').length)
const serviceCount = computed(() => staffList.value.filter(s => s.role === 'WAITER').length)

const roleOptions   = ['CHEF', 'WAITER', 'ADMIN', 'MANAGER']
const statusOptions = ['Active', 'Inactive']

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
    role:       newStaff.value.role,
    status:     newStaff.value.status,
    dateJoined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    initials,
    color: 'success',
  })
  showAddDialog.value = false
}

function openEditDialog(member) {
  editTarget.value = { ...member }
  editForm.value   = { name: member.name, email: member.email, role: member.role, status: member.status }
  showEditDialog.value = true
}

function saveEdit() {
  const idx = staffList.value.findIndex(s => s.id === editTarget.value.id)
  if (idx === -1) return
  const parts = editForm.value.name.trim().split(/\s+/)
  staffList.value[idx] = {
    ...staffList.value[idx],
    name:     editForm.value.name.trim(),
    email:    editForm.value.email.trim(),
    role:     editForm.value.role,
    status:   editForm.value.status,
    initials: parts.map(p => p[0]).join('').toUpperCase().slice(0, 2),
  }
  showEditDialog.value = false
}

function confirmDelete(id) {
  deletingId.value       = id
  showDeleteDialog.value = true
}

function handleDelete() {
  staffList.value        = staffList.value.filter(s => s.id !== deletingId.value)
  showDeleteDialog.value = false
  deletingId.value       = null
}
</script>

<template>
  <!-- ── Summary Cards ── -->
  <v-row class="mb-5">
    <v-col cols="12" sm="4">
      <v-card rounded="xl" elevation="0" border>
        <v-card-text class="d-flex align-center ga-4">
          <v-avatar color="success" variant="tonal" size="48" rounded="lg">
            <v-icon>mdi-account-check-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis">Active Staff</div>
            <div class="text-h5 font-weight-black">{{ activeCount }}</div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="4">
      <v-card rounded="xl" elevation="0" border>
        <v-card-text class="d-flex align-center ga-4">
          <v-avatar color="blue" variant="tonal" size="48" rounded="lg">
            <v-icon>mdi-silverware-fork-knife</v-icon>
          </v-avatar>
          <div>
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis">Kitchen Team</div>
            <div class="text-h5 font-weight-black">{{ kitchenCount }}</div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="4">
      <v-card rounded="xl" elevation="0" border>
        <v-card-text class="d-flex align-center ga-4">
          <v-avatar color="teal" variant="tonal" size="48" rounded="lg">
            <v-icon>mdi-room-service-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-caption font-weight-bold text-uppercase text-medium-emphasis">Service Team</div>
            <div class="text-h5 font-weight-black">{{ serviceCount }}</div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- ── Data Table Card ── -->
  <v-card rounded="xl" elevation="0" border>
    <v-card-text>
      <div class="d-flex align-center ga-3 flex-wrap">
        <v-text-field
          v-model="search"
          placeholder="Search staff..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          rounded="lg"
          hide-details
          style="min-width:220px; max-width:320px"
        />
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" prepend-icon="mdi-filter-outline">Filters</v-btn>
        <v-btn variant="outlined" rounded="lg" prepend-icon="mdi-download-outline">Export</v-btn>
        <v-btn color="#14dc8b" rounded="lg" prepend-icon="mdi-plus" @click="openAddDialog">
          <span style="color:#063824;font-weight:800">Add Staff</span>
        </v-btn>
      </div>
    </v-card-text>

    <v-data-table
      :headers="headers"
      :items="staffList"
      :search="search"
      items-per-page="8"
    >
      <template #item.name="{ item }">
        <div class="d-flex align-center ga-3 py-1">
          <v-avatar :color="item.color" variant="tonal" size="38" rounded="lg">
            <span class="text-caption font-weight-bold">{{ item.initials }}</span>
          </v-avatar>
          <div>
            <div class="font-weight-bold">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <template #item.role="{ item }">
        <v-chip :color="roleColors[item.role] || 'grey'" size="small" variant="tonal" rounded="lg">
          {{ item.role }}
        </v-chip>
      </template>

      <template #item.status="{ item }">
        <v-chip
          :color="item.status === 'Active' ? 'success' : 'default'"
          size="small" variant="tonal" rounded="lg"
        >
          <template #prepend><v-icon size="8">mdi-circle</v-icon></template>
          {{ item.status }}
        </v-chip>
      </template>

      <template #item.actions="{ item }">
        <v-btn icon size="small" variant="text" color="primary" @click="openEditDialog(item)">
          <v-icon size="18">mdi-pencil-outline</v-icon>
          <v-tooltip activator="parent" location="top">Edit</v-tooltip>
        </v-btn>
        <v-btn icon size="small" variant="text" color="error" @click="confirmDelete(item.id)">
          <v-icon size="18">mdi-delete-outline</v-icon>
          <v-tooltip activator="parent" location="top">Delete</v-tooltip>
        </v-btn>
      </template>
    </v-data-table>
  </v-card>

  <!-- ── Add Dialog ── -->
  <v-dialog v-model="showAddDialog" max-width="480" rounded="xl">
    <v-card rounded="xl" elevation="0">
      <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
        <v-avatar color="success" variant="tonal" size="40" rounded="lg">
          <v-icon size="20">mdi-account-plus-outline</v-icon>
        </v-avatar>
        <span class="text-h6 font-weight-black">Add New Staff</span>
      </v-card-title>
      <v-card-text class="px-6 pt-3">
        <v-text-field v-model="newStaff.name"  label="Full Name" variant="outlined" rounded="lg" density="comfortable" class="mb-2" />
        <v-text-field v-model="newStaff.email" label="Email"     variant="outlined" rounded="lg" density="comfortable" type="email" class="mb-2" />
        <v-row dense>
          <v-col cols="6">
            <v-select v-model="newStaff.role"   :items="roleOptions"   label="Role"   variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
          <v-col cols="6">
            <v-select v-model="newStaff.status" :items="statusOptions" label="Status" variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" @click="showAddDialog = false">Cancel</v-btn>
        <v-btn color="#14dc8b" rounded="lg" @click="addStaff">
          <span style="color:#063824;font-weight:800">Add Staff</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ── Edit Dialog ── -->
  <v-dialog v-model="showEditDialog" max-width="480" rounded="xl">
    <v-card rounded="xl" elevation="0">
      <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
        <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
          <v-icon size="20">mdi-account-edit-outline</v-icon>
        </v-avatar>
        <span class="text-h6 font-weight-black">Edit Staff</span>
      </v-card-title>
      <v-card-text class="px-6 pt-3">
        <v-text-field v-model="editForm.name"  label="Full Name" variant="outlined" rounded="lg" density="comfortable" class="mb-2" />
        <v-text-field v-model="editForm.email" label="Email"     variant="outlined" rounded="lg" density="comfortable" type="email" class="mb-2" />
        <v-row dense>
          <v-col cols="6">
            <v-select v-model="editForm.role"   :items="roleOptions"   label="Role"   variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
          <v-col cols="6">
            <v-select v-model="editForm.status" :items="statusOptions" label="Status" variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" @click="showEditDialog = false">Cancel</v-btn>
        <v-btn color="primary" rounded="lg" @click="saveEdit">Save Changes</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ── Delete Dialog ── -->
  <v-dialog v-model="showDeleteDialog" max-width="400" rounded="xl">
    <v-card rounded="xl" elevation="0">
      <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
        <v-avatar color="error" variant="tonal" size="40" rounded="lg">
          <v-icon size="20">mdi-delete-outline</v-icon>
        </v-avatar>
        <span class="text-h6 font-weight-black">Delete Staff</span>
      </v-card-title>
      <v-card-text class="px-6">Are you sure you want to delete this staff member? This cannot be undone.</v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" @click="showDeleteDialog = false">Cancel</v-btn>
        <v-btn color="error" rounded="lg" @click="handleDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>