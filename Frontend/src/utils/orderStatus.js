export const ORDER_STATUS_META = {
  new: {
    label: "Pending",
    shortLabel: "Pending",
    customerText: "Order received. Waiting for kitchen confirmation.",
    color: "blue",
  },
  received: {
    label: "Received",
    shortLabel: "Received",
    customerText: "Kitchen received your order.",
    color: "indigo",
  },
  confirmed: {
    label: "Confirmed",
    shortLabel: "Confirmed",
    customerText: "Chef confirmed the order and preparation is about to begin.",
    color: "orange",
  },
  preparing: {
    label: "Preparing",
    shortLabel: "Preparing",
    customerText: "Your food is being prepared now.",
    color: "teal",
  },
  ready: {
    label: "Ready",
    shortLabel: "Ready",
    customerText: "Your order is ready for pickup or delivery to the table.",
    color: "success",
  },
  completed: {
    label: "Delivered",
    shortLabel: "Done",
    customerText: "Order delivered. Enjoy your meal.",
    color: "grey",
  },
  served: {
    label: "Delivered",
    shortLabel: "Done",
    customerText: "Order delivered. Enjoy your meal.",
    color: "grey",
  },
  cancelled: {
    label: "Cancelled",
    shortLabel: "Cancelled",
    customerText: "This order was cancelled.",
    color: "error",
  },
};

export const PENDING_ORDER_STATUSES = ["new", "received", "confirmed"];
export const ACTIVE_ORDER_STATUSES = [
  ...PENDING_ORDER_STATUSES,
  "preparing",
  "ready",
];
export const HISTORY_ORDER_STATUSES = ["completed", "served", "cancelled"];
export const DELIVERABLE_ORDER_STATUSES = ["ready", "completed", "served"];

export function normalizeOrderId(order) {
  return order?.id ?? order?.order_id ?? null;
}

export function normalizeOrderStatus(status) {
  if (!status) return "new";
  return String(status).toLowerCase();
}

export function normalizeOrder(order = {}) {
  return {
    ...order,
    id: normalizeOrderId(order),
    order_id: order.order_id ?? normalizeOrderId(order),
    order_status: normalizeOrderStatus(order.order_status ?? order.status),
    table_name:
      order.table_name ??
      order.table_number ??
      (order.table_id ? `Table ${order.table_id}` : null),
  };
}

export function sortOrdersByNewest(a, b) {
  return (
    new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
    new Date(a.updated_at ?? a.created_at ?? 0).getTime()
  );
}

export function getOrderStatusMeta(status) {
  return ORDER_STATUS_META[normalizeOrderStatus(status)] ?? ORDER_STATUS_META.new;
}

export function getOrderStatusLabel(status) {
  return getOrderStatusMeta(status).label;
}

export function getOrderStatusColor(status) {
  return getOrderStatusMeta(status).color;
}

export function getCustomerStatusText(status) {
  return getOrderStatusMeta(status).customerText;
}

export function getCustomerProgressStep(status) {
  const normalized = normalizeOrderStatus(status);

  if (["ready", "completed", "served"].includes(normalized)) return 4;
  if (normalized === "preparing") return 3;
  if (normalized === "confirmed") return 2;
  if (["new", "received"].includes(normalized)) return 1;
  return 0;
}

export function isHistoryStatus(status) {
  return HISTORY_ORDER_STATUSES.includes(normalizeOrderStatus(status));
}

export function isActiveStatus(status) {
  return ACTIVE_ORDER_STATUSES.includes(normalizeOrderStatus(status));
}
