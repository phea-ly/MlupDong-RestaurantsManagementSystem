import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { getDashboardPathByRole, getUserRole, isAuthenticated } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authenticated = isAuthenticated()
  const role = getUserRole()

  if (to.meta.requiresAuth && !authenticated) {
    return '/login'
  }

  if (to.meta.guestOnly && authenticated) {
    return getDashboardPathByRole()
  }

  if (authenticated && to.path === '/home/dashboard') {
    return getDashboardPathByRole()
  }

  if (to.meta.roles && !to.meta.roles.includes(role)) {
    return authenticated ? getDashboardPathByRole() : '/login'
  }

  return true
})

export default router
