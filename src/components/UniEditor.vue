<template>
  <div class="uni-editor">
    <!-- 文档标签页 -->
    <div class="document-tabs" v-if="openTabs.length > 0">
      <div class="tabs-container">
        <div class="tabs-main">
          <div class="tabs-scroll" ref="tabsScrollRef">
            <div
              v-for="tab in openTabs"
              :key="tab.id"
              class="tab"
              :class="{
                active: tab.id === activeTabId,
                modified: isDocumentModified(tab.id)
              }"
              @click="selectTab(tab.id)"
            >
              <div class="tab-content">
                <div class="tab-icon">📝</div>
                <div class="tab-title" :title="getDocument(tab.id)?.title">
                  {{ getDocument(tab.id)?.title || t('documents.untitled') }}
                </div>
                <div
                  class="tab-close"
                  @click.stop="closeTab(tab.id)"
                  v-if="openTabs.length > 1"
                  :title="isDocumentModified(tab.id) ? t('documents.unsavedChangesTitle') : t('documents.closeTabTitle')"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M9.5 3.5L8.5 2.5L6 5L3.5 2.5L2.5 3.5L5 6L2.5 8.5L3.5 9.5L6 7L8.5 9.5L9.5 8.5L7 6L9.5 3.5Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div class="tabs-actions">
            <button class="action-btn" @click="toggleDocumentManager" :title="showDocumentManager ? t('documents.hideManager') : t('documents.showManager')">
              <svg v-if="showDocumentManager" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M1 6.5A1.5 1.5 0 0 1 2.5 5h3.38a1.5 1.5 0 0 1 1.06.44L8.38 7H13.5A1.5 1.5 0 0 1 15 8.354l-.8 5.32A1.5 1.5 0 0 1 12.72 15H3.28a1.5 1.5 0 0 1-1.48-1.326L1 6.5Z"/>
                <path d="M15 6.5H1V3.5A1.5 1.5 0 0 1 2.5 2h3.38a1.5 1.5 0 0 1 1.06.44L8.38 4H13.5A1.5 1.5 0 0 1 15 5.5v1Z"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h11A1.5 1.5 0 0 1 15 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9zM2.5 3a.5.5 0 0 0-.5.5V5h12V3.5a.5.5 0 0 0-.5-.5h-11zM14 6H2v6.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V6z"/>
              </svg>
            </button>
            <button class="action-btn" @click="createNewDocument" :title="t('documents.newDocument')">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="tabs-scrollbar" v-show="showScrollbar">
          <div
            class="tabs-scrollbar-thumb"
            :style="{
              width: scrollbarThumbWidth + '%',
              transform: `translateX(${scrollbarThumbPosition}px)`
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 文档管理器 -->
    <div class="document-manager" v-if="showDocumentManager">
      <div class="manager-header">
        <div class="header-title">
          <h3>{{ t('documents.manager') }}</h3>
          <span class="document-count">
            <template v-if="searchQuery.trim()">
              {{ t('documents.documentCount', { count: filteredDocumentsAll.length }) }}/{{ allDocuments.length }}
            </template>
            <template v-else>
              {{ t('documents.documentCount', { count: filteredDocuments.length }) }}
              <span v-if="showLoadMore">
                /{{ allDocuments.length }}
              </span>
            </template>
          </span>
        </div>
        <div class="header-search">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="$t('common.search') || '搜索文档...'"
            @input="handleSearch"
          >
          <svg v-if="!searchQuery" class="search-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <button v-else class="search-clear" @click="clearSearch" title="清除搜索">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="manager-content">
        <div class="document-list">
          <div
            v-for="doc in filteredDocuments"
            :key="doc.id"
            class="document-item"
            :class="{
              active: doc.id === activeTabId,
              closed: !isTabOpen(doc.id),
              modified: isDocumentModified(doc.id),
              selected: selectedDocumentId === doc.id
            }"
            @click="selectDocument(doc.id)"
            @dblclick="openDocument(doc.id)"
          >
            <div class="document-info">
              <div class="document-title">
                <span class="doc-icon">📝</span>
                <span class="title-text">{{ doc.title }}</span>
              </div>
              <div class="document-meta">
                <span class="doc-date">{{ formatDate(doc.updatedAt) }}</span>
                <span class="doc-size">{{ t('documents.charactersCount', { count: doc.content?.length || 0 }) }}</span>
              </div>
            </div>
            <div class="document-actions" @click.stop>
              <button
                class="doc-action-btn"
                @click.stop="handleDocumentTabAction(doc.id)"
                :title="getTabActionTitle(doc.id)"
              >
                <!-- 未打开：显示打开图标 -->
                <svg v-if="!isTabOpen(doc.id)" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                <!-- 已打开但非活跃：显示定位图标 -->
                <svg v-else-if="doc.id !== activeTabId" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/>
                </svg>
                <!-- 当前活跃：显示关闭图标（与标签栏X一致） -->
                <svg v-else width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M9.5 3.5L8.5 2.5L6 5L3.5 2.5L2.5 3.5L5 6L2.5 8.5L3.5 9.5L6 7L8.5 9.5L9.5 8.5L7 6L9.5 3.5Z"/>
                </svg>
              </button>
              <button
                class="doc-action-btn"
                @click.stop="importMarkdownToDocument(doc.id)"
                :title="t('documents.importMD')"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                </svg>
              </button>
              <button
                class="doc-action-btn"
                @click.stop="exportMarkdownFromDocument(doc.id)"
                :title="t('documents.exportMD')"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
              </button>
              <button
                class="doc-action-btn"
                @click.stop="duplicateDocument(doc.id)"
                :title="t('documents.duplicateDocument')"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
              </button>
              <button
                class="doc-action-btn danger"
                @click.stop="confirmDeleteDocument(doc.id)"
                :title="t('documents.deleteDocument')"
                :disabled="allDocuments.length <= 1"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                  <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 加载更多按钮 -->
        <div v-if="showLoadMore" class="load-more-container">
          <button class="load-more-btn" @click="loadMoreDocuments">
            <span>{{ $t('common.loadMore') || '加载更多' }}</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M7.646 9.646a.5.5 0 0 1 .708 0L12 13.293V2.5a.5.5 0 0 1 1 0v10.793l3.646-3.647a.5.5 0 0 1 .708.708l-4.5 4.5a.5.5 0 0 1-.708 0l-4.5-4.5a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑器 -->
    <div class="editor-container">
      <div ref="elRef" class="vditor-host"></div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>{{ t('documents.confirmDelete') }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ t('documents.confirmDeleteMessage', { title: getDocument(documentToDelete)?.title }) }}</p>
          <p class="warning-text">{{ t('documents.warningNotRecoverable') }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelDelete">{{ t('common.cancel') }}</button>
          <button class="btn btn-danger" @click="deleteDocument">{{ t('common.confirm') }}</button>
        </div>
      </div>
    </div>

    <!-- 导入覆盖确认对话框 -->
    <div v-if="showImportConfirm" class="modal-overlay" @click="cancelImport">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h3>{{ t('documents.confirmImport') }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ t('documents.confirmImportMessage', { title: getDocument(importTargetDocId)?.title }) }}</p>
          <p>{{ t('documents.confirmImportSubMessage') }}</p>
          <p class="warning-text">{{ t('documents.warningNotRecoverable') }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelImport">{{ t('common.cancel') }}</button>
          <button class="btn btn-primary" @click="confirmImport">{{ t('documents.confirmImportAction') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import zhMessages from '../locales/zh.js'
import enMessages from '../locales/en.js'
import {
  saveImage,
  convertContentForEditor,
  convertContentForStorage,
  clearImageCache,
  extractImageIdsFromContent,
  cleanupUnusedImages,
  hasIndexedDBSupport
} from '../utils/imageStore.js'

const props = defineProps({
  pageTheme: { type: String, default: 'theme-dark' }
})
const emit = defineEmits(['update:html', 'editorScroll'])

const { locale, t } = useI18n()

const elRef = ref(null)
let vd = null
let isVditorReady = false
const scrollCleanups = []

// 文档管理状态
const allDocuments = ref([]) // 所有文档缓存
const openTabs = ref([]) // 当前打开的标签页
const activeTabId = ref('') // 当前活跃的标签
const selectedDocumentId = ref('') // 在文档管理器中选中的文档
const showDocumentManager = ref(false) // 是否显示文档管理器
const showDeleteConfirm = ref(false) // 删除确认对话框
const documentToDelete = ref('') // 待删除的文档ID
const showImportConfirm = ref(false) // 导入确认对话框
const importTargetDocId = ref('') // 导入目标文档ID
const pendingImportFile = ref(null) // 待导入的文件

// 搜索相关状态
const searchQuery = ref('') // 搜索关键词
const searchDebounceTimer = ref(null) // 防抖定时器

// 分页相关状态
const currentPage = ref(1) // 当前页码
const pageSize = ref(20) // 每页显示数量
const showLoadMore = ref(false) // 是否显示加载更多按钮

// 文档修改状态跟踪
const documentModifications = ref(new Map())

// 滚动条相关
const tabsScrollRef = ref(null)
const showScrollbar = ref(false)
const scrollbarThumbWidth = ref(100)
const scrollbarThumbPosition = ref(0)

// 计算属性：按修改时间倒序排列的文档列表
const sortedDocuments = computed(() => {
  return [...allDocuments.value].sort((a, b) => b.updatedAt - a.updatedAt)
})

// 计算属性：筛选后的文档列表（完整）
const filteredDocumentsAll = computed(() => {
  if (!searchQuery.value.trim()) {
    return sortedDocuments.value
  }

  const query = searchQuery.value.toLowerCase().trim()
  return sortedDocuments.value.filter(doc => {
    return doc.title.toLowerCase().includes(query) ||
           (doc.content && doc.content.toLowerCase().includes(query))
  })
})

// 计算属性：当前页显示的文档列表
const filteredDocuments = computed(() => {
  const allDocs = filteredDocumentsAll.value
  const maxItems = currentPage.value * pageSize.value

  // 更新是否显示加载更多按钮
  showLoadMore.value = allDocs.length > maxItems

  return allDocs.slice(0, maxItems)
})

// 初始化文档管理
function initializeDocuments() {
  try {
    // 加载所有文档
    const savedDocs = localStorage.getItem('uni.allDocuments')
    if (savedDocs) {
      const parsed = JSON.parse(savedDocs)
      if (Array.isArray(parsed) && parsed.length > 0) {
        allDocuments.value = parsed
      }
    }

    // 加载打开的标签页
    const savedTabs = localStorage.getItem('uni.openTabs')
    if (savedTabs && allDocuments.value.length > 0) {
      const parsed = JSON.parse(savedTabs)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 过滤掉不存在的文档标签
        const validTabs = parsed.filter(tab =>
          allDocuments.value.find(doc => doc.id === tab.id)
        )

        if (validTabs.length > 0) {
          openTabs.value = validTabs
          const activeId = localStorage.getItem('uni.activeTabId')
          if (activeId && validTabs.find(tab => tab.id === activeId)) {
            activeTabId.value = activeId
          } else {
            activeTabId.value = validTabs[0].id
          }
          return
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load documents from localStorage:', e)
  }

  // 如果没有有效数据，创建默认文档
  if (allDocuments.value.length === 0) {
    createDefaultDocument()
  } else {
    // 如果有文档但没有打开的标签，打开第一个文档
    openTabs.value = [{ id: allDocuments.value[0].id }]
    activeTabId.value = allDocuments.value[0].id
  }
}

function createDefaultDocument() {
  const defaultDoc = {
    id: generateId(),
    title: t('editor.welcome'),
    content: getDefaultContent(),
    mode: 'wysiwyg',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  allDocuments.value = [defaultDoc]
  openTabs.value = [{ id: defaultDoc.id }]
  activeTabId.value = defaultDoc.id
  saveToLocalStorage()
}

function generateId() {
  return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

function getDefaultContent() {
  const currentLocale = locale.value
  const messages = {
    'zh': zhMessages.defaultTemplate,
    'en': enMessages.defaultTemplate
  }
  return messages[currentLocale] || messages['zh']
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('uni.allDocuments', JSON.stringify(allDocuments.value))
    localStorage.setItem('uni.openTabs', JSON.stringify(openTabs.value))
    localStorage.setItem('uni.activeTabId', activeTabId.value)
  } catch (e) {
    console.warn('Failed to save documents to localStorage:', e)
  }

  scheduleImageCleanup()
}

let imageCleanupTimer = null

function scheduleImageCleanup() {
  if (typeof window === 'undefined' || !hasIndexedDBSupport()) return
  if (imageCleanupTimer) {
    clearTimeout(imageCleanupTimer)
  }

  imageCleanupTimer = window.setTimeout(async () => {
    imageCleanupTimer = null
    await performImageCleanup()
  }, 800)
}

async function performImageCleanup() {
  try {
    const usedIds = new Set()
    allDocuments.value.forEach(doc => {
      if (!doc?.content) return
      const normalized = convertContentForStorage(doc.content)
      const ids = extractImageIdsFromContent(normalized)
      ids.forEach(id => usedIds.add(id))
    })

    // Include current editor content if it differs from stored value
    if (vd && isVditorReady) {
      const editorContent = convertContentForStorage(vd.getValue())
      const ids = extractImageIdsFromContent(editorContent)
      ids.forEach(id => usedIds.add(id))
    }

    await cleanupUnusedImages(usedIds)
  } catch (error) {
    console.warn('Image cleanup failed:', error)
  }
}

function getDocument(docId) {
  return allDocuments.value.find(d => d.id === docId)
}

function getActiveDocument() {
  return getDocument(activeTabId.value)
}

function isTabOpen(docId) {
  return openTabs.value.some(tab => tab.id === docId)
}

function isDocumentModified(docId) {
  return documentModifications.value.has(docId)
}

function markDocumentModified(docId) {
  documentModifications.value.set(docId, true)
}

function markDocumentSaved(docId) {
  documentModifications.value.delete(docId)
}

async function createNewDocument() {
  const newDoc = {
    id: generateId(),
    title: `${t('documents.untitled')} ${allDocuments.value.length + 1}`,
    content: '',
    mode: 'wysiwyg',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  allDocuments.value.push(newDoc)
  await openDocument(newDoc.id)
  saveToLocalStorage()
  // 更新滚动条
  nextTick(() => updateScrollbar())
}

async function openDocument(docId) {
  // 如果标签页未打开，则打开它
  if (!isTabOpen(docId)) {
    openTabs.value.push({ id: docId })
  }

  await selectTab(docId)
  saveToLocalStorage()
  // 更新滚动条
  nextTick(() => updateScrollbar())
}

async function selectTab(docId) {
  if (docId === activeTabId.value) return

  // 保存当前文档状态
  saveCurrentDocumentState()

  // 切换到新文档
  activeTabId.value = docId
  const newDoc = getActiveDocument()

  if (newDoc && vd && isVditorReady) {
    const displayContent = await convertContentForEditor(newDoc.content || '')
    // 更新编辑器内容
    vd.setValue(displayContent, false)

    // 如果文档有内容但标题是默认的，尝试提取标题
    if (newDoc.content && newDoc.title.startsWith(t('documents.untitled'))) {
      updateDocumentTitle(newDoc.id, newDoc.content)
    }

    // 发送HTML更新
    emit('update:html', vd.getHTML())
  }

  saveToLocalStorage()
}

async function closeTab(docId) {
  if (openTabs.value.length <= 1) return

  const index = openTabs.value.findIndex(tab => tab.id === docId)
  if (index === -1) return

  // 如果有未保存的更改，提示用户
  if (isDocumentModified(docId)) {
    if (!confirm(t('documents.unsavedChanges') + '，' + t('documents.confirmClose'))) {
      return
    }
  }

  openTabs.value.splice(index, 1)

  // 如果关闭的是当前活跃标签，切换到其他标签
  if (docId === activeTabId.value) {
    const newIndex = Math.min(index, openTabs.value.length - 1)
    await selectTab(openTabs.value[newIndex].id)
  }

  saveToLocalStorage()
  // 更新滚动条
  nextTick(() => updateScrollbar())
}

async function duplicateDocument(docId) {
  const originalDoc = getDocument(docId)
  if (!originalDoc) return

  const newDoc = {
    id: generateId(),
    title: originalDoc.title + ' - ' + t('documents.copy'),
    content: originalDoc.content,
    mode: originalDoc.mode,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  allDocuments.value.push(newDoc)
  await openDocument(newDoc.id)
  saveToLocalStorage()
}

function confirmDeleteDocument(docId) {
  if (allDocuments.value.length <= 1) return

  documentToDelete.value = docId
  showDeleteConfirm.value = true
}

function deleteDocument() {
  const docId = documentToDelete.value

  // 从所有文档中删除
  const docIndex = allDocuments.value.findIndex(d => d.id === docId)
  if (docIndex !== -1) {
    allDocuments.value.splice(docIndex, 1)
  }

  // 从打开的标签中删除
  const tabIndex = openTabs.value.findIndex(tab => tab.id === docId)
  if (tabIndex !== -1) {
    openTabs.value.splice(tabIndex, 1)
  }

  // 清除修改状态
  documentModifications.value.delete(docId)

  // 如果删除的是当前活跃文档，切换到其他文档
  if (docId === activeTabId.value && openTabs.value.length > 0) {
    const newIndex = Math.min(tabIndex, openTabs.value.length - 1)
    selectTab(openTabs.value[newIndex].id)
  } else if (openTabs.value.length === 0 && allDocuments.value.length > 0) {
    // 如果没有打开的标签但还有文档，打开第一个文档
    openDocument(allDocuments.value[0].id)
  }

  showDeleteConfirm.value = false
  documentToDelete.value = ''
  saveToLocalStorage()
}

function cancelDelete() {
  showDeleteConfirm.value = false
  documentToDelete.value = ''
}

function toggleDocumentManager() {
  showDocumentManager.value = !showDocumentManager.value
}

function saveCurrentDocumentState(preparedContent) {
  const activeDoc = getActiveDocument()
  if (activeDoc && vd && isVditorReady) {
    const currentEditorValue = vd.getValue()
    const currentContent = typeof preparedContent === 'string'
      ? preparedContent
      : convertContentForStorage(currentEditorValue)
    const currentMode = vd.getCurrentMode()

    if (activeDoc.content !== currentContent) {
      activeDoc.content = currentContent
      activeDoc.updatedAt = Date.now()
      markDocumentModified(activeDoc.id)

      // 更新文档标题
      updateDocumentTitle(activeDoc.id, currentContent)
    }

    if (activeDoc.mode !== currentMode) {
      activeDoc.mode = currentMode
    }
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return t('documents.timeJustNow')
  if (diff < 3600000) return t('documents.timeMinutesAgo', { minutes: Math.floor(diff / 60000) })
  if (diff < 86400000) return t('documents.timeHoursAgo', { hours: Math.floor(diff / 3600000) })
  if (diff < 604800000) return t('documents.timeDaysAgo', { days: Math.floor(diff / 86400000) })

  return date.toLocaleDateString()
}

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

// 初始化编辑器
async function initVditor() {
  if (!elRef.value) return

  const activeDoc = getActiveDocument()
  const initialContent = activeDoc?.content || getDefaultContent()
  const initialMode = activeDoc?.mode || 'wysiwyg'
  const editorReadyContent = await convertContentForEditor(initialContent || '')

  vd = new Vditor(elRef.value, {
    value: editorReadyContent,
    cache: { enable: false },
    height: '100%',
    mode: initialMode,
    lang: getVditorLang(locale.value),
    theme: getEditorTheme(props.pageTheme),
    toolbarConfig: { pin: true },
    toolbar: [
      'headings', 'bold', 'italic', 'strike', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', 'outline', '|',
      'quote', 'line', 'code', 'inline-code', 'insert-before', 'insert-after', '|',
      'table', 'link', 'upload', 'emoji', '|',
      'undo', 'redo', '|',
      'edit-mode',
    ],
    counter: { enable: true },
    upload: {
      accept: 'image/*',
      multiple: true,
      handler: handleImageUpload
    },
    preview: {
      theme: {
        current: getEditorTheme(props.pageTheme),
        path: 'https://unpkg.com/vditor/dist/css/content-theme'
      },
      hljs: {
        style: getEditorTheme(props.pageTheme) === 'dark' ? 'github-dark' : 'github'
      }
    },
    hint: { delay: 500 },
    typewriterMode: false,
    after: () => {
      isVditorReady = true
      console.log('Vditor ready')

      // 绑定滚动事件
      bindScrollEvents()

      // 初始化时发送内容
      if (vd) {
        emit('update:html', vd.getHTML())
      }
    },
    input: (value) => {
      if (isVditorReady) {
        const storageContent = convertContentForStorage(value)

        // 标记当前文档为已修改
        const activeDoc = getActiveDocument()
        if (activeDoc && activeDoc.content !== storageContent) {
          markDocumentModified(activeDoc.id)
          activeDoc.updatedAt = Date.now()

          // 更新文档标题
          updateDocumentTitle(activeDoc.id, storageContent)
        }

        emit('update:html', vd.getHTML())
      }
    },
    select: () => {
      if (isVditorReady) {
        emit('update:html', vd.getHTML())
      }
    },
    blur: () => {
      if (isVditorReady) {
        const storageContent = convertContentForStorage(vd.getValue())
        // 保存当前文档状态
        saveCurrentDocumentState(storageContent)

        // 标记文档为已保存
        const activeDoc = getActiveDocument()
        if (activeDoc) {
          markDocumentSaved(activeDoc.id)
          // 最终确认标题更新
          updateDocumentTitle(activeDoc.id, storageContent)
        }

        saveToLocalStorage()
        emit('update:html', vd.getHTML())
      }
    }
  })
}

async function handleImageUpload(files) {
  if (!files) return
  const fileList = Array.from(files).filter(file => file instanceof File)
  if (fileList.length === 0) return

  const fragments = []

  for (const file of fileList) {
    try {
      const { url, name } = await saveImage(file)
      if (!url) continue

      const rawName = name || file.name || 'image'
      const alt = rawName.replace(/\.[^/.]+$/, '') || 'image'
      fragments.push(`![${alt}](${url})`)
    } catch (error) {
      console.warn('Image upload failed:', error)
    }
  }

  if (fragments.length > 0 && vd) {
    const markdown = fragments.join('\n\n') + '\n'
    vd.insertValue(markdown)
    emit('update:html', vd.getHTML())
  }
}

// 绑定滚动事件
function bindScrollEvents() {
  if (!vd || !vd.vditor?.element) return

  // 清理之前的事件监听
  scrollCleanups.forEach(cleanup => cleanup())
  scrollCleanups.length = 0

  // 查找所有可能的滚动容器
  const scrollContainers = [
    vd.vditor.element.querySelector('.vditor-content'),
    vd.vditor.element.querySelector('.vditor-ir'),
    vd.vditor.element.querySelector('.vditor-wysiwyg'),
    vd.vditor.element.querySelector('.vditor-sv'),
    vd.vditor.element.querySelector('.vditor-preview'),
  ].filter(Boolean)

  scrollContainers.forEach(container => {
    if (container) {
      const scrollHandler = () => {
        const scrollTop = container.scrollTop
        const scrollHeight = container.scrollHeight
        const clientHeight = container.clientHeight
        const scrollRatio = scrollHeight > clientHeight ? scrollTop / (scrollHeight - clientHeight) : 0
        emit('editorScroll', { scrollRatio, scrollTop })
      }

      container.addEventListener('scroll', scrollHandler, { passive: true })
      scrollCleanups.push(() => {
        container.removeEventListener('scroll', scrollHandler)
      })
    }
  })
}

// 搜索相关函数
function handleSearch() {
  // 搜索无需防抖，因为computed会自动处理
  // filteredDocuments计算属性会立即反映搜索结果
}

function clearSearch() {
  searchQuery.value = ''
  // 重置分页
  currentPage.value = 1
}

function loadMoreDocuments() {
  currentPage.value += 1
}

// 监听搜索查询变化，重置分页
watch(searchQuery, () => {
  currentPage.value = 1
})

// 监听主题变化
watch(() => props.pageTheme, (newTheme) => {
  if (vd && isVditorReady) {
    vd.setTheme(
      getEditorTheme(newTheme),
      getEditorTheme(newTheme),
      getEditorTheme(newTheme) === 'dark' ? 'github-dark' : 'github'
    )
  }
})

// 监听语言变化
watch(locale, async (newLocale) => {
  if (vd && isVditorReady) {
    // 保存当前内容
    saveCurrentDocumentState()
    const activeDoc = getActiveDocument()
    const storedContent = activeDoc?.content || ''

    // 销毁当前实例
    try {
      scrollCleanups.forEach(cleanup => cleanup())
      scrollCleanups.length = 0
      vd.destroy()
    } catch (error) {
      console.warn('Failed to destroy Vditor:', error)
    }

    // 重新初始化
    await nextTick()
    await initVditor()

    if (vd && isVditorReady) {
      const displayContent = await convertContentForEditor(storedContent)
      vd.setValue(displayContent, false)
      emit('update:html', vd.getHTML())
    }
  }
})

// 销毁编辑器
function destroyVditor() {
  if (vd) {
    try {
      scrollCleanups.forEach(cleanup => cleanup())
      scrollCleanups.length = 0
      vd.destroy()
    } catch (error) {
      console.warn('Error destroying Vditor:', error)
    }
    clearImageCache()
    vd = null
    isVditorReady = false
  }
}

// 导出功能
async function exportMarkdown() {
  const activeDoc = getActiveDocument()
  if (!activeDoc || !activeDoc.content) {
    throw new Error('No content to export')
  }

  const blob = new Blob([activeDoc.content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${activeDoc.title || 'document'}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 导入功能
async function importMarkdown() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt'

    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) {
        reject('No file selected')
        return
      }

      if (!file.name.match(/\.(md|markdown|txt)$/i)) {
        reject('Invalid file type')
        return
      }

      try {
        const content = await file.text()
        const fileName = file.name.replace(/\.(md|markdown|txt)$/i, '')

        // 创建新文档
        const newDoc = {
          id: generateId(),
          title: fileName,
          content: content,
          mode: 'wysiwyg',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }

        allDocuments.value.push(newDoc)
        openDocument(newDoc.id)
        saveToLocalStorage()

        resolve()
      } catch (error) {
        reject(error)
      }
    }

    input.oncancel = () => {
      reject('Import cancelled')
    }

    input.click()
  })
}

// 针对特定文档的导出功能
async function exportMarkdownFromDocument(docId) {
  try {
    const doc = getDocument(docId)
    if (!doc) {
      console.error('Document not found:', docId)
      return
    }

    const blob = new Blob([doc.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.title || '无标题文档'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    console.log('Markdown exported successfully')
  } catch (error) {
    console.error('Export failed:', error)
  }
}

// 针对特定文档的导入功能
async function importMarkdownToDocument(docId) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.md,.markdown,.txt'

  input.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const doc = getDocument(docId)
      if (!doc) {
        console.error('Document not found:', docId)
        return
      }

      // 检查文档是否有内容，如果有则显示确认对话框
      if (doc.content && doc.content.trim().length > 0) {
        importTargetDocId.value = docId
        pendingImportFile.value = file
        showImportConfirm.value = true
        return
      }

      // 如果文档为空，直接导入
      await performImport(docId, file)
    } catch (error) {
      console.error('Import failed:', error)
    }
  }

  input.click()
}

// 执行实际的导入操作
async function performImport(docId, file) {
  try {
    const rawContent = await file.text()
    const content = convertContentForStorage(rawContent)
    const fileName = file.name.replace(/\.(md|markdown|txt)$/i, '')

    const doc = getDocument(docId)
    if (!doc) {
      console.error('Document not found:', docId)
      return
    }

    // 更新文档内容
    doc.content = content
    doc.title = fileName || doc.title
    doc.updatedAt = Date.now()

    // 如果是当前活跃文档，更新编辑器内容
    if (docId === activeTabId.value && vd && isVditorReady) {
      const displayContent = await convertContentForEditor(content)
      vd.setValue(displayContent)
      emit('update:html', vd.getHTML())
    }

    // 标记文档已修改
    markDocumentModified(docId)
    saveToLocalStorage()

    console.log('Markdown imported successfully')
  } catch (error) {
    console.error('Import failed:', error)
  }
}

// 确认导入
function confirmImport() {
  if (importTargetDocId.value && pendingImportFile.value) {
    performImport(importTargetDocId.value, pendingImportFile.value)
  }
  cancelImport()
}

// 取消导入
function cancelImport() {
  showImportConfirm.value = false
  importTargetDocId.value = ''
  pendingImportFile.value = null
}

// 处理文档标签页操作
function handleDocumentTabAction(docId) {
  if (!isTabOpen(docId)) {
    // 文档未打开，打开标签页
    openDocument(docId)
  } else if (docId !== activeTabId.value) {
    // 文档已打开但非活跃，切换到该标签
    selectTab(docId)
  } else {
    // 当前活跃文档，关闭标签页（但不删除文档）
    closeTab(docId)
  }
}

// 获取标签页操作的提示文本
function getTabActionTitle(docId) {
  if (!isTabOpen(docId)) {
    return t('documents.openDocument')
  } else if (docId !== activeTabId.value) {
    return t('documents.locateTab')
  } else {
    return t('documents.closeTabTitle')
  }
}


// 提取文档标题
function extractTitleFromContent(content) {
  if (!content) return null

  // 尝试匹配 markdown 标题
  const headingMatch = content.match(/^#+\s*(.+)$/m)
  if (headingMatch) {
    return headingMatch[1].trim()
  }

  // 尝试匹配第一行非空内容
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      // 移除markdown格式并限制长度
      const cleaned = trimmed.replace(/[*_`~\[\]]/g, '').trim()
      if (cleaned) {
        return cleaned.length > 50 ? cleaned.substring(0, 50) + '...' : cleaned
      }
    }
  }

  return null
}

// 更新文档标题
function updateDocumentTitle(docId, content) {
  const doc = getDocument(docId)
  if (!doc) return

  const extractedTitle = extractTitleFromContent(content)

  if (extractedTitle) {
    // 情况1：文档标题是默认的"无标题文档"格式，直接更新
    if (doc.title.startsWith(t('documents.untitled'))) {
      doc.title = extractedTitle
      saveToLocalStorage()
      return
    }

    // 情况2：当前标题与提取的标题不同，且提取的是markdown标题，则更新
    const headingMatch = content.match(/^#+\s*(.+)$/m)
    if (headingMatch && doc.title !== extractedTitle) {
      doc.title = extractedTitle
      saveToLocalStorage()
    }
  } else if (!content.trim() && !doc.title.startsWith(t('documents.untitled'))) {
    // 情况3：内容为空但标题不是默认的，保持当前标题不变
    // 这样用户手动设置的标题在清空内容时不会丢失
  }
}

// 更新滚动条
function updateScrollbar() {
  if (!tabsScrollRef.value) return

  const scrollEl = tabsScrollRef.value
  const scrollWidth = scrollEl.scrollWidth
  const clientWidth = scrollEl.clientWidth

  // 判断是否需要显示滚动条
  showScrollbar.value = scrollWidth > clientWidth

  if (showScrollbar.value) {
    // 计算滚动条thumb的宽度（百分比）
    scrollbarThumbWidth.value = (clientWidth / scrollWidth) * 100

    // 计算滚动条thumb的位置
    const scrollPercentage = scrollEl.scrollLeft / (scrollWidth - clientWidth)
    const maxThumbPosition = clientWidth - (clientWidth * scrollbarThumbWidth.value / 100)
    scrollbarThumbPosition.value = scrollPercentage * maxThumbPosition
  }
}

// 绑定滚动条事件
function bindScrollbarEvents() {
  if (!tabsScrollRef.value) return

  const scrollEl = tabsScrollRef.value

  // 监听滚动事件
  const handleScroll = () => {
    updateScrollbar()
  }

  // 监听尺寸变化
  const resizeObserver = new ResizeObserver(() => {
    updateScrollbar()
  })

  scrollEl.addEventListener('scroll', handleScroll)
  resizeObserver.observe(scrollEl)

  // 清理函数
  const cleanup = () => {
    scrollEl.removeEventListener('scroll', handleScroll)
    resizeObserver.disconnect()
  }

  scrollCleanups.push(cleanup)
}

// 获取HTML内容
function getHTML() {
  if (vd && isVditorReady) {
    return vd.getHTML()
  }
  return ''
}

onMounted(() => {
  initializeDocuments()
  nextTick(() => {
    initVditor()
    // 初始化滚动条
    setTimeout(() => {
      bindScrollbarEvents()
      updateScrollbar()
    }, 100)
  })
})

onBeforeUnmount(() => {
  // 保存当前状态
  saveCurrentDocumentState()
  saveToLocalStorage()
  if (imageCleanupTimer) {
    clearTimeout(imageCleanupTimer)
    imageCleanupTimer = null
  }
  destroyVditor()
})

// 暴露方法给父组件
defineExpose({
  getHTML,
  createNewDocument,
  openDocument,
  closeTab,
  duplicateDocument
})
</script>

<style lang="less" scoped>
@import '../styles/less/variables/colors.less';
@import '../styles/less/variables/layout.less';
@import '../styles/less/variables/typography.less';
@import '../styles/less/mixins/common.less';
// Import the UniEditor component styles
@import '../styles/less/components/uni-editor.less';
</style>
