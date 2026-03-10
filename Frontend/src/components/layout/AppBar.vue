<script setup>
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  actionLabel: { type: String, default: "" },
});
const emit = defineEmits(["action", "open-edit"]);

const auth = useAuthStore();
const router = useRouter();

const { user } = storeToRefs(auth);

const avatarUrl = computed(() => user.value?.avatar ?? null);

const profileMenu = ref(false);

const profileName = computed(() => {
  const f = user.value?.first_name ?? "";
  const l = user.value?.last_name ?? "";
  return (f + " " + l).trim() || "Admin User";
});

const profileRole = computed(() =>
  user.value?.role_id ? "Administrator" : "Manager"
);

const profileInitials = computed(() => {
  const f = user.value?.first_name?.[0] ?? "A";
  const l = user.value?.last_name?.[0] ?? "U";
  return (f + l).toUpperCase();
});

function openEdit(tab = "profile") {
  profileMenu.value = false;
  emit("open-edit", tab);
}

function logout() {
  profileMenu.value = false;
  auth.logout();
  router.replace("/login");
}
</script>

<template>
  <v-app-bar flat height="64" style="background: #f6f9f8; border-bottom: 1px solid #dbe3e7">
    <v-app-bar-title>
      <div class="bar-title">{{ title }}</div>
      <div class="bar-sub">{{ subtitle }}</div>
    </v-app-bar-title>

    <template #append>
      <div class="d-flex align-center ga-2 pr-4">

        <v-btn
          v-if="actionLabel"
          color="#0f9e5f" variant="flat" rounded="lg" size="small"
          style="font-weight: 700; text-transform: none"
          @click="emit('action')"
        >
          <v-icon start size="16">mdi-plus</v-icon>
          {{ actionLabel }}
        </v-btn>

        <v-btn icon variant="text" size="small" color="#6d8098">
          <v-icon size="20">mdi-bell-outline</v-icon>
        </v-btn>

        <!-- Avatar + dropdown -->
        <v-menu v-model="profileMenu" location="bottom end" :close-on-content-click="false" transition="slide-y-transition">
          <template #activator="{ props: mp }">
            <v-avatar
              v-bind="mp" size="36"
              style="cursor: pointer; box-shadow: 0 3px 10px rgba(15,158,95,0.28); overflow: hidden; padding: 0;"
            >
              <!-- ✅ FIX 3: :key forces the <img> to re-mount when the URL changes -->
              <img
                v-if="avatarUrl"
                :key="avatarUrl"
                :src="avatarUrl"
                style="width:100%; height:100%; object-fit:cover; border-radius:50%;"
              />
              <span
                v-else
                style="background:linear-gradient(135deg,#19e092,#0f9e5f); width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; color:#063824;"
              >{{ profileInitials }}</span>
            </v-avatar>
          </template>

          <v-card rounded="xl" elevation="4" width="248" style="border:1px solid #e4edf0; margin-top:8px">

            <div class="d-flex align-center ga-3 pa-4 pb-3">
              <v-avatar size="44" style="overflow:hidden; padding:0">
                <img
                  v-if="avatarUrl"
                  :key="avatarUrl"
                  :src="avatarUrl"
                  style="width:100%; height:100%; object-fit:cover; border-radius:50%;"
                />
                <span
                  v-else
                  style="background:linear-gradient(135deg,#19e092,#0f9e5f); width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800; color:#063824;"
                >{{ profileInitials }}</span>
              </v-avatar>
              <div style="min-width:0; flex:1">
                <div class="menu-name text-truncate">{{ profileName }}</div>
                <div class="menu-role">{{ profileRole }}</div>
                <v-chip size="x-small" color="#0f9e5f" variant="tonal" class="mt-1" style="font-size:10px">
                  <v-icon start size="9">mdi-circle</v-icon>Online
                </v-chip>
              </div>
            </div>

            <v-divider />

            <v-list density="compact" nav class="py-2">
              <v-list-item prepend-icon="mdi-account-edit-outline" title="Edit Profile"    rounded="lg" class="menu-item" @click="openEdit('profile')"  />
            </v-list>

            <v-divider />

            <v-list density="compact" nav class="py-2">
              <v-list-item prepend-icon="mdi-logout" title="Sign Out" rounded="lg" class="menu-item logout-item" @click="logout" />
            </v-list>

          </v-card>
        </v-menu>

      </div>
    </template>
  </v-app-bar>
</template>

<style scoped>
.bar-title { font-size:18px; font-weight:900; color:#1a2e48; line-height:1.2; }
.bar-sub   { font-size:12px; color:#7f90a4; }
.menu-name { font-size:13px; font-weight:800; color:#1a2e48; }
.menu-role { font-size:11px; color:#7f90a4; }
.menu-item { min-height:38px !important; }
.menu-item :deep(.v-list-item-title) { font-size:13px; font-weight:600; color:#2d4a6b; }
.menu-item :deep(.v-icon) { color:#6f8199 !important; font-size:17px !important; }
.menu-item:hover { background:#f0f7f4 !important; }
.logout-item :deep(.v-list-item-title) { color:#e53935 !important; }
.logout-item :deep(.v-icon) { color:#e53935 !important; }
.logout-item:hover { background:#fff5f5 !important; }
</style>