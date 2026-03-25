let memorySession = null

// Save / clear in-memory auth state (no session storage)
export function saveSession(data) {
  memorySession = data ?? null
}

export function clearSession() {
  memorySession = null
}

export function getSessionUser() {
  return memorySession
}

export function getToken() {
  return getSessionUser()?.token ?? null
}

// Auth state helpers
export function isAuthenticated() {
  return !!getToken()
}

export function getUserRole() {
  return getSessionUser()?.role ?? null
}

export function getDashboardPathByRole() {
  // Extend this switch when you add more roles
  const role = getUserRole()
  switch (role) {
    case 'admin':   return '/home/admin-dashboard'
    case 'manager': return '/home/admin-dashboard'
    default:        return '/home/admin-dashboard'
  }
}
