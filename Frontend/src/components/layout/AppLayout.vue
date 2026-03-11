<script setup>
<<<<<<< HEAD
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import AppBar from "./AppBar.vue";
import Sidebar from "./Sidebar.vue";
=======
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useI18n } from '@/composables/useI18n'
import AppBar  from './AppBar.vue'
import Sidebar from './Sidebar.vue'
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
});

<<<<<<< HEAD
const auth = useAuthStore();
=======
const auth = useAuthStore()
const { t } = useI18n()
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2

const editDialog      = ref(false);
const editLoading     = ref(false);
const editError       = ref("");
const editSuccess     = ref("");
const activeTab       = ref("profile");
const avatarFile      = ref(null);
const avatarPreview   = ref(null);
const fileInput       = ref(null);
const editFirstName   = ref("");
const editLastName    = ref("");
const editEmail       = ref("");
const currentPassword = ref("");
const newPassword     = ref("");
const confirmPassword = ref("");
const showCurrent     = ref(false);
const showNew         = ref(false);
const showConfirm     = ref(false);

const profileInitials = computed(() => {
  const f = auth.user?.first_name?.[0] ?? "A";
  const l = auth.user?.last_name?.[0] ?? "U";
  return (f + l).toUpperCase();
});

const dialogAvatarSrc = computed(() =>
  avatarPreview.value ?? auth.user?.avatar ?? null
);

function openEdit(tab = "profile") {
  editFirstName.value   = auth.user?.first_name ?? "";
  editLastName.value    = auth.user?.last_name  ?? "";
  editEmail.value       = auth.user?.email      ?? "";
  currentPassword.value = "";
  newPassword.value     = "";
  confirmPassword.value = "";
  avatarFile.value      = null;
  avatarPreview.value   = null;
  editError.value       = "";
  editSuccess.value     = "";
  activeTab.value       = tab;
  editDialog.value      = true;
}

function triggerFileInput() {
  fileInput.value?.click();
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  avatarFile.value = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    avatarPreview.value = ev.target.result; 
  };
  reader.readAsDataURL(file);
}

async function saveProfile() {
  editError.value   = "";
  editSuccess.value = "";
  editLoading.value = true;

  try {
    if (activeTab.value === "profile") {
      // The store's updateProfile will then overwrite it with the real server URL.
      if (avatarFile.value && avatarPreview.value) {
        auth.patchAvatar(avatarPreview.value);
      }

      await auth.updateProfile({
        first_name: editFirstName.value,
        last_name:  editLastName.value,
<<<<<<< HEAD
        avatar:     avatarFile.value ?? undefined,
      });

      editSuccess.value = "Profile updated successfully!";
      setTimeout(() => {
        editDialog.value    = false;
        editSuccess.value   = "";
        avatarFile.value    = null;
        avatarPreview.value = null;
      }, 1200);

=======
      })
      editSuccess.value = t('profile.profileUpdated')
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2
    } else {
      // Password change
      if (newPassword.value !== confirmPassword.value) {
<<<<<<< HEAD
        editError.value = "Passwords do not match.";
        return;
      }
      await auth.updatePassword({
        current_password:          currentPassword.value,
        new_password:              newPassword.value,
        new_password_confirmation: confirmPassword.value,
      });
      editSuccess.value = "Password updated successfully!";
      setTimeout(() => {
        editDialog.value  = false;
        editSuccess.value = "";
      }, 1200);
    }
  } catch (e) {
    editError.value = e.response?.data?.message || "Update failed.";
=======
        editError.value = t('profile.newPasswordsMismatch')
        return
      }
      if (newPassword.value.length < 6) {
        editError.value = t('profile.passwordMinLength')
        return
      }
      await auth.updateProfile({
        current_password:      currentPassword.value,
        password:              newPassword.value,
        password_confirmation: confirmPassword.value,
      })
      editSuccess.value     = t('profile.passwordChanged')
      currentPassword.value = ''
      newPassword.value     = ''
      confirmPassword.value = ''
    }
  } catch (e) {
    editError.value = e.response?.data?.message || t('profile.updateFailed')
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2
  } finally {
    editLoading.value = false;
  }
}
</script>

<template>
  <v-app style="background: #edf2f1">
    <Sidebar />
    <AppBar :title="title" :subtitle="subtitle" @open-edit="openEdit" />

    <v-main style="background: #edf2f1">
      <v-container fluid class="pa-5">
        <slot />
      </v-container>
    </v-main>

    <!-- Edit Profile Dialog -->
    <v-dialog v-model="editDialog" max-width="460" persistent>
      <v-card rounded="xl" elevation="0" style="border:1px solid #dde5e8; overflow:visible">

        <!-- Header -->
        <v-card-title class="d-flex align-center justify-space-between px-5 pt-5 pb-0">
          <div>
<<<<<<< HEAD
            <div style="font-size:16px; font-weight:800; color:#1a2e48">Account Settings</div>
            <div style="font-size:12px; color:#7f90a4">Manage your profile and security</div>
=======
            <div style="font-size: 16px; font-weight: 800; color: #1a2e48">
              {{ t('profile.accountSettings') }}
            </div>
            <div style="font-size: 12px; color: #7f90a4">
              {{ t('profile.manageProfileSecurity') }}
            </div>
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2
          </div>
          <v-btn icon variant="text" size="small" color="#7f90a4" @click="editDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Avatar — clickable -->
        <div class="d-flex justify-center mt-5 mb-2">
          <div class="avatar-wrap" @click="triggerFileInput">
            <v-avatar size="80" style="box-shadow:0 6px 20px rgba(15,158,95,0.3)">
              <img
                v-if="dialogAvatarSrc"
                :key="dialogAvatarSrc"
                :src="dialogAvatarSrc"
                style="width:100%; height:100%; object-fit:cover; border-radius:50%;"
              />
              <span
                v-else
                style="background:linear-gradient(135deg,#19e092,#0f9e5f); width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:900; color:#063824;"
              >{{ profileInitials }}</span>
            </v-avatar>
            <div class="avatar-overlay">
              <v-icon size="18" color="white">mdi-camera</v-icon>
            </div>
          </div>
<<<<<<< HEAD
          <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
=======
          <!-- Hidden file input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onFileChange"
          />
        </div>
        <div class="text-center mb-1" style="font-size: 11px; color: #9aabbd">
          {{ t('profile.changePhoto') }}
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2
        </div>
        <div class="text-center mb-1" style="font-size:11px; color:#9aabbd">Click avatar to change photo</div>

        <!-- Tabs -->
<<<<<<< HEAD
        <v-tabs v-model="activeTab" color="#0f9e5f" density="compact" class="px-5 mt-2" hide-slider>
          <v-tab value="profile" rounded="lg" class="tab-item" style="text-transform:none; font-weight:700; font-size:13px">
            <v-icon start size="16">mdi-account-outline</v-icon>Profile
          </v-tab>
          <v-tab value="password" rounded="lg" class="tab-item" style="text-transform:none; font-weight:700; font-size:13px">
            <v-icon start size="16">mdi-shield-lock-outline</v-icon>Password
=======
        <v-tabs
          v-model="activeTab"
          color="#0f9e5f"
          density="compact"
          class="px-5 mt-2"
          hide-slider
        >
          <v-tab
            value="profile"
            rounded="lg"
            class="tab-item"
            style="text-transform: none; font-weight: 700; font-size: 13px"
          >
            <v-icon start size="16">mdi-account-outline</v-icon>
            {{ t('profile.profile') }}
          </v-tab>
          <v-tab
            value="password"
            rounded="lg"
            class="tab-item"
            style="text-transform: none; font-weight: 700; font-size: 13px"
          >
            <v-icon start size="16">mdi-shield-lock-outline</v-icon>
            {{ t('profile.password') }}
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2
          </v-tab>
        </v-tabs>

        <v-divider style="border-color:#eaeff2; margin-top:8px" />

        <v-card-text class="pa-5 pt-4">
          <v-alert v-if="editError"   type="error"   variant="tonal" rounded="lg" density="compact" closable class="mb-4" @click:close="editError = ''">{{ editError }}</v-alert>
          <v-alert v-if="editSuccess" type="success" variant="tonal" rounded="lg" density="compact" closable class="mb-4" @click:close="editSuccess = ''">{{ editSuccess }}</v-alert>

          <v-window v-model="activeTab">

            <!-- Profile Tab -->
            <v-window-item value="profile">
              <v-row dense class="mt-1">
                <v-col cols="6">
<<<<<<< HEAD
                  <v-text-field v-model="editFirstName" label="First Name" variant="outlined" rounded="lg" density="comfortable" color="#0f9e5f" prepend-inner-icon="mdi-account-outline" />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="editLastName" label="Last Name" variant="outlined" rounded="lg" density="comfortable" color="#0f9e5f" />
                </v-col>
              </v-row>
              <v-text-field v-model="editEmail" label="Email Address" variant="outlined" rounded="lg" density="comfortable" color="#0f9e5f" prepend-inner-icon="mdi-email-outline" readonly bg-color="#f7faf9" />
=======
                  <v-text-field
                    v-model="editFirstName"
                    :label="t('profile.firstName')"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    color="#0f9e5f"
                    prepend-inner-icon="mdi-account-outline"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="editLastName"
                    :label="t('profile.lastName')"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    color="#0f9e5f"
                  />
                </v-col>
              </v-row>

              <v-text-field
                v-model="editEmail"
                :label="t('profile.emailAddress')"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                color="#0f9e5f"
                prepend-inner-icon="mdi-email-outline"
                readonly
                bg-color="#f7faf9"
              />
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2
            </v-window-item>

            <!-- Password Tab -->
            <v-window-item value="password">
              <div class="mt-1">
                <v-text-field
<<<<<<< HEAD
                  v-model="currentPassword" label="Current Password"
=======
                  v-model="currentPassword"
                  :label="t('profile.currentPassword')"
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2
                  :type="showCurrent ? 'text' : 'password'"
                  :append-inner-icon="showCurrent ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  variant="outlined" rounded="lg" density="comfortable" color="#0f9e5f"
                  prepend-inner-icon="mdi-lock-outline" class="mb-1"
                  @click:append-inner="showCurrent = !showCurrent"
                />
                <v-text-field
<<<<<<< HEAD
                  v-model="newPassword" label="New Password"
=======
                  v-model="newPassword"
                  :label="t('profile.newPassword')"
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2
                  :type="showNew ? 'text' : 'password'"
                  :append-inner-icon="showNew ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  variant="outlined" rounded="lg" density="comfortable" color="#0f9e5f"
                  prepend-inner-icon="mdi-lock-plus-outline" class="mb-1"
                  @click:append-inner="showNew = !showNew"
                />
                <v-text-field
<<<<<<< HEAD
                  v-model="confirmPassword" label="Confirm New Password"
=======
                  v-model="confirmPassword"
                  :label="t('profile.confirmNewPassword')"
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2
                  :type="showConfirm ? 'text' : 'password'"
                  :append-inner-icon="showConfirm ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                  variant="outlined" rounded="lg" density="comfortable" color="#0f9e5f"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :error="!!confirmPassword && newPassword !== confirmPassword"
<<<<<<< HEAD
                  :error-messages="confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : ''"
=======
                  :error-messages="
                    confirmPassword && newPassword !== confirmPassword
                      ? t('profile.passwordMismatch')
                      : ''
                  "
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2
                  @click:append-inner="showConfirm = !showConfirm"
                />
              </div>
            </v-window-item>

          </v-window>
        </v-card-text>

        <v-divider style="border-color:#eaeff2" />

        <v-card-actions class="pa-4">
<<<<<<< HEAD
          <v-btn variant="outlined" rounded="lg" color="#7f90a4" style="text-transform:none; font-weight:600" @click="editDialog = false">
            Cancel
=======
          <v-btn
            variant="outlined"
            rounded="lg"
            color="#7f90a4"
            style="text-transform: none; font-weight: 600"
            @click="editDialog = false"
          >
            {{ t('common.cancel') }}
>>>>>>> caf3139dee2eef85295594955a6455c31a4b22a2
          </v-btn>
          <v-spacer />
          <v-btn
            variant="flat" rounded="lg" :loading="editLoading"
            style="background:linear-gradient(135deg,#19e092,#0f9e5f); color:#063824; font-weight:700; text-transform:none;"
            @click="saveProfile"
          >
            <v-icon start size="16">mdi-check</v-icon>
            {{ activeTab === "profile" ? t('profile.saveProfile') : t('profile.updatePassword') }}
          </v-btn>
        </v-card-actions>

      </v-card>
    </v-dialog>
  </v-app>
</template>

<style scoped>
.avatar-wrap { position:relative; cursor:pointer; display:inline-block; border-radius:50%; }
.avatar-overlay {
  position:absolute; inset:0; border-radius:50%;
  background:rgba(0,0,0,0.38); display:flex; align-items:center; justify-content:center;
  opacity:0; transition:opacity 0.2s;
}
.avatar-wrap:hover .avatar-overlay { opacity:1; }
.tab-item { min-width:110px !important; }
.tab-item.v-tab--selected { background:#def4e8 !important; color:#0f9e5f !important; border-radius:8px; }
</style>