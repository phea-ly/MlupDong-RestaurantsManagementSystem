// src/utils/auth.js

const SESSION_KEY = 'auth_session'

// ── Session ────────────────────────────────────────────────────────────────

/**
 * Persist only the user object to localStorage.
 * The JWT token is stored in an HttpOnly cookie by the server —
 * it is never accessible to JavaScript.
 */
export function saveSession(user) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

/** Remove the session from localStorage. */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

/**
 * Read and parse the stored session.
 * Returns { user } or null.
 */
export function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── User ───────────────────────────────────────────────────────────────────

/** Return the stored user object, or null. */
export function getUser() {
  return getSessionUser()?.user ?? null
}

/**
 * True if a user object is cached in localStorage.
 * The actual token validity is always verified server-side via the cookie.
 */
export function hasUser() {
  return !!getUser()
}

/**
 * Resolve the user's role string from any shape Laravel may return:
 *   role: 'admin'
 *   role: { name: 'admin' }
 *   role: { role_name: 'admin' }
 */
export function getUserRole() {
  const user = getUser()
  return (
    user?.role?.name      ??
    user?.role?.role_name ??
    user?.role            ??
    null
  )
}

// ── Routing ────────────────────────────────────────────────────────────────

/**
 * Map a role string to its home route.
 * Extend this switch as you add more roles.
 */
export function getDashboardPathByRole(role) {
  switch (role) {
    case 'admin':
    case 'manager':
      return '/home/admin-dashboard'
    case 'waiter':
      return '/waiter'
    case 'chef':
      return '/chef'
    default:
      return '/home/admin-dashboard'
  }
}