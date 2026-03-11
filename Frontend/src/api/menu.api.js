import api from './api'

// ── Menu Items ──────────────────────────────────────────────────────
export const menuItemApi = {
    /** GET /api/menu-items */
    getAll() {
        return api.get('/menu-items')
    },

    /** GET /api/menu-items/:id */
    getOne(id) {
        return api.get(`/menu-items/${id}`)
    },

    /** POST /api/menu-items  (multipart if image file, else JSON) */
    create(payload) {
        return api.post('/menu-items', payload, {
            headers: payload instanceof FormData
                ? { 'Content-Type': 'multipart/form-data' }
                : {}
        })
    },

    /** PUT /api/menu-items/:id */
    update(id, payload) {
        // Laravel doesn't parse multipart PUT, so use POST + _method spoofing
        if (payload instanceof FormData) {
            payload.append('_method', 'PUT')
            return api.post(`/menu-items/${id}`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        }
        return api.put(`/menu-items/${id}`, payload)
    },

    /** DELETE /api/menu-items/:id */
    destroy(id) {
        return api.delete(`/menu-items/${id}`)
    },

    /** PATCH /api/menu/{id}/availability */
    toggleStatus(id, status) {
        return api.patch(`/menu/${id}/availability`, { status })
    },
}

// ── Categories ─────────────────────────────────────────────────────
export const categoryApi = {
    /** GET /api/categories */
    getAll() {
        return api.get('/categories')
    },

    /** POST /api/categories */
    create(payload) {
        return api.post('/categories', payload)
    },

    /** PUT /api/categories/:id */
    update(id, payload) {
        return api.put(`/categories/${id}`, payload)
    },

    /** DELETE /api/categories/:id */
    destroy(id) {
        return api.delete(`/categories/${id}`)
    },
}
