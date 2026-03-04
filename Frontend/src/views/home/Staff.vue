<script setup>
import { computed, ref } from 'vue'

const team = ref([
  { id: 1, name: 'Sophal K.', role: 'Manager', shift: 'Morning', status: 'On Duty' },
  { id: 2, name: 'Chan Serey', role: 'Captain', shift: 'Morning', status: 'On Break' },
  { id: 3, name: 'Sokha Meas', role: 'Server', shift: 'Evening', status: 'On Duty' },
  { id: 4, name: 'Rithy Chann', role: 'Chef', shift: 'Evening', status: 'On Duty' },
])

const staffCount = computed(() => team.value.length)
const onDutyCount = computed(() => team.value.filter((m) => m.status === 'On Duty').length)
</script>

<template>
  <v-row dense>
    <v-col cols="12" md="6">
      <v-card rounded="lg" border class="pa-4">
        <p class="card-label">Team Size</p>
        <p class="text-h5 font-weight-bold mb-1">{{ staffCount }}</p>
        <p class="muted">Total active members this week</p>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card rounded="lg" border class="pa-4">
        <p class="card-label">On Duty</p>
        <p class="text-h5 font-weight-bold mb-1">{{ onDutyCount }}</p>
        <p class="muted">Currently serving floor and kitchen</p>
      </v-card>
    </v-col>
  </v-row>

  <v-card rounded="lg" border class="pa-2 mt-4">
    <div class="d-flex justify-space-between align-center px-2 py-2">
      <p class="text-h6 font-weight-bold ma-0">Staff Roster</p>
      <v-chip size="small" color="#12d685">Live</v-chip>
    </div>
    <v-table density="comfortable">
      <thead>
        <tr>
          <th>Name</th>
          <th>Role</th>
          <th>Shift</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in team" :key="member.id">
          <td>{{ member.name }}</td>
          <td>{{ member.role }}</td>
          <td>{{ member.shift }}</td>
          <td>
            <v-chip size="x-small" :color="member.status === 'On Duty' ? '#3cc389' : '#ffaa00'">
              {{ member.status }}
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
</template>

<style scoped>
.card-label {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #76879f;
}

.muted {
  margin: 0;
  color: #71839b;
  font-size: 12px;
}
</style>
