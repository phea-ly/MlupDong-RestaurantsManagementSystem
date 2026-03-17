import { defineStore } from "pinia";
import { ref } from "vue";

export const useSalesReportStore = defineStore("salesReport", () => {
  const activeTab = ref("today");
  const searchQuery = ref("");

  const tabs = ref([
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "custom", label: "Custom" },
  ]);

  const summaryStats = ref([
    {
      label: "Total Revenue",
      value: "$12,840.00",
      trend: "+12.5%",
      sub: "vs yesterday",
      up: true,
      icon: "mdi-cash-multiple",
      color: "success",
    },
    {
      label: "Total Orders",
      value: "342",
      trend: "+5.2%",
      sub: "vs yesterday",
      up: true,
      icon: "mdi-receipt-text-outline",
      color: "blue",
    },
    {
      label: "Avg. Order",
      value: "$37.54",
      trend: "+1.8%",
      sub: "vs yesterday",
      up: true,
      icon: "mdi-clipboard-list-outline",
      color: "orange",
    },
    {
      label: "Net Profit",
      value: "$8,210.00",
      trend: "+10.4%",
      sub: "vs yesterday",
      up: true,
      icon: "mdi-trending-up",
      color: "purple",
    },
  ]);

  const topCategories = ref([
    { name: "Main Course", pct: 45, color: "success" },
    { name: "Drinks", pct: 32, color: "blue" },
    { name: "Desserts", pct: 18, color: "orange" },
    { name: "Appetizers", pct: 5, color: "purple" },
  ]);

  const salesHeaders = ref([
    { title: "Date", key: "date" },
    { title: "Order ID", key: "id" },
    { title: "Items", key: "items" },
    { title: "Payment", key: "payment" },
    { title: "Amount", key: "amount", align: "end" },
  ]);

  const salesLog = ref([
    {
      date: "Oct 24, 14:22",
      id: "ORD-9421",
      items: "Beef Steak, Red Wine, Caesar Salad",
      payment: "Visa **** 4421",
      payIcon: "mdi-credit-card-outline",
      amount: "$84.50",
    },
    {
      date: "Oct 24, 13:58",
      id: "ORD-9420",
      items: "Chicken Pasta, Iced Tea",
      payment: "Cash",
      payIcon: "mdi-cash",
      amount: "$32.00",
    },
    {
      date: "Oct 24, 13:45",
      id: "ORD-9419",
      items: "Veggie Pizza, Garlic Bread, Coke x2",
      payment: "Apple Pay",
      payIcon: "mdi-cellphone",
      amount: "$45.20",
    },
    {
      date: "Oct 24, 13:30",
      id: "ORD-9418",
      items: "Cheeseburger Deluxe, Fries, Shake",
      payment: "Visa **** 1022",
      payIcon: "mdi-credit-card-outline",
      amount: "$24.90",
    },
  ]);

  const chartPoints = ref("50,90 120,70 200,75 290,50 380,35 460,25 550,15");
  const weekDays = ref(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);

  return {
    activeTab,
    searchQuery,
    tabs,
    summaryStats,
    topCategories,
    salesHeaders,
    salesLog,
    chartPoints,
    weekDays,
  };
});
