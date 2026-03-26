import { defineStore }   from 'pinia'
import { ref, computed } from 'vue'
import salesReportApi    from '@/api/salesReport.api'

export const useSalesReportStore = defineStore('salesReport', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const activeTab    = ref('today')
  const searchQuery  = ref('')
  const dateFrom     = ref('')
  const dateTo       = ref('')

  const summaryStats   = ref([])
  const topCategories  = ref([])
  const chartData      = ref({ labels: [], revenue: [], orders: [] })
  const salesLog       = ref([])
  const meta           = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0 })

  const loadingSummary    = ref(false)
  const loadingChart      = ref(false)
  const loadingCategories = ref(false)
  const loadingOrders     = ref(false)
  const snackbar          = ref({ show: false, message: '', color: 'error' })

  // ── Constants ──────────────────────────────────────────────────────────────
  const tabs = [
    { value: 'today',     label: 'Today'       },
    { value: 'yesterday', label: 'Yesterday'   },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'custom',    label: 'Custom'      },
  ]

  const salesHeaders = [
    { title: 'Date',     key: 'date'    },
    { title: 'Order ID', key: 'id'      },
    { title: 'Items',    key: 'items'   },
    { title: 'Payment',  key: 'payment' },
    { title: 'Amount',   key: 'amount', align: 'end' },
  ]

  // ── Computed ───────────────────────────────────────────────────────────────
  // SVG polyline string from chart data
  const chartPoints = computed(() => {
    const rev = chartData.value.revenue
    if (!rev?.length) return '50,90 150,70 250,60 350,45 450,30 550,20'

    const max  = Math.max(...rev, 1)
    const W    = 550, H = 100, padX = 50
    const step = rev.length > 1 ? (W - padX) / (rev.length - 1) : 0

    return rev.map((v, i) => {
      const x = padX + i * step
      const y = H - ((v / max) * (H - 10)) - 5
      return `${Math.round(x)},${Math.round(y)}`
    }).join(' ')
  })

  const weekDayLabels = computed(() => {
    if (chartData.value.labels?.length) {
      return chartData.value.labels.map(d =>
        new Date(d).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
      )
    }
    return ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  })

  // ── Helpers ────────────────────────────────────────────────────────────────
  function notify(message, color = 'error') {
    snackbar.value = { show: true, message, color }
  }

  function buildParams() {
    const params = { period: activeTab.value }
    if (activeTab.value === 'custom') {
      params.date_from = dateFrom.value
      params.date_to   = dateTo.value
    }
    return params
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchSummary() {
    loadingSummary.value = true
    try {
      const { data } = await salesReportApi.getSummary(buildParams())
      summaryStats.value = data.stats ?? []
    } catch (err) {
      notify(err.message ?? 'Failed to load summary.')
    } finally {
      loadingSummary.value = false
    }
  }

  async function fetchChart() {
    loadingChart.value = true
    try {
      const { data } = await salesReportApi.getChart(buildParams())
      chartData.value = data
    } catch (err) {
      notify(err.message ?? 'Failed to load chart.')
    } finally {
      loadingChart.value = false
    }
  }

  async function fetchCategories() {
    loadingCategories.value = true
    try {
      const { data } = await salesReportApi.getCategories(buildParams())
      topCategories.value = Array.isArray(data) ? data : (data.data ?? [])
    } catch (err) {
      notify(err.message ?? 'Failed to load categories.')
    } finally {
      loadingCategories.value = false
    }
  }

  async function fetchOrders(page = 1) {
    loadingOrders.value = true
    try {
      const { data } = await salesReportApi.getOrders({
        ...buildParams(),
        search:   searchQuery.value || undefined,
        page,
        per_page: meta.value.per_page,
      })
      salesLog.value = data.data ?? []
      meta.value     = data.meta ?? meta.value
    } catch (err) {
      notify(err.message ?? 'Failed to load orders.')
    } finally {
      loadingOrders.value = false
    }
  }

  // Fetch everything for the active tab
  async function fetchAll() {
    await Promise.all([
      fetchSummary(),
      fetchChart(),
      fetchCategories(),
      fetchOrders(1),
    ])
  }

  async function init() {
    await fetchAll()
  }

  return {
    // state
    activeTab, searchQuery, dateFrom, dateTo,
    summaryStats, topCategories, chartData, salesLog, meta,
    loadingSummary, loadingChart, loadingCategories, loadingOrders,
    snackbar,
    // constants
    tabs, salesHeaders,
    // computed
    chartPoints, weekDayLabels,
    // actions
    init, fetchAll, fetchSummary, fetchChart,
    fetchCategories, fetchOrders,
  }
})