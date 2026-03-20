<script>
import { defineStore } from "pinia";

const metaByPath = {
  "/home/admin-dashboard": { title: "page.dashboard.title", subtitle: "page.dashboard.subtitle" },
  "/home/menu":            { title: "page.menu.title",      subtitle: "page.menu.subtitle" },
  "/home/staff":           { title: "page.staff.title",     subtitle: "page.staff.subtitle" },
  "/home/table":           { title: "page.table.title",     subtitle: "page.table.subtitle" },
  "/home/sales-report":    { title: "page.sales_report.title", subtitle: "page.sales_report.subtitle" },
  "/home/user":            { title: "page.user.title",      subtitle: "page.user.subtitle" },
  "/home/activity":        { title: "page.activity.title",  subtitle: "page.activity.subtitle" },
  "/home/settings":        { title: "page.settings.title",  subtitle: "page.settings.subtitle" },
};

const defaultMeta = { title: "page.dashboard.title", subtitle: "page.dashboard.subtitle" };

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
import { useI18n } from "vue-i18n";

const route = useRoute();
const layoutStore = useLayoutStore();
const { t } = useI18n();

const meta = computed(() => {
  const m = layoutStore.getMeta(route.path);
  return {
    title: t(m.title),
    subtitle: t(m.subtitle)
  };
});
</script>

<template>
  <AppLayout :title="meta.title" :subtitle="meta.subtitle">
    <router-view />
  </AppLayout>
</template>