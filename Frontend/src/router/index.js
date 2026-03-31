import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },

  // ── Guest only ───────────────────────────────────────────────────────────
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/Login.vue"),
  },

  // ── Protected: admin / manager shell ────────────────────────────────────
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
        path: "roles",
        name: "home-roles",
        meta: { requiresAuth: true },
        component: () => import("@/views/roles/roles.vue"),
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
        path: "activity-log",
        name: "home-activity-log",
        meta: { requiresAuth: true },
        component: () => import("@/views/activity/Activity.vue"),
      },
    ],
  },

  // ── Protected: waiter / cashier / staff ──────────────────────────────────
  {
    path: "/waiter",
    name: "waiter-dashboard",
    meta: { requiresAuth: true },
    component: () => import("@/views/waiter/waiterApp.vue"),
  },

  // ── Public: kitchen display ───────────────────────────────────────────────
  {
    path: "/chef",
    name: "chef-menu",
    meta: { requiresAuth: true },
    component: () => import("@/views/kds/KdsApp.vue"),
  },

  // ── Public: customer-facing (token-based, no login required) ─────────────
  {
    path: "/menu/:token",
    name: "customer-menu",
    component: () => import("@/views/customer/customerMenu.vue"),
  },
  {
    path: "/order/:token",
    name: "customer-order",
    component: () => import("@/views/customer/customerOrder.vue"),
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ── Navigation guard ──────────────────────────────────────────────────────
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();

  const token = localStorage.getItem("token");
  if (token && !authStore.user) {
    try {
      await authStore.fetchMe();
    } catch {
      // ✅ if token is invalid, clean up and continue
      localStorage.removeItem("token");
    }
  }

  const isAuthed = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthed) {
    return "/login";
  }

  return true;
});

export default router;
