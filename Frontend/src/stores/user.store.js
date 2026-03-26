import { defineStore }   from 'pinia'
import { ref, computed } from 'vue'
import { getApi, postApi, putApi, patchApi, deleteApi } from '@/api/auth.api'

export const useUserStore = defineStore('user', () => {

  // ── UI state ───────────────────────────────────────────────────────────────
  const search            = ref('')
  const filterRole        = ref('all')
  const filterRestaurant  = ref('all')
  const showAddDialog     = ref(false)
  const showEditDialog    = ref(false)
  const showDeleteDialog  = ref(false)
  const showProfileDialog = ref(false)
  const deletingId        = ref(null)
  const editTarget        = ref(null)
  const profileTarget     = ref(null)

  // ── Data state ─────────────────────────────────────────────────────────────
  const users         = ref([])
  const roles         = ref([])         
  const restaurants   = ref([])         
  const loading       = ref(false)
  const saving        = ref(false)
  const deleting      = ref(false)
  const profileSaving = ref(false)
  const snackbar      = ref({ show: false, message: '', color: 'success' })
  const formErrors    = ref({})        

  // Default form shape — password required on create, optional on edit
  function blankForm() {
    return {
      firstName:    '',
      lastName:     '',
      email:        '',
      password:     '',
      phone:        '',
      role_id:      null,
      restaurant_id: null,
    }
  }
  const modal = ref({ form: blankForm() })

  // ── Constants ──────────────────────────────────────────────────────────────
  const avatarColors = ['#22c55e','#6366f1','#f97316','#ec4899','#06b6d4','#84cc16','#f43f5e','#a855f7']

  const roleConfig = {
    ADMINISTRATOR: { bg: '#e6fff5', text: '#063824' },
    MANAGER:       { bg: '#eff6ff', text: '#1e40af' },
    STAFF:         { bg: '#f5f3ff', text: '#5b21b6' },
    CASHIER:       { bg: '#fff1f2', text: '#9f1239' },
    WAITRESS:      { bg: '#fdf4ff', text: '#86198f' },
    CHEF:          { bg: '#fff7ed', text: '#9a3412' },
    SERVER:        { bg: '#f0fdfa', text: '#134e4a' },
    HOST:          { bg: '#faf5ff', text: '#6b21a8' },
  }

  // ── Dropdown options derived from API data ─────────────────────────────────
  const roleOptions       = computed(() => roles.value.map(r => ({ title: r.name ?? r.role_name, value: r.role_id })))
  const restaurantOptions = computed(() => restaurants.value.map(r => ({ title: r.name ?? r.restaurant_name, value: r.restaurant_id })))

  // Filter bar options (label-only lists)
  const filterRoleOptions       = computed(() => ['All Roles',       ...roles.value.map(r => r.name ?? r.role_name)])
  const filterRestaurantOptions = computed(() => ['All Locations',   ...restaurants.value.map(r => r.name ?? r.restaurant_name)])

  // ── Helpers ────────────────────────────────────────────────────────────────
  function notify(message, color = 'success') {
    snackbar.value = { show: true, message, color }
  }

  function clearFormErrors() {
    formErrors.value = {}
  }

  function resolveAvatar(url) {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '')
    return `${base}/${url}`
  }

  function mapUser(u, index = 0) {
    const firstName = u.first_name ?? ''
    const lastName  = u.last_name  ?? ''
    const fullName  = `${firstName} ${lastName}`.trim() || u.name || '-'
    const initials  = ((firstName[0] ?? '') + (lastName[0] ?? '')).toUpperCase() || '??'
    const roleName        = u.role?.name ?? u.role?.role_name ?? u.role   ?? ''
    const restaurantName  = u.restaurant?.name ?? u.restaurant?.restaurant_name ?? u.restaurant ?? ''
    return {
      id:            `#USR-${String(u.user_id ?? u.id).padStart(4, '0')}`,
      rawId:         u.user_id ?? u.id,
      name:          fullName,
      initials,
      avatarColor:   avatarColors[index % avatarColors.length],
      avatar:        resolveAvatar(u.avatar ?? null),
      email:         u.email       ?? '',
      phone:         u.phone       ?? '',
      role:          roleName.toUpperCase(),
      role_id:       u.role_id     ?? u.role?.role_id ?? null,
      restaurant:    restaurantName,
      restaurant_id: u.restaurant_id ?? u.restaurant?.restaurant_id ?? null,
      active:        u.status      ?? u.is_active ?? true,
      created:       u.created_at
        ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        : '-',
    }
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  const stats = computed(() => ({
    total:    users.value.length,
    active:   users.value.filter(u => u.active).length,
    inactive: users.value.filter(u => !u.active).length,
  }))

  const filteredUsers = computed(() =>
    users.value.filter(u => {
      const matchRest   = ['All Locations','all'].includes(filterRestaurant.value) || u.restaurant === filterRestaurant.value
      const matchRole   = ['All Roles','all'].includes(filterRole.value)           || u.role       === filterRole.value
      const q           = search.value.trim().toLowerCase()
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      return matchRest && matchRole && matchSearch
    })
  )

  // ── Actions ────────────────────────────────────────────────────────────────
  async function fetchUsers() {
    loading.value = true
    try {
      const { data } = await getApi('/users')
      const list = Array.isArray(data) ? data : (data.data ?? [])
      users.value = list.map(mapUser)
    } catch {
      notify('Failed to load users.', 'error')
    } finally {
      loading.value = false
    }
  }

  // Fetch roles + restaurants for dropdowns
  async function fetchOptions() {
    try {
      const [rolesRes, restRes] = await Promise.all([
        getApi('/roles'),
        getApi('/restaurants'),
      ])
      roles.value       = Array.isArray(rolesRes.data) ? rolesRes.data : (rolesRes.data?.data ?? [])
      restaurants.value = Array.isArray(restRes.data)  ? restRes.data  : (restRes.data?.data  ?? [])
    } catch {
      // non-fatal — dropdowns will be empty but page still works
    }
  }

  function openAdd() {
    modal.value.form = blankForm()
    clearFormErrors()
    showAddDialog.value = true
  }

  async function saveUser() {
    saving.value = true
    clearFormErrors()
    try {
      const f = modal.value.form
      const { data } = await postApi('/users', {
        first_name:    f.firstName,
        last_name:     f.lastName,
        email:         f.email,
        password:      f.password,      
        phone:         f.phone || null,
        role_id:       f.role_id,       
        restaurant_id: f.restaurant_id,  
      })
      users.value.unshift(mapUser(data, 0))
      users.value = users.value.map((u, i) => ({ ...u, avatarColor: avatarColors[i % avatarColors.length] }))
      showAddDialog.value = false
      notify('User created successfully.')
    } catch (err) {
      formErrors.value = err.errors ?? {}
      notify(err.message ?? 'Failed to create user.', 'error')
    } finally {
      saving.value = false
    }
  }

  function openEdit(user) {
    editTarget.value = user
    modal.value.form = {
      firstName:     user.name.split(' ')[0]  ?? '',
      lastName:      user.name.split(' ').slice(1).join(' ') ?? '',
      email:         user.email,
      password:      '',             
      phone:         user.phone       ?? '',
      role_id:       user.role_id,
      restaurant_id: user.restaurant_id,
    }
    clearFormErrors()
    showEditDialog.value = true
  }

  async function saveEdit() {
    saving.value = true
    clearFormErrors()
    try {
      const f   = modal.value.form
      const payload = {
        first_name:    f.firstName,
        last_name:     f.lastName,
        email:         f.email,
        phone:         f.phone || null,
        role_id:       f.role_id,
        restaurant_id: f.restaurant_id,
      }
      if (f.password) payload.password = f.password

      const idx = users.value.findIndex(u => u.rawId === editTarget.value.rawId)
      const { data } = await putApi(`/users/${editTarget.value.rawId}`, payload)
      Object.assign(editTarget.value, mapUser(data, idx))
      showEditDialog.value = false
      notify('User updated successfully.')
    } catch (err) {
      formErrors.value = err.errors ?? {}
      notify(err.message ?? 'Failed to update user.', 'error')
    } finally {
      saving.value = false
    }
  }

  async function toggleActive(user) {
    const previous = user.active
    user.active = !previous
    try {
      await patchApi(`/users/${user.rawId}`, { status: user.active })
    } catch {
      user.active = previous
      notify('Failed to update status.', 'error')
    }
  }

  function confirmDelete(id) {
    deletingId.value       = id
    showDeleteDialog.value = true
  }

  async function handleDelete() {
    deleting.value = true
    const target = users.value.find(u => u.id === deletingId.value)
    try {
      await deleteApi(`/users/${target.rawId}`)
      users.value = users.value.filter(u => u.id !== deletingId.value)
      showDeleteDialog.value = false
      notify('User deleted.')
    } catch (err) {
      notify(err.message ?? 'Failed to delete user.', 'error')
    } finally {
      deleting.value = false
    }
  }

  function openEditProfile(user) {
    profileTarget.value     = user
    showProfileDialog.value = true
  }

  async function handleProfileSaved(updatedUser) {
    if (!profileTarget.value || profileSaving.value) return
    profileSaving.value = true
    try {
      const form = new FormData()
      form.append('first_name', updatedUser.firstName ?? '')
      form.append('last_name',  updatedUser.lastName  ?? '')
      form.append('email',      updatedUser.email     ?? '')
      if (updatedUser.avatarFile) form.append('avatar', updatedUser.avatarFile)
      form.append('_method', 'PUT')

      const { data } = await postApi(`/users/${profileTarget.value.rawId}`, form)
      const idx    = users.value.findIndex(u => u.rawId === profileTarget.value.rawId)
      const mapped = mapUser(data, idx === -1 ? users.value.length : idx)
      if (idx !== -1) users.value[idx] = mapped
      Object.assign(profileTarget.value, mapped)
      notify('Profile updated successfully.')
    } catch (err) {
      notify(err.message ?? 'Failed to update profile.', 'error')
    } finally {
      profileSaving.value = false
    }
  }

  async function init() {
    await Promise.all([fetchUsers(), fetchOptions()])
  }

  return {
    search, filterRole, filterRestaurant,
    showAddDialog, showEditDialog, showDeleteDialog, showProfileDialog,
    deletingId, editTarget, profileTarget,
    users, loading, saving, deleting, profileSaving,
    snackbar, modal, formErrors,
    roleConfig, roleOptions, restaurantOptions,
    filterRoleOptions, filterRestaurantOptions,
    stats, filteredUsers,
    init, openAdd, saveUser, openEdit, saveEdit,
    toggleActive, confirmDelete, handleDelete,
    openEditProfile, handleProfileSaved,
  }
})
