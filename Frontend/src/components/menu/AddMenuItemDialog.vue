<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useMenuStore } from '@/stores/menu.store'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editItem:   { type: Object,  default: null  },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const menuStore = useMenuStore()

// ── Form ───────────────────────────────────────────────────────────────────
const defaultForm = () => ({
  item_name:   '',
  price:       '',
  description: '',
  category_id: null,
  status:      true,
})

const form         = ref(defaultForm())
const imageFile    = ref(null)
const imagePreview = ref(null)
const imageSource  = ref('upload')   // 'upload' | 'url'
const imageUrl     = ref('')
const objectUrl    = ref(null)
const saving       = ref(false)
const errors       = ref({})
const fileInput    = ref(null)
const imageUrlInput = ref(null)

const isEdit = computed(() => !!props.editItem)
const title  = computed(() => isEdit.value ? 'Edit Menu Item' : 'Add Menu Item')

const categoryItems = computed(() =>
  menuStore.categories.map(c => ({ title: c.category_name, value: c.category_id }))
)

// ── Resolve stored image URL (same logic as store) ─────────────────────────
function resolveImageUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = (import.meta.env.VITE_STORAGE_URL ?? 'http://127.0.0.1:8000/storage').replace(/\/+$/, '')
  const clean = path.replace(/^\/storage/, '')
  return `${base}${clean}`
}

// ── Populate / reset when dialog opens ────────────────────────────────────
watch(
  () => [props.modelValue, props.editItem],
  ([open]) => {
    if (!open) return
    errors.value      = {}
    imageFile.value   = null
    imageUrl.value    = ''
    imageSource.value = 'upload'
    if (objectUrl.value) { URL.revokeObjectURL(objectUrl.value); objectUrl.value = null }

    if (props.editItem) {
      form.value = {
        item_name:   props.editItem.name,
        price:       props.editItem.price,
        description: props.editItem.description ?? '',
        category_id: props.editItem.category_id ?? null,
        status:      props.editItem.status       ?? true,
      }
      // image stored as '/storage/...' path or full URL
      const resolved = resolveImageUrl(props.editItem.image ?? null)
      imagePreview.value = resolved

      if (props.editItem.image?.startsWith('http')) {
        imageSource.value = 'url'
        imageUrl.value    = props.editItem.image
      }
    } else {
      form.value         = defaultForm()
      imagePreview.value = null
    }
  },
  { immediate: true }
)

// Keep URL preview in sync when typing
watch(imageUrl, (val) => {
  if (imageSource.value !== 'url') return
  imagePreview.value = val?.trim() ? val.trim() : null
})

// Clear the other source when switching
watch(imageSource, (val) => {
  if (val === 'url') {
    imageFile.value = null
    if (fileInput.value) fileInput.value.value = ''
  } else {
    imageUrl.value = ''
  }
})

// ── Image handlers ─────────────────────────────────────────────────────────
function triggerFileInput() { fileInput.value?.click() }
function selectUpload()     { imageSource.value = 'upload' }
function selectUrl()        { imageSource.value = 'url'; nextTick(() => imageUrlInput.value?.focus?.()) }

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  imageSource.value = 'upload'
  imageFile.value   = file
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  objectUrl.value    = URL.createObjectURL(file)
  imagePreview.value = objectUrl.value
}

function removeImage() {
  imageFile.value    = null
  imagePreview.value = null
  imageUrl.value     = ''
  if (objectUrl.value) { URL.revokeObjectURL(objectUrl.value); objectUrl.value = null }
  if (fileInput.value) fileInput.value.value = ''
}

// ── Validation ─────────────────────────────────────────────────────────────
function validate() {
  const e = {}
  if (!form.value.item_name.trim())
    e.item_name = 'Name is required.'
  if (form.value.price === '' || form.value.price === null)
    e.price = 'Price is required.'
  if (isNaN(Number(form.value.price)) || Number(form.value.price) < 0)
    e.price = 'Enter a valid price.'

  const hasExistingImage = isEdit.value && !!props.editItem?.image
  if (imageSource.value === 'upload') {
    if (!imageFile.value && !hasExistingImage)
      e.image = 'Please upload an image.'
  } else {
    const val = imageUrl.value.trim()
    if (!val)
      e.image = 'Please enter an image URL.'
    else if (!/^https?:\/\//i.test(val))
      e.image = 'Image URL must start with http:// or https://'
  }

  errors.value = e
  return Object.keys(e).length === 0
}

// ── Save ───────────────────────────────────────────────────────────────────
async function handleSave() {
  if (!validate()) return
  saving.value = true

  let payload
  if (imageSource.value === 'upload' && imageFile.value) {
    // Multipart — Laravel needs POST + _method spoofing for PUT
    payload = new FormData()
    payload.append('item_name',   form.value.item_name.trim())
    payload.append('price',       form.value.price)
    payload.append('description', form.value.description ?? '')
    payload.append('status',      form.value.status ? '1' : '0')
    if (form.value.category_id) payload.append('category_id', form.value.category_id)
    payload.append('image', imageFile.value)
  } else {
    payload = {
      item_name:   form.value.item_name.trim(),
      price:       Number(form.value.price),
      description: form.value.description || null,
      status:      form.value.status,
      category_id: form.value.category_id ?? null,
    }
    if (imageSource.value === 'url' && imageUrl.value.trim())
      payload.image = imageUrl.value.trim()
    // Explicitly null = remove existing image
    if (isEdit.value && !imagePreview.value && props.editItem?.image)
      payload.image = null
  }

  // store actions expect rawId for updates
  const result = isEdit.value
    ? await menuStore.updateMenuItem(props.editItem.rawId, payload)
    : await menuStore.addMenuItem(payload)

  saving.value = false

  if (result.success) {
    emit('saved')
    emit('update:modelValue', false)
  } else if (result.errors) {
    const mapped = {}
    for (const [field, msgs] of Object.entries(result.errors)) {
      mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs
    }
    errors.value = mapped
  }
}

function close() { emit('update:modelValue', false) }
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    rounded="xl"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" elevation="0">

      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between pt-6 px-6">
        <div class="d-flex align-center ga-3">
          <v-avatar color="var(--app-primary)" variant="tonal" size="40" rounded="lg">
            <v-icon size="20" color="var(--app-primary-600)">
              {{ isEdit ? 'mdi-pencil-outline' : 'mdi-silverware-fork-knife' }}
            </v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">{{ title }}</span>
        </div>
        <v-btn icon size="small" variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pt-3">

        <!-- Image source toggle -->
        <div class="d-flex align-center ga-2 mb-2">
          <v-btn
            size="small" rounded="lg" prepend-icon="mdi-upload"
            :variant="imageSource === 'upload' ? 'flat' : 'outlined'"
            color="var(--app-primary)"
            @click="selectUpload"
          >Upload (Local)</v-btn>
        </div>

        <!-- Upload area -->
        <template v-if="imageSource === 'upload'">
          <div
            class="upload-drop-zone mb-1"
            @click="triggerFileInput"
          >
            <v-img v-if="imagePreview" :src="imagePreview" height="58" cover />
            <div v-else class="d-flex flex-column align-center ga-1">
              <v-icon size="24" color="grey-lighten-1">mdi-image-plus-outline</v-icon>
              <span class="text-caption font-weight-bold text-medium-emphasis">Click to upload from local storage</span>
              <span class="text-caption text-disabled">PNG, JPG, WEBP — max 2 MB</span>
            </div>
            <v-btn
              v-if="imagePreview"
              icon size="x-small" color="white"
              class="img-remove-btn"
              @click.stop="removeImage"
            >
              <v-icon size="14">mdi-close</v-icon>
            </v-btn>
          </div>
          <div v-if="errors.image" class="text-caption text-error mb-2">{{ errors.image }}</div>
          <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
        </template>

        <!-- Item name -->
        <v-text-field
          v-model="form.item_name"
          label="Item Name *"
          variant="outlined" rounded="lg" density="comfortable"
          :error-messages="errors.item_name"
          class="mb-3"
        />

        <!-- Price + Category -->
        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-text-field
              v-model="form.price"
              label="Price (USD) *"
              type="number" min="0" step="0.01" prefix="$"
              variant="outlined" rounded="lg" density="comfortable"
              :error-messages="errors.price"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="form.category_id"
              :items="categoryItems"
              label="Category"
              variant="outlined" rounded="lg" density="comfortable"
              clearable
            />
          </v-col>
        </v-row>

        <!-- Description -->
        <v-textarea
          v-model="form.description"
          label="Description"
          variant="outlined" rounded="lg"
          rows="2" no-resize
          class="mb-3"
        />

        <!-- Status -->
        <v-card rounded="lg" variant="tonal" color="grey-lighten-3">
          <v-card-text class="d-flex align-center justify-space-between py-3">
            <div>
              <div class="text-body-2 font-weight-bold">Availability</div>
              <div class="text-caption text-medium-emphasis">
                {{ form.status ? 'Visible on menu' : 'Hidden from menu' }}
              </div>
            </div>
            <v-switch v-model="form.status" color="var(--app-primary)" hide-details inset density="compact" />
          </v-card-text>
        </v-card>

      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" :disabled="saving" @click="close">Cancel</v-btn>
        <v-btn color="var(--app-primary)" rounded="lg" :loading="saving" @click="handleSave">
          <span style="color:#063824; font-weight:800">{{ isEdit ? 'Save Changes' : 'Add Item' }}</span>
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<style scoped>
.upload-drop-zone {
  display: flex; align-items: center; justify-content: center;
  height: 58px;
  border: 2px dashed #dbe3e7;
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: border-color .2s, background .2s;
}
.upload-drop-zone:hover {
  border-color: var(--app-primary);
  background: rgba(15, 158, 95, 0.03);
}
.img-remove-btn {
  position: absolute !important;
  top: 8px; right: 8px;
  background: rgba(0,0,0,.5) !important;
}
</style>