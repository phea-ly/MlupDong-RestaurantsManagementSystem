<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user:       { type: Object,  default: null  },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const form          = ref({ firstName: '', lastName: '', email: '' })
const avatarFile    = ref(null)   // the raw File object — passed up to AppBar
const avatarPreview = ref(null)   // base64 data URL for preview only
const imgError      = ref(false)
const fileInput     = ref(null)
const errors        = ref({})
const isDragging    = ref(false)

// ── Normalise user prop ────────────────────────────────────────────
// Handles both auth store shape { id, first_name, last_name, avatar }
// and User.vue mapped shape     { rawId, name, email, avatar }
const normUser = computed(() => {
  const u = props.user
  if (!u) return null
  if (u.rawId !== undefined) return u
  const firstName = u.first_name ?? ''
  const lastName  = u.last_name  ?? ''
  return {
    rawId:       u.id,
    name:        `${firstName} ${lastName}`.trim(),
    email:       u.email ?? '',
    avatar:      resolveAvatarUrl(u.avatar),
    avatarColor: '#14dc8b',
    initials:    ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || 'AU',
  }
})

function resolveAvatarUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000')
    .replace(/\/api\/?$/, '').replace(/\/$/, '')
  return `${base}/${url.replace(/^\/+/, '')}`
}

// ── Sync form when dialog opens ────────────────────────────────────
watch(
  () => [props.modelValue, props.user],
  ([open]) => {
    if (!open) return
    errors.value     = {}
    avatarFile.value = null
    imgError.value   = false
    const u = normUser.value
    if (u) {
      const parts = u.name?.split(' ') ?? []
      form.value          = { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' '), email: u.email }
      avatarPreview.value = u.avatar ?? null
    } else {
      form.value          = { firstName: '', lastName: '', email: '' }
      avatarPreview.value = null
    }
  },
  { immediate: true }
)

const initials    = computed(() => {
  const f = form.value.firstName?.[0] ?? ''
  const l = form.value.lastName?.[0]  ?? ''
  return (f + l).toUpperCase() || normUser.value?.initials || '??'
})
const avatarColor = computed(() => normUser.value?.avatarColor ?? '#14dc8b')

function close() { emit('update:modelValue', false) }
function triggerFileInput() { fileInput.value?.click() }

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) processFile(file)
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) processFile(file)
}

function processFile(file) {
  if (file.size > 2 * 1024 * 1024) {
    errors.value = { ...errors.value, avatar: 'Image must be under 2 MB.' }
    return
  }
  errors.value     = { ...errors.value, avatar: null }
  avatarFile.value = file                       // keep File for parent
  const reader     = new FileReader()
  reader.onload    = ev => { avatarPreview.value = ev.target.result; imgError.value = false }
  reader.readAsDataURL(file)
}

function removeAvatar() {
  avatarFile.value    = null
  avatarPreview.value = null
  imgError.value      = false
  if (fileInput.value) fileInput.value.value = ''
}

function validate() {
  const e = {}
  if (!form.value.firstName.trim()) e.firstName = 'First name is required.'
  if (!form.value.email.trim())     e.email     = 'Email is required.'
  errors.value = e
  return !Object.keys(e).length
}

// ── Emit payload up — AppBar calls auth.updateProfile() ───────────
// This keeps the dialog dumb (no API calls) and the store as the source of truth
function handleSave() {
  if (!validate()) return
  emit('saved', {
    firstName:  form.value.firstName.trim(),
    lastName:   form.value.lastName.trim(),
    email:      form.value.email.trim(),
    avatarFile: avatarFile.value ?? null,   // File object or null
  })
  close()
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" elevation="0">

      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pt-6 px-6">
        <div class="d-flex align-center ga-3">
          <v-avatar color="blue-lighten-5" rounded="lg" size="40">
            <v-icon color="primary" size="20">mdi-account-edit-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-black">Edit Profile</div>
            <div class="text-caption text-medium-emphasis">Update info &amp; avatar</div>
          </div>
        </div>
        <v-btn icon size="small" variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pt-4">

        <!-- Avatar upload zone -->
        <div class="d-flex flex-column align-center mb-5">
          <div
            class="avatar-drop"
            :class="{ dragging: isDragging }"
            @click="triggerFileInput"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
          >
            <v-avatar size="96" rounded="xl" style="overflow:hidden;width:100%;height:100%;">
              <v-img
                v-if="avatarPreview && !imgError"
                :src="avatarPreview"
                cover
                @error="imgError = true"
              />
              <span
                v-else
                style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;"
                :style="{ background: avatarColor }"
              >{{ initials }}</span>
            </v-avatar>
            <div class="avatar-overlay">
              <v-icon color="white" size="22">mdi-camera-plus-outline</v-icon>
              <span style="font-size:11px;color:rgba(255,255,255,.9);font-weight:700">Change</span>
            </div>
          </div>

          <div class="text-center mt-2">
            <div class="text-caption text-medium-emphasis">Click or drag &amp; drop to upload</div>
            <div class="text-caption text-disabled">PNG, JPG, WEBP · max 2 MB</div>
          </div>
          <div v-if="errors.avatar" class="text-caption text-error mt-1">{{ errors.avatar }}</div>
          <v-btn
            v-if="avatarPreview"
            size="x-small" variant="outlined" color="error" rounded="lg" class="mt-2"
            prepend-icon="mdi-delete-outline"
            @click.stop="removeAvatar"
          >
            Remove photo
          </v-btn>
          <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
        </div>

        <!-- Fields -->
        <v-row dense>
          <v-col cols="6">
            <v-text-field
              v-model="form.firstName" label="First Name *"
              variant="outlined" rounded="lg" density="comfortable"
              :error-messages="errors.firstName"
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.lastName" label="Last Name"
              variant="outlined" rounded="lg" density="comfortable"
              :error-messages="errors.lastName"
            />
          </v-col>
        </v-row>

        <v-text-field
          v-model="form.email" label="Email Address *" type="email"
          variant="outlined" rounded="lg" density="comfortable"
          prepend-inner-icon="mdi-email-outline"
          :error-messages="errors.email"
          class="mt-2"
        />

      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" @click="close">Cancel</v-btn>
        <v-btn color="#14dc8b" variant="flat" rounded="lg" @click="handleSave">
          <span style="color:#063824;font-weight:800">Save Profile</span>
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>
.avatar-drop {
  position: relative; width: 96px; height: 96px;
  border-radius: 16px; cursor: pointer; overflow: hidden;
  border: 2px dashed #dbe3e7; transition: border-color 0.2s;
}
.avatar-drop:hover, .avatar-drop.dragging { border-color: #14dc8b; }
.avatar-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 3px; opacity: 0; transition: opacity 0.2s;
}
.avatar-drop:hover .avatar-overlay,
.avatar-drop.dragging .avatar-overlay { opacity: 1; }
</style>