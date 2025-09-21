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

<style lang="less" scoped>
@import '../styles/less/variables/colors.less';
@import '../styles/less/variables/layout.less';
@import '../styles/less/variables/typography.less';
@import '../styles/less/mixins/common.less';
.language-switch {
  .flex-start();
  gap: 6px;
}

</style>
