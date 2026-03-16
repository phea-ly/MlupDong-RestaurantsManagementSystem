<script setup>
import { ref } from 'vue'

const language       = ref('en')
const timezone       = ref('(GMT+07:00) Indochina Time')
const currency       = ref('USD ($)')
const restaurantName = ref('Mlup Dong')
const phone          = ref('+855 23 000 000')
const address        = ref('123 Norodom Blvd, Phnom Penh, Cambodia')
const cashEnabled    = ref(true)
const creditEnabled  = ref(true)
const qrCodeEnabled  = ref(true)
const snackbar       = ref(false)

const languages  = [
  { title: 'English', value: 'en' },
  { title: 'Khmer',   value: 'km' },
  { title: 'French',  value: 'fr' },
  { title: 'Chinese', value: 'zh' },
]
const timezones  = ['(GMT+07:00) Indochina Time', '(GMT-05:00) Eastern Time', '(GMT+00:00) UTC']
const currencies = ['USD ($)', 'KHR (៛)', 'EUR (€)', 'THB (฿)']

function saveSettings() {
  snackbar.value = true
}
</script>

<template>
  <div>
    <!-- ── General ── -->
    <v-card rounded="xl" elevation="0" border class="mb-4">
      <v-card-title class="d-flex align-center ga-2 pt-5 px-6">
        <v-icon color="#0f9e5f" size="18">mdi-cog-outline</v-icon>
        <span class="text-subtitle-1 font-weight-black text-uppercase" style="color:#0f9e5f;letter-spacing:0.1em">General Settings</span>
      </v-card-title>
      <v-card-text class="px-6">
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="language"
              :items="languages"
              item-title="title"
              item-value="value"
              label="Language"
              variant="outlined" rounded="lg" density="comfortable"
              prepend-inner-icon="mdi-translate"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="timezone"
              :items="timezones"
              label="Timezone"
              variant="outlined" rounded="lg" density="comfortable"
              prepend-inner-icon="mdi-clock-outline"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="currency"
              :items="currencies"
              label="Currency"
              variant="outlined" rounded="lg" density="comfortable"
              prepend-inner-icon="mdi-currency-usd"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ── Restaurant Profile ── -->
    <v-card rounded="xl" elevation="0" border class="mb-4">
      <v-card-title class="d-flex align-center ga-2 pt-5 px-6">
        <v-icon color="#0f9e5f" size="18">mdi-store-outline</v-icon>
        <span class="text-subtitle-1 font-weight-black text-uppercase" style="color:#0f9e5f;letter-spacing:0.1em">Restaurant Profile</span>
      </v-card-title>
      <v-card-text class="px-6">
        <!-- Logo upload -->
        <div class="d-flex align-center ga-5 mb-5">
          <v-hover v-slot="{ isHovering, props }">
            <v-avatar
              v-bind="props"
              size="80" rounded="xl"
              color="grey-lighten-3"
              style="border:2px dashed #c8d4dc; cursor:pointer;"
            >
              <v-icon v-if="!isHovering" size="28" color="grey-lighten-1">mdi-camera-outline</v-icon>
              <v-icon v-else size="28" color="primary">mdi-upload-outline</v-icon>
            </v-avatar>
          </v-hover>
          <div>
            <div class="text-subtitle-2 font-weight-bold">Restaurant Logo</div>
            <div class="text-caption text-medium-emphasis">PNG or JPG · max 2 MB · 200×200px recommended</div>
            <v-btn size="small" variant="outlined" rounded="lg" class="mt-2" prepend-icon="mdi-upload">Upload</v-btn>
          </div>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="restaurantName"
              label="Restaurant Name"
              variant="outlined" rounded="lg" density="comfortable"
              prepend-inner-icon="mdi-store-outline"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="phone"
              label="Phone Number"
              variant="outlined" rounded="lg" density="comfortable"
              prepend-inner-icon="mdi-phone-outline"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="address"
              label="Full Address"
              variant="outlined" rounded="lg"
              rows="3" no-resize
              prepend-inner-icon="mdi-map-marker-outline"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ── Payment Methods ── -->
    <v-card rounded="xl" elevation="0" border class="mb-6">
      <v-card-title class="d-flex align-center ga-2 pt-5 px-6">
        <v-icon color="#0f9e5f" size="18">mdi-credit-card-outline</v-icon>
        <span class="text-subtitle-1 font-weight-black text-uppercase" style="color:#0f9e5f;letter-spacing:0.1em">Payment Methods</span>
      </v-card-title>
      <v-card-text class="px-6">
        <v-row>
          <v-col cols="12" md="4">
            <v-card rounded="xl" variant="outlined" color="grey-lighten-3">
              <v-card-text class="d-flex align-center ga-3">
                <v-avatar color="success" variant="tonal" size="40" rounded="lg">
                  <v-icon>mdi-cash</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-subtitle-2 font-weight-bold">Cash</div>
                  <div class="text-caption text-medium-emphasis">Accept cash at counter</div>
                </div>
                <v-switch v-model="cashEnabled" color="#0f9e5f" hide-details inset />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card rounded="xl" variant="outlined" color="grey-lighten-3">
              <v-card-text class="d-flex align-center ga-3">
                <v-avatar color="blue" variant="tonal" size="40" rounded="lg">
                  <v-icon>mdi-credit-card-outline</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-subtitle-2 font-weight-bold">Credit / Debit Card</div>
                  <div class="text-caption text-medium-emphasis">Visa, Mastercard, Amex</div>
                </div>
                <v-switch v-model="creditEnabled" color="#0f9e5f" hide-details inset />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card rounded="xl" variant="outlined" color="grey-lighten-3">
              <v-card-text class="d-flex align-center ga-3">
                <v-avatar color="orange" variant="tonal" size="40" rounded="lg">
                  <v-icon>mdi-qrcode</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-subtitle-2 font-weight-bold">QR Code</div>
                  <div class="text-caption text-medium-emphasis">ABA Pay, Wing, KHQR</div>
                </div>
                <v-switch v-model="qrCodeEnabled" color="#0f9e5f" hide-details inset />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ── Actions ── -->
    <div class="d-flex justify-end ga-3">
      <v-btn variant="outlined" rounded="lg" size="large">Cancel</v-btn>
      <v-btn color="#0f9e5f" rounded="lg" size="large" variant="flat" @click="saveSettings">
        Save Changes
      </v-btn>
    </div>

    <v-snackbar v-model="snackbar" color="success" rounded="lg" :timeout="3000" location="bottom right">
      <v-icon class="mr-2">mdi-check-circle-outline</v-icon>
      Settings saved successfully.
    </v-snackbar>
  </div>
</template>