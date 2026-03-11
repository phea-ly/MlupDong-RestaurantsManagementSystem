<script setup>
<<<<<<< HEAD
import { ref, watch, computed, onMounted } from 'vue'
import { useMenuStore } from '@/stores'
=======
import { computed, ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2

const props = defineProps({
  modelValue: Boolean,
  editItem: { type: Object, default: null }
})

<<<<<<< HEAD
const emit = defineEmits(['update:modelValue', 'saved'])
=======
const emit = defineEmits(['update:modelValue', 'save'])
const { locale } = useI18n()
const isKhmer = computed(() => locale.value === 'km')
const tr = (en, km) => (isKhmer.value ? km : en)
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2

const menuStore = useMenuStore()

// ── Form state ────────────────────────────────────────────────────
const form = ref({
  item_name:   '',
  description: '',
  price:       '',
  category_id: null,
  image:       '',
  status:      true,
})

const imageFile    = ref(null)
const imagePreview = ref('')
const imageMode    = ref('url')   // 'url' | 'file'
const formRef      = ref(null)
const snackbar     = ref({ show: false, message: '', color: '' })

// ── Validation rules ──────────────────────────────────────────────
const rules = {
  required: v => !!v || 'This field is required',
  price:    v => (!v || parseFloat(v) >= 0) || 'Price must be ≥ 0',
}

// ── Category options from API ─────────────────────────────────────
const categoryItems = computed(() =>
  menuStore.categories.map(c => ({
    title: c.category_name,
    value: c.category_id,
  }))
)

// ── Watch props ───────────────────────────────────────────────────
watch(() => props.editItem, (item) => {
  if (item) {
    form.value = {
      item_name:   item.name        ?? '',
      description: item.description ?? '',
      price:       item.price       ?? '',
      category_id: item.category_id ?? null,
      image:       item.image       ?? '',
      status:      item.status      ?? true,
    }
    imagePreview.value = item.image ?? ''
    imageFile.value    = null
    imageMode.value    = 'url'
  } else {
    resetForm()
  }
}, { immediate: true })

// ── Image handling ────────────────────────────────────────────────
function onFileChange(file) {
  if (!file) { imagePreview.value = ''; return }
  const reader = new FileReader()
  reader.onload = e => { imagePreview.value = e.target.result }
  reader.readAsDataURL(file)
}

watch(imageFile, onFileChange)
watch(() => form.value.image, url => {
  if (imageMode.value === 'url') imagePreview.value = url
})

function switchMode(mode) {
  imageMode.value    = mode
  imageFile.value    = null
  imagePreview.value = mode === 'url' ? form.value.image : ''
}

// ── Submit ────────────────────────────────────────────────────────
async function handleSave() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  let payload
  if (imageMode.value === 'file' && imageFile.value) {
    payload = new FormData()
    payload.append('item_name',   form.value.item_name)
    payload.append('description', form.value.description)
    payload.append('price',       form.value.price)
    payload.append('status',      form.value.status ? 1 : 0)
    if (form.value.category_id) payload.append('category_id', form.value.category_id)
    payload.append('image', imageFile.value)
  } else {
    payload = {
      item_name:   form.value.item_name,
      description: form.value.description,
      price:       parseFloat(form.value.price),
      category_id: form.value.category_id,
      image:       imageMode.value === 'url' ? form.value.image : '',
      status:      form.value.status,
    }
  }

  let result
  if (props.editItem) {
    result = await menuStore.updateMenuItem(props.editItem.id, payload)
  } else {
    result = await menuStore.addMenuItem(payload)
  }

  if (result.success) {
    snackbar.value = { show: true, message: props.editItem ? 'Menu item updated!' : 'Menu item added!', color: 'success' }
    emit('saved')
    handleClose()
  } else {
    snackbar.value = { show: true, message: menuStore.error || 'Something went wrong', color: 'error' }
  }
}

function handleClose() {
  emit('update:modelValue', false)
  resetForm()
}

<<<<<<< HEAD
function resetForm() {
  form.value = {
    item_name:   '',
    description: '',
    price:       '',
    category_id: null,
    image:       '',
    status:      true,
  }
  imageFile.value    = null
  imagePreview.value = ''
  imageMode.value    = 'url'
  formRef.value?.resetValidation()
}

onMounted(() => {
  if (!menuStore.categories.length) menuStore.fetchCategories()
})
</script>

<template>
  <!-- Single root wrapper fixes [vue/no-multiple-template-root] -->
  <div>

    <v-dialog :model-value="modelValue" max-width="640" scrollable @update:model-value="handleClose">
      <v-card rounded="xl" elevation="0" class="dialog-card">

        <!-- Header -->
        <div class="dialog-header">
          <div class="d-flex align-center ga-3">
            <div class="header-icon-wrap">
              <v-icon size="20" color="#14dc8b">
                {{ editItem ? 'mdi-pencil-outline' : 'mdi-plus' }}
              </v-icon>
            </div>
            <div>
              <p class="dialog-title">{{ editItem ? 'Edit Menu Item' : 'Add New Menu Item' }}</p>
              <p class="dialog-sub">{{ editItem ? 'Update item details below' : 'Fill in the details for the new item' }}</p>
            </div>
          </div>
          <v-btn icon size="small" variant="text" @click="handleClose">
            <v-icon color="#9aabbd">mdi-close</v-icon>
          </v-btn>
        </div>
=======
const categoryOptions = computed(() => [
  { title: tr('Food', 'ម្ហូប'), value: 'food' },
  { title: tr('Drinks', 'ភេសជ្ជៈ'), value: 'drinks' },
  { title: tr('Promotions', 'ប្រូម៉ូសិន'), value: 'promotions' },
])
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="600" @update:model-value="handleClose">
    <v-card rounded="lg">
      <v-card-title class="pa-4 d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">
          {{ editItem ? tr('Edit Menu Item', 'កែប្រែមុខម្ហូប') : tr('Add New Menu Item', 'បន្ថែមមុខម្ហូបថ្មី') }}
        </span>
        <v-btn icon size="small" variant="text" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-text-field
          v-model="form.name"
          :label="tr('Item Name', 'ឈ្មោះមុខម្ហូប')"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <v-textarea
          v-model="form.description"
          :label="tr('Description', 'ការពិពណ៌នា')"
          variant="outlined"
          density="comfortable"
          rows="2"
          class="mb-3"
        />
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2

        <v-divider />

        <!-- Body -->
        <v-card-text class="pa-6">
          <v-form ref="formRef">

            <!-- Image Preview -->
            <div v-if="imagePreview" class="image-preview-wrap mb-4">
              <img :src="imagePreview" class="image-preview" alt="Preview" />
            </div>

            <!-- Image source toggle -->
            <div class="d-flex ga-2 mb-4">
              <button
                type="button"
                class="mode-btn"
                :class="{ active: imageMode === 'url' }"
                @click="switchMode('url')"
              >
                <v-icon size="14">mdi-link</v-icon> Image URL
              </button>
              <button
                type="button"
                class="mode-btn"
                :class="{ active: imageMode === 'file' }"
                @click="switchMode('file')"
              >
                <v-icon size="14">mdi-upload</v-icon> Upload File
              </button>
            </div>

            <!-- URL input -->
            <v-text-field
<<<<<<< HEAD
              v-if="imageMode === 'url'"
              v-model="form.image"
              label="Image URL"
              variant="outlined"
              density="comfortable"
              placeholder="https://example.com/image.jpg"
              class="mb-4"
              hide-details="auto"
            >
              <template #prepend-inner>
                <v-icon size="16" color="#9aabbd">mdi-image-outline</v-icon>
              </template>
            </v-text-field>

            <!-- File upload -->
            <v-file-input
              v-else
              v-model="imageFile"
              label="Choose Image"
              variant="outlined"
              density="comfortable"
              accept="image/*"
              prepend-icon=""
              class="mb-4"
              hide-details="auto"
            >
              <template #prepend-inner>
                <v-icon size="16" color="#9aabbd">mdi-file-image-outline</v-icon>
              </template>
            </v-file-input>

            <!-- Item Name -->
            <v-text-field
              v-model="form.item_name"
              label="Item Name"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              :rules="[rules.required]"
              hide-details="auto"
=======
              v-model="form.price"
              :label="tr('Price', 'តម្លៃ')"
              variant="outlined"
              density="comfortable"
              type="number"
              step="0.01"
              prefix="$"
            />
          </v-col>
          <v-col cols="6">
            <v-select
              v-model="form.category"
              :label="tr('Category', 'ប្រភេទ')"
              variant="outlined"
              density="comfortable"
              :items="categoryOptions"
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2
            />

<<<<<<< HEAD
            <!-- Description -->
            <v-textarea
              v-model="form.description"
              label="Description"
              variant="outlined"
              density="comfortable"
              rows="2"
              class="mb-4"
              hide-details="auto"
            />

            <!-- Price & Category row -->
            <v-row dense class="mb-2">
              <v-col cols="6">
                <v-text-field
                  v-model="form.price"
                  label="Price"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  step="0.01"
                  min="0"
                  prefix="$"
                  :rules="[rules.required, rules.price]"
                  hide-details="auto"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="form.category_id"
                  label="Category"
                  variant="outlined"
                  density="comfortable"
                  :items="categoryItems"
                  item-title="title"
                  item-value="value"
                  clearable
                  hide-details="auto"
                />
              </v-col>
            </v-row>

            <!-- Status -->
            <div class="status-row mt-4">
              <div>
                <p class="status-label">Status</p>
                <p class="status-hint">{{ form.status ? 'Active – visible to customers' : 'Inactive – hidden from menu' }}</p>
              </div>
              <v-switch
                v-model="form.status"
                color="#14dc8b"
                density="compact"
                hide-details
                inset
              />
            </div>

          </v-form>
        </v-card-text>

        <v-divider />

        <!-- Footer -->
        <div class="dialog-footer">
          <button class="btn-cancel" type="button" @click="handleClose">Cancel</button>
          <button
            class="btn-save"
            type="button"
            :disabled="menuStore.saving"
            @click="handleSave"
          >
            <v-progress-circular v-if="menuStore.saving" size="14" width="2" indeterminate color="#063824" />
            <v-icon v-else size="16" color="#063824">mdi-check</v-icon>
            {{ editItem ? 'Update Item' : 'Add Item' }}
          </button>
        </div>

      </v-card>
    </v-dialog>

    <!-- Snackbar feedback — must live inside the single root <div> -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      location="bottom right"
      :timeout="3000"
    >
      {{ snackbar.message }}
    </v-snackbar>

  </div>
=======
        <v-text-field
          v-model="form.image"
          :label="tr('Image URL', 'តំណភ្ជាប់រូបភាព')"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <v-text-field
          v-model="form.badge"
          :label="tr('Badge (Optional)', 'ស្លាក (ជម្រើស)')"
          variant="outlined"
          density="comfortable"
          :placeholder="tr('e.g., BEST SELLER, NEW', 'ឧ. លក់ដាច់ជាងគេ, ថ្មី')"
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="outlined" @click="handleClose">{{ tr('Cancel', 'បោះបង់') }}</v-btn>
        <v-btn color="#14d886" @click="handleSave">
          {{ editItem ? tr('Update', 'ធ្វើបច្ចុប្បន្នភាព') : tr('Add Item', 'បន្ថែមមុខម្ហូប') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2
</template>

<style scoped>
.dialog-card { border: 1px solid #e8edf2; }

/* Header */
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
}
.header-icon-wrap {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: rgba(20, 220, 139, 0.12);
  border: 1px solid rgba(20, 220, 139, 0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.dialog-title { font-size: 16px; font-weight: 800; color: #122039; margin: 0; }
.dialog-sub   { font-size: 12px; color: #9aabbd; margin: 0; }

/* Image preview */
.image-preview-wrap {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8edf2;
  max-height: 180px;
}
.image-preview {
  width: 100%; height: 180px;
  object-fit: cover;
  display: block;
}

/* Mode toggle */
.mode-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 12.5px; font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid #dbe3e7;
  background: #fff;
  color: #6b7f96;
}
.mode-btn:hover { background: #f4f8f6; }
.mode-btn.active {
  background: #122039;
  color: #fff;
  border-color: #122039;
}

/* Status row */
.status-row {
  display: flex; align-items: center; justify-content: space-between;
  background: #f6f9f8;
  border: 1px solid #e8edf2;
  border-radius: 10px;
  padding: 12px 16px;
}
.status-label { font-size: 13px; font-weight: 700; color: #3d5166; margin: 0; }
.status-hint  { font-size: 11px; color: #9aabbd; margin: 0; }

/* Footer */
.dialog-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px;
}
.btn-cancel {
  padding: 9px 20px; border-radius: 8px;
  border: 1px solid #dbe3e7; background: #fff;
  font-size: 13.5px; font-weight: 700; color: #3d5166;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.btn-cancel:hover { background: #f6f9f8; }

.btn-save {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 20px; border-radius: 8px;
  border: none; background: #14dc8b;
  font-size: 13.5px; font-weight: 700; color: #063824;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.btn-save:hover:not(:disabled) { background: #0fcb7e; }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
</style>