<script setup>
import AppBar from './AppBar.vue'
import Sidebar from './Sidebar.vue'

defineProps({
  activeSection: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  actionLabel: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:active-section', 'action', 'logout'])
</script>

<template>
  <v-app class="layout-root">
    <Sidebar
      :active-section="activeSection"
      @update:active-section="emit('update:active-section', $event)"
      @logout="emit('logout')"
    />
    <v-main class="main-bg">
      <AppBar :title="title" :subtitle="subtitle" :action-label="actionLabel" @action="emit('action')" />
      <v-container fluid class="content-wrap">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.layout-root {
  font-family: Manrope, Segoe UI, sans-serif;
}

.main-bg {
  background: #edf2f1;
}

.content-wrap {
  padding: 20px 18px 26px;
}
</style>
