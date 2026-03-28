import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { roleApi } from '@/api/role.api'

export const useRoleStore = defineStore('role', () => {
  // ─── State ────────────────────────────────────────────────────────────────
  /** @type {import('vue').Ref<import('@/api/role.api').Role[]>} */
  const roles       = ref([])
  const loading     = ref(false)
  const saving      = ref(false)
  const deleting    = ref(false)

  /** @type {import('vue').Ref<string|null>} */
  const error       = ref(null)

  /** @type {import('vue').Ref<Record<string,string[]>>} */
  const fieldErrors = ref({})

  // ─── Getters ──────────────────────────────────────────────────────────────
  const total = computed(() => roles.value.length)

  /** @param {number|string} id */
  const getById = (id) =>
    roles.value.find((r) => r.role_id === Number(id)) ?? null

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function clearErrors() {
    error.value       = null
    fieldErrors.value = {}
  }

  function handleError(err) {
    error.value       = err?.message       ?? 'Something went wrong.'
    fieldErrors.value = err?.errors        ?? {}
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  async function fetchRoles() {
    loading.value = true
    clearErrors()
    try {
      roles.value = await roleApi.getAll()
    } catch (err) {
      handleError(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * @param {import('@/api/role.api').RolePayload} payload
   * @returns {Promise<import('@/api/role.api').Role|null>}
   */
  async function createRole(payload) {
    saving.value = true
    clearErrors()
    try {
      const created = await roleApi.create(payload)
      roles.value.unshift(created)          // mirror backend `latest` order
      return created
    } catch (err) {
      handleError(err)
      return null
    } finally {
      saving.value = false
    }
  }

  /**
   * @param {number|string} id
   * @param {Partial<import('@/api/role.api').RolePayload>} payload
   * @returns {Promise<import('@/api/role.api').Role|null>}
   */
  async function updateRole(id, payload) {
    saving.value = true
    clearErrors()
    try {
      const updated = await roleApi.update(id, payload)
      const idx = roles.value.findIndex((r) => r.role_id === updated.role_id)
      if (idx !== -1) roles.value[idx] = updated
      return updated
    } catch (err) {
      handleError(err)
      return null
    } finally {
      saving.value = false
    }
  }

  /**
   * @param {number|string} id
   * @returns {Promise<boolean>}
   */
  async function deleteRole(id) {
    deleting.value = true
    clearErrors()
    try {
      await roleApi.destroy(id)
      roles.value = roles.value.filter((r) => r.role_id !== Number(id))
      return true
    } catch (err) {
      handleError(err)
      return false
    } finally {
      deleting.value = false
    }
  }

  return {
    // state
    roles,
    loading,
    saving,
    deleting,
    error,
    fieldErrors,
    // getters
    total,
    getById,
    // actions
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    clearErrors,
  }
})