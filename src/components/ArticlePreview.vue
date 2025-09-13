<template>
  <div class="article-preview-container" :class="[pageTheme, 'card-theme', theme]">
    <div class="article-content content-rich" v-html="html"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  html: { type: String, default: '' },
  theme: { type: String, default: 'classic' },
  pageTheme: { type: String, default: 'dark' }, // 'light' | 'dark' - 保留用于未来可能的需求
})
</script>

<style scoped>
.article-preview-container {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: var(--bg);
}

.article-content {
  width: 496px;
  margin: 0 auto;
  padding: 1rem;
  background: var(--card-bg);
  color: var(--card-text);
  border-radius: 8px;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--card-accent) 20%, transparent);
}
</style>
