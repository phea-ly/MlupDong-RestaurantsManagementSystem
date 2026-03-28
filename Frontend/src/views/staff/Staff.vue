<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useStaffStore } from '@/stores/staff.store'

const store = useStaffStore()

const {
  search, loading, saving, deleting, snackbar,
  staffList, userOptions, newStaff, editForm,
  showAddDialog, showEditDialog, showDeleteDialog,
  activeCount, kitchenCount, serviceCount,
  filteredStaff, headers,
} = storeToRefs(store)

const {
  roleColors, statusOptions,
  init, openAdd, addStaff,
  openEdit, saveEdit,
  confirmDelete, handleDelete,
} = store

onMounted(init)
</script>

<template>
  <v-container fluid class="pa-0">

    <!-- ── Summary cards ──────────────────────────────────────────────────── -->
    <v-row class="mb-5">
      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" border>
          <v-card-text class="d-flex align-center ga-4">
            <v-avatar color="success" variant="tonal" size="48" rounded="lg">
              <v-icon>mdi-account-check-outline</v-icon>
            </v-avatar>
            <div>
              <div class="stat-label">Active Staff</div>
              <div class="text-h5 font-weight-black">{{ activeCount }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="4">
        <v-card rounded="xl" elevation="0" border>
          <v-card-text class="d-flex align-center ga-4">
            <v-avatar color="orange" variant="tonal" size="48" rounded="lg">
              <v-icon>mdi-silverware-fork-knife</v-icon>
            </v-avatar>
            <div>
              <div class="stat-label">Kitchen Team</div>
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
              <div class="stat-label">Service Team</div>
              <div class="text-h5 font-weight-black">{{ serviceCount }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Table card ─────────────────────────────────────────────────────── -->
    <v-card rounded="xl" elevation="0" border>
      <v-card-text>
        <div class="d-flex align-center ga-3 flex-wrap">
          <v-text-field v-model="search" placeholder="Search staff..." prepend-inner-icon="mdi-magnify"
            variant="outlined" density="compact" rounded="lg" hide-details style="min-width:220px; max-width:320px" />
          <v-spacer />
          <v-btn color="var(--app-primary)" rounded="lg" prepend-icon="mdi-plus" @click="openAdd">
            <span style="color:#063824; font-weight:800">Add Staff</span>
          </v-btn>
        </div>
      </v-card-text>

      <v-data-table :headers="headers" :items="filteredStaff" :loading="loading" items-per-page="10"
        :header-props="{ class: 'text-caption font-weight-bold text-uppercase text-medium-emphasis' }">
        <template #loading>
          <v-skeleton-loader type="table-row@6" />
        </template>

        <!-- Staff member -->
        <template #item.name="{ item }">
          <div class="d-flex align-center ga-3 py-2">
            <v-avatar :color="item.color" variant="tonal" size="38" rounded="lg">
              <span class="text-caption font-weight-bold">{{ item.initials }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-body-2">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Role -->
        <template #item.role="{ item }">
          <v-chip :color="roleColors[item.role] ?? 'grey'" size="small" variant="tonal" rounded="lg">
            {{ item.role }}
          </v-chip>
        </template>

        <!-- Position -->
        <template #item.position="{ item }">
          <span class="text-body-2 text-medium-emphasis">{{ item.position || '—' }}</span>
        </template>

        <!-- Date joined -->
        <template #item.dateJoined="{ item }">
          <span class="text-body-2 text-medium-emphasis">{{ item.dateJoined }}</span>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <v-chip :color="item.status === 'Active' ? 'success' : 'default'" size="small" variant="tonal" rounded="lg">
            <template #prepend>
              <v-icon size="8">mdi-circle</v-icon>
            </template>
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center justify-end ga-1">
            <v-btn icon size="small" variant="text" @click="openEdit(item)">
              <v-icon size="17" color="grey">mdi-pencil-outline</v-icon>
              <v-tooltip activator="parent" location="top">Edit</v-tooltip>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="confirmDelete(item.id)">
              <v-icon size="17" color="grey">mdi-delete-outline</v-icon>
              <v-tooltip activator="parent" location="top">Delete</v-tooltip>
            </v-btn>
          </div>
        </template>

      </v-data-table>
    </v-card>

    <!-- ── Add Staff dialog ───────────────────────────────────────────────── -->
    <v-dialog v-model="showAddDialog" max-width="480">
      <v-card rounded="xl" elevation="0">
        <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
          <v-avatar color="success" variant="tonal" size="40" rounded="lg">
            <v-icon size="20">mdi-account-plus-outline</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">Add New Staff</span>
        </v-card-title>
        <v-card-text class="px-6 pt-3">

          <!-- User picker -->
          <v-select v-model="newStaff.user_id" :items="userOptions" item-title="name" item-value="id" label="User *"
            variant="outlined" rounded="lg" density="comfortable" class="mb-2">
            <template #item="{ item, props }">
              <v-list-item v-bind="props">
                <template #subtitle>
                  <span class="text-caption text-medium-emphasis">{{ item.raw.email }}</span>
                  <v-chip v-if="item.raw.role" size="x-small" class="ml-2" variant="tonal">{{ item.raw.role }}</v-chip>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <v-text-field v-model="newStaff.position" label="Position" variant="outlined" rounded="lg"
            density="comfortable" class="mb-2" />

          <v-text-field v-model="newStaff.salary" label="Salary (optional)" type="number" prefix="$" variant="outlined"
            rounded="lg" density="comfortable" class="mb-2" />

          <v-row density="comfortable">
            <v-col cols="6">
              <v-select v-model="newStaff.status" :items="statusOptions" label="Status" variant="outlined" rounded="lg"
                density="comfortable" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="newStaff.hire_date" label="Hire Date" type="date" variant="outlined" rounded="lg"
                density="comfortable" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" :disabled="saving" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="var(--app-primary)" rounded="lg" :loading="saving" :disabled="!newStaff.user_id"
            @click="addStaff">
            <span style="color:#063824; font-weight:800">Add Staff</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Edit Staff dialog ──────────────────────────────────────────────── -->
    <v-dialog v-model="showEditDialog" max-width="480">
      <v-card rounded="xl" elevation="0">
        <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
          <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
            <v-icon size="20">mdi-account-edit-outline</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">Edit Staff</span>
        </v-card-title>
        <v-card-text class="px-6 pt-3">

          <v-select v-model="editForm.user_id" :items="userOptions" item-title="name" item-value="id" label="User *"
            variant="outlined" rounded="lg" density="comfortable" class="mb-2">
            <template #item="{ item, props }">
              <v-list-item v-bind="props">
                <template #subtitle>
                  <span class="text-caption text-medium-emphasis">{{ item.raw.email }}</span>
                  <v-chip v-if="item.raw.role" size="x-small" class="ml-2" variant="tonal">{{ item.raw.role }}</v-chip>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <v-text-field v-model="editForm.position" label="Position" variant="outlined" rounded="lg"
            density="comfortable" class="mb-2" />

          <v-text-field v-model="editForm.salary" label="Salary (optional)" type="number" prefix="$" variant="outlined"
            rounded="lg" density="comfortable" class="mb-2" />

          <v-row density="comfortable">
            <v-col cols="6">
              <v-select v-model="editForm.status" :items="statusOptions" label="Status" variant="outlined" rounded="lg"
                density="comfortable" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="editForm.hire_date" label="Hire Date" type="date" variant="outlined" rounded="lg"
                density="comfortable" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" :disabled="saving" @click="showEditDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" rounded="lg" :loading="saving" @click="saveEdit">Save Changes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Delete confirm dialog ──────────────────────────────────────────── -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card rounded="xl" elevation="0">
        <v-card-text class="pa-6">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar color="red-lighten-5" rounded="lg" size="44" style="border:1px solid #fca5a5">
              <v-icon color="error" size="22">mdi-delete-outline</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-black">Delete Staff</span>
          </div>
          <p class="text-body-2 text-medium-emphasis">
            Are you sure you want to remove this staff member? This action cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" :disabled="deleting" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" :loading="deleting" @click="handleDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Snackbar ───────────────────────────────────────────────────────── -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" rounded="lg" :timeout="3000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
      </template>
    </v-snackbar>

  </v-container>
</template>

<style scoped>
.stat-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: rgba(0, 0, 0, .5);
}
</style>