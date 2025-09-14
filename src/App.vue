<template>
  <div class="container" :class="appThemeClass">
    <header class="banner">
      <a href="https://uni-editor.com" target="_blank" class="logo" title="访问官网">
        <div class="logo-mark"></div>
        <div class="logo-text">Uni Editor</div>
      </a>
      <div class="toolbar">
        <a
          href="https://github.com/flzyup/uni-editor"
          target="_blank"
          class="github-link"
          title="查看源码"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span>GitHub</span>
        </a>
        <FeaturesHint />
        <TodoHint />
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
            <select class="select" v-model="previewTheme" @change="persistPreviewTheme">
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
      © 2025 <a href="https://uni-editor.com" target="_blank" class="footer-link">Uni Editor</a>. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import UniEditor from './components/UniEditor.vue'
import CardsPreview from './components/CardsPreview.vue'
import ArticlePreview from './components/ArticlePreview.vue'
import TodoHint from './components/TodoHint.vue'
import FeaturesHint from './components/FeaturesHint.vue'
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
  const ok = await copyToWechat(previewTheme.value, appTheme.value)
  alert(ok ? `已复制为公众号格式（${previewTheme.value} 主题）。` : '复制失败：已尝试回退纯文本。')
}



async function saveCards() {
  await cardsPreviewRef.value?.exportAll?.()
}

function persistTheme(){
  try { localStorage.setItem('uni.appTheme', appTheme.value) } catch {}
}

function persistPreviewTheme(){
  try { localStorage.setItem('uni.previewTheme', previewTheme.value) } catch {}
}

onMounted(() => {
  try {
    // Restore app theme
    const savedAppTheme = localStorage.getItem('uni.appTheme')
    if (savedAppTheme === 'dark' || savedAppTheme === 'light') {
      appTheme.value = savedAppTheme
    }

    // Restore preview theme
    const savedPreviewTheme = localStorage.getItem('uni.previewTheme')
    if (savedPreviewTheme && previewThemes.includes(savedPreviewTheme)) {
      previewTheme.value = savedPreviewTheme
    }
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
  color: var(--panel);
  font-weight: 600;
}

.mode-tab + .mode-tab {
  border-left: 1px solid var(--border);
}

.mode-tab:focus-visible {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent);
}

/* Logo链接样式 */
.logo {
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
}

.logo:hover {
  opacity: 0.8;
}

/* GitHub链接样式 */
.github-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-right: 12px;
}

.github-link:hover {
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  border-color: var(--accent);
  transform: translateY(-1px);
}

.github-link svg {
  flex-shrink: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .github-link span {
    display: none;
  }
}

/* 底部链接样式 */
.footer-link {
  color: var(--accent);
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.footer-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}
</style>
