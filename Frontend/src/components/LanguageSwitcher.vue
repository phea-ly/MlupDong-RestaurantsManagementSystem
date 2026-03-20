<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { locale } = useI18n()

const languages = [
  { name: 'English', short: 'EN', code: 'en', flag: '🇺🇸' },
  { name: 'ភាសាខ្មែរ', short: 'KH', code: 'kh', flag: '🇰🇭' }
]

const currentLanguage = computed(() => 
  languages.find(l => l.code === locale.value) || languages[0]
)

const changeLanguage = (code) => {
  locale.value = code
  localStorage.setItem('locale', code)
}
</script>

<template>
  <v-menu 
    transition="slide-y-transition" 
    offset="4"
    content-class="classic-lang-menu"
  >
    <template v-slot:activator="{ props, isActive }">
      <div 
        v-bind="props" 
        class="classic-dropdown-activator d-flex align-center px-3"
      >
        <div class="flag-wrapper mr-3">
          <span class="flag-emoji">{{ currentLanguage.flag }}</span>
        </div>
        <span class="lang-text font-weight-bold">{{ currentLanguage.name }}</span>
        <v-icon size="16" class="ml-auto text-grey-darken-1">
          {{ isActive ? 'mdi-menu-up' : 'mdi-menu-down' }}
        </v-icon>
      </div>
    </template>

    <v-card class="classic-lang-card" elevation="4">
      <v-list class="pa-0">
        <v-list-item
          v-for="lang in languages"
          :key="lang.code"
          @click="changeLanguage(lang.code)"
          class="lang-item py-2 px-3 border-b border-light"
          :active="locale === lang.code"
        >
          <template v-slot:prepend>
            <div class="flag-wrapper mr-3">
              <span class="flag-emoji">{{ lang.flag }}</span>
            </div>
          </template>
          <v-list-item-title class="lang-item-text font-weight-medium">
            {{ lang.name }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<style scoped>
.classic-dropdown-activator {
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  height: 48px;
  min-width: 180px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.classic-dropdown-activator:hover {
  border-color: #c0c4cc;
  background-color: #f5f7fa;
}

.flag-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  width: 32px;
  height: 22px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.flag-emoji {
  font-size: 20px;
  line-height: 1;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
}

.lang-text {
  font-size: 15px;
  color: #303133;
}

.classic-lang-card {
  border: 1px solid #dcdfe6;
  border-radius: 6px !important;
  overflow: hidden;
}

.lang-item {
  transition: background-color 0.2s ease;
}

.lang-item:hover {
  background-color: #f5f7fa !important;
}

.lang-item-text {
  font-size: 14px;
  color: #303133;
}

.border-b {
  border-bottom: 1px solid #f2f6fc;
}

:deep(.v-list-item--active) {
  background-color: #f0fdf4 !important;
}

:deep(.v-list-item--active .lang-item-text) {
  color: var(--app-primary-600) !important;
}
</style>


