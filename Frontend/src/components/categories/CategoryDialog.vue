<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editing: { type: Object, default: null },
  form: { type: Object, required: true },
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'save'])
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="420" @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="xl" elevation="0">
      <v-card-text class="pa-6">
        <div class="d-flex align-center ga-3 mb-5">
          <v-avatar color="purple-lighten-5" rounded="lg" size="44" style="border: 1px solid rgba(168, 85, 247, 0.25)">
            <v-icon color="#a855f7" size="20">mdi-tag-outline</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">
            {{ editing ? 'Edit Category' : 'Add Category' }}
          </span>
        </div>

        <v-text-field
          v-model="form.category_name"
          label="Category Name"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          class="mb-3"
          hide-details="auto"
        />
        <v-textarea
          v-model="form.description"
          label="Description (optional)"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          rows="2"
          class="mb-3"
          hide-details="auto"
        />

        <v-card variant="tonal" color="grey-lighten-3" rounded="lg">
          <v-card-text class="d-flex align-center justify-space-between py-3 px-4">
            <div>
              <div class="text-body-2 font-weight-bold">Status</div>
              <div class="text-caption text-medium-emphasis">
                {{ form.status ? 'Active' : 'Inactive' }}
              </div>
            </div>
            <v-switch v-model="form.status" color="var(--app-primary)" density="compact" hide-details inset />
          </v-card-text>
        </v-card>
      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" @click="emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="var(--app-primary)" variant="flat" rounded="lg" :loading="saving" @click="emit('save')">
          <span style="color: #063824; font-weight: 800">
            {{ editing ? 'Update' : 'Add' }}
          </span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

