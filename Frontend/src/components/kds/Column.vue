<script setup>
defineProps({
  label:       { type: String, required: true },
  accentColor: { type: String, default: '#64748b' },
  count:       { type: Number, default: 0 },
})
</script>

<template>
  <div class="kds-col">

    <!-- ── Column header ──────────────────────────────────────────────── -->
    <div class="kds-col__head">
      <span class="kds-col__accent" :style="{ background: accentColor }" />
      <span class="kds-col__label">{{ label }}</span>
      <span
        class="kds-col__count"
        :style="{ background: accentColor + '20', color: accentColor }"
      >
        {{ count }}
      </span>
    </div>

    <!-- ── Scrollable cards area ───────────────────────────────────────── -->
    <div class="kds-col__body">
      <transition-group name="card-slide" tag="div" class="kds-col__cards">
        <slot />
      </transition-group>

      <div v-if="count === 0" class="kds-col__empty">
        <v-icon size="28" color="#e2e8f0">mdi-tray-remove</v-icon>
        <span>No {{ label.toLowerCase() }} orders</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.kds-col {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

/* ── Header ──────────────────────────────────────────────────────────── */
.kds-col__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 0 14px 0;
  flex-shrink: 0;
}

.kds-col__accent {
  display: inline-block;
  width: 4px;
  height: 20px;
  border-radius: 99px;
  flex-shrink: 0;
}

.kds-col__label {
  flex: 1;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.kds-col__count {
  min-width: 26px;
  height: 24px;
  padding: 0 8px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Body ────────────────────────────────────────────────────────────── */
.kds-col__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  border-radius: 10px;
  padding: 2px 2px 12px;
  transition: background .15s ease;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.kds-col__body::-webkit-scrollbar       { width: 4px; }
.kds-col__body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

/* Drag-over highlight applied from parent via :class */
:global(.kds-col--drag-over) .kds-col__body {
  background: rgba(22,163,74,.06);
  outline: 2px dashed rgba(22,163,74,.3);
}

.kds-col__cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Empty ───────────────────────────────────────────────────────────── */
.kds-col__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 16px;
  font-size: 12px;
  color: #c0cdd9;
  font-weight: 500;
}

/* ── Transitions ─────────────────────────────────────────────────────── */
.card-slide-enter-active { transition: all .22s ease; }
.card-slide-leave-active { transition: all .18s ease; }
.card-slide-enter-from   { opacity: 0; transform: translateY(-8px); }
.card-slide-leave-to     { opacity: 0; transform: translateX(14px); }
.card-slide-move         { transition: transform .22s ease; }
</style>