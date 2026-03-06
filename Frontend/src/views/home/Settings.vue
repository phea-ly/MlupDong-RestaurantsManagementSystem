<script setup>
import { ref } from 'vue'

const language = ref('English (US)')
const timezone = ref('(GMT-05:00) Eastern Time')
const currency = ref('USD ($)')
const restaurantName = ref('The Green Bistro')
const phone = ref('+1 (555) 000-0000')
const address = ref('123 Culinary Lane, Food District, City 10101')
const cashEnabled = ref(true)
const creditEnabled = ref(true)
const nightMode = ref(true)

const languages = ['English (US)', 'Khmer', 'French', 'Chinese']
const timezones = ['(GMT-05:00) Eastern Time', '(GMT+07:00) Indochina Time', '(GMT+00:00) UTC']
const currencies = ['USD ($)', 'KHR (៛)', 'EUR (€)', 'THB (฿)']
</script>

<template>
  <div class="settings">
    <!-- General Settings -->
    <v-card rounded="xl" elevation="0" class="settings-card pa-6 mb-4">
      <div class="section-header mb-4">
        <span class="dot"></span>
        <p class="section-title">GENERAL SETTINGS</p>
      </div>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="language"
            :items="languages"
            label="Language"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="timezone"
            :items="timezones"
            label="Time Zone"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="currency"
            :items="currencies"
            label="Currency"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Restaurant Profile -->
    <v-card rounded="xl" elevation="0" class="settings-card pa-6 mb-4">
      <div class="section-header mb-4">
        <span class="dot"></span>
        <p class="section-title">RESTAURANT PROFILE</p>
      </div>

      <!-- Logo Upload -->
      <div class="logo-upload mb-5">
        <div class="logo-placeholder">
          <v-icon size="28" color="#b0bec5">mdi-camera-outline</v-icon>
          <p class="logo-label mt-1">Upload Logo</p>
        </div>
        <div class="ml-4">
          <p class="logo-title">Restaurant Logo</p>
          <p class="logo-sub">Square image, max 2MB. Recommended 512x512px.</p>
        </div>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="restaurantName"
            label="Restaurant Name"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="phone"
            label="Phone Number"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="address"
            label="Full Address"
            variant="outlined"
            rounded="lg"
            rows="3"
            no-resize
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Payment Methods -->
    <v-card rounded="xl" elevation="0" class="settings-card pa-6 mb-6">
      <div class="section-header mb-4">
        <span class="dot"></span>
        <p class="section-title">PAYMENT METHODS</p>
      </div>
      <v-row>
        <v-col cols="12" md="6">
          <div class="payment-card pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="payment-name">Cash</p>
                <p class="payment-sub">Standard cash payments</p>
              </div>
              <v-switch v-model="cashEnabled" color="#0f9e5f" hide-details inset />
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="payment-card pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="payment-name">Credit Card</p>
                <p class="payment-sub">Visa, Mastercard, Amex</p>
              </div>
              <v-switch v-model="creditEnabled" color="#0f9e5f" hide-details inset />
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="payment-card pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="payment-name">Night Mode</p>
                <p class="payment-sub">Visa, Mastercard, Amex</p>
              </div>
              <v-switch v-model="nightMode" color="#0f9e5f" hide-details inset />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Actions -->
    <div class="d-flex justify-end ga-3">
      <v-btn variant="outlined" rounded="lg" size="large">Cancel</v-btn>
      <v-btn color="#0f9e5f" rounded="lg" size="large" flat>Save Changes</v-btn>
    </div>
  </div>
</template>

<style scoped>
.settings-card { background: #fff; border: 1px solid #e4eaec; }

.section-header { display: flex; align-items: center; gap: 8px; }
.dot { width: 8px; height: 8px; background: #0f9e5f; border-radius: 50%; display: inline-block; }
.section-title { font-size: 12px; font-weight: 800; color: #0f9e5f; letter-spacing: 0.12em; margin: 0; }

.logo-upload { display: flex; align-items: center; }
.logo-placeholder {
  width: 72px;
  height: 72px;
  border: 2px dashed #d0dce4;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f7faf9;
  cursor: pointer;
  flex-shrink: 0;
}
.logo-label { font-size: 10px; color: #9aabbd; font-weight: 600; margin: 0; }
.logo-title { font-size: 14px; font-weight: 700; color: #1a2e48; margin: 0 0 4px; }
.logo-sub { font-size: 12px; color: #9aabbd; margin: 0; }

.payment-card {
  border: 1px solid #e4eaec;
  border-radius: 12px;
  background: #f7faf9;
}
.payment-name { font-size: 14px; font-weight: 700; color: #1a2e48; margin: 0 0 2px; }
.payment-sub { font-size: 12px; color: #9aabbd; margin: 0; }
</style>