<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { createUser, deleteUser, getUsers, updateUser } from '@/api/user.api'

const users = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const deleteDialog = ref(false)
const viewDialog = ref(false)
const editingUserId = ref(null)
const deletingUserId = ref(null)
const viewingUser = ref(null)
const search = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const perPage = ref(10)
const totalUsers = ref(0)
const lastPage = ref(1)
const errorText = ref('')
let searchDebounce = null

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: 'client',
  phone: '',
  status: true,
})

const displayedUsers = computed(() => users.value)
const perPageOptions = [10, 20, 50]

const isEdit = computed(() => editingUserId.value !== null)

function resetForm() {
  form.first_name = ''
  form.last_name = ''
  form.email = ''
  form.password = ''
  form.role = 'client'
  form.phone = ''
  form.status = true
  editingUserId.value = null
  errorText.value = ''
}

function parseApiError(error, fallback) {
  const data = error?.response?.data
  if (data?.message) return data.message
  if (data?.error) return data.error
  if (data?.errors) {
    const firstKey = Object.keys(data.errors)[0]
    const firstMessage = data.errors[firstKey]?.[0]
    if (firstMessage) return firstMessage
  }
  return fallback
}

async function fetchUsers() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: perPage.value,
    }

    if (search.value.trim() !== '') {
      params.search = search.value.trim()
    }

    if (roleFilter.value !== 'all') {
      params.role = roleFilter.value
    }

    if (statusFilter.value !== 'all') {
      params.status = statusFilter.value === 'active' ? 'true' : 'false'
    }

    const response = await getUsers(params)
    const payload = response.data || {}

    users.value = Array.isArray(payload.data) ? payload.data : []
    currentPage.value = payload.current_page || 1
    perPage.value = payload.per_page || perPage.value
    totalUsers.value = payload.total || users.value.length
    lastPage.value = payload.last_page || 1
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  resetForm()
  dialog.value = true
}

function openEditDialog(user) {
  resetForm()
  editingUserId.value = user.user_id
  form.first_name = user.first_name || ''
  form.last_name = user.last_name || ''
  form.email = user.email || ''
  form.role = user.role || 'client'
  form.phone = user.phone || ''
  form.status = user.status ?? true
  dialog.value = true
}

async function saveUser() {
  errorText.value = ''
  saving.value = true

  const payload = {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    role: form.role,
    phone: form.phone.trim() || null,
    status: !!form.status,
  }

  if (!isEdit.value || form.password.trim() !== '') {
    payload.password = form.password
  }

  try {
    if (isEdit.value) {
      await updateUser(editingUserId.value, payload)
    } else {
      await createUser(payload)
      currentPage.value = 1
    }

    dialog.value = false
    resetForm()
    await fetchUsers()
  } catch (error) {
    errorText.value = parseApiError(error, 'Unable to save user.')
  } finally {
    saving.value = false
  }
}

function confirmDelete(userId) {
  deletingUserId.value = userId
  deleteDialog.value = true
}

function openViewDialog(user) {
  viewingUser.value = user
  viewDialog.value = true
}

async function removeUser() {
  if (!deletingUserId.value) return

  saving.value = true
  errorText.value = ''
  try {
    await deleteUser(deletingUserId.value)
    deleteDialog.value = false
    deletingUserId.value = null
    await fetchUsers()
  } catch (error) {
    errorText.value = parseApiError(error, 'Unable to delete user.')
  } finally {
    saving.value = false
  }
}

onMounted(fetchUsers)
onUnmounted(() => {
  if (searchDebounce) {
    clearTimeout(searchDebounce)
  }
})

watch([roleFilter, statusFilter, perPage], () => {
  currentPage.value = 1
  fetchUsers()
})

watch(currentPage, () => {
  fetchUsers()
})

watch(search, () => {
  currentPage.value = 1
  if (searchDebounce) {
    clearTimeout(searchDebounce)
  }
  searchDebounce = setTimeout(() => {
    fetchUsers()
  }, 350)
})
</script>

<template>
  <section>
    <v-card rounded="lg" border class="pa-3 mb-4 toolbar-card">
      <div class="d-flex align-center ga-3 flex-wrap">
        <v-text-field
          v-model="search"
          placeholder="Search by name, email, or role..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          density="comfortable"
          variant="solo"
          flat
          bg-color="#f7f9fb"
          class="search-input"
        />
        <v-select
          v-model="roleFilter"
          :items="[
            { title: 'All Roles', value: 'all' },
            { title: 'Admin', value: 'admin' },
            { title: 'Client', value: 'client' },
          ]"
          item-title="title"
          item-value="value"
          hide-details
          density="comfortable"
          variant="outlined"
          class="filter-select"
        />
        <v-select
          v-model="statusFilter"
          :items="[
            { title: 'All Status', value: 'all' },
            { title: 'Active', value: 'active' },
            { title: 'Inactive', value: 'inactive' },
          ]"
          item-title="title"
          item-value="value"
          hide-details
          density="comfortable"
          variant="outlined"
          class="filter-select"
        />
        <v-btn color="#19d989" class="text-none" @click="openCreateDialog">Add User</v-btn>
      </div>
    </v-card>

    <v-card rounded="lg" border class="table-card">
      <v-table density="comfortable">
        <thead>
          <tr>
            <th>NAME</th>
            <th>EMAIL</th>
            <th>ROLE</th>
            <th>STATUS</th>
            <th class="text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="text-center py-6">Loading users...</td>
          </tr>
          <tr v-else-if="displayedUsers.length === 0">
            <td colspan="5" class="text-center py-6">No users found.</td>
          </tr>
          <tr v-for="user in displayedUsers" :key="user.user_id">
            <td>{{ user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() }}</td>
            <td>{{ user.email }}</td>
            <td>
              <v-chip size="x-small" class="text-uppercase" color="#e6f4ec" text-color="#157347">
                {{ user.role || 'client' }}
              </v-chip>
            </td>
            <td>
              <v-chip size="x-small" :color="user.status ? '#dbf7e8' : '#f2f2f2'" :text-color="user.status ? '#1e8e5a' : '#7a7a7a'">
                {{ user.status ? 'Active' : 'Inactive' }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn icon variant="text" size="small" color="#5f708a" @click="openViewDialog(user)">
                <v-icon size="16">mdi-eye-outline</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small" color="#7e90ab" @click="openEditDialog(user)">
                <v-icon size="16">mdi-playlist-edit</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small" color="#d9534f" @click="confirmDelete(user.user_id)">
                <v-icon size="16">mdi-delete-outline</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
      <div class="d-flex justify-space-between align-center px-4 py-3 table-footer">
        <p class="ma-0 footer-text">Total users: {{ totalUsers }}</p>
        <div class="d-flex align-center ga-3">
          <v-select
            v-model="perPage"
            :items="perPageOptions"
            label="Rows"
            hide-details
            density="compact"
            variant="outlined"
            class="rows-select"
          />
          <v-pagination
            v-model="currentPage"
            :length="Math.max(lastPage, 1)"
            :total-visible="6"
            density="comfortable"
          />
        </div>
      </div>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title>{{ isEdit ? 'Edit User' : 'Create User' }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.first_name" label="First name" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.last_name" label="Last name" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.email" label="Email" type="email" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="form.role" :items="['admin', 'client']" label="Role" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.phone" label="Phone" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.password"
                :label="isEdit ? 'New password (optional)' : 'Password'"
                type="password"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12">
              <v-switch v-model="form.status" label="Active status" color="#19d989" hide-details />
            </v-col>
          </v-row>
          <p v-if="errorText" class="error-text mt-2 mb-0">{{ errorText }}</p>
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="#19d989" :loading="saving" @click="saveUser">{{ isEdit ? 'Update' : 'Create' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card>
        <v-card-title>Delete User</v-card-title>
        <v-card-text>Are you sure you want to delete this user?</v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="#d9534f" :loading="saving" @click="removeUser">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="480">
      <v-card>
        <v-card-title>User Details</v-card-title>
        <v-card-text>
          <v-table density="comfortable">
            <tbody>
              <tr>
                <td class="label-cell">Name</td>
                <td>{{ viewingUser?.name || `${viewingUser?.first_name || ''} ${viewingUser?.last_name || ''}`.trim() }}</td>
              </tr>
              <tr>
                <td class="label-cell">Email</td>
                <td>{{ viewingUser?.email || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Role</td>
                <td class="text-uppercase">{{ viewingUser?.role || 'client' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Phone</td>
                <td>{{ viewingUser?.phone || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Status</td>
                <td>{{ viewingUser?.status ? 'Active' : 'Inactive' }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn color="#19d989" @click="viewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

.filter-select {
  width: 160px;
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

.error-text {
  color: #d9534f;
  font-size: 13px;
}

.table-footer {
  border-top: 1px solid #ebeff4;
}

.footer-text {
  color: #7d8ca2;
  font-size: 12px;
}

.rows-select {
  width: 94px;
}

.label-cell {
  width: 120px;
  color: #60728a;
  font-weight: 700;
}
</style>
