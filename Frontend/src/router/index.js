import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "login",
    meta: { guestOnly: true },
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/home",
    component: () => import("@/views/Layout.vue"),
    children: [
      { path: "", redirect: "/home/admin-dashboard" },
      {
        path: "admin-dashboard",
        name: "home-dashboard",
        component: () => import("@/views/dashboard/AdminDashboard.vue"),
      },
      {
        path: "menu",
        name: "home-menu",
        component: () => import("@/views/menu/Menu.vue"),
      },
      {
        path: "categories",
        name: "home-categories",
        component: () => import("@/views/categories/Categories.vue"),
      },
      {
        path: "staff",
        name: "home-staff",
        component: () => import("@/views/staff/Staff.vue"),
      },
      {
        path: "table",
        name: "home-table",
        component: () => import("@/views/table/Table.vue"),
      },
      {
        path: "user",
        name: "home-user",
        component: () => import("@/views/user/User.vue"),
      },
      {
        path: "sales-report",
        name: "home-sales-report",
        component: () => import("@/views/salesReport/SalesReport.vue"),
      },
      {
        path: "activity",
        name: "home-activity",
        component: () => import("@/views/activity/Activity.vue"),
      },
      {
        path: "settings",
        name: "home-settings",
        component: () => import("@/views/setting/Settings.vue"),
      },
    ],
  },
  {
    path: "/menu/:token",
    name: "customer-menu",
    component: () => import("@/views/customer/customerMenu.vue"),
  },
  {
    path: "/waiter",
    name: "waiter-dashboard",
    component: () => import("@/views/waiter/waiterApp.vue"),
  },
  {
    path: "/order/:token",
    name: "customer-order",
    component: () => import("@/views/customer/customerOrder.vue"),
  },

  {
    path: "/chef",
    name: "chef-menu",
    component: () => import("@/views/kds/KdsApp.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  const token = localStorage.getItem('token')
  if (token && !authStore.user) {
    await authStore.fetchMe()
  }

  const isAuthed = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthed) {
    return '/login'
  }

  if (to.meta.guestOnly && isAuthed) {
    return '/home'
  }

  return true  // ← allow navigation
})

export default router