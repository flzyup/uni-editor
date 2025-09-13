<template>
  <div class="container">
    <header class="banner">
      <div class="logo">
        <div class="logo-mark"></div>
        <div class="logo-text">Uni Editor</div>
      </div>
      <div class="muted" style="font-size:12px">WYSIWYG Markdown × Cards</div>
    </header>

    <main class="main">
      <section class="panel editor-scope" :class="editorThemeClass">
        <div class="panel-header">
          <div class="panel-title">编辑器</div>
          <div class="spacer" />
          <div class="toolbar">
            <label class="muted" style="font-size:12px">主题</label>
            <select class="select" v-model="editorTheme">
              <option v-for="t in editorThemes" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
            <button class="btn" @click="toggleMode">{{ isMarkdown ? '切换到所见即所得' : '切换到Markdown源码' }}</button>
            <button class="btn" @click="copyForWeChat">复制为公众号格式</button>
          </div>
        </div>
        <UniEditor
          ref="uniEditorRef"
          :theme-class="editorThemeClass"
          :markdown-mode="isMarkdown"
          @update:html="onHtml"
        />
      </section>

      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">卡片预览</div>
          <div class="spacer" />
          <div class="toolbar">
            <label class="muted" style="font-size:12px">主题</label>
            <select class="select" v-model="cardTheme">
              <option v-for="t in cardThemes" :key="t" :value="t">{{ t.replace('card-theme-','') }}</option>
            </select>
            <button class="btn" @click="saveCards">保存卡片</button>
          </div>
        </div>
        <CardGrid
          ref="gridRef"
          :html="html"
          :card-theme="cardTheme"
        />
      </section>
    </main>

    <footer class="footer">
      © 2025 Uni Editor. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UniEditor from './components/UniEditor.vue'
import CardGrid from './components/CardGrid.vue'

const uniEditorRef = ref(null)
const gridRef = ref(null)

const html = ref('')
const isMarkdown = ref(false)

const editorThemes = [
  { value: 'editor-theme-nord', label: 'Nord' },
  { value: 'editor-theme-aurora', label: 'Aurora' },
  { value: 'editor-theme-forest', label: 'Forest' },
  { value: 'editor-theme-sakura', label: 'Sakura' },
  { value: 'editor-theme-sand', label: 'Sand' },
  { value: 'editor-theme-ink', label: 'Ink' },
]
const editorTheme = ref(editorThemes[0].value)
const editorThemeClass = computed(() => editorTheme.value)

const cardThemes = [
  'card-theme-slate','card-theme-rose','card-theme-emerald','card-theme-indigo',
  'card-theme-sunset','card-theme-plum','card-theme-mint','card-theme-coral'
]
const cardTheme = ref(cardThemes[0])

function onHtml(val) {
  html.value = val
}

function toggleMode() {
  isMarkdown.value = !isMarkdown.value
}

async function copyForWeChat() {
  const htmlRaw = await uniEditorRef.value?.getHTML?.()
  const el = document.createElement('div')
  el.className = 'editor-scope ' + editorThemeClass.value
  el.style.position = 'absolute'; el.style.left = '-9999px'
  el.innerHTML = htmlRaw || ''
  document.body.appendChild(el)
  const htmlString = inlineStyledHTML(el)
  const blobHtml = new Blob([htmlString], { type: 'text/html' })
  const plain = el.textContent || ''
  const blobText = new Blob([plain], { type: 'text/plain' })
  try {
    await navigator.clipboard.write([
      new window.ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })
    ])
    alert('已复制为公众号格式，可直接粘贴到微信公众平台编辑器。')
  } catch (e) {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = plain
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove()
    alert('已复制纯文本（浏览器限制未复制HTML）。')
  }
  try { el.remove() } catch {}
}

function inlineStyledHTML(root) {
  const clone = root.cloneNode(true)
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ELEMENT)
  const importantProps = [
    'color','backgroundColor','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing',
    'textAlign','border','borderColor','borderWidth','borderStyle','borderRadius','padding','margin',
    'listStyleType','textDecorationColor','textDecorationLine','textDecorationStyle'
  ]
  while (walker.nextNode()) {
    const node = walker.currentNode
    const cs = window.getComputedStyle(node)
    const style = importantProps.map(p => {
      const val = cs[p]
      return val && val !== 'initial' && val !== 'auto' ? `${camelToKebab(p)}:${val}` : ''
    }).filter(Boolean).join(';')
    if (style) node.setAttribute('style', (node.getAttribute('style') || '') + ';' + style)
  }
  return `<!doctype html><html><head><meta charset=\"utf-8\"></head><body>${clone.innerHTML}</body></html>`
}
function camelToKebab(s){return s.replace(/[A-Z]/g, m=>'-'+m.toLowerCase())}

async function saveCards() {
  await gridRef.value?.exportAll?.()
}
</script>

<style scoped>
.editor-scope { min-height: 70vh; display: grid; grid-template-rows: auto 1fr; }
</style>
