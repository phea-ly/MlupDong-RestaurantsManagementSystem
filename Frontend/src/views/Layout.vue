<script>
import { defineStore } from "pinia";

const metaByPath = {
  "/home/admin-dashboard": { title: "Dashboard", subtitle: "Restaurant overview" },
  "/home/menu": { title: "Menu", subtitle: "Manage menu items & categories" },
  "/home/staff": { title: "Staff", subtitle: "Manage your team" },
  "/home/table": { title: "Tables", subtitle: "Manage tables & QR codes" },
  "/home/sales-report": { title: "Sales Report", subtitle: "View sales analytics" },
  "/home/user": { title: "Users", subtitle: "Manage accounts" },
  "/home/roles": { title: "Roles", subtitle: "Manage user roles" },
  "/home/activity": { title: "Activity Log", subtitle: "View system activity" },
};

const defaultMeta = { title: "Dashboard", subtitle: "Restaurant overview" };

export const useLayoutStore = defineStore("layout", () => {
  function getMeta(path) {
    return metaByPath[path] ?? defaultMeta;
  }

  return {
    getMeta,
  };
});
</script>

<script setup>
import AppLayout from "@/components/layout/AppLayout.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const layoutStore = useLayoutStore();

const meta = computed(() => layoutStore.getMeta(route.path));
</script>

<template>
  <AppLayout :title="meta.title" :subtitle="meta.subtitle">
    <router-view />
  </AppLayout>
</template>
