<script>
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api";

export const useStaffStore = defineStore("staff", () => {
  const search = ref("");
  const showAddDialog = ref(false);
  const showEditDialog = ref(false);
  const showDeleteDialog = ref(false);
  const deletingId = ref(null);
  const editTarget = ref(null);
  const loading = ref(false);
  const saving = ref(false);
  const deleting = ref(false);
  const snackbar = ref({ show: false, message: "", color: "success" });

  const staffList = ref([]);
  const userOptions = ref([]);

  const newStaff = ref({ user_id: null, position: "", status: "Active", hire_date: "" });
  const editForm = ref({ user_id: null, position: "", status: "Active", hire_date: "" });

  const roleColors = { CHEF: "success", ADMIN: "deep-purple", WAITER: "teal", MANAGER: "blue" };

  const headers = ref([
    { title: "Staff Member", key: "name",       sortable: true  },
    { title: "Role",         key: "role",       sortable: true  },
    { title: "Date Joined",  key: "dateJoined", sortable: false },
    { title: "Status",       key: "status",     sortable: true  },
    { title: "Actions",      key: "actions",    sortable: false, align: "end" },
  ]);

  const activeCount  = computed(() => staffList.value.filter((s) => s.status === "Active").length);
  const kitchenCount = computed(() => staffList.value.filter((s) => s.role === "CHEF").length);
  const serviceCount = computed(() => staffList.value.filter((s) => s.role === "WAITER").length);

  const statusOptions = ["Active", "Inactive"];

  function notify(message, color = "success") {
    snackbar.value = { show: true, message, color };
  }

  function mapUserOption(u) {
    const firstName = u.first_name ?? "";
    const lastName  = u.last_name  ?? "";
    const name = `${firstName} ${lastName}`.trim() || u.name || "User";
    return { id: u.id, name, email: u.email ?? "", role: u.role ?? u.role_name ?? "" };
  }

  function mapStaff(s) {
    const u         = s.user ?? {};
    const firstName = u.first_name ?? "";
    const lastName  = u.last_name  ?? "";
    const name      = `${firstName} ${lastName}`.trim() || u.name || "-";
    const initials  = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "??";
    const role      = u.role ?? u.role_name ?? "STAFF";
    return {
      id:         s.staff_id,
      user_id:    s.user_id,
      position:   s.position ?? "",
      hire_date:  s.hire_date ?? "",
      name,
      email:      u.email ?? "",
      role,
      dateJoined: s.hire_date
        ? new Date(s.hire_date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : s.created_at
          ? new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
          : "-",
      status:   s.is_active ? "Active" : "Inactive",
      initials,
      color: roleColors[role] || "success",
    };
  }

  async function fetchUsers() {
    try {
      const { data } = await api.get("/users");
      const list = Array.isArray(data) ? data : data.data ?? [];
      userOptions.value = list.map(mapUserOption);
    } catch {
      notify("Failed to load users.", "error");
    }
  }

  async function fetchStaff() {
    loading.value = true;
    try {
      const { data } = await api.get("/staffs");
      const list = Array.isArray(data) ? data : data.data ?? [];
      staffList.value = list.map(mapStaff);
    } catch {
      notify("Failed to load staff.", "error");
    } finally {
      loading.value = false;
    }
  }

  function openAddDialog() {
    newStaff.value = { user_id: null, position: "", status: "Active", hire_date: "" };
    showAddDialog.value = true;
  }

  async function addStaff() {
    if (!newStaff.value.user_id || saving.value) return;
    saving.value = true;
    try {
      const payload = {
        user_id:   newStaff.value.user_id,
        position:  newStaff.value.position || null,
        hire_date: newStaff.value.hire_date || null,
        is_active: newStaff.value.status === "Active",
      };
      const { data } = await api.post("/staffs", payload);
      staffList.value.unshift(mapStaff(data));
      showAddDialog.value = false;
      notify("Staff created successfully.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to create staff.", "error");
    } finally {
      saving.value = false;
    }
  }

  function openEditDialog(member) {
    editTarget.value = { ...member };
    editForm.value = {
      user_id:   member.user_id,
      position:  member.position ?? "",
      status:    member.status,
      hire_date: member.hire_date ?? "",
    };
    showEditDialog.value = true;
  }

  async function saveEdit() {
    if (!editTarget.value || saving.value) return;
    saving.value = true;
    try {
      const payload = {
        user_id:   editForm.value.user_id,
        position:  editForm.value.position || null,
        hire_date: editForm.value.hire_date || null,
        is_active: editForm.value.status === "Active",
      };
      const { data } = await api.put(`/staffs/${editTarget.value.id}`, payload);
      const idx    = staffList.value.findIndex((s) => s.id === editTarget.value.id);
      const mapped = mapStaff(data);
      if (idx !== -1) staffList.value[idx] = mapped;
      showEditDialog.value = false;
      notify("Staff updated successfully.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to update staff.", "error");
    } finally {
      saving.value = false;
    }
  }

  function confirmDelete(id) {
    deletingId.value = id;
    showDeleteDialog.value = true;
  }

  async function handleDelete() {
    if (!deletingId.value || deleting.value) return;
    deleting.value = true;
    try {
      await api.delete(`/staffs/${deletingId.value}`);
      staffList.value = staffList.value.filter((s) => s.id !== deletingId.value);
      showDeleteDialog.value = false;
      deletingId.value = null;
      notify("Staff deleted.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to delete staff.", "error");
    } finally {
      deleting.value = false;
    }
  }

  async function init() {
    await Promise.all([fetchUsers(), fetchStaff()]);
  }

  return {
    search,
    showAddDialog,
    showEditDialog,
    showDeleteDialog,
    deletingId,
    editTarget,
    loading,
    saving,
    deleting,
    snackbar,
    staffList,
    userOptions,
    newStaff,
    editForm,
    roleColors,
    headers,
    activeCount,
    kitchenCount,
    serviceCount,
    statusOptions,
    init,
    openAddDialog,
    addStaff,
    openEditDialog,
    saveEdit,
    confirmDelete,
    handleDelete,
  };
});
</script>

<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";

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

const {
  roleColors,
  statusOptions,
  init,
  openAddDialog,
  addStaff,
  openEditDialog,
  saveEdit,
  confirmDelete,
  handleDelete,
} = staffStore;

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
        <v-text-field
          v-model="newStaff.position"
          label="Position"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          class="mb-2"
        />
        <v-row dense>
          <v-col cols="6">
            <v-select v-model="newStaff.status" :items="statusOptions" label="Status" variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="newStaff.hire_date" label="Hire Date" type="date" variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
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
        <v-text-field
          v-model="editForm.position"
          label="Position"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          class="mb-2"
        />
        <v-row dense>
          <v-col cols="6">
            <v-select v-model="editForm.status" :items="statusOptions" label="Status" variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="editForm.hire_date" label="Hire Date" type="date" variant="outlined" rounded="lg" density="comfortable" />
          </v-col>
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
      <v-card-text class="px-6">
        Are you sure you want to delete this staff member? This cannot be undone.
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" @click="showDeleteDialog = false">Cancel</v-btn>
        <v-btn color="error" rounded="lg" :loading="deleting" @click="handleDelete">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ── Snackbar ── -->
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="bottom right" rounded="lg" :timeout="3000">
    {{ snackbar.message }}
    <template #actions>
      <v-btn variant="text" icon="mdi-close" size="small" @click="snackbar.show = false" />
    </template>
  </v-snackbar>
</template>