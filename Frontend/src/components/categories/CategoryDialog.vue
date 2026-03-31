<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  editing:    { type: Object,  default: null  },
  form:       { type: Object,  required: true },
  saving:     { type: Boolean, default: false },
  nameError:  { type: String,  default: ''    }, // duplicate / validation message
})

defineEmits(['update:modelValue', 'save'])
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="420"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" elevation="0">
      <v-card-text class="pa-6">

        <!-- Header -->
        <div class="d-flex align-center ga-3 mb-5">
          <v-avatar color="#f2f8e8" rounded="lg" size="44" style="border:1px solid rgba(64,119,9,0.22)">
            <v-icon color="#407709" size="20">mdi-tag-outline</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-black">
            {{ editing ? 'Edit Category' : 'Add Category' }}
          </span>
        </div>

        <!-- Name field — shows inline error for duplicates -->
        <v-text-field
          v-model="form.category_name"
          label="Category Name *"
          variant="outlined"
          rounded="lg"
          density="comfortable"
          class="mb-3"
          hide-details="auto"
          :error-messages="nameError"
          @update:model-value="$emit('clear-name-error')"
        />

        <!-- Description -->
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

        <!-- Status toggle -->
        <v-card variant="tonal" color="black" rounded="lg">
          <v-card-text class="d-flex align-center justify-space-between py-3 px-4">
            <div>
              <div class="text-body-2 font-weight-bold">Status</div>
              <div class="text-caption text-medium-emphasis">
                {{ form.status ? 'Active — visible in menu' : 'Inactive — hidden from menu' }}
              </div>
            </div>
            <v-switch
              v-model="form.status"
              color="var(--app-primary)"
              density="compact" hide-details inset
            />
          </v-card-text>
        </v-card>

      </v-card-text>

      <v-card-actions class="px-6 pb-6 pt-0">
        <v-spacer />
        <v-btn
          variant="outlined" rounded="lg"
          @click="$emit('update:modelValue', false)"
        >Cancel</v-btn>
        <v-btn
          color="#407709" variant="flat" rounded="lg"
          :loading="saving"
          :disabled="!form.category_name?.trim()"
          @click="$emit('save')"
        >
          <span style="color:white; font-weight:800">
            {{ editing ? 'Update' : 'Add' }}
          </span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>