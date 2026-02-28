import { useAuthStore } from '@/stores/auth.store'

export function setupGuards(router) {
  router.beforeEach((to, from, next) => {
    const auth = useAuthStore()

    if (to.path === '/dashboard' && !auth.isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  })
}