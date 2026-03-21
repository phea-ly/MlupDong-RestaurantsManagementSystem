import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { orderApi } from "@/api/order.api";

const AVG_MINUTES_PER_ORDER = 8; // keep in sync with kds.store.js

export const useCartStore = defineStore("cart", () => {
  const items               = ref([]);
  const specialInstructions = ref("");
  const tableId             = ref(null);
  const tableNumber         = ref(null);

  // ── Rehydrate from localStorage ─────────────────────────────────────────
  try {
    const saved = localStorage.getItem("cart_items");
    if (saved) items.value = JSON.parse(saved);
  } catch {}

  try {
    const savedInstr = localStorage.getItem("cart_instructions");
    if (savedInstr) specialInstructions.value = savedInstr;
  } catch {}

  try {
    const tid  = localStorage.getItem("cart_table_id");
    const tnum = localStorage.getItem("cart_table_number");
    if (tid)  tableId.value     = tid;
    if (tnum) tableNumber.value = tnum;
  } catch {}

  // ── Persist on change ────────────────────────────────────────────────────
  watch(items, (v) => {
    localStorage.setItem("cart_items", JSON.stringify(v));
  }, { deep: true });

  watch(specialInstructions, (v) => {
    localStorage.setItem("cart_instructions", v);
  });

  watch(tableId, (v) => {
    if (v) localStorage.setItem("cart_table_id", v);
    else   localStorage.removeItem("cart_table_id");
  });

  watch(tableNumber, (v) => {
    if (v) localStorage.setItem("cart_table_number", v);
    else   localStorage.removeItem("cart_table_number");
  });

  // ── Computed totals ──────────────────────────────────────────────────────
  const cartCount    = computed(() => items.value.reduce((s, i) => s + i.quantity, 0));
  const cartSubtotal = computed(() => items.value.reduce((s, i) => s + (i.price || 0) * i.quantity, 0));
  const TAX_RATE     = 0.10;
  const cartTax      = computed(() => cartSubtotal.value * TAX_RATE);
  const cartTotal    = computed(() => cartSubtotal.value + cartTax.value);

  /**
   * Returns estimated wait in minutes for a new order given the current
   * number of active orders in the kitchen queue.
   */
  function calcEstimatedWait(activeOrderCount) {
    return Math.max(5, activeOrderCount * AVG_MINUTES_PER_ORDER);
  }

  // ── Table ────────────────────────────────────────────────────────────────
  function setTableId(id, number = null) {
    tableId.value = String(id);
    if (number !== null) tableNumber.value = String(number);
  }

  // ── Cart mutations ───────────────────────────────────────────────────────
  function addToCart(product) {
    const existing = items.value.find(
      (i) => i.id === (product.id || product.menu_item_id),
    );
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({
        id:       product.id || product.menu_item_id,
        name:     product.name,
        price:    parseFloat(product.price || 0),
        image:    product.image,
        quantity: 1,
      });
    }
  }

  function removeFromCart(productId) {
    items.value = items.value.filter((i) => i.id !== productId);
  }

  function updateQuantity(productId, quantity) {
    const existing = items.value.find((i) => i.id === productId);
    if (!existing) return;
    if (quantity <= 0) removeFromCart(productId);
    else existing.quantity = quantity;
  }

  function clearCart() {
    items.value               = [];
    specialInstructions.value = "";
    localStorage.removeItem("cart_items");
    localStorage.removeItem("cart_instructions");
    // tableId and tableNumber are kept — they correspond to the physical table
  }

  // ── Place order ──────────────────────────────────────────────────────────
  async function placeOrder(details = {}) {
    if (items.value.length === 0) return { success: false, message: "Cart is empty" };

    const payload = {
      order_type:     details.order_type || "dine_in",
      table_id:       details.table_id   ?? tableId.value ?? 1,
      total_amount:   cartSubtotal.value,
      tax:            cartTax.value,
      final_amount:   cartTotal.value,
      order_status:   "new",
      payment_status: "pending",
      items: items.value.map((item) => ({
        menu_item_id: item.id,
        quantity:     item.quantity,
        unit_price:   item.price,
        note:         specialInstructions.value,
      })),
    };

    try {
      const response = await orderApi.create(payload);
      clearCart();
      return { success: true, order: response.data };
    } catch (e) {
      console.error("Order placement failed", e);
      return {
        success: false,
        message: e.response?.data?.message || "Failed to place order",
      };
    }
  }

  return {
    items,
    specialInstructions,
    tableId,
    tableNumber,
    cartCount,
    cartSubtotal,
    cartTax,
    cartTotal,
    setTableId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder,
    calcEstimatedWait,
  };
});