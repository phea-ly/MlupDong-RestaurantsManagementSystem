<script setup>
defineProps({
  label:       { type: String, required: true },
  accentColor: { type: String, default: '#64748b' },
  count:       { type: Number, default: 0 },
})
</script>

<template>
  <div class="kds-col">

    <!-- ── Column header ──────────────────────────────────────────────────── -->
    <div class="kds-col__head">
      <!-- Left accent bar -->
      <span class="kds-col__accent" :style="{ background: accentColor }" />
      <span class="kds-col__label">{{ label }}</span>
      <!-- Count badge -->
      <span
        class="kds-col__count"
        :style="{ background: accentColor + '22', color: accentColor }"
      >
        {{ count }}
      </span>
    </div>

    <!-- ── Scrollable cards area ───────────────────────────────────────────── -->
    <div class="kds-col__body">
      <!-- Cards injected via default slot -->
      <transition-group name="card-slide" tag="div" class="kds-col__cards">
        <slot />
      </transition-group>

      <!-- Empty placeholder -->
      <div v-if="count === 0" class="kds-col__empty">
        No {{ label.toLowerCase() }} orders
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Column shell ────────────────────────────────────────────────────────── */
.kds-col {
  display: flex;
  flex-direction: column;
  min-height: 0;           /* flex child — allows column to shrink */
  height: 100%;
}

/* ── Header ──────────────────────────────────────────────────────────────── */
.kds-col__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 0 12px 0;
}

.kds-col__accent {
  display: inline-block;
  width: 4px;
  height: 22px;
  border-radius: 99px;
  flex-shrink: 0;
}

.kds-col__label {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.kds-col__count {
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Body / scroll ───────────────────────────────────────────────────────── */
.kds-col__body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  /* Subtle scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.kds-col__body::-webkit-scrollbar       { width: 4px; }
.kds-col__body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

.kds-col__cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── Empty ───────────────────────────────────────────────────────────────── */
.kds-col__empty {
  padding: 48px 16px;
  text-align: center;
  font-size: 13px;
  color: #c0cdd9;
  font-weight: 500;
}

/* ── Card transition ─────────────────────────────────────────────────────── */
.card-slide-enter-active,
.card-slide-leave-active { transition: all .22s ease; }
.card-slide-enter-from   { opacity: 0; transform: translateY(-8px); }
.card-slide-leave-to     { opacity: 0; transform: translateX(12px); }

.kds-col--drag-over .kds-col__body {
  background: rgba(22, 163, 74, 0.06);
}
</style>
