// Save / clear auth state in localStorage
export function saveSession(data) {
  if (data) {
    localStorage.setItem('auth_session', JSON.stringify(data))
  } else {
    localStorage.removeItem('auth_session')
  }
}

export function clearSession() {
  localStorage.removeItem('auth_session')
}

export function getSessionUser() {
  try {
    const stored = localStorage.getItem('auth_session')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function getUserRole() {
  return getSessionUser()?.user?.role ?? null
}

export function getDashboardPathByRole() {
  const role = getUserRole()
  switch (role) {
    case 'admin':   return '/home/admin-dashboard'
    case 'manager': return '/home/admin-dashboard'
    default:        return '/home/admin-dashboard'
  }
}
