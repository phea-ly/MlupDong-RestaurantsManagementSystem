import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/api/api";

export const useUserStore = defineStore("user", () => {
  const search = ref("");
  const filterRole = ref("all");
  const filterRestaurant = ref("all");
  const showAddDialog = ref(false);
  const showEditDialog = ref(false);
  const showDeleteDialog = ref(false);
  const showProfileDialog = ref(false);
  const deletingId = ref(null);
  const editTarget = ref(null);
  const profileTarget = ref(null);
  const users = ref([]);
  const loading = ref(false);
  const saving = ref(false);
  const deleting = ref(false);
  const profileSaving = ref(false);
  const snackbar = ref({ show: false, message: "", color: "success" });

  const modal = ref({
    form: { firstName: "", lastName: "", email: "", restaurant: "Downtown Bistro", role: "SERVER" },
  });

  const avatarColors = ["#22c55e", "#6366f1", "#f97316", "#ec4899", "#06b6d4", "#84cc16", "#f43f5e", "#a855f7"];
  const restaurantOptions = ["All Locations", "Downtown Bistro", "Uptown Grill", "Riverside Cafe", "Midtown Kitchen"];
  const roleOptions = ["All Roles", "ADMINISTRATOR", "MANAGER", "CHEF", "SERVER", "HOST"];

  const roleConfig = {
    ADMINISTRATOR: { color: "var(--app-primary)", bg: "#e6fff5", text: "#063824" },
    MANAGER: { color: "#3b82f6", bg: "#eff6ff", text: "#1e40af" },
    CHEF: { color: "#f97316", bg: "#fff7ed", text: "#9a3412" },
    SERVER: { color: "var(--app-primary)", bg: "#f0fdfa", text: "#134e4a" },
    HOST: { color: "#a855f7", bg: "#faf5ff", text: "#6b21a8" },
  };

  function notify(message, color = "success") {
    snackbar.value = { show: true, message, color };
  }

  function resolveAvatar(url) {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = (import.meta.env.VITE_API_URL ?? "http://localhost:8000")
      .replace(/^\/api\/\?$/, "")
      .replace(/^\+/, "");
    return `${base}/${url}`;
  }

  function mapUser(u, index = 0) {
    const firstName = u.first_name ?? "";
    const lastName = u.last_name ?? "";
    const fullName = `${firstName} ${lastName}`.trim() || u.name || "-";
    const initials = ((firstName[0] ?? "") + (lastName[0] ?? "")).toUpperCase() || "??";

    return {
      id: `#USR-${String(u.id).padStart(4, "0")}`,
      rawId: u.id,
      name: fullName,
      initials,
      avatarColor: avatarColors[index % avatarColors.length],
      avatar: resolveAvatar(u.avatar_url ?? u.avatar ?? null),
      email: u.email ?? "",
      restaurant: u.restaurant ?? "",
      role: u.role ?? "SERVER",
      active: u.is_active ?? true,
      created: u.created_at
        ? new Date(u.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "-",
    };
  }

  const stats = computed(() => ({
    total: users.value.length,
    active: users.value.filter((u) => u.active).length,
    inactive: users.value.filter((u) => !u.active).length,
  }));

  const filteredUsers = computed(() =>
    users.value.filter((u) => {
      const matchRest =
        ["All Locations", "all"].includes(filterRestaurant.value) || u.restaurant === filterRestaurant.value;
      const matchRole = ["All Roles", "all"].includes(filterRole.value) || u.role === filterRole.value;
      const q = search.value.trim().toLowerCase();
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchRest && matchRole && matchSearch;
    }),
  );

  async function fetchUsers() {
    loading.value = true;
    try {
      const { data } = await api.get("/users");
      const list = Array.isArray(data) ? data : data.data ?? [];
      users.value = list.map(mapUser);
    } catch (err) {
      notify("Failed to load users.", "error");
    } finally {
      loading.value = false;
    }
  }

  function openAdd() {
    modal.value.form = {
      firstName: "",
      lastName: "",
      email: "",
      restaurant: "Downtown Bistro",
      role: "SERVER",
    };
    showAddDialog.value = true;
  }

  async function saveUser() {
    saving.value = true;
    try {
      const f = modal.value.form;
      const { data } = await api.post("/users", {
        first_name: f.firstName,
        last_name: f.lastName,
        email: f.email,
        restaurant: f.restaurant,
        role: f.role,
      });
      users.value.push(mapUser(data, users.value.length));
      showAddDialog.value = false;
      notify("User created successfully.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to create user.", "error");
    } finally {
      saving.value = false;
    }
  }

  function openEdit(user) {
    editTarget.value = user;
    const [fn, ...ln] = user.name.split(" ");
    modal.value.form = {
      firstName: fn,
      lastName: ln.join(" "),
      email: user.email,
      restaurant: user.restaurant,
      role: user.role,
    };
    showEditDialog.value = true;
  }

  async function saveEdit() {
    saving.value = true;
    try {
      const f = modal.value.form;
      const { data } = await api.put(`/users/${editTarget.value.rawId}`, {
        first_name: f.firstName,
        last_name: f.lastName,
        email: f.email,
        restaurant: f.restaurant,
        role: f.role,
      });
      const updated = mapUser(data, users.value.findIndex((u) => u.rawId === editTarget.value.rawId));
      Object.assign(editTarget.value, updated);
      showEditDialog.value = false;
      notify("User updated successfully.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to update user.", "error");
    } finally {
      saving.value = false;
    }
  }

  async function toggleActive(user) {
    const previous = user.active;
    user.active = !previous;
    try {
      await api.patch(`/users/${user.rawId}`, { is_active: user.active });
    } catch {
      user.active = previous;
      notify("Failed to update status.", "error");
    }
  }

  function confirmDelete(id) {
    deletingId.value = id;
    showDeleteDialog.value = true;
  }

  async function handleDelete() {
    deleting.value = true;
    const target = users.value.find((u) => u.id === deletingId.value);
    try {
      await api.delete(`/users/${target.rawId}`);
      users.value = users.value.filter((u) => u.id !== deletingId.value);
      showDeleteDialog.value = false;
      notify("User deleted.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to delete user.", "error");
    } finally {
      deleting.value = false;
    }
  }

  function openEditProfile(user) {
    profileTarget.value = user;
    showProfileDialog.value = true;
  }

  async function handleProfileSaved(updatedUser) {
    if (!profileTarget.value || profileSaving.value) return;
    profileSaving.value = true;
    try {
      const form = new FormData();
      form.append("first_name", updatedUser.firstName ?? "");
      form.append("last_name", updatedUser.lastName ?? "");
      form.append("email", updatedUser.email ?? "");
      if (updatedUser.avatarFile) form.append("avatar", updatedUser.avatarFile);
      form.append("_method", "PUT");

      const { data } = await api.post(`/users/${profileTarget.value.rawId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const idx = users.value.findIndex((u) => u.rawId === profileTarget.value.rawId);
      const mapped = mapUser(data, idx === -1 ? users.value.length : idx);
      if (idx !== -1) users.value[idx] = mapped;
      Object.assign(profileTarget.value, mapped);
      notify("Profile updated successfully.");
    } catch (err) {
      notify(err.response?.data?.message ?? "Failed to update profile.", "error");
    } finally {
      profileSaving.value = false;
    }
  }

  async function init() {
    await fetchUsers();
  }

  return {
    search,
    filterRole,
    filterRestaurant,
    showAddDialog,
    showEditDialog,
    showDeleteDialog,
    showProfileDialog,
    deletingId,
    editTarget,
    profileTarget,
    users,
    loading,
    saving,
    deleting,
    profileSaving,
    snackbar,
    modal,
    avatarColors,
    restaurantOptions,
    roleOptions,
    roleConfig,
    stats,
    filteredUsers,
    init,
    openAdd,
    saveUser,
    openEdit,
    saveEdit,
    toggleActive,
    confirmDelete,
    handleDelete,
    openEditProfile,
    handleProfileSaved,
  };
});
