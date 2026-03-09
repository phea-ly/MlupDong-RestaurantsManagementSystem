<script setup>
import AppBar  from './AppBar.vue'
import Sidebar from './Sidebar.vue'

defineProps({
  title:    { type: String, required: true },
  subtitle: { type: String, required: true },
})
</script>

<template>
  <div class="layout-root">
    <Sidebar />
    <div class="layout-main">
      <AppBar :title="title" :subtitle="subtitle" />
      <div class="content-wrap">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.layout-root {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: Manrope, 'Segoe UI', sans-serif;
  background: #edf2f1;
}
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}
.content-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 20px 18px 26px;
  background: #edf2f1;
}
</style>