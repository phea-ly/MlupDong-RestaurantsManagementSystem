<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  modelValue: Boolean,
  editItem: Object
})

const emit = defineEmits(['update:modelValue', 'save'])
const { locale } = useI18n()
const isKhmer = computed(() => locale.value === 'km')
const tr = (en, km) => (isKhmer.value ? km : en)

const form = ref({
  name: '',
  description: '',
  price: '',
  category: 'food',
  image: '',
  badge: ''
})

watch(() => props.editItem, (item) => {
  if (item) {
    form.value = { ...item }
  } else {
    resetForm()
  }
}, { immediate: true })

function resetForm() {
  form.value = {
    name: '',
    description: '',
    price: '',
    category: 'food',
    image: '',
    badge: ''
  }
}

function handleSave() {
  emit('save', { ...form.value, price: parseFloat(form.value.price) })
  emit('update:modelValue', false)
  resetForm()
}

function handleClose() {
  emit('update:modelValue', false)
  resetForm()
}

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

        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-text-field
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
            />
          </v-col>
        </v-row>

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
</template>
