<template>
  <div class="article-preview-container" :class="[pageTheme, 'card-theme', theme]">
    <div ref="articleContentRef" class="article-content content-rich" v-html="highlightedHtml"></div>
    <LoadingOverlay :show="isExporting" :text="loadingText" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import * as htmlToImage from 'html-to-image'
import { highlightCodeBlocks } from '../utils/highlight.js'
import { useToast } from '../composables/useToast.js'
import { useI18n } from 'vue-i18n'
import LoadingOverlay from './LoadingOverlay.vue'

const props = defineProps({
  html: { type: String, default: '' },
  theme: { type: String, default: 'classic' },
  pageTheme: { type: String, default: 'theme-dark' }, // 'theme-light' | 'theme-dark'
})

const { t } = useI18n()
const { success, error } = useToast()
const articleContentRef = ref(null)
const isExporting = ref(false)
const loadingText = ref('')

// Apply syntax highlighting to HTML
const highlightedHtml = computed(() => {
  return highlightCodeBlocks(props.html)
})

// Export article as image
async function exportArticle() {
  if (!articleContentRef.value || !props.html) {
    error(t('messages.emptyContent') || '无法找到长文内容')
    return
  }

  isExporting.value = true
  loadingText.value = '正在准备导出...'

  try {
    // 保存原始样式
    const original = {
      borderRadius: articleContentRef.value.style.borderRadius,
      boxShadow: articleContentRef.value.style.boxShadow,
      width: articleContentRef.value.style.width,
      maxWidth: articleContentRef.value.style.maxWidth,
      minWidth: articleContentRef.value.style.minWidth
    }

    loadingText.value = '正在调整导出样式...'

    // 临时调整样式用于导出
    articleContentRef.value.style.borderRadius = '0'
    articleContentRef.value.style.boxShadow = 'none'
    articleContentRef.value.style.width = 'auto'
    articleContentRef.value.style.maxWidth = 'none'
    articleContentRef.value.style.minWidth = '600px'

    // 等待样式应用
    await new Promise(resolve => setTimeout(resolve, 200))

    loadingText.value = '正在生成图片...'

    const dataUrl = await htmlToImage.toPng(articleContentRef.value, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      style: {
        borderRadius: '0',
        boxShadow: 'none',
        width: 'auto',
        maxWidth: 'none',
        minWidth: '600px'
      }
    })

    // 恢复原始样式
    articleContentRef.value.style.borderRadius = original.borderRadius
    articleContentRef.value.style.boxShadow = original.boxShadow
    articleContentRef.value.style.width = original.width
    articleContentRef.value.style.maxWidth = original.maxWidth
    articleContentRef.value.style.minWidth = original.minWidth

    loadingText.value = '正在保存文件...'

    // 创建下载链接
    const link = document.createElement('a')
    link.download = `长文_${new Date().toISOString().slice(0, 10)}.png`
    link.href = dataUrl
    link.click()

    success(t('messages.exportSuccess') || '长文保存成功')
  } catch (err) {
    console.error('导出长文失败:', err)
    error(t('messages.exportFailed') || '导出长文失败，请重试')
  } finally {
    isExporting.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  exportArticle
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
