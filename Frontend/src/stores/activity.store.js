// src/stores/activity.store.js
import { defineStore }   from 'pinia'
import { ref, computed } from 'vue'
import activityApi       from '@/api/activity.api'

export const useActivityStore = defineStore('activity', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const logs    = ref([])
  const summary = ref({ total_entries: 0, db_size_mb: 0, by_event: {}, by_action: {} })
  const loading = ref(false)
  const snackbar = ref({ show: false, message: '', color: 'success' })

  // Pagination
  const meta = ref({ current_page: 1, last_page: 1, per_page: 15, total: 0 })

  // Filters
  const filters = ref({
    search:     '',
    event_type: '',
    action:     '',
    date_from:  '',
    date_to:    '',
    per_page:   15,
  })

  // Detail dialog
  const showDetail  = ref(false)
  const detailItem  = ref(null)

  // ── Constants ──────────────────────────────────────────────────────────────
  const EVENT_TYPES = ['user', 'menu', 'order', 'table', 'staff', 'category', 'settings', 'system']
  const ACTIONS     = ['created', 'updated', 'deleted', 'login', 'logout', 'login_failed']

  const ACTION_COLOR = {
    created:      'success',
    updated:      'blue',
    deleted:      'error',
    login:        'teal',
    logout:       'grey',
    login_failed: 'orange',
  }

  const EVENT_ICON = {
    user:     'mdi-account-outline',
    menu:     'mdi-silverware-fork-knife',
    order:    'mdi-receipt-outline',
    table:    'mdi-table-furniture',
    staff:    'mdi-badge-account-outline',
    category: 'mdi-tag-outline',
    settings: 'mdi-cog-outline',
    system:   'mdi-server-outline',
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  const recentDays = computed(() => summary.value.recent_days ?? {})

  const trendData = computed(() => {
    const events = summary.value.by_event ?? {}
    return Object.entries(events).map(([label, count]) => ({
      label,
      count,
      icon:  EVENT_ICON[label] ?? 'mdi-circle-outline',
      color: 'var(--app-primary)',
    }))
  })

  const topActions = computed(() => {
    const actions = summary.value.by_action ?? {}
    const total   = Object.values(actions).reduce((s, v) => s + v, 0) || 1
    return Object.entries(actions).map(([label, count]) => ({
      label,
      count,
      pct:   Math.round((count / total) * 100),
      color: ACTION_COLOR[label] ?? 'grey',
    }))
  })

  // ── Helpers ────────────────────────────────────────────────────────────────
  function notify(message, color = 'success') {
    snackbar.value = { show: true, message, color }
  }

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function mapLog(l) {
    return {
      id:          l.id,
      event_type:  l.event_type  ?? '',
      action:      l.action      ?? '',
      description: l.description ?? '',
      ip_address:  l.ip_address  ?? '—',
      user_agent:  l.user_agent  ?? '—',
      created_at:  l.created_at  ?? null,
      timestamp:   formatDate(l.created_at),
      user:        l.user        ?? null,
      metadata:    l.metadata    ?? null,
      actionColor: ACTION_COLOR[l.action] ?? 'grey',
      eventIcon:   EVENT_ICON[l.event_type] ?? 'mdi-circle-outline',
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchLogs(page = 1) {
    loading.value = true
    try {
      const { data } = await activityApi.getAll({
        ...filters.value,
        page,
      })
      logs.value = (data.data ?? []).map(mapLog)
      meta.value = data.meta ?? meta.value
    } catch (err) {
      notify(err.message ?? 'Failed to load activity logs.', 'error')
    } finally {
      loading.value = false
    }
  }

  async function fetchSummary() {
    try {
      const { data } = await activityApi.getSummary()
      summary.value = data
    } catch { /* non-fatal */ }
  }

  async function openDetail(item) {
    detailItem.value = item
    showDetail.value = true
  }

  async function deleteLog(id) {
    try {
      await activityApi.remove(id)
      logs.value = logs.value.filter(l => l.id !== id)
      meta.value.total = Math.max(0, meta.value.total - 1)
      notify('Log entry deleted.')
    } catch (err) {
      notify(err.message ?? 'Failed to delete log.', 'error')
    }
  }

  async function applyFilters() {
    await fetchLogs(1)
  }

  function resetFilters() {
    filters.value = { search: '', event_type: '', action: '', date_from: '', date_to: '', per_page: 15 }
    fetchLogs(1)
  }

  async function init() {
    await Promise.all([fetchLogs(), fetchSummary()])
  }

  return {
    logs, summary, loading, snackbar, meta, filters,
    showDetail, detailItem,
    EVENT_TYPES, ACTIONS, ACTION_COLOR, EVENT_ICON,
    trendData, topActions, recentDays,
    init, fetchLogs, fetchSummary,
    openDetail, deleteLog,
    applyFilters, resetFilters,
    formatDate,
  }
})