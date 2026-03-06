<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const showAddDialog = ref(false)
const newStaff = ref({ name: '', email: '', role: '', status: 'Active' })

const staffList = ref([
  { id: 1, name: 'Marcus Nguyen', email: 'marcus@mlupdong.com', role: 'CHEF', dateJoined: 'Oct 12, 2022', status: 'Active', initials: 'MN', color: '#e8f5e9', textColor: '#2e7d32' },
  { id: 2, name: 'Sarah Jenkins', email: 'sarah.j@mlupdong.com', role: 'ADMIN', dateJoined: 'Jan 05, 2021', status: 'Active', initials: 'SJ', color: '#fce4ec', textColor: '#c62828' },
  { id: 3, name: 'David Chen', email: 'david@mlupdong.com', role: 'WAITER', dateJoined: 'Mar 22, 2023', status: 'Inactive', initials: 'DC', color: '#fff3e0', textColor: '#e65100' },
  { id: 4, name: 'Jordan Lee', email: 'j.lee@mlupdong.com', role: 'CHEF', dateJoined: 'Jun 15, 2022', status: 'Active', initials: 'JL', color: '#fce4ec', textColor: '#ad1457' },
  { id: 5, name: 'Maya Patel', email: 'maya.p@mlupdong.com', role: 'WAITER', dateJoined: 'Nov 30, 2023', status: 'Active', initials: 'MP', color: '#e8eaf6', textColor: '#283593' },
])

const filteredStaff = computed(() =>
  staffList.value.filter(s =>
    s.name.toLowerCase().includes(search.value.toLowerCase()) ||
    s.role.toLowerCase().includes(search.value.toLowerCase())
  )
)

const activeCount = computed(() => staffList.value.filter(s => s.status === 'Active').length)
const kitchenCount = computed(() => staffList.value.filter(s => s.role === 'CHEF').length)
const serviceCount = computed(() => staffList.value.filter(s => s.role === 'WAITER').length)

function addStaff() {
  if (!newStaff.value.name) return
  const parts = newStaff.value.name.trim().split(' ')
  const initials = parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
  staffList.value.push({
    id: Date.now(),
    ...newStaff.value,
    role: newStaff.value.role.toUpperCase() || 'STAFF',
    dateJoined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    initials,
    color: '#e8f5e9',
    textColor: '#2e7d32',
  })
  newStaff.value = { name: '', email: '', role: '', status: 'Active' }
  showAddDialog.value = false
}

function deleteStaff(id) {
  staffList.value = staffList.value.filter(s => s.id !== id)
}
</script>

<template>
  <div>
    <!-- Add Staff Dialog -->
    <v-dialog v-model="showAddDialog" max-width="440">
      <v-card rounded="xl" class="pa-6">
        <p class="dialog-title mb-4">Add New Staff</p>
        <v-text-field v-model="newStaff.name" label="Full Name" variant="outlined" rounded="lg" density="comfortable" class="mb-3" />
        <v-text-field v-model="newStaff.email" label="Email" variant="outlined" rounded="lg" density="comfortable" class="mb-3" />
        <v-select
          v-model="newStaff.role"
          :items="['Chef', 'Waiter', 'Admin', 'Manager']"
          label="Role"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          class="mb-3"
        />
        <v-select
          v-model="newStaff.status"
          :items="['Active', 'Inactive']"
          label="Status"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          class="mb-4"
        />
        <div class="d-flex ga-3 justify-end">
          <v-btn variant="outlined" rounded="lg" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="#0f9e5f" rounded="lg" flat @click="addStaff">Add Staff</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Search + Filter + Export -->
    <v-card rounded="xl" elevation="0" class="main-card pa-0 mb-4">
      <div class="pa-4 d-flex ga-3">
        <v-text-field
          v-model="search"
          placeholder="Search staff by name or role..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          rounded="lg"
          hide-details
          class="flex-grow-1"
        />
        <v-btn variant="outlined" rounded="lg" prepend-icon="mdi-filter-outline">Filters</v-btn>
        <v-btn variant="outlined" rounded="lg" prepend-icon="mdi-download-outline">Export</v-btn>
      </div>

      <!-- Table -->
      <v-table density="comfortable" class="staff-table">
        <thead>
          <tr>
            <th>NAME</th>
            <th>ROLE</th>
            <th>DATE JOINED</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in filteredStaff" :key="member.id">
            <td>
              <div class="d-flex align-center ga-3">
                <v-avatar :color="member.color" size="38">
                  <span :style="{ color: member.textColor, fontSize: '13px', fontWeight: 800 }">{{ member.initials }}</span>
                </v-avatar>
                <div>
                  <p class="member-name">{{ member.name }}</p>
                  <p class="member-email">{{ member.email }}</p>
                </div>
              </div>
            </td>
            <td>
              <v-chip
                size="small"
                rounded="lg"
                variant="tonal"
                :color="member.role === 'CHEF' ? 'success' : member.role === 'ADMIN' ? 'deep-purple' : 'teal'"
              >
                {{ member.role }}
              </v-chip>
            </td>
            <td class="date-cell">{{ member.dateJoined }}</td>
            <td>
              <div class="d-flex align-center ga-1">
                <span class="status-dot" :style="{ background: member.status === 'Active' ? '#0f9e5f' : '#b0bec5' }"></span>
                <span :class="member.status === 'Active' ? 'status-active' : 'status-inactive'">{{ member.status }}</span>
              </div>
            </td>
            <td>
              <div class="d-flex align-center ga-2">
                <v-btn icon size="x-small" variant="text" color="#9aabbd">
                  <v-icon size="18">mdi-playlist-edit</v-icon>
                </v-btn>
                <v-btn icon size="x-small" variant="text" color="#9aabbd" @click="deleteStaff(member.id)">
                  <v-icon size="18">mdi-delete-outline</v-icon>
                </v-btn>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pagination -->
      <div class="d-flex justify-space-between align-center pa-4">
        <span class="showing-text">Showing 1-{{ filteredStaff.length }} of {{ staffList.length }} staff members</span>
        <div class="d-flex align-center ga-1">
          <v-btn icon size="x-small" variant="outlined"><v-icon size="16">mdi-chevron-left</v-icon></v-btn>
          <v-btn size="x-small" color="#0f9e5f" rounded flat style="min-width:28px">1</v-btn>
          <v-btn size="x-small" variant="outlined" rounded style="min-width:28px">2</v-btn>
          <v-btn size="x-small" variant="outlined" rounded style="min-width:28px">3</v-btn>
          <v-btn icon size="x-small" variant="outlined"><v-icon size="16">mdi-chevron-right</v-icon></v-btn>
        </div>
      </div>
    </v-card>

    <!-- Summary Cards -->
    <v-row>
      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="0" class="summary-card pa-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="#e6f9f0" size="44" rounded="lg">
              <v-icon color="#0f9e5f" size="22">mdi-account-check-outline</v-icon>
            </v-avatar>
            <div>
              <p class="summary-label">ACTIVE STAFF</p>
              <p class="summary-value">{{ activeCount }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="0" class="summary-card pa-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="#e8f0fe" size="44" rounded="lg">
              <v-icon color="#3c6bc4" size="22">mdi-silverware-fork-knife</v-icon>
            </v-avatar>
            <div>
              <p class="summary-label">KITCHEN TEAM</p>
              <p class="summary-value">{{ kitchenCount }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="0" class="summary-card pa-4">
          <div class="d-flex align-center ga-3">
            <v-avatar color="#e6f9f0" size="44" rounded="lg">
              <v-icon color="#0f9e5f" size="22">mdi-map-marker-outline</v-icon>
            </v-avatar>
            <div>
              <p class="summary-label">SERVICE TEAM</p>
              <p class="summary-value">{{ serviceCount }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.main-card { background: #fff; border: 1px solid #e4eaec; }
.summary-card { background: #fff; border: 1px solid #e4eaec; }

.staff-table th {
  font-size: 10px !important;
  font-weight: 800 !important;
  color: #9aabbd !important;
  letter-spacing: 0.08em;
}

.member-name { font-size: 14px; font-weight: 700; color: #1a2e48; margin: 0; }
.member-email { font-size: 12px; color: #9aabbd; margin: 0; }
.date-cell { font-size: 13px; color: #4b5d74; }

.status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }
.status-active { font-size: 13px; font-weight: 600; color: #0f9e5f; }
.status-inactive { font-size: 13px; font-weight: 600; color: #9aabbd; }

.showing-text { font-size: 12px; color: #9aabbd; }

.summary-label { font-size: 10px; font-weight: 800; color: #9aabbd; letter-spacing: 0.08em; margin: 0 0 4px; }
.summary-value { font-size: 24px; font-weight: 900; color: #1a2e48; margin: 0; }

.dialog-title { font-size: 16px; font-weight: 800; color: #1a2e48; margin: 0; }
</style>