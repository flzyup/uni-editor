<template>
  <div class="container" :class="appThemeClass">
    <header class="banner">
      <a href="https://uni-editor.com" target="_blank" class="logo" title="访问官网">
        <div class="logo-mark"></div>
        <div class="logo-text">Uni Editor</div>
      </a>
      <div class="toolbar">
        <div class="spacer" />
        <a
          href="https://github.com/flzyup/uni-editor"
          target="_blank"
          class="github-link"
          :title="$t('header.github')"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          <span>{{ $t('header.github') }}</span>
        </a>
        <a
          href="https://github.com/flzyup/uni-editor/issues"
          target="_blank"
          class="feedback-link"
          :title="$t('header.feedback')"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
            <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.08.08-.162.158-.242.234-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.418-.07.749-.361 1.04-.28.281-.66.464-1.074.722C6.7 14.528 4.295 14.986 4.28 15.99H2.725c-.088-2.48 2.154-2.48 2.154-2.48-.832-.832-2.725-2.479-2.725-4.543 0-1.708.84-3.327 2.04-4.326zm11.952 0c-1.2.999-2.04 2.618-2.04 4.326 0 2.064 1.893 3.711 2.725 4.543 0 0-2.242 0-2.154 2.48h1.555c.015-1.004-2.39-1.462-2.249-2.735.114-.603.709-.795 1.286-.983.596-.193 1.179-.383 1.214-1.017.029-.517-.342-.87-.758-1.266-.08-.076-.162-.154-.242-.234-.05-.05.263-.221.743-.484 1.185-.65 3.392-1.861 3.717-3.19z"/>
          </svg>
          <span>{{ $t('header.feedback') }}</span>
        </a>
        <FeaturesHint />
        <TodoHint />
        <LanguageSwitch />
        <label class="muted small-text">{{ $t('header.theme') }}</label>
        <select class="select" v-model="appTheme" @change="persistTheme">
          <option value="light">{{ $t('header.themeLight') }}</option>
          <option value="dark">{{ $t('header.themeDark') }}</option>
        </select>
      </div>
    </header>

    <main class="main" ref="mainRef" :style="{ gridTemplateColumns: leftPanelWidth + 'px auto ' + rightPanelWidth + 'px' }">
      <section class="panel editor-scope">
        <div class="panel-header">
          <div class="panel-title">{{ $t('main.editor') }}</div>
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

      <!-- Draggable Splitter -->
      <div
        class="panel-splitter"
        @mousedown="startResize"
        :class="{ resizing: isResizing }"
      >
        <div class="splitter-handle">
          <div class="splitter-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      </div>

      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">{{ $t('main.preview') }}</div>
          <div class="toolbar">
            <!-- 主题切换（左侧） -->
            <label class="muted small-text">{{ $t('main.theme') }}</label>
            <select class="select" v-model="previewTheme" @change="persistPreviewTheme">
              <option v-for="t in previewThemes" :key="t" :value="t">{{ $t(`themes.${t}`) }}</option>
            </select>

            <div class="spacer"></div>

            <!-- 模式切换（居中） -->
            <div class="mode-tabs-center">
              <div class="mode-tabs">
                <button
                  class="mode-tab"
                  :class="{ active: previewMode === 'article' }"
                  @click="setPreviewMode('article')"
                >
                  {{ $t('main.articleMode') }}
                </button>
                <button
                  class="mode-tab"
                  :class="{ active: previewMode === 'cards' }"
                  @click="setPreviewMode('cards')"
                >
                  {{ $t('main.cardMode') }}
                </button>
              </div>
            </div>

            <div class="spacer"></div>

            <!-- 缩放比例和操作按钮（右侧） -->
            <div class="toolbar-right">
              <div v-if="previewMode === 'cards'" class="scale-control-inline">
                <label class="muted small-text">{{ $t('main.scale') }}</label>
                <input
                  type="range"
                  class="scale-slider"
                  v-model="cardScale"
                  @input="persistCardScale"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                />
                <span class="scale-value small-text">{{ Math.round(cardScale * 100) }}%</span>
              </div>
              <template v-if="previewMode === 'article'">
                <button class="btn" @click="copyForWeChat">{{ $t('main.copyAll') }}</button>
                <button class="btn" @click="saveArticle">{{ $t('main.saveArticle') }}</button>
              </template>
              <button v-if="previewMode === 'cards'" class="btn" @click="saveCards">{{ $t('main.saveCards') }}</button>
            </div>
          </div>
        </div>

        <!-- 长文模式 -->
        <ArticlePreview
          ref="articlePreviewRef"
          v-if="previewMode === 'article'"
          :html="html"
          :theme="previewTheme"
          :page-theme="appThemeClass"
        />

        <!-- 卡片模式 -->
        <div v-if="previewMode === 'cards'" class="cards-container">
          <CardsPreview
            ref="cardsPreviewRef"
            :html="html"
            :card-theme="previewTheme"
            :page-theme="appThemeClass"
            :scale="cardScale"
          />
        </div>
      </section>
    </main>

    <footer class="footer">
      © 2025 <a href="https://uni-editor.com" target="_blank" class="footer-link">Uni Editor</a>. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import UniEditor from './components/UniEditor.vue'
import CardsPreview from './components/CardsPreview.vue'
import ArticlePreview from './components/ArticlePreview.vue'
import TodoHint from './components/TodoHint.vue'
import FeaturesHint from './components/FeaturesHint.vue'
import LanguageSwitch from './components/LanguageSwitch.vue'
import { copyToWechat } from './utils/copy.js'
import { useI18n } from 'vue-i18n'
import { useToast } from './composables/useToast'

// 引入Less样式
import './styles/index.less'

const { t: $t } = useI18n()
const { success, error, warning } = useToast()

const uniEditorRef = ref(null)
const cardsPreviewRef = ref(null)
const articlePreviewRef = ref(null)
const mainRef = ref(null)

const html = ref('')

// Splitter state
const isResizing = ref(false)
const leftPanelWidth = ref(0)
const rightPanelWidth = ref(0)
const initialMouseX = ref(0)
const initialLeftWidth = ref(0)

// 预览模式和主题
const previewMode = ref('article') // 'article' | 'cards'
const previewThemes = ['classic','minimal','paper','ocean','forest','sunset','grape','slate','sand']
const previewTheme = ref('classic')
const cardScale = ref(0.75) // 卡片模式缩放比例，范围 0.5-1.0

// App light/dark theme (default light)
const appTheme = ref('light')
const appThemeClass = computed(() => appTheme.value === 'dark' ? 'theme-dark' : 'theme-light')


function onHtml(val) {
  html.value = val
}

async function copyForWeChat() {
  const htmlRaw = await uniEditorRef.value?.getHTML?.()
  if (!htmlRaw) { warning($t('messages.emptyContent')); return }
  const ok = await copyToWechat(previewTheme.value, appTheme.value)
  const themeName = $t(`themes.${previewTheme.value}`)
  if (ok) {
    success($t('messages.copySuccess', { theme: themeName }))
  } else {
    error($t('messages.copyFailed'))
  }
}



async function saveCards() {
  try {
    await cardsPreviewRef.value?.exportAll?.()
    // 导出成功提示可以在CardsPreview组件内部处理
  } catch (err) {
    console.error('导出卡片失败:', err)
    error($t('messages.exportFailed'))
  }
}

async function saveArticle() {
  if (!html.value) {
    warning($t('messages.emptyContent'))
    return
  }
  try {
    await articlePreviewRef.value?.exportArticle?.()
  } catch (err) {
    console.error('导出长文失败:', err)
    error($t('messages.exportFailed'))
  }
}


function persistTheme(){
  try { localStorage.setItem('uni.appTheme', appTheme.value) } catch {}
}

function persistPreviewTheme(){
  try { localStorage.setItem('uni.previewTheme', previewTheme.value) } catch {}
}

function setPreviewMode(mode) {
  previewMode.value = mode
  persistPreviewMode()
}

function persistPreviewMode(){
  try { localStorage.setItem('uni.previewMode', previewMode.value) } catch {}
}

function persistCardScale(){
  try { localStorage.setItem('uni.cardScale', String(cardScale.value)) } catch {}
}

// Splitter functionality
function startResize(event) {
  isResizing.value = true
  initialMouseX.value = event.clientX
  initialLeftWidth.value = leftPanelWidth.value

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  event.preventDefault()
}

function handleResize(event) {
  if (!isResizing.value || !mainRef.value) return

  const deltaX = event.clientX - initialMouseX.value
  const mainWidth = mainRef.value.clientWidth
  const splitterWidth = 6 // splitter width
  const panelPadding = 32 // 16px * 2 for left and right padding
  const availableWidth = mainWidth - panelPadding
  const minPanelWidth = 300 // minimum panel width

  const newLeftWidth = Math.max(
    minPanelWidth,
    Math.min(
      availableWidth - splitterWidth - minPanelWidth,
      initialLeftWidth.value + deltaX
    )
  )

  leftPanelWidth.value = newLeftWidth
  rightPanelWidth.value = availableWidth - splitterWidth - newLeftWidth

  // Persist the split ratio based on available width
  const splitRatio = newLeftWidth / availableWidth
  try {
    localStorage.setItem('uni.splitRatio', String(splitRatio))
  } catch {}
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

function initializePanelSizes() {
  if (!mainRef.value) return

  const mainWidth = mainRef.value.clientWidth
  const splitterWidth = 6
  const panelPadding = 32 // 16px * 2 for left and right padding

  // Available width after accounting for padding
  const availableWidth = mainWidth - panelPadding

  // Try to restore saved split ratio
  let splitRatio = 0.5 // default 50/50 split
  try {
    const saved = localStorage.getItem('uni.splitRatio')
    if (saved) {
      const ratio = parseFloat(saved)
      if (!isNaN(ratio) && ratio >= 0.2 && ratio <= 0.8) {
        splitRatio = ratio
      }
    }
  } catch {}

  leftPanelWidth.value = Math.floor(availableWidth * splitRatio)
  rightPanelWidth.value = availableWidth - splitterWidth - leftPanelWidth.value
}

function handleWindowResize() {
  initializePanelSizes()
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

    // Restore preview mode
    const savedPreviewMode = localStorage.getItem('uni.previewMode')
    if (savedPreviewMode === 'article' || savedPreviewMode === 'cards') {
      previewMode.value = savedPreviewMode
    }

    // Restore card scale
    const savedCardScale = localStorage.getItem('uni.cardScale')
    if (savedCardScale) {
      const scale = parseFloat(savedCardScale)
      if (!isNaN(scale) && scale >= 0.5 && scale <= 1.0) {
        cardScale.value = scale
      }
    }
  } catch {}

  // Initialize panel sizes after mount
  setTimeout(() => {
    initializePanelSizes()
  }, 100)

  // Listen for window resize
  window.addEventListener('resize', handleWindowResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
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

.mode-tabs-center {
  display: flex;
  justify-content: center;
  flex: 0 0 auto;
}

.mode-tabs {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

.toolbar-hint {
  color: var(--accent);
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

/* 反馈链接样式 */
.feedback-link {
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

.feedback-link:hover {
  background: color-mix(in srgb, #f39c12 15%, transparent);
  border-color: #f39c12;
  color: #f39c12;
  transform: translateY(-1px);
}

.feedback-link svg {
  flex-shrink: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .github-link span,
  .feedback-link span {
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

/* 通用字体大小样式 */
.small-text {
  font-size: 12px;
}

/* 卡片容器样式 */
.cards-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 工具栏内的缩放控制布局 */
.scale-control-inline {
  display: flex;
  align-items: center;
  gap: 6px;
}

.scale-slider {
  width: 90px; /* 工具栏内缩短宽度 */
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  outline: none;
  appearance: none;
  cursor: pointer;
}

.scale-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid var(--panel);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.scale-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: 2px solid var(--panel);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.scale-value {
  min-width: 35px;
  text-align: center;
  color: var(--accent);
  font-weight: 500;
}

/* Panel Splitter Styles */
.panel-splitter {
  width: 6px;
  background: transparent;
  cursor: col-resize;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.splitter-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 60px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--border) 80%, var(--panel) 20%);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--border) 30%, transparent);
}

.panel-splitter:hover .splitter-handle {
  background: color-mix(in srgb, var(--accent) 80%, transparent);
  transform: scale(1.05);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 25%, transparent);
}

.panel-splitter.resizing .splitter-handle {
  background: var(--accent);
  transform: scale(1.1);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 40%, transparent);
}

.splitter-dots {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
}

.splitter-dots .dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--muted);
  transition: all 0.2s ease;
}

.panel-splitter:hover .splitter-dots .dot {
  background: var(--text);
  transform: scale(1.2);
}

.panel-splitter.resizing .splitter-dots .dot {
  background: white;
  transform: scale(1.3);
}

/* Panel layout adjustments for splitter */
.main > .panel {
  overflow: hidden;
}

/* Mobile responsive - hide splitter on small screens */
@media (max-width: 768px) {
  .panel-splitter {
    display: none;
  }

  .main {
    flex-direction: column !important;
  }

  .main > .panel {
    width: 100% !important;
  }
}
</style>
