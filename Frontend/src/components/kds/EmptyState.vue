<template>
  <div class="kds-empty">
    <div class="kds-empty__icon">
      <v-icon size="38" color="green-lighten-2">mdi-check-all</v-icon>
    </div>
    <p class="kds-empty__title">Kitchen is clear!</p>
    <p class="kds-empty__sub">No active orders on the board right now.</p>
  </div>
</template>

<style scoped>
.kds-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 10px;
}

.kds-empty__icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #f0fdf4;
  border: 2px solid #bbf7d0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kds-empty__title {
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.kds-empty__sub {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}
</style>
