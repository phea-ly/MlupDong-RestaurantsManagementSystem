import { createRouter, createWebHistory } from 'vue-router'
import authRoutes from './auth.routes'
import dashboardRoutes from './dashboard.routes'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  ...authRoutes,
  ...dashboardRoutes,
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
