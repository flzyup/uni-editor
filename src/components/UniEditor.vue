<template>
  <div class="editor-wrap" :class="themeClass">
    <div ref="elRef" class="vditor-host"></div>
  </div>
  
</template>

<script setup>
import { ref, watch, onMounted, nextTick, defineExpose } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = defineProps({
  themeClass: { type: String, default: '' },
  markdownMode: { type: Boolean, default: false },
})
const emit = defineEmits(['update:html'])

const elRef = ref(null)
let vd = null

const initial = `# 欢迎使用 Uni Editor\n\n- 所见即所得 + Markdown 源码\n- 主题切换（编辑器与卡片）\n- 一键复制为公众号格式\n- 预览长文卡片并导出高清图片\n\n![示例图](https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=60)`

onMounted(async () => {
  vd = new Vditor(elRef.value, {
    value: initial,
    cache: { enable: false },
    height: 480,
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
})

watch(() => props.markdownMode, async (v) => {
  if (!vd) return
  await nextTick()
  vd.setEditMode(v ? 'sv' : 'wysiwyg')
  emitHtml()
})

function emitHtml() {
  if (!vd) return
  vd.getHTML().then((html) => emit('update:html', html))
}

function getHTML() {
  return vd?.getHTML?.() || Promise.resolve('')
}

defineExpose({ getHTML })
</script>

<style scoped>
.editor-wrap { min-height: 60vh; }
.vditor-host { border-top: 1px solid var(--border); }
:deep(.vditor) { background: var(--ed-bg); color: var(--ed-text); border: none; }
:deep(.vditor .vditor-toolbar) { background: color-mix(in oklab, var(--ed-bg) 80%, #000); border-bottom: 1px solid var(--border); }
:deep(.vditor-reset) { color: var(--ed-text); }
:deep(.vditor-reset a) { color: var(--ed-link); }
:deep(.vditor-reset blockquote) { border-left: 3px solid var(--ed-accent); background: color-mix(in oklab, var(--ed-accent) 10%, transparent); }
</style>
