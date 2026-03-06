<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  editItem: Object
})

const emit = defineEmits(['update:modelValue', 'save'])

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
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="600" @update:model-value="handleClose">
    <v-card rounded="lg">
      <v-card-title class="pa-4 d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">
          {{ editItem ? 'Edit Menu Item' : 'Add New Menu Item' }}
        </span>
        <v-btn icon size="small" variant="text" @click="handleClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-text-field
          v-model="form.name"
          label="Item Name"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <v-textarea
          v-model="form.description"
          label="Description"
          variant="outlined"
          density="comfortable"
          rows="2"
          class="mb-3"
        />

        <v-row dense class="mb-3">
          <v-col cols="6">
            <v-text-field
              v-model="form.price"
              label="Price"
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
              label="Category"
              variant="outlined"
              density="comfortable"
              :items="[
                { title: 'Food', value: 'food' },
                { title: 'Drinks', value: 'drinks' },
                { title: 'Promotions', value: 'promotions' }
              ]"
            />
          </v-col>
        </v-row>

        <v-text-field
          v-model="form.image"
          label="Image URL"
          variant="outlined"
          density="comfortable"
          class="mb-3"
        />

        <v-text-field
          v-model="form.badge"
          label="Badge (Optional)"
          variant="outlined"
          density="comfortable"
          placeholder="e.g., BEST SELLER, NEW"
        />
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn variant="outlined" @click="handleClose">Cancel</v-btn>
        <v-btn color="#14d886" @click="handleSave">
          {{ editItem ? 'Update' : 'Add Item' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
