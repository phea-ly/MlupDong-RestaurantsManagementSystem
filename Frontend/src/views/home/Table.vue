<script setup>
import { computed, ref } from 'vue'

const tableFilter = ref('all')
const tableSearch = ref('')
const tableCards = ref([
  { id: 'T-08', minsAgo: 4, status: 'help', guests: 4, order: '#901', progress: 18, note: 'Customer assistance' },
  { id: 'T-01', minsAgo: 12, status: 'ready', guests: 4, order: '#882', progress: 100, note: 'Ready to serve' },
  { id: 'T-04', minsAgo: 25, status: 'cooking', guests: 2, order: '#879', progress: 64, note: 'Cooking' },
  { id: 'T-09', minsAgo: 2, status: 'ordering', guests: 2, order: '#905', progress: 0, note: 'Selecting drinks' },
])
const selectedTableId = ref('T-01')
const tableFilterOptions = [
  { id: 'all', label: 'All' },
  { id: 'ready', label: 'Ready' },
  { id: 'cooking', label: 'Cooking' },
  { id: 'help', label: 'Help' },
]

const selectedTable = computed(() => tableCards.value.find((t) => t.id === selectedTableId.value) || tableCards.value[0])
const filteredTables = computed(() => {
  const byFilter = tableCards.value.filter((table) => (tableFilter.value === 'all' ? true : table.status === tableFilter.value))
  const search = tableSearch.value.trim().toLowerCase()
  return search ? byFilter.filter((table) => table.id.toLowerCase().includes(search)) : byFilter
})

const serviceItems = ref([
  { id: 1, tableId: 'T-01', item: 'Beef Lok Lak', status: 'Ready' },
  { id: 2, tableId: 'T-01', item: 'Fish Amok', status: 'Kitchen' },
  { id: 3, tableId: 'T-04', item: 'Somlor Korko', status: 'Kitchen' },
])
const selectedItems = computed(() => serviceItems.value.filter((item) => item.tableId === selectedTable.value.id))

const servedItems = ref([{ id: 9, name: 'Angkor Beer (Large)', ago: 'Served 15m ago' }])
const snackbar = ref(false)
const snackbarText = ref('')

function markServed(itemId) {
  const index = serviceItems.value.findIndex((item) => item.id === itemId)
  if (index < 0) return
  const [served] = serviceItems.value.splice(index, 1)
  servedItems.value.unshift({ id: Date.now(), name: served.item, ago: 'Served just now' })
  snackbarText.value = `${selectedTable.value.id} status updated`
  snackbar.value = true
}
</script>

<template>
  <v-row dense>
    <v-col cols="12" lg="8">
      <v-card rounded="lg" border class="pa-3 mb-3">
        <div class="d-flex flex-wrap align-center ga-2 justify-space-between">
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-for="item in tableFilterOptions"
              :key="item.id"
              size="small"
              rounded="pill"
              :variant="tableFilter === item.id ? 'flat' : 'outlined'"
              :color="tableFilter === item.id ? '#111a2e' : undefined"
              class="text-none"
              @click="tableFilter = item.id"
            >
              {{ item.label }}
            </v-btn>
          </div>
          <v-text-field
            v-model="tableSearch"
            density="compact"
            hide-details
            variant="outlined"
            max-width="170"
            placeholder="Table #"
          />
        </div>
      </v-card>

      <v-row dense>
        <v-col v-for="table in filteredTables" :key="table.id" cols="12" sm="6" md="4">
          <v-card
            rounded="lg"
            border
            class="pa-3 fill-height table-card"
            :class="{ selected: selectedTableId === table.id, help: table.status === 'help' }"
            @click="selectedTableId = table.id"
          >
            <div class="d-flex justify-space-between align-end">
              <p class="text-h5 font-weight-bold ma-0">{{ table.id }}</p>
              <p class="muted ma-0">{{ table.minsAgo }}m ago</p>
            </div>
            <p class="table-note">{{ table.note }}</p>
            <p class="mb-1">{{ table.guests }} guests</p>
            <p class="mb-2">Order {{ table.order }}</p>
            <v-progress-linear :model-value="table.progress" color="#14d886" height="6" rounded />
          </v-card>
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="12" lg="4">
      <v-card rounded="lg" border class="pa-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <p class="text-h6 font-weight-bold ma-0">{{ selectedTable.id }}</p>
          <v-chip size="small">{{ selectedTable.order }}</v-chip>
        </div>
        <p class="muted mb-2">Items to serve</p>

        <v-list density="compact" class="py-0">
          <v-list-item v-for="item in selectedItems" :key="item.id" class="rounded-lg mb-1 border-sm">
            <template #title>{{ item.item }}</template>
            <template #subtitle>{{ item.status }}</template>
            <template #append>
              <v-btn
                v-if="item.status === 'Ready'"
                size="x-small"
                color="#14d886"
                class="text-none"
                @click.stop="markServed(item.id)"
              >
                Mark
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <p class="muted mt-4 mb-2">Served</p>
        <v-list density="compact" class="py-0">
          <v-list-item v-for="served in servedItems" :key="served.id" class="rounded-lg mb-1 border-sm">
            <template #title>{{ served.name }}</template>
            <template #subtitle>{{ served.ago }}</template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>
  </v-row>

  <v-snackbar v-model="snackbar" location="bottom right" color="#0f1d38" timeout="2200">
    {{ snackbarText }}
  </v-snackbar>
</template>

<style scoped>
.muted {
  margin: 0;
  color: #71839b;
  font-size: 12px;
}

.table-card {
  cursor: pointer;
}

.table-card.selected {
  outline: 2px solid rgba(18, 215, 134, 0.35);
}

.table-card.help {
  border-color: #ff5757 !important;
}

.table-note {
  margin: 8px 0;
  color: #60728a;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 800;
}
</style>
