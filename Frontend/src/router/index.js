import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'  // ← ADD this import

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
    path: '/home',
    meta: { requiresAuth: true },
    component: () => import('@/views/Layout.vue'),
    children: [
      { path: '', redirect: '/home/admin-dashboard' },
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
<<<<<<< HEAD
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
        path: 'users',
        name: 'home-users',
        meta: { requiresAuth: true, roles: ['admin'] },
        component: () => import('@/views/home/Users.vue'),
      },
      {
        path: 'table',
        name: 'home-table',
        component: () => import('@/views/home/Table.vue'),
=======
        path: 'settings',
        name: 'home-settings',
        meta: { requiresAuth: true },
        component: () => import('@/views/setting/Settings.vue'),
>>>>>>> c4255a11263de64539af4715253de56ebbc217b2
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')   // ← read directly, most reliable

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.guestOnly && token) {
    next('/home')
  } else {
    next()
  }
})

export default router