<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import AppBar  from './AppBar.vue'
import Sidebar from './Sidebar.vue'

defineProps({
  title:    { type: String, required: true },
  subtitle: { type: String, required: true },
})

const auth = useAuthStore()

const editDialog      = ref(false)
const editLoading     = ref(false)
const editError       = ref('')
const editSuccess     = ref('')
const activeTab       = ref('profile')
const avatarFile      = ref(null)
const avatarPreview   = ref(null)
const fileInput       = ref(null)
const editFirstName   = ref('')
const editLastName    = ref('')
const editEmail       = ref('')
const currentPassword = ref('')
const newPassword     = ref('')
const confirmPassword = ref('')
const showCurrent     = ref(false)
const showNew         = ref(false)
const showConfirm     = ref(false)

const profileInitials = computed(() => {
  const f = auth.user?.first_name?.[0] ?? 'A'
  const l = auth.user?.last_name?.[0]  ?? 'U'
  return (f + l).toUpperCase()
})

const dialogAvatarSrc = computed(() =>
  avatarPreview.value ?? auth.user?.avatar ?? null
)

function openEdit(tab = 'profile') {
  editFirstName.value   = auth.user?.first_name ?? ''
  editLastName.value    = auth.user?.last_name  ?? ''
  editEmail.value       = auth.user?.email      ?? ''
  currentPassword.value = ''
  newPassword.value     = ''
  confirmPassword.value = ''
  avatarFile.value      = null
  avatarPreview.value   = null
  editError.value       = ''
  editSuccess.value     = ''
  activeTab.value       = tab
  editDialog.value      = true
}

function triggerFileInput() { fileInput.value?.click() }

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = ev => { avatarPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

async function saveProfile() {
  editError.value   = ''
  editSuccess.value = ''
  editLoading.value = true
  try {
    if (activeTab.value === 'profile') {
      if (avatarFile.value && avatarPreview.value) auth.patchAvatar(avatarPreview.value)
      const profilePayload = { first_name: editFirstName.value, last_name: editLastName.value }
      if (avatarFile.value) profilePayload.avatar = avatarFile.value
      await auth.updateProfile(profilePayload)
      editSuccess.value = 'Profile updated successfully.'
    } else {
      if (newPassword.value !== confirmPassword.value) { editError.value = 'New passwords do not match.'; return }
      if (newPassword.value.length < 6) { editError.value = 'Password must be at least 6 characters.'; return }
      await auth.updateProfile({
        current_password:      currentPassword.value,
        password:              newPassword.value,
        password_confirmation: confirmPassword.value,
      })
      editSuccess.value     = 'Password changed successfully.'
      currentPassword.value = ''
      newPassword.value     = ''
      confirmPassword.value = ''
    }
  } catch (e) {
    editError.value = e.response?.data?.message || 'Update failed. Please try again.'
  } finally {
    editLoading.value = false
  }
}
</script>

<template>
  <v-app style="background:#edf2f1">
    <Sidebar />
    <AppBar :title="title" :subtitle="subtitle" @open-edit="openEdit" />

    <v-main style="background:#edf2f1">
      <v-container fluid class="pa-0">
        <div class="page-shell">
          <slot />
        </div>
      </v-container>
    </v-main>

    <!-- ── Edit Profile Dialog ── -->
    <v-dialog v-model="editDialog" max-width="480" persistent rounded="xl">
      <v-card rounded="xl" elevation="0">

        <v-card-title class="d-flex align-center justify-space-between pt-5 px-6">
          <div>
          </div>
          <v-btn icon size="small" variant="text" @click="editDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Avatar -->
        <div class="d-flex flex-column align-center mt-3 mb-1">
          <v-hover v-slot="{ isHovering, props: hp }">
            <v-avatar
              v-bind="hp"
              size="80"
              style="cursor:pointer; box-shadow:0 6px 20px rgba(15,158,95,0.3);"
              @click="triggerFileInput"
            >
              <v-img v-if="dialogAvatarSrc" :src="dialogAvatarSrc" cover />
              <span
                v-else
                style="background:linear-gradient(135deg,var(--app-primary),var(--app-primary-600)); width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:900; color:#063824;"
              >{{ profileInitials }}</span>
              <v-overlay :model-value="isHovering" contained class="d-flex align-center justify-center" style="border-radius:50%">
                <v-icon color="white">mdi-camera</v-icon>
              </v-overlay>
            </v-avatar>
          </v-hover>
          <div class="text-caption text-disabled mt-1">Click avatar to change photo</div>
          <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
        </div>

        <!-- Tabs -->
        <v-tabs v-model="activeTab" color="var(--app-primary-600)" density="compact" class="px-5 mt-2">
          <v-tab value="profile" rounded="lg">
            <v-icon start size="16">mdi-account-outline</v-icon>
            Profile
          </v-tab>
          <v-tab value="password" rounded="lg">
            <v-icon start size="16">mdi-shield-lock-outline</v-icon>
            Password
          </v-tab>
        </v-tabs>

        <v-divider class="mt-2" />

        <v-card-text class="px-6 pt-4">
          <v-alert v-if="editError"   type="error"   variant="tonal" rounded="lg" density="compact" closable class="mb-4" @click:close="editError = ''">{{ editError }}</v-alert>
          <v-alert v-if="editSuccess" type="success" variant="tonal" rounded="lg" density="compact" closable class="mb-4" @click:close="editSuccess = ''">{{ editSuccess }}</v-alert>

          <v-window v-model="activeTab">

            <v-window-item value="profile">
              <v-row dense class="mt-1">
                <v-col cols="6">
                  <v-text-field v-model="editFirstName" label="First Name" variant="outlined" rounded="lg" density="comfortable" prepend-inner-icon="mdi-account-outline" />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="editLastName"  label="Last Name"  variant="outlined" rounded="lg" density="comfortable" />
                </v-col>
              </v-row>
              <v-text-field v-model="editEmail" label="Email Address" variant="outlined" rounded="lg" density="comfortable" prepend-inner-icon="mdi-email-outline" readonly bg-color="grey-lighten-4" />
            </v-window-item>

            <v-window-item value="password">
              <div class="mt-1 d-flex flex-column ga-2">
                <v-text-field
                  v-model="currentPassword" label="Current Password"
                  :type="showCurrent ? 'text' : 'password'"
                  :append-inner-icon="showCurrent ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  variant="outlined" rounded="lg" density="comfortable"
                  prepend-inner-icon="mdi-lock-outline"
                  @click:append-inner="showCurrent = !showCurrent"
                />
                <v-text-field
                  v-model="newPassword" label="New Password"
                  :type="showNew ? 'text' : 'password'"
                  :append-inner-icon="showNew ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  variant="outlined" rounded="lg" density="comfortable"
                  prepend-inner-icon="mdi-lock-plus-outline"
                  @click:append-inner="showNew = !showNew"
                />
                <v-text-field
                  v-model="confirmPassword" label="Confirm New Password"
                  :type="showConfirm ? 'text' : 'password'"
                  :append-inner-icon="showConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  variant="outlined" rounded="lg" density="comfortable"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :error="!!confirmPassword && newPassword !== confirmPassword"
                  :error-messages="confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match.' : ''"
                  @click:append-inner="showConfirm = !showConfirm"
                />
              </div>
            </v-window-item>

          </v-window>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-btn variant="outlined" rounded="lg" @click="editDialog = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            color="var(--app-primary-600)" rounded="lg" variant="flat"
            :loading="editLoading"
            prepend-icon="mdi-check"
            @click="saveProfile"
          >
            {{ activeTab === 'profile' ? 'Save Profile' : 'Update Password' }}
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
  </v-app>
</template>

