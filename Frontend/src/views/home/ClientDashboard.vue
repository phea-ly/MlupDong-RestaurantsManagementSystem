<script setup>
import { computed, onMounted, ref } from 'vue'
import { getMenuItemsApi, getOrdersApi } from '@/api/management.api'
import { getSessionUser } from '@/utils/auth'

const orders = ref([])
const menuItems = ref([])

const myEmail = computed(() => getSessionUser()?.email || null)
const myOrders = computed(() => {
  if (!myEmail.value) return []
  return orders.value.filter((order) => order.user?.email === myEmail.value)
})

const cards = computed(() => [
  { label: 'My Orders', value: String(myOrders.value.length), note: 'Orders in history' },
  { label: 'Pending Orders', value: String(myOrders.value.filter((o) => o.order_status !== 'completed').length), note: 'Need attention' },
  { label: 'Available Items', value: String(menuItems.value.filter((m) => m.status).length), note: 'Current menu items' },
])

async function loadData() {
  const [ordersRes, menuRes] = await Promise.all([getOrdersApi(), getMenuItemsApi()])
  orders.value = Array.isArray(ordersRes.data) ? ordersRes.data : []
  menuItems.value = Array.isArray(menuRes.data) ? menuRes.data : []
}

onMounted(loadData)
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
