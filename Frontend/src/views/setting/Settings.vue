<script setup>
import { onMounted, ref } from 'vue'
import { storeToRefs }    from 'pinia'
import { useSettingsStore } from '@/stores/settings.store'

const store = useSettingsStore()

const {
  language, timezone, currency,
  restaurantName, phone, address,
  cashEnabled, creditEnabled, qrCodeEnabled,
  loading, saving, snackbar, errorMessage,
  logoPreview, logoInput,
} = storeToRefs(store)

const {
  languages, timezones, currencies,
  init, triggerLogoInput, onLogoChange, removeLogo, saveSettings,
} = store

onMounted(init)

// Section label helper
const sectionTitle = (icon, label) => ({ icon, label })
</script>

<template>
  <v-container fluid class="pa-0">

    <!-- ── Error alert ─────────────────────────────────────────────────────── -->
    <v-alert
      v-if="errorMessage"
      type="error" variant="tonal" rounded="xl" class="mb-5"
      closable @click:close="errorMessage = ''"
    >
      {{ errorMessage }}
    </v-alert>

    <!-- ── Loading overlay ────────────────────────────────────────────────── -->
    <div v-if="loading" class="d-flex justify-center align-center py-16">
      <v-progress-circular indeterminate color="var(--app-primary)" size="48" />
    </div>

    <template v-else>

      <!-- ── General Settings ──────────────────────────────────────────────── -->
      <v-card rounded="xl" elevation="0" border class="mb-4">
        <v-card-title class="section-header px-6 pt-5 pb-0">
          <v-icon size="18" color="var(--app-primary)">mdi-cog-outline</v-icon>
          <span>General Settings</span>
        </v-card-title>
        <v-card-text class="px-6 pt-4">
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="language"
                :items="languages"
                item-title="title" item-value="value"
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

      <!-- ── Restaurant Profile ────────────────────────────────────────────── -->
      <v-card rounded="xl" elevation="0" border class="mb-4">
        <v-card-title class="section-header px-6 pt-5 pb-0">
          <v-icon size="18" color="var(--app-primary)">mdi-store-outline</v-icon>
          <span>Restaurant Profile</span>
        </v-card-title>
        <v-card-text class="px-6 pt-4">

          <!-- Logo upload row -->
          <div class="d-flex align-center ga-5 mb-5">
            <v-hover v-slot="{ isHovering, props }">
              <v-avatar
                v-bind="props"
                size="88" rounded="xl"
                color="grey-lighten-3"
                class="logo-avatar"
                @click="triggerLogoInput"
              >
                <v-img v-if="logoPreview" :src="logoPreview" cover />
                <v-icon v-else size="30" :color="isHovering ? 'var(--app-primary)' : 'grey-lighten-1'">
                  {{ isHovering ? 'mdi-upload-outline' : 'mdi-camera-outline' }}
                </v-icon>

                <!-- Remove button -->
                <v-btn
                  v-if="logoPreview"
                  icon size="x-small"
                  class="logo-remove-btn"
                  @click.stop="removeLogo"
                >
                  <v-icon size="14">mdi-close</v-icon>
                </v-btn>
              </v-avatar>
            </v-hover>

            <div>
              <div class="text-subtitle-2 font-weight-bold mb-1">Restaurant Logo</div>
              <div class="text-caption text-medium-emphasis mb-2">
                PNG or JPG · max 2 MB · 200×200 px recommended
              </div>
              <v-btn
                size="small" variant="outlined" rounded="lg"
                prepend-icon="mdi-upload"
                @click="triggerLogoInput"
              >
                Upload Logo
              </v-btn>
              <!-- Hidden file input — ref bound to store -->
              <input
                ref="logoInput"
                type="file"
                accept="image/*"
                style="display:none"
                @change="onLogoChange"
              />
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

      <!-- ── Payment Methods ───────────────────────────────────────────────── -->
      <v-card rounded="xl" elevation="0" border class="mb-6">
        <v-card-title class="section-header px-6 pt-5 pb-0">
          <v-icon size="18" color="var(--app-primary)">mdi-credit-card-outline</v-icon>
          <span>Payment Methods</span>
        </v-card-title>
        <v-card-text class="px-6 pt-4">
          <v-row>

            <!-- Cash -->
            <v-col cols="12" md="4">
              <v-card rounded="xl" border flat :class="cashEnabled ? 'payment-card-on' : 'payment-card-off'">
                <v-card-text class="d-flex align-center ga-3 pa-4">
                  <v-avatar color="success" variant="tonal" size="44" rounded="lg">
                    <v-icon>mdi-cash</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="text-subtitle-2 font-weight-bold">Cash</div>
                    <div class="text-caption text-medium-emphasis">Accept cash at counter</div>
                  </div>
                  <v-switch v-model="cashEnabled" color="var(--app-primary)" hide-details inset density="compact" />
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Credit card -->
            <v-col cols="12" md="4">
              <v-card rounded="xl" border flat :class="creditEnabled ? 'payment-card-on' : 'payment-card-off'">
                <v-card-text class="d-flex align-center ga-3 pa-4">
                  <v-avatar color="blue" variant="tonal" size="44" rounded="lg">
                    <v-icon>mdi-credit-card-outline</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="text-subtitle-2 font-weight-bold">Credit / Debit Card</div>
                    <div class="text-caption text-medium-emphasis">Visa, Mastercard, Amex</div>
                  </div>
                  <v-switch v-model="creditEnabled" color="var(--app-primary)" hide-details inset density="compact" />
                </v-card-text>
              </v-card>
            </v-col>

            <!-- QR -->
            <v-col cols="12" md="4">
              <v-card rounded="xl" border flat :class="qrCodeEnabled ? 'payment-card-on' : 'payment-card-off'">
                <v-card-text class="d-flex align-center ga-3 pa-4">
                  <v-avatar color="deep-purple" variant="tonal" size="44" rounded="lg">
                    <v-icon>mdi-qrcode</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="text-subtitle-2 font-weight-bold">QR Code</div>
                    <div class="text-caption text-medium-emphasis">ABA Pay, Wing, KHQR</div>
                  </div>
                  <v-switch v-model="qrCodeEnabled" color="var(--app-primary)" hide-details inset density="compact" />
                </v-card-text>
              </v-card>
            </v-col>

          </v-row>
        </v-card-text>
      </v-card>

      <!-- ── Action bar ────────────────────────────────────────────────────── -->
      <div class="d-flex justify-end ga-3">
        <v-btn
          variant="outlined" rounded="lg" size="large"
          :disabled="saving"
          @click="init"
        >
          Reset
        </v-btn>
        <v-btn
          color="var(--app-primary)" rounded="lg" size="large" variant="flat"
          :loading="saving"
          @click="saveSettings"
        >
          <span style="color:#063824; font-weight:800">Save Changes</span>
        </v-btn>
      </div>

    </template>

    <!-- ── Success snackbar ──────────────────────────────────────────────── -->
    <v-snackbar
      v-model="snackbar"
      color="success" rounded="lg"
      :timeout="3000" location="bottom right"
    >
      <div class="d-flex align-center ga-2">
        <v-icon>mdi-check-circle-outline</v-icon>
        Settings saved successfully.
      </div>
    </v-snackbar>

  </v-container>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--app-primary-600, #065f46);
}

/* Logo avatar */
.logo-avatar {
  border: 2px dashed #c8d4dc !important;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color .2s ease;
}
.logo-avatar:hover {
  border-color: var(--app-primary) !important;
}
.logo-remove-btn {
  position: absolute !important;
  top: 6px; right: 6px;
  background: rgba(0,0,0,.5) !important;
  color: white !important;
}

/* Payment method cards */
.payment-card-on {
  border-color: rgba(15, 158, 95, 0.35) !important;
  background: rgba(15, 158, 95, 0.03) !important;
  transition: all .2s ease;
}
.payment-card-off {
  border-color: rgba(0,0,0,.08) !important;
  background: #fafafa !important;
  opacity: .75;
  transition: all .2s ease;
}
</style>