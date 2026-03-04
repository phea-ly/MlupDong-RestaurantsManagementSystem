<script setup>
const cards = [
  { label: 'My Orders', value: '12', note: 'Orders this month' },
  { label: 'Pending Orders', value: '2', note: 'Need attention' },
  { label: 'Favorite Items', value: '7', note: 'Saved menu items' },
]
</script>

<template>
  <section>
    <v-row dense>
      <v-col v-for="card in cards" :key="card.label" cols="12" md="4">
        <v-card rounded="lg" border class="pa-4">
          <p class="label">{{ card.label }}</p>
          <p class="value">{{ card.value }}</p>
          <p class="note">{{ card.note }}</p>
        </v-card>
      </v-col>
    </v-row>
  </section>
</template>

<style scoped>
.label {
  margin: 0 0 6px;
  font-size: 12px;
  color: #6c7f98;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 800;
}

.value {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
  color: #13213b;
}

.note {
  margin: 8px 0 0;
  font-size: 12px;
  color: #6a7d95;
}
</style>
