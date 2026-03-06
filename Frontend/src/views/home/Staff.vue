<script setup>
import { computed, onMounted, ref } from 'vue'
import { getStaffsApi } from '@/api/management.api'

const search = ref('')
const loading = ref(false)
const errorText = ref('')

const team = ref([])

async function loadStaff() {
  loading.value = true
  errorText.value = ''
  try {
    const response = await getStaffsApi()
    const rows = Array.isArray(response.data) ? response.data : []
    team.value = rows.map((staff) => {
      const position = (staff.position || '').toLowerCase()
      const normalizedRole = position.includes('chef')
        ? 'chef'
        : position.includes('wait')
          ? 'waiter'
          : (staff.user?.role || 'admin')

      return {
        id: staff.staff_id,
        name: staff.user?.name || `${staff.user?.first_name || ''} ${staff.user?.last_name || ''}`.trim() || `Staff #${staff.staff_id}`,
        email: staff.user?.email || '-',
        role: normalizedRole,
        joinedAt: staff.hire_date || '-',
        status: staff.is_active ? 'active' : 'inactive',
        avatar: staff.profile_image || `https://i.pravatar.cc/80?img=${(staff.staff_id % 60) + 1}`,
      }
    })
  } catch (error) {
    errorText.value = error?.response?.data?.message || 'Failed to load staff data.'
  } finally {
    loading.value = false
  }
}

const filteredTeam = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) {
    return team.value
  }

  return team.value.filter((member) =>
    member.name.toLowerCase().includes(query) || member.role.toLowerCase().includes(query)
  )
})

const activeCount = computed(() => team.value.filter((member) => member.status === 'active').length)
const kitchenCount = computed(() => team.value.filter((member) => member.role === 'chef').length)
const serviceCount = computed(() => team.value.filter((member) => member.role === 'waiter').length)

function roleLabel(role) {
  return role.toUpperCase()
}

onMounted(loadStaff)
</script>

<template>
  <section>
    <v-card rounded="lg" border class="pa-3 mb-4 toolbar-card">
      <div class="d-flex align-center ga-3 flex-wrap">
        <v-text-field
          v-model="search"
          placeholder="Search staff by name or role..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          density="comfortable"
          variant="solo"
          flat
          bg-color="#f7f9fb"
          class="search-input"
        />
        <div class="d-flex ga-2">
          <v-btn variant="outlined" class="text-none filter-btn" color="#6e7f99">
            <v-icon start size="16">mdi-filter-variant</v-icon>
            Filters
          </v-btn>
          <v-btn variant="outlined" class="text-none filter-btn" color="#6e7f99">
            <v-icon start size="16">mdi-export-variant</v-icon>
            Export
          </v-btn>
        </div>
      </div>
    </v-card>

    <v-card rounded="lg" border class="table-card mb-4">
      <v-table density="comfortable">
        <thead>
          <tr>
            <th>NAME</th>
            <th>ROLE</th>
            <th>DATE JOINED</th>
            <th>STATUS</th>
            <th class="text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="text-center py-6">Loading staff...</td>
          </tr>
          <tr v-else-if="filteredTeam.length === 0">
            <td colspan="5" class="text-center py-6">{{ errorText || 'No staff found.' }}</td>
          </tr>
          <tr v-for="member in filteredTeam" :key="member.id">
            <td>
              <div class="d-flex align-center ga-3">
                <v-avatar size="36" class="member-avatar">
                  <img :src="member.avatar" :alt="member.name" />
                </v-avatar>
                <div>
                  <p class="member-name">{{ member.name }}</p>
                  <p class="member-email">{{ member.email }}</p>
                </div>
              </div>
            </td>
            <td>
              <v-chip
                size="x-small"
                class="role-chip font-weight-bold"
                :class="`role-${member.role}`"
              >
                {{ roleLabel(member.role) }}
              </v-chip>
            </td>
            <td class="joined-text">{{ member.joinedAt }}</td>
            <td>
              <span class="status-dot" :class="member.status"></span>
              <span class="status-text">{{ member.status === 'active' ? 'Active' : 'Inactive' }}</span>
            </td>
            <td class="text-right">
              <v-btn icon variant="text" size="small" color="#7e90ab">
                <v-icon size="16">mdi-playlist-edit</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small" color="#7e90ab">
                <v-icon size="16">mdi-delete-outline</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

      <div class="table-footer">
        <p>Showing 1-{{ filteredTeam.length }} of 24 staff members</p>
        <div class="d-flex align-center ga-2">
          <v-btn icon size="x-small" variant="outlined" color="#b3bfce">
            <v-icon size="14">mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn size="x-small" min-width="28" color="#19d989" class="text-none">1</v-btn>
          <v-btn size="x-small" min-width="28" variant="text" color="#5f708a">2</v-btn>
          <v-btn size="x-small" min-width="28" variant="text" color="#5f708a">3</v-btn>
          <v-btn icon size="x-small" variant="outlined" color="#b3bfce">
            <v-icon size="14">mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>

    <v-row dense>
      <v-col cols="12" md="4">
        <v-card rounded="lg" border class="pa-4 summary-card">
          <div class="d-flex align-center ga-3">
            <div class="summary-icon icon-green"><v-icon>mdi-account-group-outline</v-icon></div>
            <div>
              <p class="summary-label">ACTIVE STAFF</p>
              <p class="summary-value">{{ activeCount }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card rounded="lg" border class="pa-4 summary-card">
          <div class="d-flex align-center ga-3">
            <div class="summary-icon icon-blue"><v-icon>mdi-silverware-fork-knife</v-icon></div>
            <div>
              <p class="summary-label">KITCHEN TEAM</p>
              <p class="summary-value">{{ kitchenCount }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card rounded="lg" border class="pa-4 summary-card">
          <div class="d-flex align-center ga-3">
            <div class="summary-icon icon-mint"><v-icon>mdi-bell-ring-outline</v-icon></div>
            <div>
              <p class="summary-label">SERVICE TEAM</p>
              <p class="summary-value">{{ serviceCount }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.toolbar-card {
  background: #f3f5f6;
}

.search-input {
  flex: 1 1 420px;
  max-width: 100%;
}

.filter-btn {
  border-color: #d6dee8;
}

.table-card {
  overflow: hidden;
}

thead th {
  color: #7f8ea3 !important;
  font-size: 11px !important;
  letter-spacing: 0.08em;
  font-weight: 800 !important;
}

tbody tr {
  height: 74px;
}

.member-avatar {
  border: 2px solid #dbe3ee;
}

.member-name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1f2a3f;
}

.member-email {
  margin: 2px 0 0;
  font-size: 12px;
  color: #8a99ad;
}

.role-chip {
  min-width: 64px;
  justify-content: center;
}

.role-chef {
  background: #dce9ff;
  color: #2c62c7;
}

.role-admin {
  background: #eadcfa;
  color: #8145cb;
}

.role-waiter {
  background: #d4f0df;
  color: #1e9660;
}

.joined-text {
  color: #5f6f87;
  font-size: 14px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.status-dot.active {
  background: #1bd483;
}

.status-dot.inactive {
  background: #cad3df;
}

.status-text {
  color: #3a4a61;
  font-size: 14px;
}

.table-footer {
  border-top: 1px solid #ebeff4;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.table-footer p {
  margin: 0;
  color: #7d8ca2;
  font-size: 12px;
}

.summary-card {
  background: #f8fafb;
}

.summary-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: grid;
  place-items: center;
}

.icon-green {
  background: #d6f8ea;
  color: #11be72;
}

.icon-blue {
  background: #dce9ff;
  color: #2e66ca;
}

.icon-mint {
  background: #d9f6e7;
  color: #14bf74;
}

.summary-label {
  margin: 0;
  color: #7f8ea2;
  font-size: 10px;
  letter-spacing: 0.09em;
  font-weight: 800;
}

.summary-value {
  margin: 2px 0 0;
  font-size: 30px;
  line-height: 1;
  font-weight: 900;
  color: #17243b;
}

@media (max-width: 960px) {
  .summary-value {
    font-size: 24px;
  }
}
</style>
