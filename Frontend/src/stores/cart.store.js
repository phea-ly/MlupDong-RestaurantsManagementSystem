import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { echo } from "@/echo";
import { customerOrderApi } from "@/api/order.api";
import {
  getOrderStatusColor,
  getOrderStatusLabel,
  isActiveStatus,
  isHistoryStatus,
  normalizeOrder,
  normalizeOrderStatus,
  sortOrdersByNewest,
} from "@/utils/orderStatus";

const STORAGE_KEY = "mlupdong.customer.order-session";

export const useCartStore = defineStore("cart", () => {
  const items = ref([]);
  const tableId = ref(null);
  const tableNumber = ref(null);
  const specialInstructions = ref("");
  const orders = ref([]);

  let tableChannel = null;

  const lastOrder = computed(() => orders.value[0] ?? null);
  const activeOrders = computed(() =>
    [...orders.value]
      .filter((order) => isActiveStatus(order.order_status))
      .sort(sortOrdersByNewest),
  );
  const orderHistory = computed(() =>
    [...orders.value]
      .filter((order) => isHistoryStatus(order.order_status))
      .sort(sortOrdersByNewest),
  );

  const cartCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );
  const cartSubtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
  );
  const cartTax = computed(() => Math.round(cartSubtotal.value * 0.1 * 100) / 100);
  const cartTotal = computed(
    () => Math.round((cartSubtotal.value + cartTax.value) * 100) / 100,
  );

  function persistSession() {
    if (typeof window === "undefined") return;

    const payload = {
      items: items.value,
      orders: orders.value,
      specialInstructions: specialInstructions.value,
      tableId: tableId.value,
      tableNumber: tableNumber.value,
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function hydrateSession() {
    if (typeof window === "undefined") return;

    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const session = JSON.parse(raw);

      items.value = Array.isArray(session.items) ? session.items : [];
      orders.value = Array.isArray(session.orders)
        ? session.orders.map(normalizeOrder).sort(sortOrdersByNewest)
        : [];
      specialInstructions.value = session.specialInstructions ?? "";
      tableId.value = session.tableId ?? null;
      tableNumber.value = session.tableNumber ?? null;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  function upsertOrder(rawOrder) {
    const order = normalizeOrder(rawOrder);
    const index = orders.value.findIndex((entry) => entry.id === order.id);

    if (index === -1) {
      orders.value.unshift(order);
    } else {
      orders.value[index] = {
        ...orders.value[index],
        ...order,
      };
    }

    orders.value = [...orders.value].sort(sortOrdersByNewest);
  }

  function mergeOrders(rawOrders = []) {
    rawOrders.forEach((order) => upsertOrder(order));
  }

  function setTableId(id, number) {
    tableId.value = id;
    tableNumber.value = number;
    ensureTableChannel();
  }

  function ensureTableChannel() {
    if (!tableNumber.value) return;
    subscribeTableChannel(tableNumber.value);
  }

  function addToCart(item) {
    const id = item.id ?? item.rawId;
    const existingItem = items.value.find((entry) => entry.id === id);

    if (existingItem) {
      existingItem.quantity += 1;
      return;
    }

    items.value.push({
      id,
      menu_item_id: id,
      name: item.name ?? item.item_name,
      price: parseFloat(item.price),
      image: item.image ?? null,
      quantity: 1,
      note: "",
    });
  }

  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const item = items.value.find((entry) => entry.id === id);
    if (item) {
      item.quantity = quantity;
    }
  }

  function updateItemNote(id, note) {
    const item = items.value.find((entry) => entry.id === id);
    if (item) {
      item.note = note;
    }
  }

  function removeFromCart(id) {
    items.value = items.value.filter((item) => item.id !== id);
  }

  function clearCart() {
    items.value = [];
    specialInstructions.value = "";
  }

  function calcEstimatedWait(activeOrdersAhead) {
    return Math.max(5, 5 + activeOrdersAhead * 5);
  }

  async function placeOrder({ order_type, table_id } = {}) {
    if (!items.value.length) {
      return { success: false, message: "Cart is empty." };
    }

    const payload = {
      table_id: table_id ?? tableId.value,
      order_type: order_type ?? "dine_in",
      special_instructions: specialInstructions.value || null,
      items: items.value.map((item) => ({
        menu_item_id: item.menu_item_id ?? item.id,
        quantity: item.quantity,
        note: item.note || null,
      })),
    };

    try {
      const { data } = await customerOrderApi.placeOrder(payload);

      upsertOrder({
        ...data,
        order_status: data.order_status ?? "new",
        created_at: data.created_at ?? new Date().toISOString(),
        table_id: tableId.value,
        table_name: tableNumber.value ? `Table ${tableNumber.value}` : null,
      });

      clearCart();
      return { success: true, data };
    } catch (err) {
      const message =
        err.response?.data?.message ?? err.message ?? "Order failed.";
      return { success: false, message };
    }
  }

  function subscribeTableChannel(number) {
    if (tableChannel === number) return;

    if (tableChannel !== null) {
      echo.leaveChannel(`table.${tableChannel}`);
    }

    tableChannel = number;

    echo.channel(`table.${number}`).listen(".order.status.updated", (payload) => {
      const orderId = payload.order_id ?? payload.id;
      const nextStatus = normalizeOrderStatus(payload.order_status ?? payload.status);
      const existingOrder = orders.value.find((order) => order.id === orderId);

      upsertOrder({
        ...existingOrder,
        ...payload,
        id: orderId,
        order_id: orderId,
        order_status: nextStatus,
        confirmed_at:
          ["confirmed", "preparing"].includes(nextStatus) &&
          !existingOrder?.confirmed_at
            ? new Date().toISOString()
            : existingOrder?.confirmed_at ?? payload.confirmed_at ?? null,
      });
    });
  }

  function leaveTableChannel() {
    if (tableChannel === null) return;
    echo.leaveChannel(`table.${tableChannel}`);
    tableChannel = null;
  }

  function getStatusLabel(status) {
    return getOrderStatusLabel(status);
  }

  function getStatusColor(status) {
    return getOrderStatusColor(status);
  }

  hydrateSession();

  watch(
    [items, tableId, tableNumber, specialInstructions, orders],
    () => {
      persistSession();
    },
    { deep: true },
  );

  return {
    items,
    tableId,
    tableNumber,
    specialInstructions,
    orders,
    lastOrder,
    activeOrders,
    orderHistory,
    cartCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    setTableId,
    ensureTableChannel,
    mergeOrders,
    addToCart,
    updateQuantity,
    updateItemNote,
    removeFromCart,
    clearCart,
    calcEstimatedWait,
    placeOrder,
    getStatusLabel,
    getStatusColor,
    leaveTableChannel,
  };
});
