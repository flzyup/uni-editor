<template>
  <div class="article-preview-container" :class="['article-theme', theme]">
    <div class="article-content" v-html="html"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  html: { type: String, default: '' },
  theme: { type: String, default: 'classic' },
})
</script>

<style scoped>
.article-preview-container {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: var(--ed-bg);
  color: var(--ed-text);
}

.article-content {
  max-width: 800px;
  margin: 0 auto;
  font-family: var(--ed-body-font);
  line-height: 1.8;
  font-size: 16px;
}

/* 应用编辑器主题样式到长文模式 */
.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  font-family: var(--ed-h-font);
  font-weight: 700;
  color: var(--ed-accent);
  margin: 1.4em 0 0.6em 0;
}

.article-content :deep(h1) { font-size: 2em; }
.article-content :deep(h2) { font-size: 1.5em; }
.article-content :deep(h3) { font-size: 1.25em; }

.article-content :deep(p) {
  margin: 0.8em 0;
  text-align: justify;
}

.article-content :deep(a) {
  color: var(--ed-accent);
  text-decoration: none;
  border-bottom: 1px solid var(--ed-accent);
}

.article-content :deep(a:hover) {
  border-bottom-style: solid;
}

.article-content :deep(blockquote) {
  border-left: 4px solid var(--ed-quote);
  background: color-mix(in srgb, var(--ed-quote) 12%, transparent);
  color: var(--ed-text);
  padding: 12px 16px;
  margin: 16px 0;
  border-radius: 4px;
  font-style: italic;
}

.article-content :deep(pre) {
  background: var(--ed-code-bg);
  color: var(--ed-text);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.article-content :deep(code) {
  background: color-mix(in srgb, var(--ed-code-bg) 65%, transparent);
  color: var(--ed-text);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', Monaco, monospace;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 24px;
  margin: 12px 0;
}

.article-content :deep(li) {
  margin: 4px 0;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.article-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
  border: 2px solid var(--ed-accent);
  border-radius: 8px;
  overflow: hidden;
}

.article-content :deep(th),
.article-content :deep(td) {
  border: 1px solid color-mix(in srgb, var(--ed-accent) 30%, transparent);
  padding: 8px 12px;
  text-align: left;
}

.article-content :deep(th) {
  background: color-mix(in srgb, var(--ed-accent) 25%, transparent);
  font-weight: 600;
  color: var(--ed-text);
}

.article-content :deep(tr:nth-child(even) td) {
  background: color-mix(in srgb, var(--ed-accent) 8%, transparent);
}
</style>