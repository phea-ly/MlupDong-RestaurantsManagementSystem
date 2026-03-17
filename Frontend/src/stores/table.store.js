import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTableStore = defineStore("table", () => {
  const activeFilter = ref("all");
  const showCreateDialog = ref(false);
  const showDeleteDialog = ref(false);
  const showEditDialog = ref(false);
  const newTableName = ref("");
  const deletingId = ref(null);
  const editingTable = ref(null);
  const editForm = ref({ name: "", status: "available" });

  const tables = ref([
    { id: 1, name: "Table 01", status: "available" },
    { id: 2, name: "Table 02", status: "occupied" },
    { id: 3, name: "Table 03", status: "available" },
    { id: 4, name: "Table 04", status: "available" },
    { id: 5, name: "Table 05", status: "occupied" },
  ]);

  const filteredTables = computed(() =>
    activeFilter.value === "all"
      ? tables.value
      : tables.value.filter((t) => t.status === activeFilter.value),
  );
  const allCount = computed(() => tables.value.length);
  const availableCount = computed(() => tables.value.filter((t) => t.status === "available").length);
  const occupiedCount = computed(() => tables.value.filter((t) => t.status === "occupied").length);

  function openCreate() {
    newTableName.value = "";
    showCreateDialog.value = true;
  }

  function createTable() {
    if (!newTableName.value.trim()) return;
    tables.value.push({
      id: Date.now(),
      name: newTableName.value.trim(),
      status: "available",
    });
    showCreateDialog.value = false;
  }

  function openEdit(table) {
    editingTable.value = table;
    editForm.value = { name: table.name, status: table.status };
    showEditDialog.value = true;
  }

  function saveEdit() {
    if (!editingTable.value || !editForm.value.name.trim()) return;
    editingTable.value.name = editForm.value.name.trim();
    editingTable.value.status = editForm.value.status;
    showEditDialog.value = false;
  }

  function confirmDelete(id) {
    deletingId.value = id;
    showDeleteDialog.value = true;
  }

  function handleDelete() {
    tables.value = tables.value.filter((t) => t.id !== deletingId.value);
    showDeleteDialog.value = false;
    deletingId.value = null;
  }

  function downloadQR(table) {
    const svg = generateQRSvg(table.name);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${table.name.replace(/\\s+/g, "-")}-QR.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportAllQR() {
    tables.value.forEach((t) => downloadQR(t));
  }

  function generateQRSvg(label = "") {
    return `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='110' viewBox='0 0 100 110'>
    <rect width='100' height='100' fill='#f7faf9'/>
    <rect x='10' y='10' width='28' height='28' rx='2' fill='none' stroke='#122039' stroke-width='3'/>
    <rect x='16' y='16' width='16' height='16' rx='1' fill='#122039'/>
    <rect x='62' y='10' width='28' height='28' rx='2' fill='none' stroke='#122039' stroke-width='3'/>
    <rect x='68' y='16' width='16' height='16' rx='1' fill='#122039'/>
    <rect x='10' y='62' width='28' height='28' rx='2' fill='none' stroke='#122039' stroke-width='3'/>
    <rect x='16' y='68' width='16' height='16' rx='1' fill='#122039'/>
    <rect x='62' y='62' width='8' height='8' fill='#122039'/>
    <rect x='74' y='62' width='8' height='8' fill='#122039'/>
    <rect x='62' y='74' width='8' height='8' fill='#122039'/>
    <rect x='74' y='74' width='8' height='8' fill='#122039'/>
    <rect x='86' y='62' width='4' height='4' fill='#122039'/>
    <rect x='86' y='74' width='4' height='4' fill='#122039'/>
    <rect x='44' y='10' width='6' height='6' fill='#122039'/>
    <rect x='44' y='22' width='6' height='6' fill='#122039'/>
    <rect x='44' y='44' width='6' height='6' fill='#122039'/>
    <rect x='44' y='56' width='6' height='6' fill='#122039'/>
    <text x='50' y='108' font-size='9' font-family='sans-serif' font-weight='700' fill='#9aabbd' text-anchor='middle'>${label}</text>
  </svg>`;
  }

  return {
    activeFilter,
    showCreateDialog,
    showDeleteDialog,
    showEditDialog,
    newTableName,
    deletingId,
    editingTable,
    editForm,
    tables,
    filteredTables,
    allCount,
    availableCount,
    occupiedCount,
    openCreate,
    createTable,
    openEdit,
    saveEdit,
    confirmDelete,
    handleDelete,
    downloadQR,
    exportAllQR,
    generateQRSvg,
  };
});
