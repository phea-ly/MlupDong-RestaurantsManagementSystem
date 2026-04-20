<script setup>
import { ref } from 'vue'

const props = defineProps({
  connected:   { type: Boolean, default: false },
  currentTime: { type: String,  default: '' },
  boardCount:  { type: Number,  default: 0 },
  loading:     { type: Boolean, default: false },
  tab:         { type: String,  default: 'active' },
})

const emit = defineEmits(['update:tab', 'refresh', 'logout'])

const logoutDialog = ref(false)

function confirmLogout() {
  logoutDialog.value = false
  emit('logout')
}
</script>

<template>
  <!-- ── Top bar ─────────────────────────────────────────────────────────── -->
  <v-app-bar flat height="58" class="kds-bar">

    <!-- Brand -->
    <template #prepend>
      <div class="kds-brand">
        <div class="kds-brand__icon">
          <v-icon size="18" color="white">mdi-silverware-fork-knife</v-icon>
        </div>
        <span class="kds-brand__name">The Kinetic Kitchen</span>
      </div>
    </template>

    <v-spacer />

    <!-- Board / History tabs (minimal text toggle) -->
    <v-btn-toggle
      :model-value="tab"
      @update:model-value="emit('update:tab', $event)"
      mandatory
      class="kds-toggle"
    >
      <v-btn value="active" class="kds-toggle__btn" variant="text">
        <v-badge v-if="boardCount > 0" :content="boardCount" color="#1e3a8a" inline>
          Board
        </v-badge>
        <template v-else>Board</template>
      </v-btn>
      <v-btn value="done" class="kds-toggle__btn" variant="text">History</v-btn>
    </v-btn-toggle>

    <!-- Live pill -->
    <div class="kds-live ml-4" :class="connected ? 'kds-live--on' : 'kds-live--off'">
      <span class="kds-live__dot" :class="{ pulse: connected }" />
      {{ connected ? 'LIVE' : 'OFFLINE' }}
    </div>

    <!-- Notification bell -->
    <v-btn icon variant="text" size="small" class="ml-2 kds-icon-btn">
      <v-icon size="20">mdi-bell-outline</v-icon>
    </v-btn>

    <!-- Clock -->
    <div class="kds-clock ml-1">{{ currentTime }}</div>

    <!-- Avatar / logout -->
    <v-btn
      icon
      variant="text"
      size="small"
      class="kds-avatar ml-1 mr-2"
      @click="logoutDialog = true"
    >
      <v-icon size="20" color="white">mdi-account</v-icon>
      <v-tooltip activator="parent" location="bottom">Sign out</v-tooltip>
    </v-btn>

    <!-- Refresh (hidden, accessible via the board) -->
    <v-btn
      v-if="false"
      icon
      variant="text"
      size="small"
      :loading="loading"
      @click="emit('refresh')"
    >
      <v-icon size="17">mdi-refresh</v-icon>
    </v-btn>

  </v-app-bar>

  <!-- ── Logout dialog ───────────────────────────────────────────────────── -->
  <v-dialog v-model="logoutDialog" max-width="340" persistent>
    <v-card rounded="xl" class="kds-dialog" elevation="2">
      <div class="kds-dialog__icon-row">
        <div class="kds-dialog__orb">
          <v-icon size="24" color="white">mdi-logout</v-icon>
        </div>
      </div>
      <v-card-title class="kds-dialog__title">Sign out?</v-card-title>
      <v-card-text class="kds-dialog__body">
        You'll be logged out of the Kitchen Display. Active orders will remain visible to others.
      </v-card-text>
      <v-card-actions class="kds-dialog__actions">
        <v-btn variant="tonal" rounded="lg" class="flex-1" @click="logoutDialog = false">Cancel</v-btn>
        <v-btn color="error" variant="flat" rounded="lg" class="flex-1" @click="confirmLogout">
          <v-icon start size="14">mdi-logout</v-icon>Sign out
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/* ── Bar ───────────────────────────────────────────────────────────────────── */
.kds-bar {
  background: #ffffff !important;
  border-bottom: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 4px rgba(0,0,0,.06) !important;
}

/* ── Brand ─────────────────────────────────────────────────────────────────── */
.kds-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 8px;
}

.kds-brand__icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #1e3a8a;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kds-brand__name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -.3px;
}

/* ── Divider after brand (matches screenshot) ──────────────────────────────── */
.kds-brand::after {
  content: '';
  display: block;
  width: 1px;
  height: 24px;
  background: #e2e8f0;
  margin-left: 16px;
}

/* ── Toggle ────────────────────────────────────────────────────────────────── */
.kds-toggle {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  padding: 3px;
  gap: 2px;
}

.kds-toggle__btn {
  text-transform: none;
  font-size: 12px;
  font-weight: 600;
  border-radius: 7px !important;
  color: #64748b !important;
  min-width: 70px;
  height: 30px !important;
}

.kds-toggle__btn.v-btn--active {
  background: #fff !important;
  color: #0f172a !important;
  box-shadow: 0 1px 4px rgba(0,0,0,.08) !important;
}

/* ── Live pill ─────────────────────────────────────────────────────────────── */
.kds-live {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .6px;
  border: 1px solid currentColor;
}

.kds-live--on  { color: #16a34a; background: transparent; border-color: #bbf7d0; }
.kds-live--off { color: #ef4444; background: transparent; border-color: #fecaca; }

.kds-live__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}

.kds-live__dot.pulse {
  animation: dotPulse 1.6s ease-in-out infinite;
}

@keyframes dotPulse {
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:.4; transform:scale(.65); }
}

/* ── Icon btn ──────────────────────────────────────────────────────────────── */
.kds-icon-btn { color: #64748b !important; }

/* ── Clock ─────────────────────────────────────────────────────────────────── */
.kds-clock {
  font-size: 12px;
  font-family: 'DM Mono', monospace;
  font-weight: 600;
  color: #64748b;
  padding: 0 6px;
  letter-spacing: .5px;
}

/* ── Avatar btn ────────────────────────────────────────────────────────────── */
.kds-avatar {
  width: 34px !important;
  height: 34px !important;
  border-radius: 50% !important;
  background: #334155 !important;
}

/* ── Logout dialog ─────────────────────────────────────────────────────────── */
.kds-dialog {
  padding: 24px 20px 20px;
  background: #fff;
  text-align: center;
}

.kds-dialog__icon-row {
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}

.kds-dialog__orb {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f87171, #ef4444);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 18px rgba(239,68,68,.25);
}

.kds-dialog__title {
  font-size: 17px !important;
  font-weight: 800 !important;
  color: #0f172a;
  text-align: center;
  padding: 0 0 6px !important;
}

.kds-dialog__body {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  padding: 0 0 20px !important;
  text-align: center;
}

.kds-dialog__actions {
  display: flex;
  gap: 8px;
  padding: 0 !important;
}

@media (max-width: 540px) {
  .kds-brand__name { display: none; }
  .kds-clock { display: none; }
}
</style>
