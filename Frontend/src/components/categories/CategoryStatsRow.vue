<script setup>
const props = defineProps({
  stats: { type: Object, required: true },
})
</script>

<template>
  <v-row dense class="mb-4">
    <v-col cols="6" sm="4">
      <v-card rounded="xl" border flat>
        <v-card-text class="d-flex align-center ga-3 pa-4">
          <v-avatar color="purple-lighten-5" rounded="lg" size="40">
            <v-icon color="#a855f7" size="20">mdi-tag-multiple-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-h5 font-weight-black">{{ stats.total }}</div>
            <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase" style="letter-spacing: 0.06em">
              Total Categories
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="6" sm="4">
      <v-card rounded="xl" border flat>
        <v-card-text class="d-flex align-center ga-3 pa-4">
          <v-avatar color="green-lighten-5" rounded="lg" size="40">
            <v-icon color="var(--app-primary)" size="20">mdi-check-circle-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-h5 font-weight-black">{{ stats.active }}</div>
            <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase" style="letter-spacing: 0.06em">
              Active
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="6" sm="4">
      <v-card rounded="xl" border flat>
        <v-card-text class="d-flex align-center ga-3 pa-4">
          <v-avatar color="orange-lighten-5" rounded="lg" size="40">
            <v-icon color="#f59e0b" size="20">mdi-eye-off-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-h5 font-weight-black">{{ stats.inactive }}</div>
            <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase" style="letter-spacing: 0.06em">
              Inactive
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

