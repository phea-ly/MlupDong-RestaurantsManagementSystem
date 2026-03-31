<template>
  <v-btn :color="color" @click="$emit('click')">
    <slot />
  </v-btn>
</template>

<script setup>
defineProps({
  color: {
    type: String,
    default: 'app-primary'
  }
})
</script>