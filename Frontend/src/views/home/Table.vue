<script setup>
import { computed, onMounted, ref } from 'vue'
import { getOrderItemsApi, getOrdersApi, getTablesApi } from '@/api/management.api'

const tableFilter = ref('all')
const tableSearch = ref('')
const loading = ref(false)
const tableCards = ref([])
const selectedTableId = ref('')
const tableFilterOptions = [
  { id: 'all', label: 'All' },
  { id: 'ready', label: 'Ready' },
  { id: 'cooking', label: 'Cooking' },
  { id: 'help', label: 'Help' },
]

const selectedTable = computed(() => tableCards.value.find((t) => t.id === selectedTableId.value) || tableCards.value[0] || {
  id: '-',
  order: '-',
})
const filteredTables = computed(() => {
  const byFilter = tableCards.value.filter((table) => (tableFilter.value === 'all' ? true : table.status === tableFilter.value))
  const search = tableSearch.value.trim().toLowerCase()
  return search ? byFilter.filter((table) => table.id.toLowerCase().includes(search)) : byFilter
})

const serviceItems = ref([])
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

function mapOrderStatus(orderStatus) {
  if (orderStatus === 'completed') return 'ready'
  if (orderStatus === 'preparing') return 'cooking'
  if (orderStatus === 'new') return 'ordering'
  if (orderStatus === 'cancelled') return 'help'
  return 'ordering'
}

async function loadTableData() {
  loading.value = true
  try {
    const [tablesRes, ordersRes, orderItemsRes] = await Promise.all([
      getTablesApi(),
      getOrdersApi(),
      getOrderItemsApi(),
    ])

    const tables = Array.isArray(tablesRes.data) ? tablesRes.data : []
    const orders = Array.isArray(ordersRes.data) ? ordersRes.data : []
    const orderItems = Array.isArray(orderItemsRes.data) ? orderItemsRes.data : []

    tableCards.value = tables.map((table) => {
      const tableOrders = orders.filter((o) => o.table_id === table.table_id)
      const latestOrder = tableOrders[0] || null
      const createdAt = latestOrder?.created_at ? new Date(latestOrder.created_at) : null
      const minsAgo = createdAt ? Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60000)) : 0

      return {
        id: `T-${String(table.table_number || table.table_id).padStart(2, '0')}`,
        tableId: table.table_id,
        minsAgo,
        status: latestOrder ? mapOrderStatus(latestOrder.order_status) : 'ordering',
        guests: table.capacity || 0,
        order: latestOrder?.order_number || `#${latestOrder?.order_id || '-'}`,
        progress: latestOrder?.order_status === 'completed' ? 100 : latestOrder?.order_status === 'preparing' ? 64 : 18,
        note: latestOrder ? `Order ${latestOrder.order_status}` : 'No active order',
      }
    })

    if (tableCards.value.length > 0) {
      selectedTableId.value = tableCards.value[0].id
    }

    serviceItems.value = orderItems
      .filter((item) => item.order)
      .map((item) => {
        const table = tableCards.value.find((t) => t.tableId === item.order.table_id)
        return {
          id: item.order_item_id,
          tableId: table?.id || '',
          item: item.menu_item?.item_name || `Item #${item.menu_item_id}`,
          status: item.order?.order_status === 'completed' ? 'Ready' : 'Kitchen',
        }
      })
  } finally {
    loading.value = false
  }
}

onMounted(loadTableData)
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
        <v-col v-if="loading" cols="12">
          <v-card rounded="lg" border class="pa-4 text-center">Loading table data...</v-card>
        </v-col>
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
