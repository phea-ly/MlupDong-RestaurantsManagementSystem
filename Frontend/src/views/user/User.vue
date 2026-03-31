<script setup>
import { onMounted }    from 'vue'
import { storeToRefs }  from 'pinia'
import { useUserStore } from '@/stores/user.store'
import { useAuthStore } from '@/stores/auth.store'
import EditProfileDialog from '@/components/avatar/Editprofiledialog.vue'

const userStore = useUserStore()
const authStore = useAuthStore()

const {
  search, filterRole, filterRestaurant,
  showAddDialog, showEditDialog, showDeleteDialog, showProfileDialog,
  loading, saving, deleting,
  snackbar, modal, formErrors, profileTarget,
  stats, filteredUsers,
  roleOptions, restaurantOptions,
  filterRoleOptions, filterRestaurantOptions,
} = storeToRefs(userStore)

const {
  roleConfig,
  init, openAdd, saveUser,
  openEdit, saveEdit,
  toggleActive, confirmDelete, handleDelete,
  openEditProfile, handleProfileSaved,
} = userStore

onMounted(init)

const TABLE_HEADERS = [
  { title: 'User Identity',  key: 'name',       sortable: true  },
  { title: 'Email Address',  key: 'email',       sortable: true  },
  { title: 'Restaurant',     key: 'restaurant',  sortable: true  },
  { title: 'Role & Rank',    key: 'role',        sortable: true  },
  { title: 'Status',         key: 'active',      sortable: true  },
  { title: 'Created At',     key: 'created',     sortable: false },
  { title: 'Actions',        key: 'actions',     sortable: false, align: 'end' },
]
</script>

<template>
  <v-container fluid class="pa-0">

    <!-- ── Stats row ─────────────────────────────────────────────────────── -->
    <v-row dense class="mb-5">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-3">
              <span class="stat-label">Total Users</span>
              <v-icon size="18" color="grey-lighten-2">mdi-account-group-outline</v-icon>
            </div>
            <div class="text-h3 font-weight-black mb-1">{{ stats.total }}</div>
            <v-chip color="success" size="x-small" variant="tonal">+12% vs last month</v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-3">
              <span class="stat-label">Status Distribution</span>
              <v-progress-circular
                :model-value="stats.total ? (stats.active / stats.total) * 100 : 0"
                color="var(--app-primary)" size="18" width="2"
              />
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

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-3">
              <span class="stat-label">Locations Managed</span>
              <v-icon size="18" color="grey-lighten-2">mdi-map-marker-outline</v-icon>
            </div>
            <div class="text-h3 font-weight-black mb-1">8</div>
            <div class="text-caption text-medium-emphasis">Restaurants active</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" border flat>
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-start mb-2">
              <span class="stat-label">Pending Approvals</span>
              <v-chip color="error" size="x-small" variant="flat">2 New</v-chip>
            </div>
            <div class="d-flex flex-column ga-2 mt-1">
              <div class="d-flex align-center ga-2">
                <v-avatar size="28" rounded="lg" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                  <span class="pending-initials">LC</span>
                </v-avatar>
                <div>
                  <div class="text-caption font-weight-bold" style="line-height:1.2">Liam Connor</div>
                  <div class="text-caption text-medium-emphasis" style="font-size:10px">Server @ Downtown</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Table card ─────────────────────────────────────────────────────── -->
    <v-card rounded="xl" border flat>
      <v-card-text class="pa-4 pb-0">
        <div class="d-flex align-center ga-3 flex-wrap">
          <div class="d-flex align-center ga-2 flex-wrap flex-grow-1">
            <span class="filter-label">Restaurant:</span>
            <v-select
              v-model="filterRestaurant"
              :items="filterRestaurantOptions"
              variant="outlined" rounded="lg" density="compact" hide-details
              style="max-width:180px; min-width:150px"
            />
            <span class="filter-label">Role:</span>
            <v-select
              v-model="filterRole"
              :items="filterRoleOptions"
              variant="outlined" rounded="lg" density="compact" hide-details
              style="max-width:150px; min-width:130px"
            />
            <div class="text-caption text-medium-emphasis ml-auto" style="white-space:nowrap">
              Sorted by: <strong>Recently Created</strong>
            </div>
          </div>
          <v-text-field
            v-model="search"
            placeholder="Search across all locations..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined" rounded="lg" density="compact" hide-details
            style="max-width:260px; min-width:200px"
          />
          <v-btn color="var(--app-primary)" rounded="lg" elevation="0" prepend-icon="mdi-account-multiple-plus" @click="openAdd">
            <span style="color:white; font-weight:800">Create Account</span>
          </v-btn>
        </div>
      </v-card-text>

      <v-data-table
        :headers="TABLE_HEADERS"
        :items="filteredUsers"
        :loading="loading"
        items-per-page="10"
        :header-props="{ class: 'text-caption font-weight-bold text-uppercase text-medium-emphasis' }"
      >
        <template #loading>
          <v-skeleton-loader type="table-row@8" />
        </template>

        <template #item.name="{ item }">
          <div class="d-flex align-center ga-3 py-2">
            <v-avatar size="38" rounded="lg" style="overflow:hidden; flex-shrink:0">
              <v-img v-if="item.avatar" :src="item.avatar" cover />
              <span v-else class="avatar-initials" :style="{ background: item.avatarColor }">{{ item.initials }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-bold text-body-2" style="line-height:1.3">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.id }}</div>
            </div>
          </div>
        </template>

        <template #item.email="{ item }">
          <span class="text-body-2 text-medium-emphasis">{{ item.email }}</span>
        </template>

        <template #item.restaurant="{ item }">
          <span class="text-body-2 font-weight-medium">{{ item.restaurant }}</span>
        </template>

        <template #item.role="{ item }">
          <span
            class="role-chip"
            :style="{ background: roleConfig[item.role]?.bg ?? '#f3f4f6', color: roleConfig[item.role]?.text ?? '#374151' }"
          >{{ item.role }}</span>
        </template>

        <template #item.active="{ item }">
          <v-switch
            :model-value="item.active"
            color="var(--app-primary)"
            hide-details density="compact" inset
            @change="toggleActive(item)"
          />
        </template>

        <template #item.created="{ item }">
          <span class="text-body-2 text-medium-emphasis">{{ item.created }}</span>
        </template>

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
            <v-btn
              icon size="small" variant="text"
              :disabled="item.rawId === authStore.user?.id"
              @click="confirmDelete(item.id)"
            >
              <v-icon size="16" color="grey">mdi-delete-outline</v-icon>
              <v-tooltip activator="parent" location="top">
                {{ item.rawId === authStore.user?.id ? 'You cannot delete your own account' : 'Delete' }}
              </v-tooltip>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- ── Edit Profile dialog ────────────────────────────────────────────── -->
    <EditProfileDialog v-model="showProfileDialog" :user="profileTarget" @saved="handleProfileSaved" />

    <!-- ── Create Account dialog ─────────────────────────────────────────── -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card rounded="xl" elevation="0">
        <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
          <v-avatar color="success" variant="tonal" size="40" rounded="lg">
            <v-icon size="20">mdi-account-plus-outline</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">Create New Account</span>
        </v-card-title>

        <v-card-text class="px-6 pt-3">
          <!-- Name row -->
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="modal.form.firstName" label="First Name *"
                variant="outlined" rounded="lg" density="comfortable"
                :error-messages="formErrors.first_name"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="modal.form.lastName" label="Last Name *"
                variant="outlined" rounded="lg" density="comfortable"
                :error-messages="formErrors.last_name"
              />
            </v-col>
          </v-row>

          <!-- Email -->
          <v-text-field
            v-model="modal.form.email" label="Email Address *" type="email"
            variant="outlined" rounded="lg" density="comfortable" class="mt-1"
            :error-messages="formErrors.email"
          />

          <!-- Password — required on create -->
          <v-text-field
            v-model="modal.form.password" label="Password *" type="password"
            variant="outlined" rounded="lg" density="comfortable" class="mt-1"
            hint="Minimum 8 characters" persistent-hint
            :error-messages="formErrors.password"
          />

          <!-- Phone -->
          <v-text-field
            v-model="modal.form.phone" label="Phone (optional)"
            variant="outlined" rounded="lg" density="comfortable" class="mt-1"
            :error-messages="formErrors.phone"
          />

          <!-- Role + Restaurant -->
          <v-row dense class="mt-1">
            <v-col>
              <v-select
                v-model="modal.form.role_id"
                :items="roleOptions"
                item-title="title" item-value="value"
                label="Role *"
                variant="outlined" rounded="lg" density="comfortable"
                :error-messages="formErrors.role_id"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" :disabled="saving" @click="showAddDialog = false">Cancel</v-btn>
          <v-btn color="var(--app-primary)" variant="flat" rounded="lg" :loading="saving" @click="saveUser">
            <span style="color:white; font-weight:800">Create Account</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Edit Account dialog ────────────────────────────────────────────── -->
    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card rounded="xl" elevation="0">
        <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
          <v-avatar color="var(--app-primary)" variant="tonal" size="40" rounded="lg">
            <v-icon size="20">mdi-account-edit-outline</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">Edit Account</span>
        </v-card-title>

        <v-card-text class="px-6 pt-3">
          <v-row dense>
            <v-col cols="6">
              <v-text-field
                v-model="modal.form.firstName" label="First Name *"
                variant="outlined" rounded="lg" density="comfortable"
                :error-messages="formErrors.first_name"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="modal.form.lastName" label="Last Name *"
                variant="outlined" rounded="lg" density="comfortable"
                :error-messages="formErrors.last_name"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="modal.form.email" label="Email Address *" type="email"
            variant="outlined" rounded="lg" density="comfortable" class="mt-1"
            :error-messages="formErrors.email"
          />

          <!-- Password optional on edit -->
          <v-text-field
            v-model="modal.form.password" label="New Password (leave blank to keep current)" type="password"
            variant="outlined" rounded="lg" density="comfortable" class="mt-1"
            hint="Minimum 8 characters" persistent-hint
            :error-messages="formErrors.password"
          />

          <v-text-field
            v-model="modal.form.phone" label="Phone (optional)"
            variant="outlined" rounded="lg" density="comfortable" class="mt-1"
            :error-messages="formErrors.phone"
          />

          <v-row dense class="mt-1">
            <v-col cols="6">
              <v-select
                v-model="modal.form.role_id"
                :items="roleOptions"
                item-title="title" item-value="value"
                label="Role *"
                variant="outlined" rounded="lg" density="comfortable"
                :error-messages="formErrors.role_id"
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="modal.form.restaurant_id"
                :items="restaurantOptions"
                item-title="title" item-value="value"
                label="Restaurant *"
                variant="outlined" rounded="lg" density="comfortable"
                :error-messages="formErrors.restaurant_id"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="outlined" rounded="lg" :disabled="saving" @click="showEditDialog = false">Cancel</v-btn>
          <v-btn color="var(--app-primary)" variant="flat" rounded="lg" :loading="saving" @click="saveEdit">Save Changes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Delete dialog ──────────────────────────────────────────────────── -->
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
.stat-label, .filter-label {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  color: rgba(0,0,0,.45);
}
.avatar-initials {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: #fff;
}
.pending-initials { font-size: 10px; font-weight: 800; color: #fff; }
.role-chip {
  font-size: 11px; font-weight: 800;
  padding: 3px 10px; border-radius: 6px; letter-spacing: .04em;
}
</style>
