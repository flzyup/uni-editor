<template>
  <div class="article-preview-container" :class="[pageTheme, 'card-theme', theme]">
    <div ref="articleContentRef" class="article-content content-rich" v-html="highlightedHtml"></div>
    <LoadingOverlay
      :show="isExporting"
      :text="loadingText"
      :theme="theme"
      :pageTheme="pageTheme"
    />
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
  loadingText.value = t('loading.articlePreparing')

  try {
    // 保存原始样式
    const original = {
      borderRadius: articleContentRef.value.style.borderRadius,
      boxShadow: articleContentRef.value.style.boxShadow,
      width: articleContentRef.value.style.width,
      maxWidth: articleContentRef.value.style.maxWidth,
      minWidth: articleContentRef.value.style.minWidth,
      transform: articleContentRef.value.style.transform,
      transformOrigin: articleContentRef.value.style.transformOrigin
    }

    // 声明在更大作用域中
    let allElements = []
    let elementStyles = []
    let listItemData = []

    loadingText.value = t('loading.articleAdjusting')

    // 临时调整样式用于导出，保持与预览一致的宽度
    articleContentRef.value.style.borderRadius = '0'
    articleContentRef.value.style.boxShadow = 'none'
    articleContentRef.value.style.width = '496px'
    articleContentRef.value.style.maxWidth = '496px'
    articleContentRef.value.style.minWidth = '496px'
    articleContentRef.value.style.transform = 'none'
    articleContentRef.value.style.transformOrigin = 'initial'

    // 清理内容中可能导致错位的样式
    allElements = Array.from(articleContentRef.value.querySelectorAll('*'))
    elementStyles = []

    allElements.forEach((el, index) => {
      // 保存原始样式
      elementStyles[index] = {
        transform: el.style.transform,
        transformOrigin: el.style.transformOrigin,
        position: el.style.position,
        top: el.style.top,
        left: el.style.left,
        right: el.style.right,
        bottom: el.style.bottom
      }

      // 清理可能导致错位的样式
      if (el.style.transform && el.style.transform !== 'none') {
        el.style.transform = 'none'
      }
      if (el.style.position === 'absolute' || el.style.position === 'fixed') {
        el.style.position = 'static'
      }
    })

    // 修复有序列表编号显示问题
    const orderedLists = articleContentRef.value.querySelectorAll('ol')
    listItemData = []

    orderedLists.forEach((ol, olIndex) => {
      const items = ol.querySelectorAll('li')
      listItemData[olIndex] = []

      items.forEach((li, liIndex) => {
        // 保存原始::before内容
        const computedStyle = window.getComputedStyle(li, '::before')
        listItemData[olIndex][liIndex] = {
          element: li,
          originalContent: computedStyle.content,
          actualNumber: liIndex + 1
        }

        // 创建实际的数字元素替换CSS counter
        const numberSpan = document.createElement('span')
        numberSpan.className = 'export-list-number'
        numberSpan.textContent = (liIndex + 1).toString()
        numberSpan.style.cssText = `
          position: absolute;
          top: 50%;
          left: 0;
          width: 16px;
          height: 16px;
          border-radius: 8px;
          background: var(--card-accent);
          color: white;
          font-size: 10px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(-50%);
          z-index: 2;
          box-shadow:
            0 0 6px color-mix(in srgb, var(--card-accent) 80%, transparent),
            0 0 12px color-mix(in srgb, var(--card-accent) 40%, transparent);
        `

        // 暂时隐藏::before伪元素
        li.style.setProperty('--before-display', 'none')
        li.insertBefore(numberSpan, li.firstChild)
      })
    })

    // 等待样式应用
    await new Promise(resolve => setTimeout(resolve, 300))

    loadingText.value = t('loading.articleGenerating')

    // 获取当前主题的颜色值
    const computedStyle = window.getComputedStyle(articleContentRef.value)
    const cardBgColor = computedStyle.getPropertyValue('background-color') || '#ffffff'
    const cardTextColor = computedStyle.getPropertyValue('color') || '#333333'

    // 获取主题色（从容器的CSS变量中获取）
    const containerStyle = window.getComputedStyle(articleContentRef.value.parentElement)
    const accentColor = containerStyle.getPropertyValue('--card-accent') || '#3b82f6'

    // 创建宣传 footer 元素
    const footer = document.createElement('div')
    footer.className = 'export-footer'
    footer.innerHTML = `
      <div class="footer-divider"></div>
      <div class="footer-content">
        <span class="footer-text">${t('footer.exportCredit')}</span>
        <span class="footer-link">${t('footer.exportLink')}</span>
      </div>
    `
    footer.style.cssText = `
      margin-top: 40px;
      padding: 20px 0;
      text-align: center;
      font-size: 12px;
      color: ${cardTextColor};
      opacity: 0.6;
    `
    footer.querySelector('.footer-divider').style.cssText = `
      width: 60px;
      height: 1px;
      background: ${accentColor};
      margin: 0 auto 12px;
      opacity: 0.3;
    `
    footer.querySelector('.footer-content').style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    `
    footer.querySelector('.footer-text').style.cssText = `
      font-weight: 500;
    `
    footer.querySelector('.footer-link').style.cssText = `
      font-family: 'Courier New', monospace;
      font-weight: 400;
      opacity: 0.8;
    `

    // 临时添加 footer
    articleContentRef.value.appendChild(footer)

    // 使用更保守的配置来避免渲染问题
    const dataUrl = await htmlToImage.toPng(articleContentRef.value, {
      quality: 1,
      pixelRatio: 1,  // 降低像素比例避免渲染问题
      backgroundColor: cardBgColor,
      cacheBust: true,  // 避免缓存问题
      imagePlaceholder: undefined,
      skipAutoScale: true,
      style: {
        borderRadius: '0',
        boxShadow: 'none',
        width: '496px',
        maxWidth: '496px',
        minWidth: '496px',
        transform: 'none',
        transformOrigin: 'initial',
        position: 'relative',
        display: 'block',
        margin: '0',
        padding: '16px',
        boxSizing: 'border-box'
      }
    })

    // 移除临时 footer
    articleContentRef.value.removeChild(footer)

    // 清理有序列表的临时数字元素
    const exportNumbers = articleContentRef.value.querySelectorAll('.export-list-number')
    exportNumbers.forEach(span => span.remove())

    // 恢复列表项的原始样式
    listItemData.forEach((olData, olIndex) => {
      olData.forEach((itemData, liIndex) => {
        itemData.element.style.removeProperty('--before-display')
      })
    })

    // 恢复所有元素的原始样式
    allElements.forEach((el, index) => {
      if (elementStyles[index]) {
        el.style.transform = elementStyles[index].transform || ''
        el.style.transformOrigin = elementStyles[index].transformOrigin || ''
        el.style.position = elementStyles[index].position || ''
        el.style.top = elementStyles[index].top || ''
        el.style.left = elementStyles[index].left || ''
        el.style.right = elementStyles[index].right || ''
        el.style.bottom = elementStyles[index].bottom || ''
      }
    })

    // 恢复原始样式
    articleContentRef.value.style.borderRadius = original.borderRadius
    articleContentRef.value.style.boxShadow = original.boxShadow
    articleContentRef.value.style.width = original.width
    articleContentRef.value.style.maxWidth = original.maxWidth
    articleContentRef.value.style.minWidth = original.minWidth
    articleContentRef.value.style.transform = original.transform
    articleContentRef.value.style.transformOrigin = original.transformOrigin

    loadingText.value = t('loading.articleSaving')

    // 创建下载链接
    const link = document.createElement('a')
    link.download = `长文_${new Date().toISOString().slice(0, 10)}.png`
    link.href = dataUrl
    link.click()

    success(t('loading.articleSuccess'))
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
