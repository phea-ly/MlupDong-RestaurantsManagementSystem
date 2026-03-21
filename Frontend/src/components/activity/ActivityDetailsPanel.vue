<script setup>
const props = defineProps({
  detail: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <v-card rounded="xl" border flat class="pa-4 mt-3">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2">
      <div class="text-subtitle-1 font-weight-black">Complete Log Entry Details</div>
      <div class="d-flex align-center ga-2">
        <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-eye-outline">Show JSON</v-btn>
        <v-btn size="small" variant="outlined" prepend-icon="mdi-content-copy">Copy to Clipboard</v-btn>
      </div>
    </div>

    <v-row dense class="mt-4">
      <v-col cols="12" md="3">
        <v-card rounded="lg" border flat class="pa-4" style="border-left:4px solid #2563eb">
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon size="18" color="primary">mdi-information-outline</v-icon>
            <span class="text-caption font-weight-bold">BASIC INFORMATION</span>
          </div>
          <div class="text-caption text-medium-emphasis">LOG ID</div>
          <div class="text-body-2 font-weight-bold mb-2">{{ detail.basic.logId }}</div>
          <div class="text-caption text-medium-emphasis">CREATED AT</div>
          <div class="text-body-2 mb-2">{{ detail.basic.createdAt }}</div>
          <div class="text-caption text-medium-emphasis">EVENT TYPE</div>
          <div class="text-body-2 mb-2">{{ detail.basic.eventType }}</div>
          <div class="text-caption text-medium-emphasis">ACTION</div>
          <div class="text-body-2 mb-2">{{ detail.basic.action }}</div>
          <div class="text-caption text-medium-emphasis">DESCRIPTION</div>
          <div class="text-body-2">{{ detail.basic.description }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card rounded="lg" border flat class="pa-4" style="border-left:4px solid #16a34a">
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon size="18" color="success">mdi-account-outline</v-icon>
            <span class="text-caption font-weight-bold">USER INFORMATION</span>
          </div>
          <div class="text-caption text-medium-emphasis">USER ID</div>
          <div class="text-body-2 font-weight-bold mb-2">{{ detail.user.id }}</div>
          <div class="text-caption text-medium-emphasis">USERNAME</div>
          <div class="text-body-2 mb-2">{{ detail.user.username }}</div>
          <div class="text-caption text-medium-emphasis">DISPLAY NAME</div>
          <div class="text-body-2 mb-2">{{ detail.user.displayName }}</div>
          <div class="text-caption text-medium-emphasis">USER ROLE</div>
          <div class="text-body-2 mb-2">{{ detail.user.role }}</div>
          <div class="text-caption text-medium-emphasis">PROFILE LINK</div>
          <div class="text-body-2 text-primary">{{ detail.user.profile }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card rounded="lg" border flat class="pa-4" style="border-left:4px solid #7c3aed">
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon size="18" color="deep-purple">mdi-lan-connect</v-icon>
            <span class="text-caption font-weight-bold">NETWORK INFORMATION</span>
          </div>
          <div class="text-caption text-medium-emphasis">IP ADDRESS</div>
          <div class="text-body-2 font-weight-bold mb-2">{{ detail.network.ip }}</div>
          <div class="text-caption text-medium-emphasis">USER AGENT</div>
          <div class="text-body-2 mb-2">{{ detail.network.userAgent }}</div>
          <div class="text-caption text-medium-emphasis">REFERRER</div>
          <div class="text-body-2 mb-2">{{ detail.network.referer }}</div>
          <div class="text-caption text-medium-emphasis">REQUEST METHOD</div>
          <div class="text-body-2 mb-2">{{ detail.network.requestMethod }}</div>
          <div class="text-caption text-medium-emphasis">REQUEST URI</div>
          <div class="text-body-2">{{ detail.network.requestUri }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card rounded="lg" border flat class="pa-4" style="border-left:4px solid #f59e0b">
          <div class="d-flex align-center ga-2 mb-3">
            <v-icon size="18" color="orange-darken-2">mdi-target</v-icon>
            <span class="text-caption font-weight-bold">TARGET OBJECT</span>
          </div>
          <div class="text-caption text-medium-emphasis">OBJECT TYPE</div>
          <div class="text-body-2 font-weight-bold mb-2">{{ detail.target.type }}</div>
          <div class="text-caption text-medium-emphasis">OBJECT ID</div>
          <div class="text-body-2 mb-2">{{ detail.target.id }}</div>
          <div class="text-caption text-medium-emphasis">OBJECT NAME</div>
          <div class="text-body-2 mb-2">{{ detail.target.name }}</div>
          <div class="text-caption text-medium-emphasis">OBJECT STATUS</div>
          <div class="text-body-2 mb-2">{{ detail.target.status }}</div>
          <div class="text-caption text-medium-emphasis">PREVIOUS STATUS</div>
          <div class="text-body-2">{{ detail.target.previousStatus }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="lg" border flat class="pa-4 mt-4">
      <div class="d-flex align-center ga-2 mb-3">
        <v-icon size="18" color="primary">mdi-database-outline</v-icon>
        <span class="text-caption font-weight-bold">RAW DATABASE FIELDS</span>
      </div>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-caption text-medium-emphasis">DATABASE FIELD</th>
            <th class="text-caption text-medium-emphasis">RAW VALUE</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in detail.rawFields" :key="row.key">
            <td class="text-body-2 font-weight-medium">{{ row.key }}</td>
            <td class="text-body-2">{{ row.value }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-card>
</template>
