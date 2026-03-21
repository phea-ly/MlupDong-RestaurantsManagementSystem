<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useMenuStore } from '@/stores'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editItem:   { type: Object,  default: null  },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const menuStore = useMenuStore()

const defaultForm = () => ({ item_name: '', price: '', description: '', category_id: null, status: true })

const form         = ref(defaultForm())
const imageFile    = ref(null)
const imagePreview = ref(null)
const imageSource  = ref('upload') // upload | url
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

watch(
  () => [props.modelValue, props.editItem],
  ([open]) => {
    if (!open) return
    errors.value    = {}
    imageFile.value = null
    imageUrl.value  = ''
    imageSource.value = 'upload'
    if (props.editItem) {
      form.value = {
        item_name:   props.editItem.name,
        price:       props.editItem.price,
        description: props.editItem.description ?? '',
        category_id: props.editItem.category_id ?? null,
        status:      props.editItem.status ?? true,
      }
      imagePreview.value = props.editItem.image ? resolveImageUrl(props.editItem.image) : null
      if (props.editItem.image?.startsWith('http')) {
        imageSource.value = 'url'
        imageUrl.value = props.editItem.image
      }
    } else {
      form.value         = defaultForm()
      imagePreview.value = null
    }
  },
  { immediate: true }
)

function resolveImageUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000'
  return `${base}${path}`
}

function close() { emit('update:modelValue', false) }

function triggerFileInput() { fileInput.value?.click() }
function selectUpload() { imageSource.value = 'upload' }
function selectUrl() {
  imageSource.value = 'url'
  nextTick(() => imageUrlInput.value?.focus?.())
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  imageSource.value = 'upload'
  imageFile.value = file
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = URL.createObjectURL(file)
  imagePreview.value = objectUrl.value
}

function removeImage() {
  imageFile.value    = null
  imagePreview.value = null
  imageUrl.value     = ''
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = null
  }
  if (fileInput.value) fileInput.value.value = ''
}

watch(imageSource, (val) => {
  if (val === 'url') {
    imageFile.value = null
    if (fileInput.value) fileInput.value.value = ''
  } else {
    imageUrl.value = ''
  }
})

watch(imageUrl, (val) => {
  if (imageSource.value !== 'url') return
  imagePreview.value = val?.trim() ? val.trim() : null
})

function validate() {
  const e = {}
  if (!form.value.item_name.trim())                          e.item_name = 'Name is required.'
  if (form.value.price === '' || form.value.price === null)  e.price     = 'Price is required.'
  if (isNaN(Number(form.value.price)) || Number(form.value.price) < 0) e.price = 'Enter a valid price.'
  const hasExistingImage = isEdit.value && !!props.editItem?.image
  if (imageSource.value === 'upload') {
    if (!imageFile.value && !hasExistingImage) e.image = 'Please upload an image.'
  } else if (imageSource.value === 'url') {
    const val = imageUrl.value.trim()
    if (!val) e.image = 'Please enter an image URL.'
    else if (!/^https?:\/\//i.test(val)) e.image = 'Image URL must start with http:// or https://'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

async function handleSave() {
  if (!validate()) return
  saving.value = true

  let payload
  if (imageSource.value === 'upload' && imageFile.value) {
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
      price:       form.value.price,
      description: form.value.description ?? '',
      status:      form.value.status,
      category_id: form.value.category_id ?? null,
    }
    if (imageSource.value === 'url' && imageUrl.value.trim()) payload.image = imageUrl.value.trim()
    if (isEdit.value && !imagePreview.value && props.editItem?.image) payload.image = null
  }

  const result = isEdit.value
    ? await menuStore.updateMenuItem(props.editItem.id, payload)
    : await menuStore.addMenuItem(payload)

  saving.value = false

  if (result.success) {
    emit('saved')
    close()
  } else if (result.errors) {
    const mapped = {}
    for (const [field, msgs] of Object.entries(result.errors)) {
      mapped[field] = Array.isArray(msgs) ? msgs[0] : msgs
    }
    errors.value = mapped
  }
}
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
            <v-icon size="20" color="var(--app-primary-600)">{{ isEdit ? 'mdi-pencil-outline' : 'mdi-silverware-fork-knife' }}</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">{{ title }}</span>
        </div>
        <v-btn icon size="small" variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="px-6 pt-3">
        <!-- Image Source -->
        <div class="d-flex align-center ga-2 mb-1">
          <v-btn
            size="small"
            rounded="lg"
            prepend-icon="mdi-upload"
            :variant="imageSource === 'upload' ? 'flat' : 'outlined'"
            color="var(--app-primary)"
            @click="selectUpload"
          >
            Upload (Local)
          </v-btn>
          <v-btn
            size="small"
            rounded="lg"
            prepend-icon="mdi-link-variant"
            :variant="imageSource === 'url' ? 'flat' : 'outlined'"
            color="var(--app-primary)"
            @click="selectUrl"
          >
            Paste Image URL
          </v-btn>
        </div>

        <!-- Image Upload / URL -->
        <template v-if="imageSource === 'upload'">
          <div
            class="d-flex align-center justify-center mb-4"
            style="height:58px; border:2px dashed #dbe3e7; border-radius:12px; cursor:pointer; overflow:hidden; position:relative; transition:border-color 0.2s, background 0.2s;"
            @click="triggerFileInput"
          >
            <v-img v-if="imagePreview" :src="imagePreview" height="58" cover />
            <div v-else class="d-flex flex-column align-center ga-1">
              <v-icon size="24" color="grey-lighten-1">mdi-image-plus-outline</v-icon>
              <span class="text-caption font-weight-bold text-medium-emphasis">Click to upload from local storage</span>
              <span class="text-caption text-disabled">PNG, JPG, WEBP - max 2 MB</span>
            </div>
            <v-btn
              v-if="imagePreview"
              icon size="x-small"
              color="white"
              style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.5);"
              @click.stop="removeImage"
            >
              <v-icon size="14">mdi-close</v-icon>
            </v-btn>
          </div>
          <div v-if="errors.image" class="text-caption text-error mt-1">{{ errors.image }}</div>
          <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
        </template>

        <template v-else>
          <div class="mb-3">
            <v-text-field
              v-model="imageUrl"
              ref="imageUrlInput"
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              prepend-inner-icon="mdi-link-variant"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              :error-messages="errors.image"
            />
            <v-card v-if="imagePreview" rounded="lg" border flat style="overflow:hidden">
              <v-img :src="imagePreview" height="58" cover />
            </v-card>
          </div>
        </template>

        <!-- Fields -->
        <v-text-field
          v-model="form.item_name"
          label="Item Name *"
          variant="outlined" rounded="lg" density="comfortable"
          :error-messages="errors.item_name"
          class="mb-3"
        />

        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-text-field
              v-model="form.price"
              label="Price (USD) *"
              type="number" min="0" step="0.01"
              variant="outlined" rounded="lg" density="comfortable"
              prefix="$"
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

        <v-textarea
          v-model="form.description"
          label="Description"
          variant="outlined" rounded="lg"
          rows="2" no-resize
          class="mb-3"
        />

        <v-card rounded="lg" variant="tonal" color="grey-lighten-3">
          <v-card-text class="d-flex align-center justify-space-between py-3">
            <div>
              <div class="text-body-2 font-weight-bold">Availability</div>
              <div class="text-caption text-medium-emphasis">{{ form.status ? 'Visible on menu' : 'Hidden from menu' }}</div>
            </div>
            <v-switch v-model="form.status" color="var(--app-primary)" hide-details inset density="compact" />
          </v-card-text>
        </v-card>

      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" :disabled="saving" @click="close">Cancel</v-btn>
        <v-btn color="var(--app-primary)" rounded="lg" :loading="saving" @click="handleSave">
          <span style="color:#063824;font-weight:800">{{ isEdit ? 'Save Changes' : 'Add Item' }}</span>
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>


