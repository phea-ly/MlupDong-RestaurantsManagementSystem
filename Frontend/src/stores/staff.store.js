import { defineStore }   from 'pinia'
import { ref, computed } from 'vue'
import staffApi          from '@/api/staff.api'
import { getApi }        from '@/api/auth.api' 

export const useStaffStore = defineStore('staff', () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const staffList   = ref([])
  const userOptions = ref([])    
  const loading     = ref(false)
  const saving      = ref(false)
  const deleting    = ref(false)
  const snackbar    = ref({ show: false, message: '', color: 'success' })

  // Filters
  const search = ref('')

  // Dialog state
  const showAddDialog    = ref(false)
  const showEditDialog   = ref(false)
  const showDeleteDialog = ref(false)
  const deletingId       = ref(null)
  const editTarget       = ref(null)

  // Forms
  function blankForm() {
    return { user_id: null, position: '', status: 'Active', hire_date: '', salary: '' }
  }
  const newStaff = ref(blankForm())
  const editForm = ref(blankForm())

  // ── Constants ──────────────────────────────────────────────────────────────
  const statusOptions = ['Active', 'Inactive']

    const roleColors = {
    ADMINISTRATOR: 'deep-purple',
    MANAGER:       'blue',
    STAFF:         'indigo',
    CASHIER:       'pink',
    WAITRESS:      'purple',
    CHEF:          'orange',
    SERVER:        'teal',
    HOST:          'pink',
  }

  const headers = [
    { title: 'Staff Member', key: 'name',       sortable: true  },
    { title: 'Role',         key: 'role',        sortable: true  },
    { title: 'Position',     key: 'position',    sortable: true  },
    { title: 'Date Joined',  key: 'dateJoined',  sortable: false },
    { title: 'Status',       key: 'status',      sortable: true  },
    { title: 'Actions',      key: 'actions',     sortable: false, align: 'end' },
  ]

  // ── Computed ───────────────────────────────────────────────────────────────
  const activeCount  = computed(() => staffList.value.filter(s => s.status === 'Active').length)
  const kitchenCount = computed(() => staffList.value.filter(s => s.role === 'CHEF').length)
  const serviceCount = computed(() => staffList.value.filter(s => ['SERVER', 'HOST', 'WAITRESS', 'CASHIER', 'STAFF'].includes(s.role)).length)

  const filteredStaff = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return staffList.value
    return staffList.value.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      (s.position ?? '').toLowerCase().includes(q)
    )
  })

  // ── Helpers ────────────────────────────────────────────────────────────────
  function notify(message, color = 'success') {
    snackbar.value = { show: true, message, color }
  }

  function mapUserOption(u) {
    const firstName = u.first_name ?? ''
    const lastName  = u.last_name  ?? ''
    const name      = `${firstName} ${lastName}`.trim() || u.name || 'User'
    const role      = u.role?.name ?? u.role?.role_name ?? u.role ?? ''
    return {
      id:    u.user_id ?? u.id,
      name,
      email: u.email ?? '',
      role:  role.toUpperCase(),
    }
  }

  function mapStaff(s) {
    const u         = s.user ?? {}
    const firstName = u.first_name ?? ''
    const lastName  = u.last_name  ?? ''
    const name      = `${firstName} ${lastName}`.trim() || u.name || '-'
    const initials  = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '??'
    const role      = (u.role?.name ?? u.role?.role_name ?? u.role ?? 'STAFF').toString().toUpperCase()

    return {
      id:         s.staff_id,
      user_id:    s.user_id,
      position:   s.position  ?? '',
      hire_date:  s.hire_date ?? '',
      salary:     s.salary    ?? '',
      name,
      email:      u.email ?? '',
      role,
      initials,
      color:      roleColors[role] ?? 'success',
      status:     s.is_active ? 'Active' : 'Inactive',
      dateJoined: s.hire_date
        ? new Date(s.hire_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : s.created_at
          ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
          : '-',
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchUsers() {
    try {
      const { data } = await getApi('/users')
      const list = Array.isArray(data) ? data : (data.data ?? [])
      userOptions.value = list.map(mapUserOption)
    } catch {
      notify('Failed to load users.', 'error')
    }
  }

  async function fetchStaff() {
    loading.value = true
    try {
      const { data } = await staffApi.getAll()
      const list = Array.isArray(data) ? data : (data.data ?? [])
      staffList.value = list.map(mapStaff)
    } catch {
      notify('Failed to load staff.', 'error')
    } finally {
      loading.value = false
    }
  }

  // ── Create ─────────────────────────────────────────────────────────────────
  function openAdd() {
    newStaff.value      = blankForm()
    showAddDialog.value = true
  }

  async function addStaff() {
    if (!newStaff.value.user_id || saving.value) return
    saving.value = true
    try {
      const { data } = await staffApi.create({
        user_id:   newStaff.value.user_id,
        position:  newStaff.value.position  || null,
        hire_date: newStaff.value.hire_date || null,
        salary:    newStaff.value.salary    || null,
        is_active: newStaff.value.status === 'Active',
      })
      staffList.value.unshift(mapStaff(data))
      showAddDialog.value = false
      notify('Staff member added successfully.')
    } catch (err) {
      notify(err.message ?? 'Failed to create staff.', 'error')
    } finally {
      saving.value = false
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  function openEdit(member) {
    editTarget.value = { ...member }
    editForm.value   = {
      user_id:   member.user_id,
      position:  member.position  ?? '',
      hire_date: member.hire_date ?? '',
      salary:    member.salary    ?? '',
      status:    member.status,
    }
    showEditDialog.value = true
  }

  async function saveEdit() {
    if (!editTarget.value || saving.value) return
    saving.value = true
    try {
      const { data } = await staffApi.update(editTarget.value.id, {
        user_id:   editForm.value.user_id,
        position:  editForm.value.position  || null,
        hire_date: editForm.value.hire_date || null,
        salary:    editForm.value.salary    || null,
        is_active: editForm.value.status === 'Active',
      })
      const idx = staffList.value.findIndex(s => s.id === editTarget.value.id)
      if (idx !== -1) staffList.value[idx] = mapStaff(data)
      showEditDialog.value = false
      notify('Staff member updated successfully.')
    } catch (err) {
      notify(err.message ?? 'Failed to update staff.', 'error')
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
    if (!deletingId.value || deleting.value) return
    deleting.value = true
    try {
      await staffApi.remove(deletingId.value)
      staffList.value    = staffList.value.filter(s => s.id !== deletingId.value)
      showDeleteDialog.value = false
      deletingId.value   = null
      notify('Staff member deleted.')
    } catch (err) {
      notify(err.message ?? 'Failed to delete staff.', 'error')
    } finally {
      deleting.value = false
    }
  }

  async function init() {
    await Promise.all([fetchUsers(), fetchStaff()])
  }

  return {
    // state
    staffList, userOptions, loading, saving, deleting,
    snackbar, search,
    showAddDialog, showEditDialog, showDeleteDialog,
    deletingId, editTarget, newStaff, editForm,
    // constants
    headers, statusOptions, roleColors,
    // computed
    activeCount, kitchenCount, serviceCount, filteredStaff,
    // actions
    init, openAdd, addStaff, openEdit, saveEdit, confirmDelete, handleDelete,
  }
})
