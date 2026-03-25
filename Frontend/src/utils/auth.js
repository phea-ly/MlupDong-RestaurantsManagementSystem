let memorySession = null

export function saveSession(data) {
  memorySession = data ?? null
}

export function clearSession() {
  memorySession = null
}

export function getSessionUser() {
  return memorySession
}

export function getUserRole() {
  return getSessionUser()?.user?.role ?? null
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
