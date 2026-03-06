import { loginApi, logoutApi, meApi, registerApi } from '@/api/auth.api'

const AUTH_USER_KEY = 'auth_session_user'
const AUTH_TOKEN_KEY = 'auth_session_token'

function parseJson(rawValue) {
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    return null
  }
}

export function getSessionUser() {
  const user = parseJson(localStorage.getItem(AUTH_USER_KEY))

  if (user) {
    return user
  }

  localStorage.removeItem(AUTH_USER_KEY)
  return null
}

export function getSessionToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

function setSessionToken(token) {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    return
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

function setSessionUser(user) {
  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY)
    return
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

function parseApiError(error, fallbackMessage) {
  const data = error?.response?.data

  if (data?.error) {
    return data.error
  }

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
  return !!getSessionToken()
}

export function getUserRole() {
  return getSessionUser()?.role ?? null
}

export function getDashboardPathByRole() {
  return getUserRole() === 'admin' ? '/home/admin-dashboard' : '/home/client-dashboard'
}

export async function loginWithCredentials(email, password, remember = false) {
  if (!email || !password) {
    throw new Error('Email and password are required.')
  }

  try {
    const loginResponse = await loginApi({ email, password, remember })
    const token = loginResponse?.data?.token

    if (!token) {
      throw new Error('Login succeeded but token was not returned.')
    }

    setSessionToken(token)

    const userResponse = await meApi()
    const user = userResponse?.data
    setSessionUser(user)

    return user
  } catch (error) {
    clearSession()
    throw new Error(parseApiError(error, 'Unable to sign in.'))
  }
}

export async function registerWithCredentials(payload) {
  try {
    const response = await registerApi(payload)
    const token = response?.data?.token
    const registeredUser = response?.data?.user ?? null

    if (token) {
      setSessionToken(token)
    }

    if (registeredUser) {
      setSessionUser(registeredUser)
      return registeredUser
    }

    if (token) {
      const userResponse = await meApi()
      const user = userResponse?.data
      setSessionUser(user)
      return user
    }

    throw new Error('Registration succeeded but token was not returned.')
  } catch (error) {
    clearSession()
    throw new Error(parseApiError(error, 'Unable to create account.'))
  }
}

export async function syncAuthSession() {
  if (!getSessionToken()) {
    clearSession()
    return false
  }

  try {
    const response = await meApi()
    setSessionUser(response.data)
    return true
  } catch {
    clearSession()
    return false
  }
}

export async function logoutSession() {
  try {
    await logoutApi()
  } finally {
    clearSession()
  }
}
