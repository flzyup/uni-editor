<template>
  <div class="editor-wrap">
    <div ref="elRef" class="vditor-host"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import zhMessages from '../locales/zh.js'
import enMessages from '../locales/en.js'

const props = defineProps({
  pageTheme: { type: String, default: 'theme-dark' },
  document: { type: Object, default: null },
})
const emit = defineEmits(['update:html', 'update:content', 'update:mode', 'editorScroll'])

const { locale } = useI18n()

const elRef = ref(null)
let vd = null
let isVditorReady = false
let suppressNextInput = false
const scrollCleanups = []

// 获取当前文档内容
function getCurrentContent() {
  return props.document?.content ?? ''
}

// 获取当前文档模式
function getCurrentMode() {
  if (props.document && props.document.mode) {
    return props.document.mode
  }
  return 'wysiwyg'
}

function getDefaultContent() {
  return ''
}

function getEditorTheme(v) {
  return v === 'theme-dark' ? 'dark' : 'classic'
}

function getVditorLang(locale) {
  const langMap = {
    'zh': 'zh_CN',
    'en': 'en_US'
  }
  return langMap[locale] || 'en_US'
}

// 初始化编辑器
async function initVditor() {
  if (!elRef.value) return

  const initialContent = getCurrentContent()
  const initialMode = getCurrentMode()

  vd = new Vditor(elRef.value, {
    value: initialContent,
    cache: { enable: false },
    height: '100%',
    mode: initialMode,
    lang: getVditorLang(locale.value),
    theme: getEditorTheme(props.pageTheme),
    toolbarConfig: { pin: true },
    toolbar: [
      'headings', 'bold', 'italic', 'strike', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', 'outline', '|',
      'quote', 'line', 'code', 'inline-code',
      'table', 'insert-before', 'insert-after', '|',
      'line', 'link', 'emoji', '|',
      'undo', 'redo', '|',
      'edit-mode',
    ],
    counter: { enable: true },
    upload: { accept: 'image/*' },
    preview: {
      theme: {
        current: getEditorTheme(props.pageTheme),
        path: 'https://unpkg.com/vditor/dist/css/content-theme'
      },
      hljs: {
        style: getEditorTheme(props.pageTheme) === 'dark' ? 'github-dark' : 'github'
      }
    },
    hint: { delay: 500 },
    typewriterMode: false,
    after: () => {
      isVditorReady = true
      console.log('Vditor ready for document:', props.document?.id)

      // 绑定滚动事件
      bindScrollEvents()

      // 初始化时发送内容
      if (vd) {
        emit('update:html', vd.getHTML())
        emit('update:content', vd.getValue())
      }
    },
    input: (value) => {
      if (!suppressNextInput && isVditorReady) {
        // 同时发送HTML（用于预览）和Markdown（用于存储）
        emit('update:html', vd.getHTML())
        emit('update:content', vd.getValue())
      }
      suppressNextInput = false
    },
    select: () => {
      if (isVditorReady) {
        emit('update:html', vd.getHTML())
        emit('update:content', vd.getValue())
      }
    },
    blur: () => {
      if (isVditorReady) {
        emit('update:html', vd.getHTML())
        emit('update:content', vd.getValue())
      }
    }
  })
}

// 绑定滚动事件
function bindScrollEvents() {
  if (!vd || !vd.vditor?.element) return

  // 清理之前的事件监听
  scrollCleanups.forEach(cleanup => cleanup())
  scrollCleanups.length = 0

  // 查找所有可能的滚动容器
  const scrollContainers = [
    vd.vditor.element.querySelector('.vditor-content'),
    vd.vditor.element.querySelector('.vditor-ir'),
    vd.vditor.element.querySelector('.vditor-wysiwyg'),
    vd.vditor.element.querySelector('.vditor-sv'),
    vd.vditor.element.querySelector('.vditor-preview'),
  ].filter(Boolean)

  scrollContainers.forEach(container => {
    if (container) {
      const scrollHandler = () => {
        const scrollTop = container.scrollTop
        const scrollHeight = container.scrollHeight
        const clientHeight = container.clientHeight
        const scrollRatio = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0
        emit('editorScroll', { scrollRatio, scrollTop })
      }

      container.addEventListener('scroll', scrollHandler, { passive: true })
      scrollCleanups.push(() => {
        container.removeEventListener('scroll', scrollHandler)
      })
    }
  })
}

// 切换模式
function switchMode(mode) {
  if (vd && isVditorReady) {
    const currentMode = vd.getCurrentMode()
    if (currentMode !== mode) {
      // 先保存当前内容
      const currentContent = vd.getValue()

      // 重新初始化编辑器以切换模式
      destroyVditor()
      nextTick(() => {
        initVditor().then(() => {
          if (vd && isVditorReady) {
            vd.setValue(currentContent, false)
          }
        })
        emit('update:mode', mode)
      })
    }
  }
}

// 设置内容
function setContent(content) {
  if (vd && isVditorReady) {
    const finalContent = content || getDefaultContent()
    suppressNextInput = true
    // 使用 setValue 方法，第二个参数 false 表示清空撤销栈
    vd.setValue(finalContent, false)
  }
}

// 获取内容
function getContent() {
  return vd && isVditorReady ? vd.getValue() : ''
}

// 监听文档变化
watch(() => props.document, (newDoc, oldDoc) => {
  if (!newDoc) return

  if (!oldDoc || newDoc.id !== oldDoc.id) {
    // 文档切换，更新内容
    console.log('Document switched:', newDoc.id)
    setContent(newDoc.content)

    // 如果模式不同，也要切换模式
    if (newDoc.mode !== getCurrentMode()) {
      switchMode(newDoc.mode)
    }
  }
}, { immediate: true })

// 监听主题变化
watch(() => props.pageTheme, (newTheme) => {
  if (vd && isVditorReady) {
    vd.setTheme(
      getEditorTheme(newTheme),
      getEditorTheme(newTheme),
      getEditorTheme(newTheme) === 'dark' ? 'github-dark' : 'github'
    )
  }
})

// 监听语言变化
watch(locale, (newLocale) => {
  if (vd && isVditorReady) {
    // 重新初始化编辑器以应用新语言
    destroyVditor()
    nextTick(() => {
      initVditor()
    })
  }
})

// 销毁编辑器
function destroyVditor() {
  if (vd) {
    try {
      scrollCleanups.forEach(cleanup => cleanup())
      scrollCleanups.length = 0
      vd.destroy()
    } catch (error) {
      console.warn('Error destroying Vditor:', error)
    }
    vd = null
    isVditorReady = false
  }
}

onMounted(() => {
  nextTick(() => {
    initVditor()
  })
})

onBeforeUnmount(() => {
  destroyVditor()
})

// 暴露方法给父组件
defineExpose({
  getContent,
  setContent,
  switchMode,
  focus: () => vd?.focus(),
  blur: () => vd?.blur(),
  insertValue: (value) => vd?.insertValue(value),
  getValue: () => vd?.getValue(),
  getHTML: () => vd?.getHTML(),
  getMarkdown: () => vd?.getValue()
})
</script>

<style scoped>
.editor-wrap {
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
}

.vditor-host {
  flex: 1;
  min-height: 0;
  display: flex;
}

/* 确保编辑器占满容器 */
:deep(.vditor) {
  border: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

:deep(.vditor .vditor-workspace) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.vditor .vditor-content) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  height: auto !important;
  display: flex;
}

:deep(.vditor .vditor-content .vditor-reset) {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 工具栏主题样式 */
:deep(.vditor-toolbar) {
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  border-top: none;
  border-left: none;
  border-right: none;
}

:deep(.vditor-toolbar__item) {
  color: var(--muted);
}

:deep(.vditor-toolbar__item:hover) {
  background: var(--bg-hover);
  color: var(--text);
}

:deep(.vditor-toolbar__item--current) {
  background: var(--bg-hover);
  color: var(--primary);
}

:deep(.vditor-toolbar__item button) {
  color: inherit;
  background: transparent;
  border: none;
}

:deep(.vditor-toolbar__item svg) {
  fill: currentColor;
}

/* 编辑区域样式 */
:deep(.vditor-content .vditor-reset) {
  padding: 16px 24px;
  background: var(--bg-primary);
  color: var(--text);
}

/* WYSIWYG模式样式 */
:deep(.vditor-wysiwyg) {
  background: var(--bg-primary);
  color: var(--text);
}

:deep(.vditor-wysiwyg .vditor-reset) {
  background: var(--bg-primary);
  color: var(--text);
}

/* IR模式样式 */
:deep(.vditor-ir) {
  background: var(--bg-primary);
  color: var(--text);
}

:deep(.vditor-ir .vditor-reset) {
  background: var(--bg-primary);
  color: var(--text);
}

/* SV模式样式 */
:deep(.vditor-sv) {
  background: var(--bg-primary);
  color: var(--text);
}

:deep(.vditor-sv .vditor-reset) {
  background: var(--bg-primary);
  color: var(--text);
}

/* 预览区域样式 */
:deep(.vditor-preview) {
  background: var(--bg-primary);
  color: var(--text);
}

/* 分割线样式 */
:deep(.vditor-resize) {
  background: var(--border);
}

/* 计数器样式 */
:deep(.vditor-counter) {
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
}
</style>
