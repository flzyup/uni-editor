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

function loadCachedContent() {
  try {
    return localStorage.getItem(CACHE_KEY) || getDefaultContent()
  } catch (e) {
    return getDefaultContent()
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
    mode: 'ir',
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
      mode: 'ir',
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
:deep(.vditor-reset) { color: var(--ed-text); }
:deep(.vditor-reset a) { color: var(--ed-accent); }
:deep(.vditor-reset blockquote) { border-left: 3px solid var(--ed-accent); background: color-mix(in oklab, var(--ed-accent) 10%, transparent); }
</style>
