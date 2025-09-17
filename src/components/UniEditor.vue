<template>
  <div class="editor-wrap">
    <div ref="elRef" class="vditor-host"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, defineExpose } from 'vue'
import { useI18n } from 'vue-i18n'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import zhMessages from '../locales/zh.js'
import enMessages from '../locales/en.js'

const props = defineProps({
  pageTheme: { type: String, default: 'theme-dark' }, // 'theme-light' | 'theme-dark'
})
const emit = defineEmits(['update:html'])

const { locale } = useI18n()

const elRef = ref(null)
let vd = null
let isVditorReady = false

const CACHE_KEY = 'uni-editor-content'
const MODE_CACHE_KEY = 'uni-editor-mode'

function loadCachedContent() {
  try {
    return localStorage.getItem(CACHE_KEY) || getDefaultContent()
  } catch (e) {
    return getDefaultContent()
  }
}

function loadCachedMode() {
  try {
    const savedMode = localStorage.getItem(MODE_CACHE_KEY)
    // Vditor 支持的模式: 'wysiwyg', 'ir', 'sv'
    return ['wysiwyg', 'ir', 'sv'].includes(savedMode) ? savedMode : 'wysiwyg'
  } catch (e) {
    return 'wysiwyg'
  }
}

function saveModeToCache(mode) {
  try {
    localStorage.setItem(MODE_CACHE_KEY, mode)
  } catch (e) {
    console.warn('Failed to save editor mode to localStorage:', e)
  }
}

function getDefaultContent() {
  // 根据当前语言返回默认内容
  const currentLocale = locale.value

  // 获取对应语言的默认模板
  const messages = {
    'zh': zhMessages,
    'en': enMessages
  }

  const message = messages[currentLocale] || messages['en']
  return message.defaultTemplate
}

function saveContent(content) {
  try {
    localStorage.setItem(CACHE_KEY, content)
  } catch (e) {
    console.warn('Failed to save content to localStorage:', e)
  }
}

const initial = loadCachedContent()
const initialMode = loadCachedMode()

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

onMounted(async () => {
  vd = new Vditor(elRef.value, {
    value: initial,
    cache: { enable: false },
    height: '100%',
    mode: initialMode,
    lang: getVditorLang(locale.value),
    toolbarConfig: { pin: true },
    toolbar: [
      'headings', 'bold', 'italic', 'strike', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', 'outline', '|',
      'quote', 'line', 'code', 'inline-code', '|',
      'table', 'insert-before', 'insert-after','|',
      'line', 'link', 'emoji', '|', //'upload',
      'undo', 'redo', '|',
      'edit-mode', 'both',
      'code-theme','content-theme',  '|',
      'edit-mode', 'export'
      // 'devtools', '|'
    ],
    counter: { enable: true },
    upload: { accept: 'image/*' },
    input: () => emitHtml(),
    after: () => {
      isVditorReady = true
      vd.setTheme(getEditorTheme(props.pageTheme))
      emitHtml()
      // 添加模式变化监听
      addModeChangeListener()
    },
  })
  window.addEventListener('keydown', onKey)
})

watch(() => props.pageTheme, async (v) => {
  if (vd && isVditorReady) {
    try {
      vd.setTheme(getEditorTheme(v))
    } catch (error) {
      console.warn('Failed to set Vditor theme:', error)
    }
  }
})

// 监听语言变化，重新初始化Vditor（因为Vditor没有动态切换语言的API）
watch(locale, async (newLocale) => {
  if (vd && isVditorReady) {
    // 保存当前内容
    const currentContent = vd.getValue()

    // 销毁当前实例
    try {
      vd.destroy()
    } catch (error) {
      console.warn('Failed to destroy Vditor:', error)
    }

    // 重新初始化
    await nextTick()
    vd = new Vditor(elRef.value, {
      value: currentContent,
      cache: { enable: false },
      height: '100%',
      mode: loadCachedMode(), // 使用缓存的模式
      lang: getVditorLang(newLocale),
      toolbarConfig: { pin: true },
      toolbar: [
        'headings', 'bold', 'italic', 'strike', '|',
        'list', 'ordered-list', 'check', 'outdent', 'indent', 'outline', '|',
        'quote', 'line', 'code', 'inline-code', '|',
        'table', 'insert-before', 'insert-after','|',
        'line', 'link', 'emoji', '|', //'upload',
        'undo', 'redo', '|',
        'edit-mode', 'both',
        'code-theme','content-theme',  '|',
        'export'
        // 'devtools', '|'
      ],
      counter: { enable: true },
      upload: { accept: 'image/*' },
      input: () => emitHtml(),
      after: () => {
        isVditorReady = true
        vd.setTheme(getEditorTheme(props.pageTheme))
        emitHtml()
        // 重新添加模式变化监听
        addModeChangeListener()
      },
    })
  }
})

function emitHtml() {
  if (!vd) return
  try {
    const html = vd.getHTML()
    emit('update:html', html)
    // 保存内容到localStorage
    const content = vd.getValue()
    saveContent(content)
  } catch (e) {
    // 某些版本如返回 Promise，可兼容处理
    Promise.resolve(vd.getHTML()).then((html) => {
      emit('update:html', html)
      const content = vd.getValue()
      saveContent(content)
    })
  }
}

function getHTML() {
  return vd?.getHTML?.() || Promise.resolve('')
}

onBeforeUnmount(() => {
  isVditorReady = false
  if (vd) {
    vd.destroy?.()
    vd = null
  }
  window.removeEventListener('keydown', onKey)
})

function addModeChangeListener() {
  if (!vd || !vd.vditor?.element) return

  // 监听编辑模式按钮点击
  const toolbar = vd.vditor.element.querySelector('.vditor-toolbar')
  if (toolbar) {
    // 查找编辑模式相关的按钮
    const modeButtons = toolbar.querySelectorAll('[data-type="edit-mode"], [data-type="both"]')

    modeButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 延迟检查模式变化，因为 Vditor 需要时间更新
        setTimeout(() => {
          if (vd && vd.vditor) {
            // 检查当前活跃的编辑器类型
            let currentMode = 'wysiwyg' // 默认值

            if (vd.vditor.sv && vd.vditor.sv.element.style.display !== 'none') {
              currentMode = 'sv'
            } else if (vd.vditor.ir && vd.vditor.ir.element.style.display !== 'none') {
              currentMode = 'ir'
            } else if (vd.vditor.wysiwyg && vd.vditor.wysiwyg.element.style.display !== 'none') {
              currentMode = 'wysiwyg'
            }

            saveModeToCache(currentMode)
          }
        }, 150)
      })
    })
  }
}

function onKey(e) {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
  const z = e.key.toLowerCase() === 'z'
  if ((isMac ? e.metaKey : e.ctrlKey) && z) {
    e.preventDefault()
    if (e.shiftKey) document.execCommand('redo')
    else document.execCommand('undo')
  }
}

defineExpose({ getHTML })
</script>

<style scoped>
.editor-wrap { height: 100%; min-height: 0; display: flex; }
.vditor-host { border-top: 1px solid var(--border); flex: 1; min-height: 0; }
:deep(.vditor) { background: var(--panel); color: var(--text); border: none; }
:deep(.vditor .vditor-toolbar) {
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}
/* 提升深色模式下工具栏可读性 */
:deep(.vditor .vditor-toolbar) .vditor-tooltipped,
:deep(.vditor .vditor-toolbar) button,
:deep(.vditor .vditor-toolbar) svg,
:deep(.vditor .vditor-toolbar) path {
  color: var(--text) !important;
  fill: var(--text) !important;
  stroke: var(--text) !important;
}
/* Vditor 工具栏按钮悬停和激活状态，使用统一主题色 */
:deep(.vditor .vditor-toolbar button:hover) {
  background: color-mix(in srgb, var(--accent) 15%, var(--panel)) !important;
  border-color: var(--accent) !important;
  color: var(--text) !important;
  fill: var(--text) !important;
  stroke: var(--text) !important;
  transform: translateY(-1px);
}
:deep(.vditor .vditor-toolbar button:active) {
  background: color-mix(in srgb, var(--accent) 25%, var(--panel)) !important;
  transform: translateY(0px);
}
/* Vditor 工具栏按钮激活状态（选中状态）*/
:deep(.vditor .vditor-toolbar button.vditor-toolbar--current) {
  background: color-mix(in srgb, var(--accent) 20%, var(--panel)) !important;
  border-color: var(--accent) !important;
  color: var(--text) !important;
}
/* Vditor 分隔符样式 */
:deep(.vditor .vditor-toolbar .vditor-toolbar__divider) {
  background: var(--border) !important;
}
/* Vditor 下拉菜单样式 */
:deep(.vditor .vditor-panel) {
  background: var(--panel) !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 15%, transparent) !important;
}
:deep(.vditor .vditor-panel button) {
  color: var(--text) !important;
  background: transparent !important;
  border: none !important;
}
:deep(.vditor .vditor-panel button:hover) {
  background: color-mix(in srgb, var(--accent) 15%, var(--panel)) !important;
}
/* Vditor tooltip 样式 */
:deep(.vditor-tooltipped__tip) {
  background: var(--panel) !important;
  color: var(--text) !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 10%, transparent) !important;
}
:deep(.vditor-reset) { color: var(--ed-text); }
:deep(.vditor-reset a) { color: var(--ed-accent); }
:deep(.vditor-reset blockquote) { border-left: 3px solid var(--ed-accent); background: color-mix(in oklab, var(--ed-accent) 10%, transparent); }
</style>
