<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores'

const route = useRoute()
const layoutStore = useLayoutStore()

const meta = computed(() => layoutStore.getMeta(route.path))

</script>

<template>
  <AppLayout :title="meta.title" :subtitle="meta.subtitle">
    <router-view />
  </AppLayout>
</template>
