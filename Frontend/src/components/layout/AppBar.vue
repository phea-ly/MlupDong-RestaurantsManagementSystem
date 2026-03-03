<script setup>
defineProps({
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

const emit = defineEmits(['action'])
</script>

<template>
  <v-app-bar flat height="128" class="topbar px-5">
    <div>
      <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </div>
    <v-spacer />
    <div class="d-flex align-center ga-2">
      <v-btn color="#14dc8b" rounded="lg" class="text-none font-weight-bold" @click="emit('action')">
        {{ actionLabel }}
      </v-btn>
      <v-btn icon="mdi-bell-outline" variant="text" />
      <v-btn icon="mdi-cog-outline" variant="text" />
      <v-avatar color="#10d283" size="36">SK</v-avatar>
    </div>
  </v-app-bar>
</template>

<style scoped>
.topbar {
  border-bottom: 1px solid #d2dce1;
  background: #f6f9f8;
}

.subtitle {
  margin:0px;
  color: #5d6d86;
  font-size: 14px;
}
</style>
