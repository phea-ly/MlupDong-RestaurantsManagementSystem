import { defineStore }   from 'pinia'
import { ref, computed } from 'vue'
import dashboardApi      from '@/api/dashboard.api'
import { useAuthStore }  from '@/stores/auth.store'

export const useDashboardStore = defineStore('dashboard', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const activeRange  = ref('7days')
  const stats        = ref([])
  const bestSelling  = ref([])
  const peakHours    = ref([])
  const orderSummary = ref([])
  const recentOrders = ref([])
  const chartData    = ref({ labels: [], revenue: [], orders: [] })

  const loadingKpi      = ref(false)
  const loadingChart    = ref(false)
  const loadingBest     = ref(false)
  const loadingPeak     = ref(false)
  const loadingSummary  = ref(false)
  const loadingOrders   = ref(false)

  // ── Constants ──────────────────────────────────────────────────────────────
  const quickActions = [
    { label: 'Add Item',     icon: 'mdi-plus',               color: 'var(--app-primary)', route: '/home/menu'         },
    { label: 'New Order',    icon: 'mdi-silverware-fork-knife', color: '#3b82f6',          route: '/home/table'        },
    { label: 'View Reports', icon: 'mdi-chart-box-outline',  color: '#f59e0b',            route: '/home/sales-report' },
  ]

  const orderHeaders = [
    { title: 'Order ID',  key: 'id'       },
    { title: 'Customer',  key: 'customer' },
    { title: 'Items',     key: 'items'    },
    { title: 'Status',    key: 'status'   },
    { title: 'Amount',    key: 'amount',  align: 'end' },
  ]

  // ── Computed ───────────────────────────────────────────────────────────────
  const chartPoints = computed(() => {
    const rev = chartData.value.revenue
    if (!rev?.length) return '50,80 150,60 250,65 350,45 450,30 550,20 650,25'

    const max  = Math.max(...rev, 1)
    const W = 650, H = 110, padX = 50
    const step = rev.length > 1 ? (W - padX) / (rev.length - 1) : 0

    return rev.map((v, i) => {
      const x = padX + i * step
      const y = H - ((v / max) * (H - 15)) - 5
      return `${Math.round(x)},${Math.round(y)}`
    }).join(' ')
  })

  const weekDays = computed(() => {
    if (chartData.value.labels?.length) {
      return chartData.value.labels.map(d =>
        new Date(d).toLocaleDateString('en-US', { weekday: 'short' })
      )
    }
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  })

  const userName = computed(() => {
    const auth = useAuthStore()
    return auth.fullName || 'Admin'
  })

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchKpi() {
    loadingKpi.value = true
    try {
      const { data } = await dashboardApi.getSummary('today')
      stats.value = data.stats ?? []
    } catch { /* keep fallback */ } finally { loadingKpi.value = false }
  }

  async function fetchChart() {
    loadingChart.value = true
    try {
      const period = activeRange.value === '7days' ? 'last7days' : 'last7days'
      const { data } = await dashboardApi.getChart(period)
      chartData.value = data
    } catch { } finally { loadingChart.value = false }
  }

  async function fetchBestSelling() {
    loadingBest.value = true
    try {
      const { data } = await dashboardApi.getBestSelling()
      bestSelling.value = Array.isArray(data) ? data : (data.data ?? [])
    } catch { } finally { loadingBest.value = false }
  }

  async function fetchPeakHours() {
    loadingPeak.value = true
    try {
      const { data } = await dashboardApi.getPeakHours()
      peakHours.value = Array.isArray(data) ? data : []
    } catch { } finally { loadingPeak.value = false }
  }

  async function fetchOrderSummary() {
    loadingSummary.value = true
    try {
      const { data } = await dashboardApi.getOrderSummary()
      orderSummary.value = Array.isArray(data) ? data : []
    } catch { } finally { loadingSummary.value = false }
  }

  async function fetchRecentOrders() {
    loadingOrders.value = true
    try {
      const { data } = await dashboardApi.getRecentOrders()
      const orders = data.data ?? []
      recentOrders.value = orders.map(mapOrder)
    } catch { } finally { loadingOrders.value = false }
  }

  function mapOrder(o) {
    const statusColor = {
      completed:  'success',
      preparing:  'warning',
      ready:      'info',
      cancelled:  'error',
      new:        'grey',
      confirmed:  'blue',
    }
    const name     = o.customer ?? o.id ?? '??'
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const colors   = ['success', 'orange', 'blue', 'purple', 'teal']
    const colorIdx = name.charCodeAt(0) % colors.length

    return {
      id:          o.id,
      initials,
      color:       colors[colorIdx],
      customer:    o.customer ?? '—',
      items:       o.items    ?? '—',
      status:      (o.status  ?? 'new').toUpperCase(),
      statusColor: statusColor[o.status] ?? 'grey',
      amount:      o.amount   ?? '$0.00',
    }
  }

  function goTo(router, route) {
    if (!route) return
    router.push(route)
  }

  async function init() {
    await Promise.all([
      fetchKpi(),
      fetchChart(),
      fetchBestSelling(),
      fetchPeakHours(),
      fetchOrderSummary(),
      fetchRecentOrders(),
    ])
  }

  return {
    // state
    activeRange, stats, bestSelling, peakHours,
    orderSummary, recentOrders, chartData,
    loadingKpi, loadingChart, loadingBest,
    loadingPeak, loadingSummary, loadingOrders,
    // constants
    quickActions, orderHeaders,
    // computed
    chartPoints, weekDays, userName,
    // actions
    init, fetchChart, goTo,
  }
})