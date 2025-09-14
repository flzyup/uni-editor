<template>
  <div class="language-switch">
    <select
      class="select"
      :value="currentLocale"
      @change="changeLanguage"
      :title="$t('header.language')"
    >
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { saveLanguage } from '../locales/index.js'

const { locale } = useI18n()

const currentLocale = computed(() => locale.value)

function changeLanguage(event) {
  const newLocale = event.target.value
  locale.value = newLocale
  saveLanguage(newLocale)
}
</script>

<style scoped>
.language-switch {
  display: flex;
  align-items: center;
  gap: 6px;
}

.select {
  background: var(--panel);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
}

.select:hover {
  border-color: var(--accent);
}

.select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 25%, transparent);
}
</style>