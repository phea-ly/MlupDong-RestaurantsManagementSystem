<script setup>
import { computed, ref } from 'vue'

const search = ref('')

const team = ref([
  {
    id: 1,
    name: 'Marcus Nguyen',
    email: 'marcus@mlupdong.com',
    role: 'chef',
    joinedAt: 'Oct 12, 2022',
    status: 'active',
    avatar: 'https://i.pravatar.cc/80?img=13',
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    email: 'sarah.j@mlupdong.com',
    role: 'admin',
    joinedAt: 'Jan 05, 2021',
    status: 'active',
    avatar: 'https://i.pravatar.cc/80?img=47',
  },
  {
    id: 3,
    name: 'David Chen',
    email: 'david@mlupdong.com',
    role: 'waiter',
    joinedAt: 'Mar 22, 2023',
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/80?img=12',
  },
  {
    id: 4,
    name: 'Jordan Lee',
    email: 'j.lee@mlupdong.com',
    role: 'chef',
    joinedAt: 'Jun 15, 2022',
    status: 'active',
    avatar: 'https://i.pravatar.cc/80?img=15',
  },
  {
    id: 5,
    name: 'Maya Patel',
    email: 'maya.p@mlupdong.com',
    role: 'waiter',
    joinedAt: 'Nov 30, 2023',
    status: 'active',
    avatar: 'https://i.pravatar.cc/80?img=5',
  },
])

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
