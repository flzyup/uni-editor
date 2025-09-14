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
      </div>
    </header>

    <main class="main">
      <section class="panel editor-scope">
        <div class="panel-header">
          <div class="panel-title">编辑器</div>
          <div class="spacer" />
          <div class="toolbar">
           
          </div>
        </div>
        <UniEditor
          ref="uniEditorRef"
          :page-theme="appThemeClass"
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
            <button v-if="previewMode === 'article'" class="btn" @click="copyForWeChat">全部复制</button>
            <button v-if="previewMode === 'cards'" class="btn" @click="saveCards">保存卡片</button>
          </div>
        </div>

        <!-- 长文模式 -->
        <ArticlePreview
          v-if="previewMode === 'article'"
          :html="html"
          :theme="previewTheme"
          :page-theme="appThemeClass"
        />

        <!-- 卡片模式 -->
        <CardsPreview
          v-if="previewMode === 'cards'"
          ref="cardsPreviewRef"
          :html="html"
          :card-theme="previewTheme"
          :page-theme="appThemeClass"
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
import CardsPreview from './components/CardsPreview.vue'
import ArticlePreview from './components/ArticlePreview.vue'
import { copyToWechat } from './utils/copy.js'

// 引入Less样式
import './styles/index.less'

const uniEditorRef = ref(null)
const cardsPreviewRef = ref(null)

const html = ref('')

// 预览模式和主题
const previewMode = ref('article') // 'article' | 'cards'
const previewThemes = ['classic','minimal','paper','ocean','forest','sunset','grape','slate','sand']
const previewTheme = ref('classic')

// App light/dark theme (default light)
const appTheme = ref('light')
const appThemeClass = computed(() => appTheme.value === 'dark' ? 'theme-dark' : 'theme-light')

function onHtml(val) {
  html.value = val
}

async function copyForWeChat() {
  const htmlRaw = await uniEditorRef.value?.getHTML?.()
  if (!htmlRaw) { alert('编辑器内容为空'); return }
  const ok = await copyToWechat(htmlRaw, previewTheme.value)
  alert(ok ? `已复制为公众号格式（${previewTheme.value} 主题）。` : '复制失败：已尝试回退纯文本。')
}



async function saveCards() {
  await cardsPreviewRef.value?.exportAll?.()
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
  outline: none;
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

.mode-tab:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent);
}
</style>
