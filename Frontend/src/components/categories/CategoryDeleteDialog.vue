<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'confirm'])
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="400" @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="xl" elevation="0">
      <v-card-text class="pa-6">
        <div class="d-flex align-center ga-3 mb-4">
          <v-avatar color="red-lighten-5" rounded="lg" size="44" style="border: 1px solid #fca5a5">
            <v-icon color="error" size="22">mdi-tag-remove-outline</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">Delete Category</span>
        </div>
        <p class="text-body-2 text-medium-emphasis">
          This will delete the category. Menu items in this category will become uncategorised.
        </p>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer />
        <v-btn variant="outlined" rounded="lg" @click="emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="error" variant="flat" rounded="lg" @click="emit('confirm')">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
