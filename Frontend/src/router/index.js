<<<<<<< HEAD
=======
import { createRouter, createWebHistory } from 'vue-router'
import {
  getDashboardPathByRole,
  getUserRole,
  isAuthenticated,
  syncAuthSession,
} from '@/utils/auth'

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
      redirect: '/home/admin-dashboard',  // ✅ redirect here
    },
    {
      path: 'admin-dashboard',
      name: 'home-admin-dashboard',
      meta: { requiresAuth: true }, // ✅ no roles array
      component: () => import('@/views/home/AdminDashboard.vue'),
    },
    {
      path: 'sales-report',
      name: 'home-sales-report',
      meta: { requiresAuth: true },
      component: () => import('@/views/home/SalesReport.vue'),
    },
    {
      path: 'menu',
      name: 'home-menu',
      component: () => import('@/views/home/Menu.vue'),
    },
    {
      path: 'staff',
      name: 'home-staff',
      component: () => import('@/views/home/Staff.vue'),
    },
    {
      path: 'table',
      name: 'home-table',
      component: () => import('@/views/home/Table.vue'),
    },
    {
      path: 'settings',
      name: 'home-settings',
      meta: { requiresAuth: true },
      component: () => import('@/views/home/Settings.vue'),
    },
  ],
  },
  {
    path: '/features',
    name: 'features',
    meta: { requiresAuth: true },
    component: () => import('@/views/Features.vue'),
  },
  {
    path: '/dashboard',
    meta: { requiresAuth: true },
    redirect: '/home/dashboard',
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/NotFoundView.vue'),
  },
]
>>>>>>> e159202bdfe4d65fb2d1c3f48c42c4cdacd9d8f2


<<<<<<< HEAD
=======
let sessionChecked = false

async function ensureSession() {
  if (!isAuthenticated()) {
    sessionChecked = true
    return false
  }

  if (sessionChecked) {
    return true
  }

  const ok = await syncAuthSession()
  sessionChecked = true
  return ok
}

router.beforeEach(async (to) => {
  const authed = await ensureSession()

  if (to.meta.requiresAuth && !authed) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && authed) {
    return getDashboardPathByRole()
  }

  if (to.meta.requiresAuth && Array.isArray(to.meta.roles) && to.meta.roles.length > 0) {
    const role = getUserRole()

    if (!to.meta.roles.includes(role)) {
      return getDashboardPathByRole()
    }
  }

  return true
})

export default router


>>>>>>> e159202bdfe4d65fb2d1c3f48c42c4cdacd9d8f2
