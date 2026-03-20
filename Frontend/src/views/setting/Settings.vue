<script>
import { defineStore } from "pinia";
import { ref } from "vue";
import { settingsApi } from "@/api/settings.api";

export const useSettingsStore = defineStore("settings", () => {
  const language       = ref("en");
  const timezone       = ref("(GMT+07:00) Indochina Time");
  const currency       = ref("USD (USD)");
  const restaurantName = ref("");
  const phone          = ref("");
  const address        = ref("");
  const cashEnabled    = ref(true);
  const creditEnabled  = ref(true);
  const qrCodeEnabled  = ref(true);
  const saving         = ref(false);
  const loading        = ref(false);
  const snackbar       = ref(false);
  const errorMessage   = ref("");

  const logoFile    = ref(null);
  const logoPreview = ref(null);
  const logoInput   = ref(null);

  const languages = [
    { title: "English", value: "en" },
    { title: "Khmer",   value: "km" },
    { title: "French",  value: "fr" },
    { title: "Chinese", value: "zh" },
  ];
  const timezones = [
    "(GMT+07:00) Indochina Time",
    "(GMT-05:00) Eastern Time",
    "(GMT+00:00) UTC",
  ];
  const currencies = ["USD (USD)", "KHR (KHR)", "EUR (EUR)", "THB (THB)"];

  function applySettings(data) {
    language.value       = data.language        ?? language.value;
    timezone.value       = data.timezone        ?? timezone.value;
    currency.value       = data.currency        ?? currency.value;
    restaurantName.value = data.restaurant_name ?? restaurantName.value;
    phone.value          = data.phone           ?? phone.value;
    address.value        = data.address         ?? address.value;
    cashEnabled.value    = data.cash_enabled    ?? cashEnabled.value;
    creditEnabled.value  = data.credit_enabled  ?? creditEnabled.value;
    qrCodeEnabled.value  = data.qr_code_enabled ?? qrCodeEnabled.value;
    logoPreview.value    = data.logo_path       ?? logoPreview.value;
  }

  async function fetchSettings() {
    loading.value = true;
    errorMessage.value = "";
    try {
      const { data } = await settingsApi.get();
      applySettings(data);
    } catch (e) {
      errorMessage.value = e?.response?.data?.message ?? "Failed to load settings.";
    } finally {
      loading.value = false;
    }
  }

  function triggerLogoInput() {
    logoInput.value?.click();
  }

  function onLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    logoFile.value = file;
    const reader = new FileReader();
    reader.onload = (ev) => { logoPreview.value = ev.target.result; };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    logoFile.value = null;
    logoPreview.value = null;
    if (logoInput.value) logoInput.value.value = "";
  }

  async function saveSettings() {
    saving.value = true;
    errorMessage.value = "";

    let payload;
    if (logoFile.value) {
      payload = new FormData();
      payload.append("language",        language.value);
      payload.append("timezone",        timezone.value);
      payload.append("currency",        currency.value);
      payload.append("restaurant_name", restaurantName.value);
      payload.append("phone",           phone.value);
      payload.append("address",         address.value);
      payload.append("cash_enabled",    cashEnabled.value   ? "1" : "0");
      payload.append("credit_enabled",  creditEnabled.value ? "1" : "0");
      payload.append("qr_code_enabled", qrCodeEnabled.value ? "1" : "0");
      payload.append("logo",            logoFile.value);
    } else {
      payload = {
        language:        language.value,
        timezone:        timezone.value,
        currency:        currency.value,
        restaurant_name: restaurantName.value,
        phone:           phone.value,
        address:         address.value,
        cash_enabled:    cashEnabled.value,
        credit_enabled:  creditEnabled.value,
        qr_code_enabled: qrCodeEnabled.value,
      };
    }

    try {
      const { data } = await settingsApi.update(payload);
      applySettings(data);
      logoFile.value = null;
      snackbar.value = true;
    } catch (e) {
      errorMessage.value = e?.response?.data?.message ?? "Failed to save settings.";
    } finally {
      saving.value = false;
    }
  }

  async function init() {
    await fetchSettings();
  }

  return {
    language,
    timezone,
    currency,
    restaurantName,
    phone,
    address,
    cashEnabled,
    creditEnabled,
    qrCodeEnabled,
    saving,
    loading,
    snackbar,
    errorMessage,
    logoFile,
    logoPreview,
    logoInput,
    languages,
    timezones,
    currencies,
    init,
    triggerLogoInput,
    onLogoChange,
    removeLogo,
    saveSettings,
  };
});
</script>

<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";

const settingsStore = useSettingsStore();

const {
  language,
  timezone,
  currency,
  restaurantName,
  phone,
  address,
  cashEnabled,
  creditEnabled,
  qrCodeEnabled,
  saving,
  loading,
  snackbar,
  errorMessage,
  logoFile,
  logoPreview,
  logoInput,
} = storeToRefs(settingsStore);

const { languages, timezones, currencies, triggerLogoInput, onLogoChange, removeLogo, saveSettings, init } = settingsStore;

onMounted(init);
</script>

<template>
  <div>
    <v-alert v-if="errorMessage" type="error" variant="tonal" rounded="lg" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <!-- ── General Settings ── -->
    <v-card rounded="xl" elevation="0" border class="mb-4">
      <v-card-title class="d-flex align-center ga-2 pt-5 px-6">
        <v-icon color="primary" size="18">mdi-cog-outline</v-icon>
        <span class="text-subtitle-1 font-weight-black text-uppercase" style="color:var(--app-primary-600);letter-spacing:0.1em">General Settings</span>
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
        <v-icon color="primary" size="18">mdi-store-outline</v-icon>
        <span class="text-subtitle-1 font-weight-black text-uppercase" style="color:var(--app-primary-600);letter-spacing:0.1em">Restaurant Profile</span>
      </v-card-title>
      <v-card-text class="px-6">
        <div class="d-flex align-center ga-5 mb-5">
          <v-hover v-slot="{ isHovering, props }">
            <v-avatar
              v-bind="props"
              size="80" rounded="xl"
              color="grey-lighten-3"
              style="border:2px dashed #c8d4dc; cursor:pointer; position:relative; overflow:hidden;"
              @click="triggerLogoInput"
            >
              <v-img v-if="logoPreview" :src="logoPreview" cover />
              <v-icon v-else-if="!isHovering" size="28" color="grey-lighten-1">mdi-camera-outline</v-icon>
              <v-icon v-else size="28" color="primary">mdi-upload-outline</v-icon>
              <v-btn
                v-if="logoPreview"
                icon size="x-small" color="white"
                style="position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.5);"
                @click.stop="removeLogo"
              >
                <v-icon size="14">mdi-close</v-icon>
              </v-btn>
            </v-avatar>
          </v-hover>
          <div>
            <div class="text-subtitle-2 font-weight-bold">Restaurant Logo</div>
            <div class="text-caption text-medium-emphasis">PNG or JPG - max 2 MB - 200x200px recommended</div>
            <v-btn size="small" variant="outlined" rounded="lg" class="mt-2" prepend-icon="mdi-upload" @click="triggerLogoInput">
              Upload
            </v-btn>
            <input ref="logoInput" type="file" accept="image/*" style="display:none" @change="onLogoChange" />
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
        <v-icon color="primary" size="18">mdi-credit-card-outline</v-icon>
        <span class="text-subtitle-1 font-weight-black text-uppercase" style="color:var(--app-primary-600);letter-spacing:0.1em">Payment Methods</span>
      </v-card-title>
      <v-card-text class="px-6">
        <v-row>
          <v-col cols="12" md="4">
            <v-card rounded="xl" variant="outlined" color="grey-lighten-3">
              <v-card-text class="d-flex align-center ga-3">
                <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
                  <v-icon>mdi-cash</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-subtitle-2 font-weight-bold">Cash</div>
                  <div class="text-caption text-medium-emphasis">Accept cash at counter</div>
                </div>
                <v-switch v-model="cashEnabled" color="primary" hide-details inset />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card rounded="xl" variant="outlined" color="grey-lighten-3">
              <v-card-text class="d-flex align-center ga-3">
                <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
                  <v-icon>mdi-credit-card-outline</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-subtitle-2 font-weight-bold">Credit / Debit Card</div>
                  <div class="text-caption text-medium-emphasis">Visa, Mastercard, Amex</div>
                </div>
                <v-switch v-model="creditEnabled" color="primary" hide-details inset />
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card rounded="xl" variant="outlined" color="grey-lighten-3">
              <v-card-text class="d-flex align-center ga-3">
                <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
                  <v-icon>mdi-qrcode</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-subtitle-2 font-weight-bold">QR Code</div>
                  <div class="text-caption text-medium-emphasis">ABA Pay, Wing, KHQR</div>
                </div>
                <v-switch v-model="qrCodeEnabled" color="primary" hide-details inset />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ── Actions ── -->
    <div class="d-flex justify-end ga-3">
      <v-btn variant="outlined" rounded="lg" size="large">Cancel</v-btn>
      <v-btn color="primary" rounded="lg" size="large" variant="flat" :loading="saving" @click="saveSettings">
        Save Changes
      </v-btn>
    </div>

    <!-- ── Snackbar ── -->
    <v-snackbar v-model="snackbar" color="success" rounded="lg" :timeout="3000" location="bottom right">
      <v-icon class="mr-2">mdi-check-circle-outline</v-icon>
      Settings saved successfully.
    </v-snackbar>
  </div>
</template>