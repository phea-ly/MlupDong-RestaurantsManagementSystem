import { defineStore } from "pinia";
import { ref } from "vue";

export const useDashboardStore = defineStore("dashboard", () => {
  const activeRange = ref("7days");

  const stats = ref([
    {
      label: "TOTAL REVENUE",
      value: "$420,000",
      sub: "Year to date performance",
      trend: "+15.8%",
      up: true,
      color: "var(--app-primary-600)",
      icon: "mdi-chart-line",
      route: "/home/sales-report",
    },
    {
      label: "ORDERS TODAY",
      value: "128",
      sub: "18 orders since 6:00 AM",
      trend: "+8.1%",
      up: true,
      color: "#3b82f6",
      icon: "mdi-receipt-text-outline",
      route: "/home/sales-report",
    },
    {
      label: "AVG TICKET",
      value: "$32.40",
      sub: "Last 7 days average",
      trend: "-1.2%",
      up: false,
      color: "#f59e0b",
      icon: "mdi-currency-usd",
      route: "/home/sales-report",
    },
    {
      label: "NEW GUESTS",
      value: "46",
      sub: "First-time visitors",
      trend: "+5.6%",
      up: true,
      color: "#a855f7",
      icon: "mdi-account-plus-outline",
      route: "/home/user",
    },
  ]);

  const quickActions = ref([
    { label: "Add Item", icon: "mdi-plus", color: "var(--app-primary)", route: "/home/menu" },
    { label: "New Order", icon: "mdi-silverware-fork-knife", color: "#3b82f6", route: "/home/table" },
    { label: "View Reports", icon: "mdi-chart-box-outline", color: "#f59e0b", route: "/home/sales-report" },
  ]);

  const bestSelling = ref([
    { name: "Signature Fish Amok", sold: 452, pct: 100, color: "success" },
    { name: "Iced Coconut Coffee", sold: 310, pct: 69, color: "blue" },
    { name: "Kampot Pepper Squid", sold: 285, pct: 63, color: "orange" },
    { name: "Mango Sticky Rice", sold: 215, pct: 48, color: "pink" },
    { name: "Tamarind Shaked Tea", sold: 198, pct: 44, color: "teal" },
  ]);

  const peakHours = ref([
    { label: "8 AM", height: 30 },
    { label: "10 AM", height: 45 },
    { label: "12 PM", height: 85 },
    { label: "2 PM", height: 55 },
    { label: "4 PM", height: 40 },
    { label: "6 PM", height: 95 },
    { label: "8 PM", height: 75 },
  ]);

  const orderSummary = ref([
    { label: "Total Orders", value: "2,480", meta: "+12% vs last month" },
    { label: "Refund Rate", value: "0.7%", meta: "-0.3% trend" },
    { label: "Repeat Guests", value: "38%", meta: "+4% last 30 days" },
  ]);

  const orderHeaders = ref([
    { title: "Order ID", key: "id" },
    { title: "Customer", key: "customer" },
    { title: "Items", key: "items" },
    { title: "Status", key: "status" },
    { title: "Amount", key: "amount", align: "end" },
  ]);

  const recentOrders = ref([
    {
      id: "MD-9284",
      initials: "RC",
      color: "success",
      customer: "Rithy Chann",
      items: "Fish Amok x2, Cambodia Beer x4",
      status: "COMPLETED",
      statusColor: "success",
      amount: "$124.50",
    },
    {
      id: "MD-9283",
      initials: "SM",
      color: "orange",
      customer: "Sokha Meas",
      items: "Beef Lok Lak x3, Fresh Juices x3",
      status: "PREPARING",
      statusColor: "warning",
      amount: "$86.20",
    },
    {
      id: "MD-9281",
      initials: "JP",
      color: "blue",
      customer: "John Pierce",
      items: "Signature Seafood Platter x1",
      status: "COMPLETED",
      statusColor: "success",
      amount: "$55.00",
    },
  ]);

  const chartPoints = ref("50,80 150,60 250,65 350,45 450,30 550,20 650,25");
  const weekDays = ref(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

  function goTo(router, route) {
    if (!route) return;
    router.push(route);
  }

  return {
    activeRange,
    stats,
    quickActions,
    bestSelling,
    peakHours,
    orderSummary,
    orderHeaders,
    recentOrders,
    chartPoints,
    weekDays,
    goTo,
  };
});
