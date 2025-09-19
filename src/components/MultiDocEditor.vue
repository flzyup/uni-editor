<template>
  <div class="multi-doc-editor">
    <!-- 文档标签页 -->
    <DocumentTabs
      :documents="documents"
      :active-document-id="activeDocumentId"
      @select-document="selectDocument"
      @create-document="createDocument"
      @close-document="closeDocument"
      @rename-document="renameDocument"
      @duplicate-document="duplicateDocument"
      @import-markdown="$emit('import-markdown')"
      @export-markdown="$emit('export-markdown')"
    />

    <!-- 编辑器区域 -->
    <div class="editor-container">
      <DocumentEditor
        v-if="activeDocument"
        :key="activeDocument.id"
        :document="activeDocument"
        :page-theme="pageTheme"
        @update:html="$emit('update:html', $event)"
        @update:content="updateDocumentContent"
        @update:mode="updateDocumentMode"
        @editor-scroll="$emit('editor-scroll', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import DocumentTabs from './DocumentTabs.vue'
import DocumentEditor from './DocumentEditor.vue'
import { useDocuments } from '../composables/useDocuments.js'

const props = defineProps({
  pageTheme: { type: String, default: 'theme-light' }
})

const emit = defineEmits(['update:html', 'editor-scroll', 'import-markdown', 'export-markdown'])

// 使用文档管理composable
const {
  documents,
  activeDocumentId,
  activeDocument,
  createDocument,
  selectDocument,
  updateDocumentContent: updateContent,
  updateDocumentMode: updateMode,
  renameDocument,
  duplicateDocument,
  closeDocument,
  initialize
} = useDocuments()

// 更新文档内容（Markdown）
function updateDocumentContent(content) {
  if (activeDocument.value) {
    updateContent(activeDocument.value.id, content)
  }
}

// 更新文档模式
function updateDocumentMode(mode) {
  if (activeDocument.value) {
    updateMode(activeDocument.value.id, mode)
  }
}

// 初始化
onMounted(() => {
  initialize()
})

// 更新当前文档内容和标题
function updateActiveDocument(title, content) {
  if (activeDocument.value) {
    if (title) {
      renameDocument(activeDocument.value.id, title)
    }
    if (content !== undefined) {
      updateDocumentContent(content)
    }
  }
}

// 暴露给父组件的方法
defineExpose({
  getActiveDocument: () => activeDocument.value,
  getAllDocuments: () => documents.value,
  createDocument,
  selectDocument,
  updateActiveDocument
})
</script>

<style scoped>
.multi-doc-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-container {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
}
</style>
