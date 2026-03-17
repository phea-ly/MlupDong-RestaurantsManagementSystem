import { defineStore } from "pinia";
import { ref } from "vue";
import { settingsApi } from "@/api/settings.api";

export const useSettingsStore = defineStore("settings", () => {
  const language = ref("en");
  const timezone = ref("(GMT+07:00) Indochina Time");
  const currency = ref("USD (USD)");
  const restaurantName = ref("");
  const phone = ref("");
  const address = ref("");
  const cashEnabled = ref(true);
  const creditEnabled = ref(true);
  const qrCodeEnabled = ref(true);
  const saving = ref(false);
  const loading = ref(false);
  const snackbar = ref(false);
  const errorMessage = ref("");

  const logoFile = ref(null);
  const logoPreview = ref(null);
  const logoInput = ref(null);

  const languages = [
    { title: "English", value: "en" },
    { title: "Khmer", value: "km" },
    { title: "French", value: "fr" },
    { title: "Chinese", value: "zh" },
  ];
  const timezones = [
    "(GMT+07:00) Indochina Time",
    "(GMT-05:00) Eastern Time",
    "(GMT+00:00) UTC",
  ];
  const currencies = ["USD (USD)", "KHR (KHR)", "EUR (EUR)", "THB (THB)"];

  function applySettings(data) {
    language.value = data.language ?? language.value;
    timezone.value = data.timezone ?? timezone.value;
    currency.value = data.currency ?? currency.value;
    restaurantName.value = data.restaurant_name ?? restaurantName.value;
    phone.value = data.phone ?? phone.value;
    address.value = data.address ?? address.value;
    cashEnabled.value = data.cash_enabled ?? cashEnabled.value;
    creditEnabled.value = data.credit_enabled ?? creditEnabled.value;
    qrCodeEnabled.value = data.qr_code_enabled ?? qrCodeEnabled.value;
    logoPreview.value = data.logo_path ?? logoPreview.value;
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
    reader.onload = (ev) => {
      logoPreview.value = ev.target.result;
    };
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
      payload.append("language", language.value);
      payload.append("timezone", timezone.value);
      payload.append("currency", currency.value);
      payload.append("restaurant_name", restaurantName.value);
      payload.append("phone", phone.value);
      payload.append("address", address.value);
      payload.append("cash_enabled", cashEnabled.value ? "1" : "0");
      payload.append("credit_enabled", creditEnabled.value ? "1" : "0");
      payload.append("qr_code_enabled", qrCodeEnabled.value ? "1" : "0");
      payload.append("logo", logoFile.value);
    } else {
      payload = {
        language: language.value,
        timezone: timezone.value,
        currency: currency.value,
        restaurant_name: restaurantName.value,
        phone: phone.value,
        address: address.value,
        cash_enabled: cashEnabled.value,
        credit_enabled: creditEnabled.value,
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
