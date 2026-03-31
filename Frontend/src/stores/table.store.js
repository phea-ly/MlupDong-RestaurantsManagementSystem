// src/stores/table.store.js
import { defineStore }   from 'pinia'
import { ref, computed } from 'vue'
import tableApi          from '@/api/table.api'

export const useTableStore = defineStore('table', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const tables          = ref([])
  const loading         = ref(false)
  const saving          = ref(false)
  const deleting        = ref(false)
  const generatingId    = ref(null)  
  const generatingAll   = ref(false)
  const snackbar        = ref({ show: false, message: '', color: 'success' })

  // Filter / search
  const search          = ref('')
  const selectedSection = ref('All Sections')

  // Dialog state
  const showAddDialog   = ref(false)
  const showEditDialog  = ref(false)
  const showDeleteDialog = ref(false)
  const deletingId      = ref(null)
  const editTableData   = ref(null)
  const tableToPrint    = ref(null)

  // Form for new table
  function blankForm() {
    return { table_number: '', capacity: 4, location: 'Indoor', restaurant_id: null }
  }
  const newTable = ref(blankForm())

  // ── Constants ──────────────────────────────────────────────────────────────
  const sections = ['All Sections', 'Indoor', 'Patio', 'Bar']

  // ── Computed ───────────────────────────────────────────────────────────────
  const filteredTables = computed(() =>
    tables.value.filter(t => {
      const q            = search.value.trim().toLowerCase()
      const matchSearch  = !q || String(t.table_number).includes(q) || (t.location ?? '').toLowerCase().includes(q)
      const matchSection = selectedSection.value === 'All Sections' || t.location === selectedSection.value
      return matchSearch && matchSection
    })
  )

  const dashboardStats = computed(() => [
    {
      label: 'TOTAL UNITS',
      value: tables.value.length,
      icon:  'mdi-table-furniture',
      color: '#0f172a',
      bg:    '#f1f5f9',
    },
    {
      label: 'ASSETS READY',
      value: tables.value.filter(t => t.qr_code).length,
      icon:  'mdi-check-circle-outline',
      color: '#407709',
      bg:    '#f2f8e8',
    },
    {
      label: 'PENDING QRS',
      value: tables.value.filter(t => !t.qr_code).length,
      icon:  'mdi-clock-outline',
      color: '#f59e0b',
      bg:    '#fffbeb',
    },
    {
      label: 'TOTAL CAPACITY',
      value: tables.value.reduce((acc, t) => acc + (parseInt(t.capacity) || 0), 0),
      icon:  'mdi-account-group',
      color: '#6366f1',
      bg:    '#eef2ff',
    },
  ])

  // ── Helpers ────────────────────────────────────────────────────────────────
  function notify(message, color = 'success') {
    snackbar.value = { show: true, message, color }
  }

  function getQrUrl(path) {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    const base = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '').replace(/\/+$/, '')
    return `${base}/${path}`
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchTables() {
    loading.value = true
    try {
      const { data } = await tableApi.getAll()
      tables.value = Array.isArray(data) ? data : (data.data ?? [])
    } catch {
      notify('Failed to load tables.', 'error')
    } finally {
      loading.value = false
    }
  }

  // ── Create ─────────────────────────────────────────────────────────────────
  function openAdd() {
    newTable.value    = blankForm()
    newTable.value.table_number = tables.value.length + 1
    showAddDialog.value = true
  }

  async function addTable() {
    if (!newTable.value.table_number) {
      notify('Please enter a valid table number.', 'error')
      return
    }
    saving.value = true
    try {
      const { data } = await tableApi.create({
        table_number:  Number(newTable.value.table_number),
        capacity:      Number(newTable.value.capacity),
        location:      newTable.value.location,
        restaurant_id: newTable.value.restaurant_id ?? null,
      })
      // Laravel wraps in { table: ... }
      tables.value.unshift(data.table ?? data)
      showAddDialog.value = false
      notify('Table registered successfully.')
    } catch (err) {
      notify(err.message ?? 'Failed to register table.', 'error')
    } finally {
      saving.value = false
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  function openEdit(table) {
    editTableData.value  = { ...table }
    showEditDialog.value = true
  }

  async function saveEdit() {
    if (!editTableData.value?.table_number) {
      notify('Please enter a valid table number.', 'error')
      return
    }
    saving.value = true
    try {
      const { data } = await tableApi.update(editTableData.value.table_id, {
        table_number:  Number(editTableData.value.table_number),
        capacity:      Number(editTableData.value.capacity),
        location:      editTableData.value.location,
        restaurant_id: editTableData.value.restaurant_id ?? null,
      })
      const updated = data.table ?? data
      const idx = tables.value.findIndex(t => t.table_id === updated.table_id)
      if (idx !== -1) tables.value[idx] = updated
      showEditDialog.value = false
      notify('Table updated successfully.')
    } catch (err) {
      notify(err.message ?? 'Failed to update table.', 'error')
    } finally {
      saving.value = false
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  function confirmDelete(id) {
    deletingId.value       = id
    showDeleteDialog.value = true
  }

  async function handleDelete() {
    deleting.value = true
    try {
      await tableApi.remove(deletingId.value)
      tables.value = tables.value.filter(t => t.table_id !== deletingId.value)
      showDeleteDialog.value = false
      notify('Table deleted.')
    } catch (err) {
      notify(err.message ?? 'Failed to delete table.', 'error')
    } finally {
      deleting.value  = false
      deletingId.value = null
    }
  }

  // ── QR ─────────────────────────────────────────────────────────────────────
  async function generateQr(tableId) {
    generatingId.value = tableId
    try {
      const { data } = await tableApi.generateQr(tableId)
      const updated  = data.table ?? data
      const idx = tables.value.findIndex(t => t.table_id === tableId)
      if (idx !== -1) tables.value[idx] = updated
      notify('QR code generated.')
    } catch (err) {
      notify(err.message ?? 'Failed to generate QR code.', 'error')
    } finally {
      generatingId.value = null
    }
  }

  async function generateAll() {
    generatingAll.value = true
    try {
      const { data } = await tableApi.generateAll()
      notify(data.message ?? `QR codes generated for ${data.count} tables.`)
      await fetchTables()    
    } catch (err) {
      notify(err.message ?? 'Failed to bulk generate QR codes.', 'error')
    } finally {
      generatingAll.value = false
    }
  }

  function downloadQr(table) {
    window.location.href = tableApi.downloadQrUrl(table.table_id)
  }

  function printQr(table) {
    tableToPrint.value = table
    setTimeout(() => {
      window.print()
      setTimeout(() => { tableToPrint.value = null }, 500)
    }, 100)
  }

  async function init() {
    await fetchTables()
  }

  return {
    // state
    tables, loading, saving, deleting,
    generatingId, generatingAll,
    snackbar, search, selectedSection, sections,
    showAddDialog, showEditDialog, showDeleteDialog,
    deletingId, editTableData, tableToPrint, newTable,
    // computed
    filteredTables, dashboardStats,
    // helpers
    getQrUrl,
    // actions
    init, fetchTables,
    openAdd, addTable,
    openEdit, saveEdit,
    confirmDelete, handleDelete,
    generateQr, generateAll,
    downloadQr, printQr,
  }
})