const SESSION_KEY = 'auth_session'

export function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
  } catch {}
}

export function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function hasUser() {
  return !!getSessionUser()?.user
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {}
}

export function getDashboardPathByRole(role) {
  if (!role) return '/home'
  switch (role.toString().toLowerCase().trim()) {
    case 'chef':
      return '/chef'
    case 'waiter':
    case 'cashier':
    case 'staff':
      return '/waiter'
    case 'admin':
    case 'administrator':
    case 'manager':
    default:
      return '/home'
  }
}

export function canAccessPath(role, path) {
  if (!role) return false
  const r    = role.toString().toLowerCase().trim()
  const base = '/' + (path.split('/')[1] ?? '')
  switch (base) {
    case '/home':
      return ['admin', 'administrator', 'manager'].includes(r)
    case '/chef':
      return ['admin', 'administrator', 'manager', 'chef', 'staff'].includes(r)
    case '/waiter':
      return ['admin', 'administrator', 'manager', 'waiter', 'cashier', 'staff'].includes(r)
    default:
      return ['admin', 'administrator'].includes(r)
  }
}