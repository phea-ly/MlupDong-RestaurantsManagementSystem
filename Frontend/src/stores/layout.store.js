import { defineStore } from "pinia";

const metaByPath = {
  "/home/admin-dashboard": { title: "Dashboard", subtitle: "Restaurant overview" },
  "/home/menu": { title: "Menu", subtitle: "Manage menu items & categories" },
  "/home/staff": { title: "Staff", subtitle: "Manage your team" },
  "/home/table": { title: "Tables", subtitle: "Manage tables & QR codes" },
  "/home/sales-report": { title: "Sales Report", subtitle: "View sales analytics" },
  "/home/user": { title: "Users", subtitle: "Manage accounts" },
  "/home/activity": { title: "Activity Log", subtitle: "View system activity" },
  "/home/settings": { title: "Settings", subtitle: "System configuration" },
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
