<script setup>
import { computed, ref } from 'vue'
import { useUiStore } from '@/stores/ui.store'
import { useI18n } from '@/composables/useI18n'

const ui = useUiStore()
const { t } = useI18n()

const language = computed({
  get: () => ui.language,
  set: (value) => ui.setLanguage(value),
})

const timezone = ref('(GMT-05:00) Eastern Time')
const currency = ref('USD ($)')
const restaurantName = ref('The Green Bistro')
const phone = ref('+1 (555) 000-0000')
const address = ref('123 Culinary Lane, Food District, City 10101')
const cashEnabled = ref(true)
const creditEnabled = ref(true)
const qrCodeEnabled = ref(true)

const languages = computed(() => [
  { title: t('language.english'), value: 'en' },
  { title: t('language.khmer'), value: 'km' },
  { title: t('language.french'), value: 'fr' },
  { title: t('language.chinese'), value: 'zh' },
])
const timezones = ['(GMT-05:00) Eastern Time', '(GMT+07:00) Indochina Time', '(GMT+00:00) UTC']
const currencies = ['USD ($)', 'KHR (៛)', 'EUR (€)', 'THB (฿)']
</script>

<template>
  <div class="settings">
    <v-card rounded="xl" elevation="0" class="settings-card pa-6 mb-4">
      <div class="section-header mb-4">
        <span class="dot"></span>
        <p class="section-title">{{ t('settings.general') }}</p>
      </div>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="language"
            :items="languages"
            item-title="title"
            item-value="value"
            :label="t('settings.language')"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="timezone"
            :items="timezones"
            :label="t('settings.timezone')"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="currency"
            :items="currencies"
            :label="t('settings.currency')"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-card rounded="xl" elevation="0" class="settings-card pa-6 mb-4">
      <div class="section-header mb-4">
        <span class="dot"></span>
        <p class="section-title">{{ t('settings.restaurantProfile') }}</p>
      </div>

      <div class="logo-upload mb-5">
        <div class="logo-placeholder">
          <v-icon size="28" color="#b0bec5">mdi-camera-outline</v-icon>
          <p class="logo-label mt-1">{{ t('settings.uploadLogo') }}</p>
        </div>
        <div class="ml-4">
          <p class="logo-title">{{ t('settings.restaurantLogo') }}</p>
          <p class="logo-sub">{{ t('settings.logoHint') }}</p>
        </div>
      </div>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="restaurantName"
            :label="t('settings.restaurantName')"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="phone"
            :label="t('settings.phoneNumber')"
            variant="outlined"
            rounded="lg"
            density="comfortable"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="address"
            :label="t('settings.fullAddress')"
            variant="outlined"
            rounded="lg"
            rows="3"
            no-resize
          />
        </v-col>
      </v-row>
    </v-card>

    <v-card rounded="xl" elevation="0" class="settings-card pa-6 mb-6">
      <div class="section-header mb-4">
        <span class="dot"></span>
        <p class="section-title">{{ t('settings.paymentMethods') }}</p>
      </div>
      <v-row>
        <v-col cols="12" md="6">
          <div class="payment-card pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="payment-name">{{ t('settings.cash') }}</p>
                <p class="payment-sub">{{ t('settings.cashSub') }}</p>
              </div>
              <v-switch v-model="cashEnabled" color="#0f9e5f" hide-details inset />
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="payment-card pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="payment-name">{{ t('settings.creditCard') }}</p>
                <p class="payment-sub">{{ t('settings.creditCardSub') }}</p>
              </div>
              <v-switch v-model="creditEnabled" color="#0f9e5f" hide-details inset />
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="payment-card pa-4">
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="payment-name">{{ t('settings.qrCode') }}</p>
                <p class="payment-sub">{{ t('settings.qrCodeSub') }}</p>
              </div>
              <v-switch v-model="qrCodeEnabled" color="#0f9e5f" hide-details inset />
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <div class="d-flex justify-end ga-3">
      <v-btn variant="outlined" rounded="lg" size="large">{{ t('common.cancel') }}</v-btn>
      <v-btn color="#0f9e5f" rounded="lg" size="large" flat>{{ t('common.saveChanges') }}</v-btn>
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
