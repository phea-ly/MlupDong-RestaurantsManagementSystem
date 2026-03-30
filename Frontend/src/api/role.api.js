import api from './api'

/**
 * @typedef {Object} Role
 * @property {number}      role_id
 * @property {string}      role_name
 * @property {string|null} description
 * @property {string}      created_at
 * @property {string}      updated_at
 */

/**
 * @typedef {Object} RolePayload
 * @property {string}      role_name
 * @property {string|null} [description]
 */

const BASE = '/roles'

export const roleApi = {
  /**
   * Fetch all roles (latest first).
   * @returns {Promise<Role[]>}
   */
  getAll() {
    return api.get(BASE).then((r) => r.data)
  },

  /**
   * Fetch a single role by ID.
   * @param {number|string} id
   * @returns {Promise<Role>}
   */
  getOne(id) {
    return api.get(`${BASE}/${id}`).then((r) => r.data)
  },

  /**
   * Create a new role.
   * @param {RolePayload} payload
   * @returns {Promise<Role>}
   */
  create(payload) {
    return api.post(BASE, payload).then((r) => r.data)
  },

  /**
   * Update an existing role.
   * @param {number|string} id
   * @param {Partial<RolePayload>} payload
   * @returns {Promise<Role>}
   */
  update(id, payload) {
    return api.put(`${BASE}/${id}`, payload).then((r) => r.data)
  },

  /**
   * Delete a role.
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  destroy(id) {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  },
}