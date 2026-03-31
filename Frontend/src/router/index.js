// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { canAccessPath } from "@/utils/auth";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },

  // ── Guest only ─────────────────────────────────────────────────────────────
  {
    path: "/login",
    name: "login",
    meta: { guestOnly: true },
    component: () => import("@/views/Login.vue"),
  },

  // ── Admin dashboard (/home/**) — admin only ────────────────────────────────
  // The canAccessPath() guard enforces this. Any other role trying to visit
  // /home/* is redirected to their own dashboard.
  {
    path: "/home",
    meta: { requiresAuth: true, section: "home" },
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
        path: "roles",
        name: "home-roles",
        component: () => import("@/views/roles/roles.vue"),
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
        path: "activity-log",
        name: "home-activity-log",
        component: () => import("@/views/activity/Activity.vue"),
      },
    ],
  },

  // ── Waiter / cashier / staff / admin ──────────────────────────────────────
  {
    path: "/waiter",
    name: "waiter-dashboard",
    meta: { requiresAuth: true, section: "waiter" },
    component: () => import("@/views/waiter/waiterApp.vue"),
  },

  // ── Chef / KDS — chef, staff, admin ───────────────────────────────────────
  {
    path: "/chef",
    name: "chef-menu",
    meta: { requiresAuth: true, section: "chef" },
    component: () => import("@/views/kds/KdsApp.vue"),
  },

  // ── Public: customer QR menu (no login required) ──────────────────────────
  {
    path: "/menu/:token",
    name: "customer-menu",
    meta: { public: true },
    component: () => import("@/views/customer/customerMenu.vue"),
  },
  {
    path: "/order/:token",
    name: "customer-order",
    meta: { public: true },
    component: () => import("@/views/customer/customerOrder.vue"),
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ── Navigation guard ──────────────────────────────────────────────────────────

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (to.meta.public) return true;

  await auth.ensureAuthChecked();

  const isAuthed = auth.isAuthenticated;

  console.log(
    "Guard:",
    to.path,
    "| isAuthed:",
    isAuthed,
    "| role:",
    auth.role,
    "| dashboard:",
    auth.dashboardPath,
  );

  if (to.meta.guestOnly) {
    if (isAuthed) return auth.dashboardPath;
    return true;
  }

  if (to.meta.requiresAuth) {
    if (!isAuthed) {
      return { name: "login", query: { redirect: to.fullPath } };
    }

    const section = to.meta.section;
    console.log(
      "Section:",
      section,
      "| canAccess:",
      canAccessPath(auth.role, `/${section}`),
    );

    if (section && !canAccessPath(auth.role, `/${section}`)) {
      return auth.dashboardPath;
    }
  }

  return true;
});

export default router;
