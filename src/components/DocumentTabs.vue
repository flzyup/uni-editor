<template>
  <div class="document-tabs">
    <div class="tabs-container">
      <div class="tabs-scroll">
        <div
          v-for="(doc, index) in documents"
          :key="doc.id"
          class="tab"
          :class="{ active: doc.id === activeDocumentId, modified: doc.modified }"
          @click="selectDocument(doc.id)"
          @contextmenu.prevent="showContextMenu($event, doc.id)"
        >
          <div class="tab-content">
            <div class="tab-icon">📝</div>
            <div class="tab-title" :title="doc.title">{{ doc.title }}</div>
            <div
              v-if="documents.length > 1"
              class="tab-close"
              @click.stop="closeDocument(doc.id)"
              @mouseenter="hoveredClose = doc.id"
              @mouseleave="hoveredClose = null"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M9.5 3.5L8.5 2.5L6 5L3.5 2.5L2.5 3.5L5 6L2.5 8.5L3.5 9.5L6 7L8.5 9.5L9.5 8.5L7 6L9.5 3.5Z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="tabs-actions">
        <button
          class="action-btn"
          @click="importMarkdown"
          :title="$t('main.importMarkdown')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <g transform="scale(1,-1) translate(0,-24)">
              <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
            </g>
          </svg>
        </button>
        <button
          class="action-btn"
          @click="exportMarkdown"
          :title="$t('main.exportMarkdown')"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
          </svg>
        </button>
        <button
          class="add-tab-btn"
          @click="createNewDocument"
          :title="$t('documents.newDocument')"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.show"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <div class="menu-item" @click="renameDocument(contextMenu.documentId)">
        {{ $t('documents.rename') }}
      </div>
      <div class="menu-item" @click="duplicateDocument(contextMenu.documentId)">
        {{ $t('documents.duplicate') }}
      </div>
      <div class="menu-divider"></div>
      <div
        v-if="documents.length > 1"
        class="menu-item danger"
        @click="closeDocument(contextMenu.documentId)"
      >
        {{ $t('documents.close') }}
      </div>
    </div>

    <!-- 重命名对话框 -->
    <div v-if="renameDialog.show" class="rename-overlay" @click="cancelRename">
      <div class="rename-dialog" @click.stop>
        <div class="dialog-title">{{ $t('documents.renameTitle') }}</div>
        <input
          ref="renameInput"
          v-model="renameDialog.newTitle"
          class="rename-input"
          :placeholder="$t('documents.renamePlaceholder')"
          @keyup.enter="confirmRename"
          @keyup.escape="cancelRename"
        />
        <div class="dialog-actions">
          <button class="btn btn-secondary" @click="cancelRename">
            {{ $t('common.cancel') }}
          </button>
          <button class="btn btn-primary" @click="confirmRename">
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  documents: {
    type: Array,
    required: true
  },
  activeDocumentId: {
    type: String,
    required: true
  }
})

const emit = defineEmits([
  'select-document',
  'create-document',
  'close-document',
  'rename-document',
  'duplicate-document',
  'import-markdown',
  'export-markdown'
])

// 状态管理
const hoveredClose = ref(null)
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  documentId: null
})

const renameDialog = ref({
  show: false,
  documentId: null,
  newTitle: ''
})

const renameInput = ref(null)

// 方法
const selectDocument = (documentId) => {
  emit('select-document', documentId)
}

const createNewDocument = () => {
  emit('create-document')
}

const importMarkdown = () => {
  emit('import-markdown')
}

const exportMarkdown = () => {
  emit('export-markdown')
}

const closeDocument = (documentId) => {
  if (props.documents.length > 1) {
    emit('close-document', documentId)
  }
  hideContextMenu()
}

const showContextMenu = (event, documentId) => {
  contextMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    documentId
  }
}

const hideContextMenu = () => {
  contextMenu.value.show = false
}

const renameDocument = async (documentId) => {
  const doc = props.documents.find(d => d.id === documentId)
  if (!doc) return

  renameDialog.value = {
    show: true,
    documentId,
    newTitle: doc.title
  }

  hideContextMenu()

  await nextTick()
  renameInput.value?.focus()
  renameInput.value?.select()
}

const confirmRename = () => {
  const { documentId, newTitle } = renameDialog.value
  const trimmedTitle = newTitle.trim()

  if (trimmedTitle && trimmedTitle !== props.documents.find(d => d.id === documentId)?.title) {
    emit('rename-document', documentId, trimmedTitle)
  }

  cancelRename()
}

const cancelRename = () => {
  renameDialog.value.show = false
}

const duplicateDocument = (documentId) => {
  emit('duplicate-document', documentId)
  hideContextMenu()
}

// 全局点击事件处理
const handleGlobalClick = () => {
  hideContextMenu()
}

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
.document-tabs {
  position: relative;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}

.tabs-container {
  display: flex;
  align-items: center;
  height: 42px;
  overflow: hidden;
}

.tabs-scroll {
  display: flex;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tabs-scroll::-webkit-scrollbar {
  display: none;
}

.tab {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 120px;
  max-width: 200px;
  height: 100%;
  background: var(--panel);
  border-right: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.tab:hover {
  background: var(--bg-hover);
}

.tab:hover .tab-title {
  color: var(--text);
}

.tab.active {
  background: var(--bg-primary);
  border-bottom: 2px solid var(--primary);
  z-index: 1;
}

.tab-content {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  width: 100%;
  gap: 8px;
}

.tab-icon {
  font-size: 14px;
  opacity: 0.7;
}

.tab-title {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab.active .tab-title {
  color: var(--text);
  font-weight: 600;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  opacity: 0;
  transition: all 0.2s ease;
  color: var(--text-secondary);
}

.tab:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: var(--bg-hover);
  color: var(--text);
}


.tabs-actions {
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-left: 1px solid var(--border);
}

.action-btn,
.add-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 4px;
}

.action-btn:hover,
.add-tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text);
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  z-index: 1000;
  min-width: 120px;
}

.menu-item {
  padding: 8px 16px;
  font-size: 13px;
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s ease;
}

.menu-item:hover {
  background: var(--bg-hover);
}

.menu-item.danger {
  color: var(--danger);
}

.menu-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

/* 重命名对话框 */
.rename-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.rename-dialog {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  width: 300px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 16px;
}

.rename-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text);
  font-size: 14px;
  margin-bottom: 16px;
}

.rename-input:focus {
  outline: none;
  border-color: var(--primary);
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  opacity: 0.9;
}
</style>
