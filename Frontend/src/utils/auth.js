const SESSION_KEY = 'auth_session'


// ── Save / clear session ────────────────────────────────────────────
export function saveSession(user) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
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

// ── Auth state ──────────────────────────────────────────────────────
export function isAuthenticated() {
  return !!getSessionUser()
}

export function getUserRole() {
  return getSessionUser()?.role ?? null
}

// ── Route helper ────────────────────────────────────────────────────
export function getDashboardPathByRole() {
  const role = getUserRole()
  if (role === 'admin') return '/home/admin-dashboard'
  return '/home/admin-dashboard' 
}

// ── Auth actions ────────────────────────────────────────────────────
export async function loginSession({ email, password }) {

  if (email === 'admin@test.com' && password === 'password') {
    saveSession({ name: 'Admin User', email, role: 'admin' })
    return
  }
  if (email === 'staff@test.com' && password === 'password') {
    saveSession({ name: 'Sophal K.', email, role: 'staff' })
    return
  }
  throw new Error('Invalid email or password')
}

export async function registerSession({ name, email, password }) {

  const role = email.includes('admin') ? 'admin' : 'admin'
  saveSession({ name, email, role })
}

export async function logoutSession() {
  clearSession()
}

export async function syncAuthSession() {
  return isAuthenticated()
}
