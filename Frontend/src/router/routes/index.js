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
    component: () => import('@/views/Home.vue'),
    children: [
      {
        path: '',
        redirect: '/home/dashboard',
      },
      {
        path: 'admin-dashboard',
        name: 'home-admin-dashboard',
        meta: { requiresAuth: true, roles: ['admin'] },
        component: () => import('@/views/home/AdminDashboard.vue'),
      },
      {
        path: 'client-dashboard',
        name: 'home-client-dashboard',
        meta: { requiresAuth: true, roles: ['client'] },
        component: () => import('@/views/home/ClientDashboard.vue'),
      },
      {
        path: 'dashboard',
        name: 'home-dashboard',
        meta: { requiresAuth: true },
        component: () => import('@/views/home/Dashboard.vue'),
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

export default routes
