import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, syncAuthSession } from '@/utils/auth'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    meta: { guestOnly: true },
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/register',
    name: 'register',
    meta: { guestOnly: true },
    component: () => import('@/views/Register.vue'),
  },
  {
    path: '/home',
    meta: { requiresAuth: true },
    component: () => import('@/views/Layout.vue'),
    children: [
      {
        path: '',
        redirect: '/home/admin-dashboard',
      },
      {
        path: 'admin-dashboard',
        name: 'home-dashboard',
        meta: { requiresAuth: true },
        component: () => import('@/views/dashboard/AdminDashboard.vue'),
      },
      {
        path: 'menu',
        name: 'home-menu',
        meta: { requiresAuth: true },
        component: () => import('@/views/menu/Menu.vue'),
      },
      {
        path: 'staff',
        name: 'home-staff',
        meta: { requiresAuth: true },
        component: () => import('@/views/staff/Staff.vue'),
      },
      {
        path: 'table',
        name: 'home-table',
        meta: { requiresAuth: true },
        component: () => import('@/views/table/Table.vue'),
      },
      {
        path: 'user',
        name: 'home-user',
        meta: { requiresAuth: true },
        component: () => import('@/views/user/User.vue'),
      },
      {
        path: 'sales-report',
        name: 'home-sales-report',
        meta: { requiresAuth: true },
        component: () => import('@/views/salesReport/SalesReport.vue'),
      },
      {
        path: 'settings',
        name: 'home-settings',
        meta: { requiresAuth: true },
        component: () => import('@/views/setting/Settings.vue'),
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ── Navigation Guard ───────────────────────────────────
let sessionChecked = false

async function ensureSession() {
  if (!isAuthenticated()) {
    sessionChecked = true
    return false
  }
  if (sessionChecked) return true
  const ok = await syncAuthSession()
  sessionChecked = true
  return ok
}

router.beforeEach(async (to) => {
  const authed = await ensureSession()

  if (to.meta.requiresAuth && !authed) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guestOnly && authed) {
    return '/home/admin-dashboard'
  }

  return true
})

export default router