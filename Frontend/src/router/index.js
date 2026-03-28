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
    meta: { requiresAuth: true },
    component: () => import("@/views/Layout.vue"),
    children: [
      { path: "", redirect: "/home/admin-dashboard" },
      {
        path: "admin-dashboard",
        name: "home-dashboard",
        meta: { requiresAuth: true },
        component: () => import("@/views/dashboard/AdminDashboard.vue"),
      },
      {
        path: "menu",
        name: "home-menu",
        meta: { requiresAuth: true },
        component: () => import("@/views/menu/Menu.vue"),
      },
      {
        path: "categories",
        name: "home-categories",
        meta: { requiresAuth: true },
        component: () => import("@/views/categories/Categories.vue"),
      },
      {
        path: "staff",
        name: "home-staff",
        meta: { requiresAuth: true },
        component: () => import("@/views/staff/Staff.vue"),
      },
      {
        path: "table",
        name: "home-table",
        meta: { requiresAuth: true },
        component: () => import("@/views/table/Table.vue"),
      },
      {
        path: "user",
        name: "home-user",
        meta: { requiresAuth: true },
        component: () => import("@/views/user/User.vue"),
      },
      {
        path: "sales-report",
        name: "home-sales-report",
        meta: { requiresAuth: true },
        component: () => import("@/views/salesReport/SalesReport.vue"),
      },
      {
        path: "activity",
        name: "home-activity",
        meta: { requiresAuth: true },
        component: () => import("@/views/activity/Activity.vue"),
      },
      {
        path: "settings",
        name: "home-settings",
        meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  await authStore.ensureAuthChecked();
  const isAuthed = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthed) {
    // Save where the user wanted to go
    localStorage.setItem('redirectPath', to.fullPath);
    next("/login");
  } else if (to.meta.guestOnly && isAuthed) {
    next("/home");
  } else {
    next();
  }
});

export default router;
