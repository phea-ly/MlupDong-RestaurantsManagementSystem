<script setup>
import AppBar from './AppBar.vue'
import Sidebar from './Sidebar.vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
})


</script>

<template>
  <v-app style="background:#edf2f1">
    <Sidebar />
    <AppBar :title="title" :subtitle="subtitle" />

    <v-main style="background:#edf2f1">
      <v-container fluid class="pa-0">
        <div class="page-shell">
          <slot />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>
