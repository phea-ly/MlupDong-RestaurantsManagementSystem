import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
  const store = useAuthStore()

  const login = async (credentials) => {
    await store.login(credentials)
  }

  const logout = () => {
    store.logout()
  }

  return {
    user: store.user,
    login,
    logout
  }
}