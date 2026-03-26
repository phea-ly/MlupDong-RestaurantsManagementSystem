<script setup>
defineProps({
  stats: { type: Object, required: true }, // { total, active, inactive }
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
            <div class="stat-label">Total Categories</div>
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
            <div class="stat-label">Active</div>
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
            <div class="stat-label">Inactive</div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.stat-label {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .06em;
  color: rgba(0,0,0,.45);
}
</style>