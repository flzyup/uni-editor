<template>
  <div class="editor-shell editor-theme" :class="[editorThemeClass]">
    <div class="editor-toolbar">
      <label>编辑器主题</label>
      <select v-model="localTheme" @change="emitTheme">
        <option v-for="t in editorThemes" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
      <div class="spacer" />
      <label>模式</label>
      <select v-model="localMode" @change="toggleMode">
        <option value="wysiwyg">所见即所得</option>
        <option value="markdown">Markdown 源码</option>
      </select>
      <button class="primary" @click="copyWechat">复制为公众号格式</button>
    </div>
    <div class="editor-host" :class="[editorThemeClass]">
      <div ref="editorEl" style="height:100%" />
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

import { buildWechatHtml } from '../utils/copy.js'

const props = defineProps({
  editorTheme: { type: String, default: 'classic' },
  mode: { type: String, default: 'wysiwyg' },
})
const emit = defineEmits(['update:html','update:markdown','update:title','change-theme','change-mode'])

const editorThemes = [
  { value: 'classic', label: 'Classic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'night', label: 'Night' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'paper', label: 'Paper（浅色）' },
  { value: 'pop', label: 'Pop' },
]

const localTheme = ref(props.editorTheme)
const localMode = ref(props.mode)
watch(() => props.editorTheme, v => localTheme.value = v)
watch(() => props.mode, v => localMode.value = v)

const editorEl = ref()
let vditor = null
const editorThemeClass = computed(() => localTheme.value)

function handleChange() {
  if (!vditor) return
  const html = vditor.getHTML()
  const md = vditor.getValue()
  emit('update:html', html)
  emit('update:markdown', md)
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const h1 = doc.querySelector('h1, h2')
  emit('update:title', h1?.textContent?.trim() || '')
}

function toggleMode() {
  if (!vditor) return
  const target = localMode.value
  const mode = target === 'wysiwyg' ? 'wysiwyg' : 'sv'
  vditor.setTheme(undefined, undefined, undefined)
  vditor.setEditMode(mode)
  emit('change-mode', target)
}

function emitTheme(){
  emit('change-theme', localTheme.value)
}

async function copyWechat(){
  const html = vditor.getHTML()
  const title = vditor.getValue().split('\n').find(l=>l.startsWith('#'))?.replace(/^#+\s*/, '') || '未命名'
  const themed = buildWechatHtml(html, localTheme.value)
  try {
    const type = 'text/html'
    const blob = new Blob([themed], { type })
    await navigator.clipboard.write([new window.ClipboardItem({ [type]: blob })])
    alert('已复制为公众号格式（含样式）')
  } catch (e) {
    await navigator.clipboard.writeText(themed)
    alert('已复制纯文本版本。提示：使用现代浏览器可复制含样式的 HTML。')
  }
}

const sampleMd = `# Uni Editor 示例标题\n\n> 一个现代化、所见即所得的 Markdown 编辑器 + 卡片预览导出工具。\n\n## 功能概览\n- WYSIWYG 和 Markdown 源码切换\n- 多套主题样式随时切换\n- 可视化表格编辑\n- 复制为公众号格式（保留样式）\n- 生成卡片封面与预览\n\n## 表格示例\n| 功能 | 状态 |\n| ---- | ---- |\n| 编辑器 | ✅ |\n| 主题 | ✅ |\n| 卡片导出 | ✅ |\n\n## 图片示例\n![风景](https://images.unsplash.com/photo-1529245019870-59b249281fd5?w=1200&q=80)\n\n结尾：欢迎体验 Uni Editor！`

onMounted(() => {
  vditor = new Vditor(editorEl.value, {
    height: '100%',
    mode: localMode.value === 'wysiwyg' ? 'wysiwyg' : 'sv',
    toolbarConfig: { pin: true },
    counter: { enable: true },
    outline: { enable: true, position: 'left' },
    cache: { enable: false },
    preview: { hljs: { style: 'github-dark' } },
    upload: { accept: 'image/*' },
    toolbar: [
      'headings','bold','italic','strike','|','list','ordered-list','check','|','quote','code','inline-code','|','link','table','|','undo','redo','|','both','preview'
    ],
    value: sampleMd,
    input: () => handleChange(),
    after: () => handleChange(),
  })
})

onBeforeUnmount(() => { vditor?.destroy?.() })
</script>

<style scoped>
/* Host styles live in themes.css */
</style>
