<template>
  <div class="container" :class="appThemeClass">
    <header class="banner">
      <div class="logo">
        <div class="logo-mark"></div>
        <div class="logo-text">Uni Editor</div>
      </div>
      <div class="toolbar">
        <label class="muted" style="font-size:12px">页面主题</label>
        <select class="select" v-model="appTheme" @change="persistTheme">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
        <div class="muted" style="font-size:12px; margin-left:8px">WYSIWYG Markdown × Cards</div>
      </div>
    </header>

    <main class="main">
      <section class="panel editor-scope" :class="['editor-theme', editorTheme]">
        <div class="panel-header">
          <div class="panel-title">编辑器</div>
          <div class="spacer" />
          <div class="toolbar">
            <button class="btn" @click="toggleMode">{{ isMarkdown ? '切换到所见即所得' : '切换到Markdown源码' }}</button>
          </div>
        </div>
        <UniEditor
          ref="uniEditorRef"
          :theme-class="['editor-theme', editorTheme].join(' ')"
          :markdown-mode="isMarkdown"
          @update:html="onHtml"
        />
      </section>

      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">内容预览</div>
          <div class="spacer" />
          <div class="toolbar">
            <!-- 模式切换 -->
            <div class="mode-tabs">
              <button 
                class="mode-tab" 
                :class="{ active: previewMode === 'article' }"
                @click="previewMode = 'article'"
              >
                长文模式
              </button>
              <button 
                class="mode-tab" 
                :class="{ active: previewMode === 'cards' }"
                @click="previewMode = 'cards'"
              >
                卡片模式
              </button>
            </div>
            
            <!-- 主题切换 -->
            <label class="muted" style="font-size:12px">主题</label>
            <select class="select" v-model="previewTheme">
              <option v-for="t in previewThemes" :key="t" :value="t">{{ t }}</option>
            </select>
            
            <!-- 操作按钮 -->
            <button v-if="previewMode === 'article'" class="btn" @click="copyForWeChat">复制为公众号格式</button>
            <button v-if="previewMode === 'cards'" class="btn" @click="saveCards">保存卡片</button>
          </div>
        </div>
        
        <!-- 长文模式 -->
        <ArticlePreview
          v-if="previewMode === 'article'"
          :html="html"
          :theme="previewTheme"
        />
        
        <!-- 卡片模式 -->
        <CardGrid
          v-if="previewMode === 'cards'"
          ref="gridRef"
          :html="html"
          :card-theme="previewTheme"
        />
      </section>
    </main>

    <footer class="footer">
      © 2025 Uni Editor. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UniEditor from './components/UniEditor.vue'
import CardGrid from './components/CardGrid.vue'
import ArticlePreview from './components/ArticlePreview.vue'
import { buildWechatHtml } from './utils/copy.js'

// 引入Less样式
import './styles/index.less'

const uniEditorRef = ref(null)
const gridRef = ref(null)

const html = ref('')
const isMarkdown = ref(false)

// 编辑器简化，不需要多主题
const editorTheme = ref('classic')

// 预览模式和主题
const previewMode = ref('article') // 'article' | 'cards'
const previewThemes = ['classic','minimal','night','coffee','paper','pop','ocean','forest','sunset','grape','slate','sand']
const previewTheme = ref('classic')

// App light/dark theme (default light)
const appTheme = ref('light')
const appThemeClass = computed(() => appTheme.value === 'dark' ? 'theme-dark' : 'theme-light')

function onHtml(val) {
  html.value = val
}

function toggleMode() {
  isMarkdown.value = !isMarkdown.value
}

async function copyForWeChat() {
  try {
    const htmlRaw = await uniEditorRef.value?.getHTML?.()
    if (!htmlRaw) {
      alert('编辑器内容为空')
      return
    }
    
    const themed = buildWechatHtml(htmlRaw, previewTheme.value)
    const blobHtml = new Blob([themed], { type: 'text/html' })
    const plain = (new DOMParser().parseFromString(htmlRaw, 'text/html').body.textContent) || ''
    const blobText = new Blob([plain], { type: 'text/plain' })
    
    await navigator.clipboard.write([
      new window.ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })
    ])
    alert(`已复制为公众号格式（${previewTheme.value}主题），可直接粘贴到微信公众平台编辑器。`)
  } catch (e) {
    // fallback for browsers that don't support ClipboardItem
    try {
      const htmlRaw = await uniEditorRef.value?.getHTML?.()
      const plain = (new DOMParser().parseFromString(htmlRaw || '', 'text/html').body.textContent) || ''
      await navigator.clipboard.writeText(plain)
      alert('已复制纯文本（浏览器限制未复制HTML格式）。')
    } catch (err) {
      // last resort fallback
      const htmlRaw = await uniEditorRef.value?.getHTML?.()
      const plain = (new DOMParser().parseFromString(htmlRaw || '', 'text/html').body.textContent) || ''
      const ta = document.createElement('textarea')
      ta.value = plain
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove()
      alert('已复制纯文本。')
    }
  }
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

function persistTheme(){
  try { localStorage.setItem('uni.appTheme', appTheme.value) } catch {}
}

onMounted(() => {
  try {
    const saved = localStorage.getItem('uni.appTheme')
    if (saved === 'dark' || saved === 'light') appTheme.value = saved
  } catch {}
})
</script>

<style scoped>
.editor-scope { 
  min-height: 0; 
  display: grid; 
  grid-template-rows: auto 1fr; 
  height: 100%;
  overflow: hidden;
}

.mode-tabs {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  margin-right: 12px;
}

.mode-tab {
  background: var(--panel);
  color: var(--text);
  border: none;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-tab:hover {
  background: color-mix(in srgb, var(--accent) 20%, transparent);
}

.mode-tab.active {
  background: var(--accent);
  color: white;
}

.mode-tab + .mode-tab {
  border-left: 1px solid var(--border);
}
</style>
