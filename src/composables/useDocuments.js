import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

// 全局文档状态
const documents = ref([])
const activeDocumentId = ref(null)

// 缓存键
const DOCUMENTS_CACHE_KEY = 'uni-editor-documents'
const ACTIVE_DOC_CACHE_KEY = 'uni-editor-active-document'

export function useDocuments() {
  const { t } = useI18n()

  // 计算属性
  const activeDocument = computed(() => {
    return documents.value.find(doc => doc.id === activeDocumentId.value) || null
  })

  const hasMultipleDocuments = computed(() => {
    return documents.value.length > 1
  })

  // 生成唯一ID
  function generateId() {
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // 从内容中提取第一个标题作为标签名称
  function extractTitleFromContent(content) {
    if (!content || typeof content !== 'string') {
      return null
    }

    // 查找第一个标题（# 开头的行）
    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('#')) {
        // 提取标题文本，移除#符号和多余空格
        const title = trimmed.replace(/^#+\s*/, '').trim()
        if (title) {
          // 限制标题长度，超过20个字符用...截断
          return title.length > 20 ? title.substring(0, 20) + '...' : title
        }
      }
    }

    return null
  }

  // 生成新文档标题
  function generateTitle() {
    const existingTitles = documents.value.map(doc => doc.title)
    let counter = 1
    let title = t('documents.untitled')

    while (existingTitles.includes(title)) {
      counter++
      title = `${t('documents.untitled')} ${counter}`
    }

    return title
  }

  // 获取新文档的空内容
  function getEmptyContent() {
    return ''
  }

  // 确保内容是Markdown格式，而不是HTML
  function ensureMarkdownContent(content) {
    if (!content) return getEmptyContent()

    // 检查是否包含HTML标签（简单检测）
    const hasHtmlTags = /<[^>]+>/.test(content)
    if (hasHtmlTags) {
      // 如果包含HTML标签，返回默认内容而不是尝试转换
      // 这是为了避免复杂的HTML到Markdown转换
      console.warn('Detected HTML content in document, using empty content instead')
      return getEmptyContent()
    }

    return content
  }

  // 创建新文档
  function createDocument(options = {}) {
    // 如果没有提供内容，使用空内容；如果提供了内容，进行验证
    const content = options.content !== undefined ?
      ensureMarkdownContent(options.content) :
      getEmptyContent()

    const hasCustomTitle = typeof options.title === 'string' && options.title.trim().length > 0
    const autoTitle = options.autoTitle !== undefined ? options.autoTitle : !hasCustomTitle

    const newDoc = {
      id: generateId(),
      title: hasCustomTitle ? options.title.trim() : generateTitle(),
      content: content,
      modified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mode: 'wysiwyg', // Vditor 模式
      autoTitle,
      ...options
    }

    documents.value.push(newDoc)
    activeDocumentId.value = newDoc.id
    saveToCache()

    return newDoc
  }

  // 选择文档
  function selectDocument(documentId) {
    const doc = documents.value.find(d => d.id === documentId)
    if (doc) {
      activeDocumentId.value = documentId
      saveActiveDocumentToCache()
    }
  }

  // 更新文档内容
  function updateDocumentContent(documentId, content) {
    const doc = documents.value.find(d => d.id === documentId)
    if (doc) {
      const validatedContent = ensureMarkdownContent(content)
      const isModified = validatedContent.trim() !== ''

      const extractedTitle = extractTitleFromContent(validatedContent)
      if (doc.autoTitle) {
        if (extractedTitle) {
          doc.title = extractedTitle
        }
      }

      doc.content = validatedContent
      doc.modified = isModified
      doc.updatedAt = new Date().toISOString()
      saveToCache()
    }
  }

  // 更新文档模式
  function updateDocumentMode(documentId, mode) {
    const doc = documents.value.find(d => d.id === documentId)
    if (doc) {
      doc.mode = mode
      saveToCache()
    }
  }

  // 重命名文档
  function renameDocument(documentId, newTitle) {
    const doc = documents.value.find(d => d.id === documentId)
    if (doc && newTitle.trim()) {
      doc.title = newTitle.trim()
      doc.updatedAt = new Date().toISOString()
      doc.autoTitle = false
      saveToCache()
      return true
    }
    return false
  }

  // 复制文档
  function duplicateDocument(documentId) {
    const doc = documents.value.find(d => d.id === documentId)
    if (doc) {
      const duplicatedDoc = createDocument({
        title: `${doc.title} ${t('documents.copy')}`,
        content: doc.content,
        mode: doc.mode,
        autoTitle: false
      })
      return duplicatedDoc
    }
    return null
  }

  // 关闭文档
  function closeDocument(documentId) {
    const docIndex = documents.value.findIndex(d => d.id === documentId)
    if (docIndex === -1 || documents.value.length <= 1) {
      return false
    }

    const doc = documents.value[docIndex]

    // 如果关闭的是当前激活文档，需要选择新的激活文档
    if (activeDocumentId.value === documentId) {
      // 优先选择下一个文档，如果没有则选择上一个
      const nextIndex = docIndex < documents.value.length - 1 ? docIndex + 1 : docIndex - 1
      if (nextIndex >= 0 && nextIndex < documents.value.length) {
        activeDocumentId.value = documents.value[nextIndex].id
      }
    }

    documents.value.splice(docIndex, 1)
    saveToCache()
    saveActiveDocumentToCache()

    return true
  }

  // 移动文档位置
  function moveDocument(fromIndex, toIndex) {
    if (fromIndex === toIndex) return

    const doc = documents.value.splice(fromIndex, 1)[0]
    documents.value.splice(toIndex, 0, doc)
    saveToCache()
  }

  // 获取文档统计信息
  function getDocumentStats(documentId) {
    const doc = documents.value.find(d => d.id === documentId)
    if (!doc) return null

    const content = doc.content || ''
    const wordCount = content.replace(/<[^>]+>/g, '').trim().length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200)) // 假设每分钟200字

    return {
      wordCount,
      readingTime,
      lastModified: doc.updatedAt
    }
  }

  // 缓存管理
  function saveToCache() {
    try {
      const cacheData = {
        documents: documents.value,
        version: '1.0',
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(DOCUMENTS_CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to save documents to cache:', error)
    }
  }

  function saveActiveDocumentToCache() {
    try {
      localStorage.setItem(ACTIVE_DOC_CACHE_KEY, activeDocumentId.value || '')
    } catch (error) {
      console.warn('Failed to save active document to cache:', error)
    }
  }

  function loadFromCache() {
    try {
      const cached = localStorage.getItem(DOCUMENTS_CACHE_KEY)
      const activeDocCached = localStorage.getItem(ACTIVE_DOC_CACHE_KEY)

      if (cached) {
        const cacheData = JSON.parse(cached)
        if (cacheData.documents && Array.isArray(cacheData.documents)) {
          // 验证并清理文档内容，确保都是Markdown格式
          documents.value = cacheData.documents.map(doc => ({
            ...doc,
            content: ensureMarkdownContent(doc.content),
            autoTitle: doc.autoTitle !== undefined
              ? doc.autoTitle
              : (doc.title === t('documents.untitled') || doc.title?.startsWith(`${t('documents.untitled')} `))
          }))

          // 恢复激活文档
          if (activeDocCached && documents.value.find(d => d.id === activeDocCached)) {
            activeDocumentId.value = activeDocCached
          } else if (documents.value.length > 0) {
            activeDocumentId.value = documents.value[0].id
          }

          return true
        }
      }
    } catch (error) {
      console.warn('Failed to load documents from cache:', error)
    }

    return false
  }

  // 清理localStorage（临时修复方法）
  function clearCache() {
    try {
      localStorage.removeItem(DOCUMENTS_CACHE_KEY)
      localStorage.removeItem(ACTIVE_DOC_CACHE_KEY)
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }

  // 初始化
  function initialize() {
    const loaded = loadFromCache()

    if (!loaded || documents.value.length === 0) {
      // 创建默认文档
      createDocument()
    }
  }

  // 导出导入功能
  function exportDocuments() {
    const exportData = {
      documents: documents.value,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uni-editor-documents-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function importDocuments(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result)

          if (importData.documents && Array.isArray(importData.documents)) {
            // 生成新的ID避免冲突
            const importedDocs = importData.documents.map(doc => ({
              ...doc,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              autoTitle: false
            }))

            documents.value.push(...importedDocs)
            saveToCache()

            resolve(importedDocs.length)
          } else {
            reject(new Error('Invalid file format'))
          }
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  return {
    // 状态
    documents,
    activeDocumentId,
    activeDocument,
    hasMultipleDocuments,

    // 方法
    createDocument,
    selectDocument,
    updateDocumentContent,
    updateDocumentMode,
    renameDocument,
    duplicateDocument,
    closeDocument,
    moveDocument,
    getDocumentStats,

    // 缓存
    saveToCache,
    loadFromCache,
    initialize,

    // 导入导出
    exportDocuments,
    importDocuments
  }
}
