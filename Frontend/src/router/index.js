import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes = [
  {
    path:     '/',
    redirect: '/login',
  },

  // ── Guest only ───────────────────────────────────────────────────────────
  {
    path:      '/login',
    name:      'login',
    meta:      { guestOnly: true },
    component: () => import('@/views/Login.vue'),
  },

  // ── Protected: admin / manager shell ─────────────────────────────────────
  {
    path:      '/home',
    meta:      { requiresAuth: true },
    component: () => import('@/views/Layout.vue'),
    children: [
      { path: '', redirect: '/home/admin-dashboard' },
      {
        path:      'admin-dashboard',
        name:      'home-dashboard',
        component: () => import('@/views/dashboard/AdminDashboard.vue'),
      },
      {
        path:      'menu',
        name:      'home-menu',
        component: () => import('@/views/menu/Menu.vue'),
      },
      {
        path:      'roles',
        name:      'home-roles',
        component: () => import('@/views/roles/roles.vue'),
      },
      {
        path:      'categories',
        name:      'home-categories',
        component: () => import('@/views/categories/Categories.vue'),
      },
      {
        path:      'staff',
        name:      'home-staff',
        component: () => import('@/views/staff/Staff.vue'),
      },
      {
        path:      'table',
        name:      'home-table',
        component: () => import('@/views/table/Table.vue'),
      },
      {
        path:      'user',
        name:      'home-user',
        component: () => import('@/views/user/User.vue'),
      },
      {
        path:      'sales-report',
        name:      'home-sales-report',
        component: () => import('@/views/salesReport/SalesReport.vue'),
      },
      {
        path:      'activity',
        name:      'home-activity',
        component: () => import('@/views/activity/Activity.vue'),
      },
      {
        path:      'settings',
        name:      'home-settings',
        component: () => import('@/views/setting/Settings.vue'),
      },
    ],
  },

  // ── Protected: staff ─────────────────────────────────────────────────────
  {
    path:      '/waiter',
    name:      'waiter-dashboard',
    // meta:      { requiresAuth: true },
    component: () => import('@/views/waiter/waiterApp.vue'),
  },

  // ── Public: kitchen display ───────────────────────────────────────────────
  {
    path:      '/chef',
    name:      'chef-menu',
    component: () => import('@/views/kds/KdsApp.vue'),
  },

  // ── Public: customer-facing (token-based, no login required) ─────────────
  // {
  //   path:      '/menu/:token',
  //   name:      'customer-menu',
  //   component: () => import('@/views/customer/customerMenu.vue'),
  // },
  {
    path:      '/order/:token',
    name:      'customer-order',
    component: () => import('@/views/customer/customerOrder.vue'),
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  {
    path:     '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ── Navigation guard ───────────────────────────────────────────────────────
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  const needsAuthCheck = to.meta.requiresAuth || to.meta.guestOnly

  if (needsAuthCheck) {
    await authStore.ensureAuthChecked()
  }

  const isAuthed = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthed) {

    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.guestOnly && isAuthed) {
    return next(authStore.dashboardPath)
  }

  return next()
})

export default router
