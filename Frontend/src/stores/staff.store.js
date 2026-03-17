import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api";

export const useStaffStore = defineStore("staff", () => {
  const search = ref("");
  const showAddDialog = ref(false);
  const showEditDialog = ref(false);
  const showDeleteDialog = ref(false);
  const deletingId = ref(null);
  const editTarget = ref(null);
  const loading = ref(false);
  const saving = ref(false);
  const deleting = ref(false);
  const snackbar = ref({ show: false, message: "", color: "success" });

  const staffList = ref([]);
  const userOptions = ref([]);

  const newStaff = ref({ user_id: null, position: "", status: "Active", hire_date: "" });
  const editForm = ref({ user_id: null, position: "", status: "Active", hire_date: "" });

  const roleColors = { CHEF: "success", ADMIN: "deep-purple", WAITER: "teal", MANAGER: "blue" };

  const headers = ref([
    { title: "Staff Member", key: "name", sortable: true },
    { title: "Role", key: "role", sortable: true },
    { title: "Date Joined", key: "dateJoined", sortable: false },
    { title: "Status", key: "status", sortable: true },
    { title: "Actions", key: "actions", sortable: false, align: "end" },
  ]);

  const activeCount = computed(() => staffList.value.filter((s) => s.status === "Active").length);
  const kitchenCount = computed(() => staffList.value.filter((s) => s.role === "CHEF").length);
  const serviceCount = computed(() => staffList.value.filter((s) => s.role === "WAITER").length);

  const statusOptions = ["Active", "Inactive"];

  function notify(message, color = "success") {
    snackbar.value = { show: true, message, color };
  }

  function mapUserOption(u) {
    const firstName = u.first_name ?? "";
    const lastName = u.last_name ?? "";
    const name = `${firstName} ${lastName}`.trim() || u.name || "User";
    return { id: u.id, name, email: u.email ?? "", role: u.role ?? u.role_name ?? "" };
  }

  function mapStaff(s) {
    const u = s.user ?? {};
    const firstName = u.first_name ?? "";
    const lastName = u.last_name ?? "";
    const name = `${firstName} ${lastName}`.trim() || u.name || "-";
    const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "??";
    const role = u.role ?? u.role_name ?? "STAFF";
    return {
      id: s.staff_id,
      user_id: s.user_id,
      position: s.position ?? "",
      hire_date: s.hire_date ?? "",
      name,
      email: u.email ?? "",
      role,
      dateJoined: s.hire_date
        ? new Date(s.hire_date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : s.created_at
          ? new Date(s.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })
          : "-",
      status: s.is_active ? "Active" : "Inactive",
      initials,
      color: roleColors[role] || "success",
    };
  }

  async function fetchUsers() {
    try {
      const { data } = await api.get("/users");
      const list = Array.isArray(data) ? data : data.data ?? [];
      userOptions.value = list.map(mapUserOption);
    } catch {
      notify("Failed to load users.", "error");
    }
  }

  async function fetchStaff() {
    loading.value = true;
    try {
      const { data } = await api.get("/staffs");
      const list = Array.isArray(data) ? data : data.data ?? [];
      staffList.value = list.map(mapStaff);
    } catch {
      notify("Failed to load staff.", "error");
    } finally {
      loading.value = false;
    }
  }

  function openAddDialog() {
    newStaff.value = { user_id: null, position: "", status: "Active", hire_date: "" };
    showAddDialog.value = true;
  }

  async function addStaff() {
    if (!newStaff.value.user_id || saving.value) return;
    saving.value = true;
    try {
      const payload = {
        user_id: newStaff.value.user_id,
        position: newStaff.value.position || null,
        hire_date: newStaff.value.hire_date || null,
        is_active: newStaff.value.status === "Active",
      };
      const { data } = await api.post("/staffs", payload);
      staffList.value.unshift(mapStaff(data));
      showAddDialog.value = false;
      notify("Staff created successfully.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to create staff.", "error");
    } finally {
      saving.value = false;
    }
  }

  function openEditDialog(member) {
    editTarget.value = { ...member };
    editForm.value = {
      user_id: member.user_id,
      position: member.position ?? "",
      status: member.status,
      hire_date: member.hire_date ?? "",
    };
    showEditDialog.value = true;
  }

  async function saveEdit() {
    if (!editTarget.value || saving.value) return;
    saving.value = true;
    try {
      const payload = {
        user_id: editForm.value.user_id,
        position: editForm.value.position || null,
        hire_date: editForm.value.hire_date || null,
        is_active: editForm.value.status === "Active",
      };
      const { data } = await api.put(`/staffs/${editTarget.value.id}`, payload);
      const idx = staffList.value.findIndex((s) => s.id === editTarget.value.id);
      const mapped = mapStaff(data);
      if (idx !== -1) staffList.value[idx] = mapped;
      showEditDialog.value = false;
      notify("Staff updated successfully.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to update staff.", "error");
    } finally {
      saving.value = false;
    }
  }

  function confirmDelete(id) {
    deletingId.value = id;
    showDeleteDialog.value = true;
  }

  async function handleDelete() {
    if (!deletingId.value || deleting.value) return;
    deleting.value = true;
    try {
      await api.delete(`/staffs/${deletingId.value}`);
      staffList.value = staffList.value.filter((s) => s.id !== deletingId.value);
      showDeleteDialog.value = false;
      deletingId.value = null;
      notify("Staff deleted.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to delete staff.", "error");
    } finally {
      deleting.value = false;
    }
  }

  async function init() {
    await Promise.all([fetchUsers(), fetchStaff()]);
  }

  return {
    search,
    showAddDialog,
    showEditDialog,
    showDeleteDialog,
    deletingId,
    editTarget,
    loading,
    saving,
    deleting,
    snackbar,
    staffList,
    userOptions,
    newStaff,
    editForm,
    roleColors,
    headers,
    activeCount,
    kitchenCount,
    serviceCount,
    statusOptions,
    init,
    openAddDialog,
    addStaff,
    openEditDialog,
    saveEdit,
    confirmDelete,
    handleDelete,
  };
});
