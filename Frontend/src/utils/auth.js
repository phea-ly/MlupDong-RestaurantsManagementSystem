
const SESSION_KEY = 'auth_session'

// ── Save / clear session ────────────────────────────────────────────────────
export function saveSession(data) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function getSessionUser() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getToken() {
  return getSessionUser()?.token ?? null
}

// ── Auth state helpers ──────────────────────────────────────────────────────
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