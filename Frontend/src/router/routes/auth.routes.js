const authRoutes = [
  {
    path: '/login',
    component: () => import('@/views/auth/LoginView.vue')
  },
  {
    path: '/register',
    component: () => import('@/views/auth/RegisterView.vue')
  }
]

export default authRoutes
