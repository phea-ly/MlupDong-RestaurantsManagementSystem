<script>
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api";

export const useUserStore = defineStore("user", () => {
  const search = ref("");
  const filterRole = ref("all");
  const filterRestaurant = ref("all");
  const showAddDialog = ref(false);
  const showEditDialog = ref(false);
  const showDeleteDialog = ref(false);
  const showProfileDialog = ref(false);
  const deletingId = ref(null);
  const editTarget = ref(null);
  const profileTarget = ref(null);
  const users = ref([]);
  const loading = ref(false);
  const saving = ref(false);
  const deleting = ref(false);
  const profileSaving = ref(false);
  const snackbar = ref({ show: false, message: "", color: "success" });

  const modal = ref({
    form: { firstName: "", lastName: "", email: "", restaurant: "Downtown Bistro", role: "SERVER" },
  });

  const avatarColors = ["#22c55e", "#6366f1", "#f97316", "#ec4899", "#06b6d4", "#84cc16", "#f43f5e", "#a855f7"];
  const restaurantOptions = ["All Locations", "Downtown Bistro", "Uptown Grill", "Riverside Cafe", "Midtown Kitchen"];
  const roleOptions = ["All Roles", "ADMINISTRATOR", "MANAGER", "CHEF", "SERVER", "HOST"];

  const roleConfig = {
    ADMINISTRATOR: { color: "var(--app-primary)", bg: "#e6fff5", text: "#063824" },
    MANAGER: { color: "#3b82f6", bg: "#eff6ff", text: "#1e40af" },
    CHEF: { color: "#f97316", bg: "#fff7ed", text: "#9a3412" },
    SERVER: { color: "var(--app-primary)", bg: "#f0fdfa", text: "#134e4a" },
    HOST: { color: "#a855f7", bg: "#faf5ff", text: "#6b21a8" },
  };

  function notify(message, color = "success") {
    snackbar.value = { show: true, message, color };
  }

  function resolveAvatar(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = (import.meta.env.VITE_API_URL ?? "http://localhost:8000")
      .replace(/^\/api\/\?$/, "")
      .replace(/^\+/, "");
    return `${base}/${url}`;
  }

  function mapUser(u, index = 0) {
    const firstName = u.first_name ?? "";
    const lastName = u.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim() || u.name || "-";
    const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "??";

    return {
      id: `#USR-${String(u.id).padStart(4, "0")}`,
      rawId: u.id,
      name: fullName,
      initials,
      avatarColor: avatarColors[index % avatarColors.length],
      avatar: resolveAvatar(u.avatar_url ?? u.avatar ?? null),
      email: u.email ?? "",
      restaurant: u.restaurant ?? "",
      role: u.role ?? "SERVER",
      active: u.is_active ?? true,
      created: u.created_at
        ? new Date(u.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "-",
    };
  }

  const stats = computed(() => ({
    total: users.value.length,
    active: users.value.filter((u) => u.active).length,
    inactive: users.value.filter((u) => !u.active).length,
  }));

  const filteredUsers = computed(() =>
    users.value.filter((u) => {
      const matchRest =
        ["All Locations", "all"].includes(filterRestaurant.value) || u.restaurant === filterRestaurant.value;
      const matchRole = ["All Roles", "all"].includes(filterRole.value) || u.role === filterRole.value;
      const q = search.value.trim().toLowerCase();
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchRest && matchRole && matchSearch;
    }),
  );

  async function fetchUsers() {
    loading.value = true;
    try {
      const { data } = await api.get("/users");
      const list = Array.isArray(data) ? data : data.data ?? [];
      users.value = list.map(mapUser);
    } catch (err) {
      notify("Failed to load users.", "error");
    } finally {
      loading.value = false;
    }
  }

  function openAdd() {
    modal.value.form = {
      firstName: "",
      lastName: "",
      email: "",
      restaurant: "Downtown Bistro",
      role: "SERVER",
    };
    showAddDialog.value = true;
  }

  async function saveUser() {
    saving.value = true;
    try {
      const f = modal.value.form;
      const { data } = await api.post("/users", {
        first_name: f.firstName,
        last_name: f.lastName,
        email: f.email,
        restaurant: f.restaurant,
        role: f.role,
      });
      users.value.push(mapUser(data, users.value.length));
      showAddDialog.value = false;
      notify("User created successfully.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to create user.", "error");
    } finally {
      saving.value = false;
    }
  }

  function openEdit(user) {
    editTarget.value = user;
    const [fn, ...ln] = user.name.split(" ");
    modal.value.form = {
      firstName: fn,
      lastName: ln.join(" "),
      email: user.email,
      restaurant: user.restaurant,
      role: user.role,
    };
    showEditDialog.value = true;
  }

  async function saveEdit() {
    saving.value = true;
    try {
      const f = modal.value.form;
      const { data } = await api.put(`/users/${editTarget.value.rawId}`, {
        first_name: f.firstName,
        last_name: f.lastName,
        email: f.email,
        restaurant: f.restaurant,
        role: f.role,
      });
      const updated = mapUser(data, users.value.findIndex((u) => u.rawId === editTarget.value.rawId));
      Object.assign(editTarget.value, updated);
      showEditDialog.value = false;
      notify("User updated successfully.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to update user.", "error");
    } finally {
      saving.value = false;
    }
  }

  async function toggleActive(user) {
    const previous = user.active;
    user.active = !previous;
    try {
      await api.patch(`/users/${user.rawId}`, { is_active: user.active });
    } catch {
      user.active = previous;
      notify("Failed to update status.", "error");
    }
  }

  function confirmDelete(id) {
    deletingId.value = id;
    showDeleteDialog.value = true;
  }

  async function handleDelete() {
    deleting.value = true;
    const target = users.value.find((u) => u.id === deletingId.value);
    try {
      await api.delete(`/users/${target.rawId}`);
      users.value = users.value.filter((u) => u.id !== deletingId.value);
      showDeleteDialog.value = false;
      notify("User deleted.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to delete user.", "error");
    } finally {
      deleting.value = false;
    }
  }

  function openEditProfile(user) {
    profileTarget.value = user;
    showProfileDialog.value = true;
  }

  async function handleProfileSaved(updatedUser) {
    if (!profileTarget.value || profileSaving.value) return;
    profileSaving.value = true;
    try {
      const form = new FormData();
      form.append("first_name", updatedUser.firstName ?? "");
      form.append("last_name", updatedUser.lastName ?? "");
      form.append("email", updatedUser.email ?? "");
      if (updatedUser.avatarFile) form.append("avatar", updatedUser.avatarFile);
      form.append("_method", "PUT");

      const { data } = await api.post(`/users/${profileTarget.value.rawId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const idx = users.value.findIndex((u) => u.rawId === profileTarget.value.rawId);
      const mapped = mapUser(data, idx === -1 ? users.value.length : idx);
      if (idx !== -1) users.value[idx] = mapped;
      Object.assign(profileTarget.value, mapped);
      notify("Profile updated successfully.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to update profile.", "error");
    } finally {
      profileSaving.value = false;
    }
  }

  async function init() {
    await fetchUsers();
  }

  return {
    search,
    filterRole,
    filterRestaurant,
    showAddDialog,
    showEditDialog,
    showDeleteDialog,
    showProfileDialog,
    deletingId,
    editTarget,
    profileTarget,
    users,
    loading,
    saving,
    deleting,
    profileSaving,
    snackbar,
    modal,
    avatarColors,
    restaurantOptions,
    roleOptions,
    roleConfig,
    stats,
    filteredUsers,
    init,
    openAdd,
    saveUser,
    openEdit,
    saveEdit,
    toggleActive,
    confirmDelete,
    handleDelete,
    openEditProfile,
    handleProfileSaved,
  };
});
</script>

<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import EditProfileDialog from "@/components/avatar/Editprofiledialog.vue";

const userStore = useUserStore();

const {
  search,
  filterRole,
  filterRestaurant,
  showAddDialog,
  showEditDialog,
  showDeleteDialog,
  showProfileDialog,
  users,
  loading,
  saving,
  deleting,
  snackbar,
  modal,
  profileTarget,
  stats,
  filteredUsers,
} = storeToRefs(userStore);

const {
  restaurantOptions,
  roleOptions,
  roleConfig,
  init,
  openAdd,
  saveUser,
  openEdit,
  saveEdit,
  toggleActive,
  confirmDelete,
  handleDelete,
  openEditProfile,
  handleProfileSaved,
} = userStore;

onMounted(init);
</script>

<template>
  <v-container fluid class="pa-0">

    <!-- ── Top stats row ── -->
    <v-row dense class="mb-5">

      <!-- Total Users -->
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-3">
              <span class="text-caption font-weight-bold text-uppercase text-medium-emphasis" style="letter-spacing:.08em">Total Users</span>
              <v-icon size="18" color="grey-lighten-2">mdi-account-group-outline</v-icon>
            </div>
            <div class="text-h3 font-weight-black mb-1">{{ stats.total }}</div>
            <v-chip color="success" size="x-small" variant="tonal">+12% vs last month</v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Status Distribution -->
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-3">
              <span class="text-caption font-weight-bold text-uppercase text-medium-emphasis" style="letter-spacing:.08em">Status Distribution</span>
              <v-progress-circular :model-value="stats.total ? (stats.active/stats.total)*100 : 0" color="var(--app-primary)" size="18" width="2" />
            </div>
            <div class="d-flex align-end ga-3">
              <div>
                <div class="text-h3 font-weight-black" style="color:var(--app-primary)">{{ stats.active }}</div>
                <div class="text-caption text-medium-emphasis">Active</div>
              </div>
              <div class="pb-1">
                <div class="text-h5 font-weight-black text-medium-emphasis">{{ stats.inactive }}</div>
                <div class="text-caption text-medium-emphasis">Inactive</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Locations -->
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-3">
              <span class="text-caption font-weight-bold text-uppercase text-medium-emphasis" style="letter-spacing:.08em">Locations Managed</span>
              <v-icon size="18" color="grey-lighten-2">mdi-map-marker-outline</v-icon>
            </div>
            <div class="text-h3 font-weight-black mb-1">8</div>
            <div class="text-caption text-medium-emphasis">Restaurants active</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Pending Approvals -->
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-2">
              <span class="text-caption font-weight-bold text-uppercase text-medium-emphasis" style="letter-spacing:.08em">Pending Approvals</span>
              <v-chip color="error" size="x-small" variant="flat">2 New</v-chip>
            </div>
            <div class="d-flex flex-column ga-2 mt-1">
              <div class="d-flex align-center ga-2">
                <v-avatar size="28" rounded="lg" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                  <span style="font-size:10px;font-weight:800;color:#fff">LC</span>
                </v-avatar>
                <div>
                  <div class="text-caption font-weight-bold" style="line-height:1.2">Liam Connor</div>
                  <div class="text-caption text-medium-emphasis" style="font-size:10px">Server @ Downtown</div>
                </div>
              </div>
              <div class="d-flex align-center ga-2">
                <v-avatar size="28" rounded="lg" style="background:linear-gradient(135deg,#ec4899,#f43f5e)">
                  <span style="font-size:10px;font-weight:800;color:#fff">AS</span>
                </v-avatar>
                <div>
                  <div class="text-caption font-weight-bold" style="line-height:1.2">Anna Smith</div>
                  <div class="text-caption text-medium-emphasis" style="font-size:10px">Chef @ Uptown</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Table card ── -->
    <v-card rounded="xl" border flat>

      <!-- Toolbar -->
      <v-card-text class="pa-4 pb-0">
        <div class="d-flex align-center ga-3 flex-wrap">

          <!-- Filters -->
          <div class="d-flex align-center ga-2 flex-wrap flex-grow-1">
            <span class="text-caption font-weight-bold text-medium-emphasis text-uppercase" style="letter-spacing:.08em">Restaurant:</span>
            <v-select
              v-model="filterRestaurant"
              :items="restaurantOptions"
              variant="outlined"
              rounded="lg"
              density="compact"
              hide-details
              style="max-width:180px; min-width:150px"
            />
            <span class="text-caption font-weight-bold text-medium-emphasis text-uppercase" style="letter-spacing:.08em">Role:</span>
            <v-select
              v-model="filterRole"
              :items="roleOptions"
              variant="outlined"
              rounded="lg"
              density="compact"
              hide-details
              style="max-width:150px; min-width:130px"
            />
            <div class="text-caption text-medium-emphasis ml-auto" style="white-space:nowrap">
              Sorted by: <strong>Recently Created</strong>
            </div>
          </div>

          <!-- Search + create -->
          <v-text-field
            v-model="search"
            placeholder="Search across all locations..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            rounded="lg"
            density="compact"
            hide-details
            style="max-width:260px; min-width:200px"
          />
          <v-btn
            color="var(--app-primary)"
            rounded="lg"
            elevation="0"
            prepend-icon="mdi-account-multiple-plus"
            @click="openAdd"
          >
            <span style="color:#063824;font-weight:800">Create Account</span>
          </v-btn>
        </div>
      </v-card-text>

      <!-- Table -->
      <v-data-table
        :headers="[
          { title: 'User Identity',  key: 'name',       sortable: true  },
          { title: 'Email Address',  key: 'email',      sortable: true  },
          { title: 'Restaurant',     key: 'restaurant', sortable: true  },
          { title: 'Role & Rank',    key: 'role',       sortable: true  },
          { title: 'Status',         key: 'active',     sortable: true  },
          { title: 'Created At',     key: 'created',    sortable: false },
          { title: 'Actions',        key: 'actions',    sortable: false, align: 'end' },
        ]"
        :items="filteredUsers"
        :loading="loading"
        items-per-page="10"
        :header-props="{ class: 'text-caption font-weight-bold text-uppercase text-medium-emphasis' }"
      >
        <template #loading>
          <v-skeleton-loader type="table-row@8" />
        </template>

        <!-- User Identity -->
        <template #item.name="{ item }">
          <div class="d-flex align-center ga-3 py-2">
            <v-avatar size="38" rounded="lg" style="overflow:hidden; flex-shrink:0">
              <v-img v-if="item.avatar" :src="item.avatar" cover />
              <span
                v-else
                style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;"
                :style="{ background: item.avatarColor }"
              >{{ item.initials }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-body-2" style="line-height:1.3">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.id }}</div>
            </div>
          </div>
        </template>

        <!-- Email -->
        <template #item.email="{ item }">
          <span class="text-body-2 text-medium-emphasis">{{ item.email }}</span>
        </template>

        <!-- Restaurant -->
        <template #item.restaurant="{ item }">
          <span class="text-body-2 font-weight-medium">{{ item.restaurant }}</span>
        </template>

        <!-- Role -->
        <template #item.role="{ item }">
          <div class="d-flex align-center ga-1">
            <span
              class="text-caption font-weight-black px-3 py-1"
              style="border-radius:6px; letter-spacing:.04em"
              :style="{
                background: roleConfig[item.role]?.bg ?? '#f3f4f6',
                color:      roleConfig[item.role]?.text ?? '#374151',
              }"
            >{{ item.role }}</span>
          </div>
        </template>

        <!-- Status toggle -->
        <template #item.active="{ item }">
          <v-switch
            :model-value="item.active"
            color="var(--app-primary)"
            hide-details
            density="compact"
            inset
            @change="toggleActive(item)"
          />
        </template>

        <!-- Created -->
        <template #item.created="{ item }">
          <span class="text-body-2 text-medium-emphasis">{{ item.created }}</span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center justify-end ga-1">
            <v-btn icon size="small" variant="text" @click="openEditProfile(item)">
              <v-icon size="16" color="grey">mdi-account-circle-outline</v-icon>
              <v-tooltip activator="parent" location="top">Edit Profile / Avatar</v-tooltip>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="openEdit(item)">
              <v-icon size="16" color="grey">mdi-pencil-outline</v-icon>
              <v-tooltip activator="parent" location="top">Edit</v-tooltip>
            </v-btn>
            <v-btn icon size="small" variant="text" @click="confirmDelete(item.id)">
              <v-icon size="16" color="grey">mdi-delete-outline</v-icon>
              <v-tooltip activator="parent" location="top">Delete</v-tooltip>
            </v-btn>
          </div>
        </template>

      </v-data-table>
    </v-card>

    <!-- ── Edit Profile / Avatar dialog ── -->
    <EditProfileDialog
      v-model="showProfileDialog"
      :user="profileTarget"
      @saved="handleProfileSaved"
    />

    <!-- ── Create Account dialog ── -->
    <v-dialog v-model="showAddDialog" max-width="480">
      <v-card rounded="xl" elevation="0">
        <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
          <v-avatar color="success" variant="tonal" size="40" rounded="lg">
            <v-icon size="20">mdi-account-plus-outline</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">Create New Account</span>
        </v-card-title>
        <v-card-text class="px-6 pt-3">
          <v-row dense>
            <v-col cols="6"><v-text-field v-model="modal.form.firstName" label="First Name" variant="outlined" rounded="lg" density="comfortable" /></v-col>
            <v-col cols="6"><v-text-field v-model="modal.form.lastName"  label="Last Name"  variant="outlined" rounded="lg" density="comfortable" /></v-col>
          </v-row>
          <v-text-field v-model="modal.form.email" label="Email Address" type="email" variant="outlined" rounded="lg" density="comfortable" class="mt-2" />
          <v-row dense class="mt-2">
            <v-col cols="6">
              <v-select v-model="modal.form.restaurant" :items="restaurantOptions.slice(1)" label="Restaurant" variant="outlined" rounded="lg" density="comfortable" />
            </v-col>
            <v-col cols="6">
              <v-select v-model="modal.form.role" :items="roleOptions.slice(1)" label="Role" variant="outlined" rounded="lg" density="comfortable" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" :disabled="saving" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="var(--app-primary)" rounded="lg" :loading="saving" @click="saveUser">
            <span style="color:#063824;font-weight:800">Create Account</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Edit Account dialog ── -->
    <v-dialog v-model="showEditDialog" max-width="480">
      <v-card rounded="xl" elevation="0">
        <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
          <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
            <v-icon size="20">mdi-account-edit-outline</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">Edit Account</span>
        </v-card-title>
        <v-card-text class="px-6 pt-3">
          <v-row dense>
            <v-col cols="6"><v-text-field v-model="modal.form.firstName" label="First Name" variant="outlined" rounded="lg" density="comfortable" /></v-col>
            <v-col cols="6"><v-text-field v-model="modal.form.lastName"  label="Last Name"  variant="outlined" rounded="lg" density="comfortable" /></v-col>
          </v-row>
          <v-text-field v-model="modal.form.email" label="Email Address" type="email" variant="outlined" rounded="lg" density="comfortable" class="mt-2" />
          <v-row dense class="mt-2">
            <v-col cols="6">
              <v-select v-model="modal.form.restaurant" :items="restaurantOptions.slice(1)" label="Restaurant" variant="outlined" rounded="lg" density="comfortable" />
            </v-col>
            <v-col cols="6">
              <v-select v-model="modal.form.role" :items="roleOptions.slice(1)" label="Role" variant="outlined" rounded="lg" density="comfortable" />
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

    <!-- ── Delete dialog ── -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card rounded="xl" elevation="0">
        <v-card-text class="pa-6">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar color="red-lighten-5" rounded="lg" size="44" style="border:1px solid #fca5a5">
              <v-icon color="error" size="22">mdi-delete-outline</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-black">Delete User</span>
          </div>
          <p class="text-body-2 text-medium-emphasis">
            This will permanently delete the user account. This action cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" :disabled="deleting" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" :loading="deleting" @click="handleDelete">Delete</v-btn>
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

  </v-container>
</template>