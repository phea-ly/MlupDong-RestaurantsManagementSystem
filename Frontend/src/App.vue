<script setup>
import { watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui.store'

const ui = useUiStore()
const { language } = storeToRefs(ui)

watchEffect(() => {
  const isKhmer = language.value === 'km'
  document.documentElement.lang = isKhmer ? 'km' : 'en'
  document.body.classList.toggle('locale-km', isKhmer)
})
</script>

<template>
  <router-view />
</template>

<style>
.locale-km {
  font-family: 'Noto Sans Khmer', 'Khmer OS System', 'Khmer OS Battambang', sans-serif;
}
</style>
