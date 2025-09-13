<template>
  <div class="editor-wrap">
    <div ref="elRef" class="vditor-host"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, defineExpose } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = defineProps({
  markdownMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:html'])

const elRef = ref(null)
let vd = null

const CACHE_KEY = 'uni-editor-content'

function loadCachedContent() {
  try {
    return localStorage.getItem(CACHE_KEY) || `# 欢迎使用 Uni Editor

- 所见即所得 + Markdown 源码
- 主题切换（编辑器与卡片）
- 一键复制为公众号格式
- 预览长文卡片并导出高清图片

![示例图](https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=60)`
  } catch (e) {
    return `# 欢迎使用 Uni Editor

- 所见即所得 + Markdown 源码
- 主题切换（编辑器与卡片）
- 一键复制为公众号格式
- 预览长文卡片并导出高清图片

![示例图](https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=60)`
  }
}

function saveContent(content) {
  try {
    localStorage.setItem(CACHE_KEY, content)
  } catch (e) {
    console.warn('Failed to save content to localStorage:', e)
  }
}

const initial = loadCachedContent()

onMounted(async () => {
  vd = new Vditor(elRef.value, {
    value: initial,
    cache: { enable: false },
    height: '100%',
    theme: 'dark',
    mode: 'wysiwyg',
    toolbarConfig: { pin: true },
    toolbar: [
      'headings', 'bold', 'italic', 'strike', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', '|',
      'quote', 'line', 'code', 'inline-code', 'table', '|',
      'link', 'upload', 'emoji', '|',
      'undo', 'redo', 'fullscreen'
    ],
    counter: { enable: true },
    upload: { accept: 'image/*' },
    input: () => emitHtml(),
    after: () => emitHtml(),
  })
  window.addEventListener('keydown', onKey)
})

watch(() => props.markdownMode, async (v) => {
  if (!vd) return
  await nextTick()
  vd.setEditMode(v ? 'sv' : 'wysiwyg')
  emitHtml()
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
:deep(.vditor) { background: var(--ed-bg); color: var(--ed-text); border: none; }
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