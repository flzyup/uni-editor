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
        <label class="muted" style="font-size:12px">{{ $t('header.theme') }}</label>
        <select class="select" v-model="appTheme" @change="persistTheme">
          <option value="light">{{ $t('header.themeLight') }}</option>
          <option value="dark">{{ $t('header.themeDark') }}</option>
        </select>
      </div>
    </header>

    <main class="main">
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

      <section class="panel">
        <div class="panel-header">
          <div class="panel-title">{{ $t('main.preview') }}</div>
          <div class="spacer" />
          <div class="toolbar">
            <!-- 模式切换 -->
            <div class="mode-tabs">
              <button
                class="mode-tab"
                :class="{ active: previewMode === 'article' }"
                @click="previewMode = 'article'"
              >
                {{ $t('main.articleMode') }}
              </button>
              <button
                class="mode-tab"
                :class="{ active: previewMode === 'cards' }"
                @click="previewMode = 'cards'"
              >
                {{ $t('main.cardMode') }}
              </button>
            </div>

            <!-- 主题切换 -->
            <label class="muted" style="font-size:12px">{{ $t('main.theme') }}</label>
            <select class="select" v-model="previewTheme" @change="persistPreviewTheme">
              <option v-for="t in previewThemes" :key="t" :value="t">{{ $t(`themes.${t}`) }}</option>
            </select>

            <!-- 操作按钮 -->
            <button v-if="previewMode === 'article'" class="btn" @click="copyForWeChat">{{ $t('main.copyAll') }}</button>
            <button v-if="previewMode === 'cards'" class="btn" @click="saveCards">{{ $t('main.saveCards') }}</button>
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
import LanguageSwitch from './components/LanguageSwitch.vue'
import { copyToWechat } from './utils/copy.js'
import { useI18n } from 'vue-i18n'

// 引入Less样式
import './styles/index.less'

const { t: $t } = useI18n()

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
  if (!htmlRaw) { alert($t('messages.emptyContent')); return }
  const ok = await copyToWechat(previewTheme.value, appTheme.value)
  const themeName = $t(`themes.${previewTheme.value}`)
  alert(ok ? $t('messages.copySuccess', { theme: themeName }) : $t('messages.copyFailed'))
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
</style>
