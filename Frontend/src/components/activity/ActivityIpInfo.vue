<script setup>
import { ref } from 'vue'

const props = defineProps({
  ip:   { type: String, required: true },
  info: {
    type: Object,
    default: () => ({
      location:     '—',
      postalCode:   '—',
      coordinates:  '—',
      organization: '—',
      timezone:     '—',
    }),
  },
})

const copied = ref(false)

async function copyIp() {
  try {
    await navigator.clipboard.writeText(props.ip)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { /* ignore */ }
}
</script>

<template>
  <v-menu open-on-hover location="bottom" offset="6" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        variant="text" size="small"
        class="text-primary font-mono"
        style="text-transform:none; padding:0; min-width:auto"
      >{{ ip }}</v-btn>
    </template>

    <v-card rounded="lg" elevation="4" width="300">
      <v-card-title class="d-flex align-center justify-space-between py-3 px-4">
        <div class="d-flex align-center ga-2">
          <span class="text-subtitle-2 font-weight-black">IP Information</span>
          <v-chip size="x-small" color="success" variant="flat">Cached</v-chip>
        </div>
      </v-card-title>

      <v-card-text class="pt-0 px-4 pb-4">
        <v-alert type="info" variant="tonal" density="compact" class="mb-3">
          <span class="text-caption">IP location is approximate and shown for general reference.</span>
        </v-alert>

        <!-- Mock map placeholder -->
        <div
          class="rounded-lg mb-3 d-flex align-center justify-center"
          style="height:100px; background:linear-gradient(135deg,#eef2ff,#dbeafe); border:1px solid #e5e7eb; position:relative;"
        >
          <v-icon size="24" color="primary">mdi-map-marker</v-icon>
        </div>

        <div v-for="(label, key) in {
          'IP Address':   ip,
          'Location':     info.location,
          'Postal Code':  info.postalCode,
          'Coordinates':  info.coordinates,
          'Organization': info.organization,
          'Timezone':     info.timezone,
        }" :key="key" class="d-flex justify-space-between mb-1">
          <span class="text-caption text-medium-emphasis">{{ key }}</span>
          <span class="text-caption font-weight-bold">{{ label }}</span>
        </div>

        <v-btn
          block color="primary" rounded="lg" variant="tonal" size="small" class="mt-3"
          :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
          @click="copyIp"
        >
          {{ copied ? 'Copied!' : 'Copy IP to Clipboard' }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<style scoped>
.font-mono { font-family: 'Courier New', monospace; font-size: 12px; }
</style>