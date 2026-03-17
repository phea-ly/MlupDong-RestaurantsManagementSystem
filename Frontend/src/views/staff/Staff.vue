<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useStaffStore } from "@/stores";

const staffStore = useStaffStore();

const {
  search,
  showAddDialog,
  showEditDialog,
  showDeleteDialog,
  loading,
  saving,
  deleting,
  snackbar,
  staffList,
  userOptions,
  newStaff,
  editForm,
  activeCount,
  kitchenCount,
  serviceCount,
  headers,
} = storeToRefs(staffStore);

const { roleColors, statusOptions, init, openAddDialog, addStaff, openEditDialog, saveEdit, confirmDelete, handleDelete } = staffStore;

onMounted(init);
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
        <v-btn color="var(--app-primary)" rounded="lg" prepend-icon="mdi-plus" @click="openAddDialog">
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
        <v-select
          v-model="newStaff.user_id"
          :items="userOptions"
          item-title="name"
          item-value="id"
          label="User"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          class="mb-2"
        />
        <v-text-field v-model="newStaff.position" label="Position" variant="outlined" rounded="lg" density="comfortable" class="mb-2" />
        <v-row dense>
          <v-col cols="6"><v-select v-model="newStaff.status" :items="statusOptions" label="Status" variant="outlined" rounded="lg" density="comfortable" /></v-col>
          <v-col cols="6"><v-text-field v-model="newStaff.hire_date" label="Hire Date" type="date" variant="outlined" rounded="lg" density="comfortable" /></v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" @click="showAddDialog = false">Cancel</v-btn>
        <v-btn color="var(--app-primary)" rounded="lg" :loading="saving" @click="addStaff">
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
        <v-select
          v-model="editForm.user_id"
          :items="userOptions"
          item-title="name"
          item-value="id"
          label="User"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          class="mb-2"
        />
        <v-text-field v-model="editForm.position" label="Position" variant="outlined" rounded="lg" density="comfortable" class="mb-2" />
        <v-row dense>
          <v-col cols="6"><v-select v-model="editForm.status" :items="statusOptions" label="Status" variant="outlined" rounded="lg" density="comfortable" /></v-col>
          <v-col cols="6"><v-text-field v-model="editForm.hire_date" label="Hire Date" type="date" variant="outlined" rounded="lg" density="comfortable" /></v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" @click="showEditDialog = false">Cancel</v-btn>
        <v-btn color="primary" rounded="lg" :loading="saving" @click="saveEdit">Save Changes</v-btn>
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
        <v-btn color="error" rounded="lg" :loading="deleting" @click="handleDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snackbar -->
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" rounded="lg" :timeout="3000">
    {{ snackbar.message }}
    <template #actions>
      <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
    </template>
  </v-snackbar>
</template>


