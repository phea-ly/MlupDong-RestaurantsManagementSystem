<script setup>
const cards = [
  { label: 'Total Revenue', value: '$42,830', note: 'Monthly total', trend: '+14.2%' },
  { label: 'Orders Today', value: '286', note: 'All branches', trend: '+7.8%' },
  { label: 'Staff On Shift', value: '18', note: 'Current active staff', trend: '+2' },
]
</script>

<template>
  <section>
    <v-row dense>
      <v-col v-for="card in cards" :key="card.label" cols="12" md="4">
        <v-card rounded="lg" border class="pa-4">
          <p class="label">{{ card.label }}</p>
          <p class="value">{{ card.value }}</p>
          <div class="d-flex justify-space-between align-center">
            <p class="note">{{ card.note }}</p>
            <v-chip size="small" color="#daf4e8" class="font-weight-bold">{{ card.trend }}</v-chip>
          </div>
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
