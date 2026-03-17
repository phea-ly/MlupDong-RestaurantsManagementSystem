<script setup>
const props = defineProps({
  ip: { type: String, required: true },
  info: {
    type: Object,
    default: () => ({
      location: 'Dublin, Leinster, IE',
      postalCode: 'D02',
      coordinates: '53.XXXX, -6.XXXX',
      organization: 'AS136787 PacketHub S.A.',
      timezone: 'Europe/Dublin',
    }),
  },
})
</script>

<template>
  <v-menu open-on-hover location="bottom" offset="6">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        variant="text"
        size="small"
        class="text-primary"
        style="text-transform:none; padding:0; min-width:auto"
      >
        {{ ip }}
      </v-btn>
    </template>
    <v-card rounded="lg" elevation="4" width="320">
      <v-card-title class="d-flex align-center justify-space-between py-3">
        <div class="d-flex align-center ga-2">
          <span class="text-subtitle-2 font-weight-black">IP Information</span>
          <v-chip size="x-small" color="success" variant="flat">Cached</v-chip>
        </div>
        <v-btn icon size="x-small" variant="text">
          <v-icon size="16">mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pt-0">
        <v-alert type="info" variant="tonal" density="compact" class="mb-3">
          <span class="text-caption">IP location is approximate and shown for general reference.</span>
        </v-alert>
        <div class="rounded-lg mb-3" style="height:120px; background:linear-gradient(135deg,#eef2ff,#dbeafe); border:1px solid #e5e7eb; position:relative;">
          <v-icon size="20" color="primary" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-60%);">
            mdi-map-marker
          </v-icon>
          <div class="text-caption text-medium-emphasis" style="position:absolute; bottom:8px; right:8px;">
            Click to expand
          </div>
        </div>
        <div class="text-caption text-medium-emphasis">IP Address: <strong class="text-body-2">{{ ip }}</strong></div>
        <div class="text-caption text-medium-emphasis">Location: <strong class="text-body-2">{{ info.location }}</strong></div>
        <div class="text-caption text-medium-emphasis">Postal Code: <strong class="text-body-2">{{ info.postalCode }}</strong></div>
        <div class="text-caption text-medium-emphasis">Coordinates: <strong class="text-body-2">{{ info.coordinates }}</strong></div>
        <div class="text-caption text-medium-emphasis">Organization: <strong class="text-body-2">{{ info.organization }}</strong></div>
        <div class="text-caption text-medium-emphasis">Timezone: <strong class="text-body-2">{{ info.timezone }}</strong></div>
        <v-btn block color="primary" rounded="lg" variant="tonal" size="small" class="mt-3">
          Copy to Clipboard
        </v-btn>
      </v-card-text>
    </v-card>
  </v-menu>
</template>
