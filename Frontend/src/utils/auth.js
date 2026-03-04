import { loginApi, logoutApi, meApi, registerApi } from '@/api/auth.api'

const AUTH_KEY = 'auth_session_user'

export function getSessionUser() {
  const rawUser = localStorage.getItem(AUTH_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    localStorage.removeItem(AUTH_KEY)
    return null
  }
}

function setSessionUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
}

function clearSessionUser() {
  localStorage.removeItem(AUTH_KEY)
}

function parseApiError(error, fallbackMessage) {
  const data = error?.response?.data

  if (data?.message) {
    return data.message
  }

  if (data?.errors) {
    const firstField = Object.keys(data.errors)[0]
    const firstMessage = data.errors[firstField]?.[0]

    if (firstMessage) {
      return firstMessage
    }
  }

  return fallbackMessage
}

export function isAuthenticated() {
  return Boolean(getSessionUser())
}

export function getUserRole() {
  return getSessionUser()?.role ?? null
}

export function getDashboardPathByRole() {
  const role = getUserRole()

  if (role === 'admin') {
    return '/home/admin-dashboard'
  }

  return '/home/client-dashboard'
}

export async function loginWithCredentials(email, password, remember = false) {
  if (!email || !password) {
    throw new Error('Email and password are required.')
  }

  try {
    const response = await loginApi({ email, password, remember })
    setSessionUser(response.data.user)
    return response.data.user
  } catch (error) {
    throw new Error(parseApiError(error, 'Unable to sign in.'))
  }
}

export async function registerWithCredentials(payload) {
  try {
    const response = await registerApi(payload)
    setSessionUser(response.data.user)
    return response.data.user
  } catch (error) {
    throw new Error(parseApiError(error, 'Unable to create account.'))
  }
}

export async function syncAuthSession() {
  try {
    const response = await meApi()
    setSessionUser(response.data.user)
    return true
  } catch {
    clearSessionUser()
    return false
  }
}

export async function logoutSession() {
  try {
    await logoutApi()
  } finally {
    clearSessionUser()
  }
}
