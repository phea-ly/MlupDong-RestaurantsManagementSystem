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
  return '/home/admin-dashboard' // ✅ everyone goes here for now
}

// ── Auth actions ────────────────────────────────────────────────────
export async function loginSession({ email, password }) {
  // 🔧 Replace this with your real API call
  // Example: const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) })

  // Mock login for now
  if (email === 'admin@test.com' && password === 'password') {
    saveSession({ name: 'Admin User', email, role: 'admin' })
    return
  }
  if (email === 'staff@test.com' && password === 'password') {
    saveSession({ name: 'Sophal K.', email, role: 'manager' })
    return
  }
  throw new Error('Invalid email or password')
}

export async function registerSession({ name, email, password }) {
  // 🔧 Replace with your real API call later
  const role = email.includes('admin') ? 'admin' : 'manager'
  saveSession({ name, email, role })
}

export async function logoutSession() {
  clearSession()
}

export async function syncAuthSession() {
  // 🔧 Replace with API token validation if needed
  // e.g. verify token with backend, refresh if expired
  return isAuthenticated()
}
