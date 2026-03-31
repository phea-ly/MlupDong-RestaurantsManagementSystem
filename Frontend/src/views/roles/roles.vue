<template>
  <v-container fluid class="pa-0">

    <!-- ── Page Header ─────────────────────────────────────────────────── -->
    <div class="d-flex align-center justify-space-between mb-5">
      <div>
      </div>

      <v-btn
        color="var(--app-primary)"
        rounded="lg"
        prepend-icon="mdi-plus"
        :disabled="store.loading"
        @click="openCreate"
      >
        <span style="color:white; font-weight:800">New Role</span>
      </v-btn>
    </div>

    <!-- ── Global Error Banner ─────────────────────────────────────────── -->
    <v-alert
      v-if="store.error && !dialogOpen"
      type="error"
      variant="tonal"
      closable
      class="mb-4"
      @click:close="store.clearErrors()"
    >
      {{ store.error }}
    </v-alert>

    <!-- ── Table Card ──────────────────────────────────────────────────── -->
    <v-card rounded="xl" elevation="0" border>
      <v-card-text>
        <div class="d-flex align-center ga-3 flex-wrap">
          <v-text-field
            v-model="search"
            placeholder="Search roles..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            rounded="lg"
            hide-details
            clearable
            style="min-width: 220px; max-width: 320px"
          />
          <v-spacer />
          <v-btn
            icon="mdi-refresh"
            variant="text"
            rounded="lg"
            :loading="store.loading"
            title="Refresh"
            @click="store.fetchRoles()"
          />
        </div>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="store.roles"
        :loading="store.loading"
        :search="search"
        item-value="role_id"
        items-per-page="10"
        hover
        :header-props="{ class: 'text-caption font-weight-bold text-uppercase text-medium-emphasis' }"
      >
        <!-- Loading skeleton -->
        <template #loading>
          <v-skeleton-loader type="table-row@6" />
        </template>

        <!-- Role name -->
        <template #item.role_name="{ item }">
          <span class="font-weight-bold text-body-2">{{ item.role_name }}</span>
        </template>

        <!-- Description with fallback -->
        <template #item.description="{ item }">
          <span v-if="item.description" class="text-body-2 text-medium-emphasis text-truncate-cell">
            {{ item.description }}
          </span>
          <span v-else class="text-body-2 text-medium-emphasis font-italic">
            No description
          </span>
        </template>

        <!-- Created at -->
        <template #item.created_at="{ item }">
          <span class="text-body-2 text-medium-emphasis">
            {{ formatDate(item.created_at) }}
          </span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center justify-end ga-1">
            <v-btn icon size="small" variant="text" @click="openEdit(item)">
              <v-icon size="17" color="grey">mdi-pencil-outline</v-icon>
              <v-tooltip activator="parent" location="top">Edit</v-tooltip>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              :loading="store.deleting && deletingId === item.role_id"
              @click="confirmDelete(item)"
            >
              <v-icon size="17" color="grey">mdi-delete-outline</v-icon>
              <v-tooltip activator="parent" location="top">Delete</v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- Empty state -->
        <template #no-data>
          <div class="py-12 text-center">
            <v-icon size="48" color="medium-emphasis" class="mb-3">
              mdi-shield-account-outline
            </v-icon>
            <p class="text-body-1 text-medium-emphasis">No roles found.</p>
            <v-btn
              class="mt-4"
              color="var(--app-primary)"
              variant="tonal"
              rounded="lg"
              prepend-icon="mdi-plus"
              @click="openCreate"
            >
              <span style="color:#063824; font-weight:700">Create first role</span>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- ── Create / Edit Dialog ────────────────────────────────────────── -->
    <v-dialog v-model="dialogOpen" max-width="480" persistent>
      <v-card rounded="xl" elevation="0">
        <v-card-title class="d-flex align-center ga-3 pt-6 px-6">
          <v-avatar
            :color="isEditing ? 'primary' : 'success'"
            variant="tonal"
            size="40"
            rounded="lg"
          >
            <v-icon size="20">
              {{ isEditing ? 'mdi-account-edit-outline' : 'mdi-shield-plus-outline' }}
            </v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">
            {{ isEditing ? 'Edit Role' : 'New Role' }}
          </span>
        </v-card-title>

        <v-card-text class="px-6 pt-3">
          <!-- API error -->
          <v-alert
            v-if="store.error"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            {{ store.error }}
          </v-alert>

          <v-form ref="formRef" @submit.prevent="submitForm">
            <v-text-field
              v-model="form.role_name"
              label="Role Name *"
              placeholder="e.g. Administrator"
              :error-messages="store.fieldErrors?.role_name"
              :rules="[rules.required, rules.maxLen(100)]"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              autofocus
              class="mb-2"
            />

            <v-textarea
              v-model="form.description"
              label="Description"
              placeholder="Brief description of this role…"
              :error-messages="store.fieldErrors?.description"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              rows="3"
              no-resize
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            rounded="lg"
            :disabled="store.saving"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="var(--app-primary)"
            rounded="lg"
            :loading="store.saving"
            @click="submitForm"
          >
            <span style="color:#063824; font-weight:800">
              {{ isEditing ? 'Save Changes' : 'Create Role' }}
            </span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Delete Confirm Dialog ───────────────────────────────────────── -->
    <v-dialog v-model="deleteDialogOpen" max-width="400">
      <v-card rounded="xl" elevation="0">
        <v-card-text class="pa-6">
          <div class="d-flex align-center ga-3 mb-4">
            <v-avatar
              color="red-lighten-5"
              rounded="lg"
              size="44"
              style="border: 1px solid #fca5a5"
            >
              <v-icon color="error" size="22">mdi-delete-outline</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-black">Delete Role</span>
          </div>
          <p class="text-body-2 text-medium-emphasis">
            Are you sure you want to delete
            <strong>{{ roleToDelete?.role_name }}</strong>?
            This action cannot be undone.
          </p>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn
            variant="outlined"
            rounded="lg"
            :disabled="store.deleting"
            @click="deleteDialogOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            rounded="lg"
            :loading="store.deleting"
            @click="handleDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoleStore } from '@/stores/role.store'

// ─── Store ───────────────────────────────────────────────────────────────────
const store = useRoleStore()

// ─── Table ───────────────────────────────────────────────────────────────────
const search = ref('')

const headers = [
  { title: 'Role Name',   key: 'role_name',   sortable: true,  width: '20%'   },
  { title: 'Description', key: 'description', sortable: false                  },
  { title: 'Created',     key: 'created_at',  sortable: true,  width: '180px' },
  { title: '',            key: 'actions',     sortable: false, width: '90px', align: 'end' },
]

function formatDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(iso))
}

// ─── Form Dialog ─────────────────────────────────────────────────────────────
const dialogOpen = ref(false)
const isEditing  = ref(false)
const formRef    = ref(null)
const editingId  = ref(null)

const emptyForm = () => ({ role_name: '', description: '' })
const form      = ref(emptyForm())

const rules = {
  required: (v) => !!v?.trim() || 'This field is required.',
  maxLen:   (n) => (v) => !v || v.length <= n || `Max ${n} characters.`,
}

function openCreate() {
  isEditing.value  = false
  editingId.value  = null
  form.value       = emptyForm()
  store.clearErrors()
  dialogOpen.value = true
}

function openEdit(role) {
  isEditing.value  = true
  editingId.value  = role.role_id
  form.value       = { role_name: role.role_name, description: role.description ?? '' }
  store.clearErrors()
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  formRef.value?.reset()
  store.clearErrors()
}

async function submitForm() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const payload = {
    role_name:   form.value.role_name.trim(),
    description: form.value.description?.trim() || null,
  }

  const result = isEditing.value
    ? await store.updateRole(editingId.value, payload)
    : await store.createRole(payload)

  if (result) closeDialog()
}

// ─── Delete Dialog ───────────────────────────────────────────────────────────
const deleteDialogOpen = ref(false)
const roleToDelete     = ref(null)
const deletingId       = ref(null)

function confirmDelete(role) {
  roleToDelete.value     = role
  deleteDialogOpen.value = true
}

async function handleDelete() {
  if (!roleToDelete.value) return
  deletingId.value = roleToDelete.value.role_id
  const ok = await store.deleteRole(roleToDelete.value.role_id)
  if (ok) {
    deleteDialogOpen.value = false
    roleToDelete.value     = null
  }
  deletingId.value = null
}

// ─── Init ────────────────────────────────────────────────────────────────────
onMounted(() => store.fetchRoles())
</script>

<style scoped>
.text-truncate-cell {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>