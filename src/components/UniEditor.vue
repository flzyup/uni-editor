<template>
  <div class="editor-wrap">
    <div ref="elRef" class="vditor-host"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, defineExpose } from 'vue'
import { useI18n } from 'vue-i18n'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import zhMessages from '../locales/zh.js'
import enMessages from '../locales/en.js'

const props = defineProps({
  pageTheme: { type: String, default: 'theme-dark' }, // 'theme-light' | 'theme-dark'
})
const emit = defineEmits(['update:html', 'editorScroll'])

const { locale } = useI18n()

const elRef = ref(null)
let vd = null
let isVditorReady = false
const scrollCleanups = []

const CACHE_KEY = 'uni-editor-content'
const MODE_CACHE_KEY = 'uni-editor-mode'

function loadCachedContent() {
  try {
    return localStorage.getItem(CACHE_KEY) || getDefaultContent()
  } catch (e) {
    return getDefaultContent()
  }
}

function loadCachedMode() {
  try {
    const savedMode = localStorage.getItem(MODE_CACHE_KEY)
    // Vditor 支持的模式: 'wysiwyg', 'ir', 'sv'
    return ['wysiwyg', 'ir', 'sv'].includes(savedMode) ? savedMode : 'wysiwyg'
  } catch (e) {
    return 'wysiwyg'
  }
}

function saveModeToCache(mode) {
  try {
    localStorage.setItem(MODE_CACHE_KEY, mode)
  } catch (e) {
    console.warn('Failed to save editor mode to localStorage:', e)
  }
}

function getDefaultContent() {
  // 根据当前语言返回默认内容
  const currentLocale = locale.value

  // 获取对应语言的默认模板
  const messages = {
    'zh': zhMessages,
    'en': enMessages
  }

  const message = messages[currentLocale] || messages['en']
  return message.defaultTemplate
}

function saveContent(content) {
  try {
    localStorage.setItem(CACHE_KEY, content)
  } catch (e) {
    console.warn('Failed to save content to localStorage:', e)
  }
}

const initial = loadCachedContent()
const initialMode = loadCachedMode()

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

onMounted(async () => {
  vd = new Vditor(elRef.value, {
    value: initial,
    cache: { enable: false },
    height: '100%',
    mode: initialMode,
    lang: getVditorLang(locale.value),
    toolbarConfig: { pin: true },
    toolbar: [
      'headings', 'bold', 'italic', 'strike', '|',
      'list', 'ordered-list', 'check', 'outdent', 'indent', 'outline', '|',
      'quote', 'line', 'code', 'inline-code',
      'table', 'insert-before', 'insert-after','|',
      'line', 'link', 'emoji', '|', //'upload',
      'undo', 'redo', '|',
      'edit-mode',
      // 'devtools', '|'
    ],
    counter: { enable: true },
    upload: { accept: 'image/*' },
    input: () => emitHtml(),
    after: () => {
      isVditorReady = true
      vd.setTheme(getEditorTheme(props.pageTheme))
      emitHtml()
      // 添加模式变化监听
      addModeChangeListener()
      setupScrollSync()
    },
  })
  window.addEventListener('keydown', onKey)
})

watch(() => props.pageTheme, async (v) => {
  if (vd && isVditorReady) {
    try {
      vd.setTheme(getEditorTheme(v))
    } catch (error) {
      console.warn('Failed to set Vditor theme:', error)
    }
  }
})

// 监听语言变化，重新初始化Vditor（因为Vditor没有动态切换语言的API）
watch(locale, async (newLocale) => {
  if (vd && isVditorReady) {
    // 保存当前内容
    const currentContent = vd.getValue()

    // 销毁当前实例
    try {
      cleanupScrollSync()
      vd.destroy()
    } catch (error) {
      console.warn('Failed to destroy Vditor:', error)
    }

    // 重新初始化
    await nextTick()
    vd = new Vditor(elRef.value, {
      value: currentContent,
      cache: { enable: false },
      height: '100%',
      mode: loadCachedMode(), // 使用缓存的模式
      lang: getVditorLang(newLocale),
      toolbarConfig: { pin: true },
      toolbar: [
        'headings', 'bold', 'italic', 'strike', '|',
        'list', 'ordered-list', 'check', 'outdent', 'indent', 'outline', '|',
        'quote', 'line', 'code', 'inline-code', '|',
        'table', 'insert-before', 'insert-after','|',
        'line', 'link', 'emoji', '|', //'upload',
        'undo', 'redo', '|',
        'edit-mode', 'both',
        'code-theme','content-theme',  '|',
        'export'
        // 'devtools', '|'
      ],
      counter: { enable: true },
      upload: { accept: 'image/*' },
      input: () => emitHtml(),
      after: () => {
        isVditorReady = true
        vd.setTheme(getEditorTheme(props.pageTheme))
        emitHtml()
        // 重新添加模式变化监听
        addModeChangeListener()
        setupScrollSync()
      },
    })
  }
})

function emitHtml() {
  if (!vd) return
  try {
    const html = vd.getHTML()
    emit('update:html', html)
    // 保存内容到localStorage
    const content = vd.getValue()
    saveContent(content)
  } catch (e) {
    // 某些版本如返回 Promise，可兼容处理
    Promise.resolve(vd.getHTML()).then((html) => {
      emit('update:html', html)
      const content = vd.getValue()
      saveContent(content)
    })
  }
}

function getHTML() {
  return vd?.getHTML?.() || Promise.resolve('')
}

function exportMarkdown() {
  if (!vd) return Promise.reject('Editor not ready')

  try {
    const markdownContent = vd.getValue()
    if (!markdownContent) {
      return Promise.reject('No content to export')
    }

    // 提取文件名
    let filename = getFilenameFromContent(markdownContent)

    // 创建下载链接
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename

    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  }
}

function importMarkdown() {
  return new Promise((resolve, reject) => {
    if (!vd) {
      reject('Editor not ready')
      return
    }

    // 创建文件输入元素
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,text/markdown'
    input.style.display = 'none'

    input.onchange = (event) => {
      const file = event.target.files?.[0]
      if (!file) {
        reject('No file selected')
        return
      }

      // 验证文件类型
      const fileExtension = file.name.toLowerCase().split('.').pop()
      if (!['md', 'markdown'].includes(fileExtension)) {
        reject('Invalid file type')
        return
      }

      // 读取文件内容
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result
          if (typeof content === 'string') {
            // 设置编辑器内容
            vd.setValue(content)
            // 手动触发HTML更新，确保右侧预览区域更新
            setTimeout(() => {
              emitHtml()
            }, 100)
            resolve(content)
          } else {
            reject('Failed to read file content')
          }
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject('Failed to read file')
      }

      reader.readAsText(file, 'utf-8')
    }

    input.oncancel = () => {
      reject('Import cancelled')
    }

    // 触发文件选择
    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  })
}

function getFilenameFromContent(content) {
  // 查找第一个标题（# 或 ## 等）
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmedLine = line.trim()
    // 匹配 markdown 标题格式：# 标题, ## 标题, ### 标题 等
    const headerMatch = trimmedLine.match(/^#{1,6}\s+(.+)$/)
    if (headerMatch) {
      let title = headerMatch[1].trim()

      // 清理标题，移除不适合作为文件名的字符
      title = title
        .replace(/[<>:"/\\|?*]/g, '') // 移除Windows不支持的字符
        .replace(/\s+/g, '_') // 空格替换为下划线
        .replace(/[^\w\u4e00-\u9fa5_-]/g, '') // 只保留字母、数字、中文、下划线和连字符
        .substring(0, 50) // 限制长度

      if (title) {
        return `${title}.md`
      }
    }
  }

  // 如果没有找到标题，使用时间戳格式
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_')
  return `uni-editor-export_${timestamp}.md`
}

onBeforeUnmount(() => {
  isVditorReady = false
  cleanupScrollSync()
  if (vd) {
    vd.destroy?.()
    vd = null
  }
  window.removeEventListener('keydown', onKey)
})

function addModeChangeListener() {
  if (!vd || !vd.vditor?.element) return

  // 监听编辑模式按钮点击
  const toolbar = vd.vditor.element.querySelector('.vditor-toolbar')
  if (toolbar) {
    // 查找编辑模式相关的按钮
    const modeButtons = toolbar.querySelectorAll('[data-type="edit-mode"], [data-type="both"]')

    modeButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 延迟检查模式变化，因为 Vditor 需要时间更新
        setTimeout(() => {
          if (vd && vd.vditor) {
            // 检查当前活跃的编辑器类型
            let currentMode = 'wysiwyg' // 默认值

            if (vd.vditor.sv && vd.vditor.sv.element.style.display !== 'none') {
              currentMode = 'sv'
            } else if (vd.vditor.ir && vd.vditor.ir.element.style.display !== 'none') {
              currentMode = 'ir'
            } else if (vd.vditor.wysiwyg && vd.vditor.wysiwyg.element.style.display !== 'none') {
              currentMode = 'wysiwyg'
            }

            saveModeToCache(currentMode)
            setupScrollSync()
          }
        }, 150)
      })
    })
  }
}

function onKey(e) {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
  const z = e.key.toLowerCase() === 'z'
  if ((isMac ? e.metaKey : e.ctrlKey) && z) {
    e.preventDefault()
    if (e.shiftKey) document.execCommand('redo')
    else document.execCommand('undo')
  }
}

function setupScrollSync() {
  cleanupScrollSync()
  if (!vd || !vd.vditor) return

  const modes = ['wysiwyg', 'ir', 'sv']
  const state = {
    rafId: 0,
    lastMode: '',
    lastTop: -1,
    lastRatio: -1,
    lastMax: -1,
  }

  const tick = () => {
    const mode = vd.vditor.currentMode || modes.find(m => vd.vditor[m]) || 'wysiwyg'
    const modeData = vd.vditor[mode]
    const element = modeData?.element

    if (element instanceof HTMLElement) {
      const container = resolveScrollableContainer(element, mode)
      if (container instanceof HTMLElement) {
        const maxScroll = container.scrollHeight - container.clientHeight
        const currentTop = container.scrollTop
        const ratio = maxScroll > 0 ? currentTop / maxScroll : 0

        const ratioChanged = Math.abs(ratio - state.lastRatio) > 0.001
        const modeChanged = mode !== state.lastMode
        const topChanged = Math.abs(currentTop - state.lastTop) > 0.5
        const sizeChanged = Math.abs(maxScroll - state.lastMax) > 0.5

        if (ratioChanged || modeChanged || topChanged || sizeChanged) {
          emit('editorScroll', {
            mode,
            ratio,
            scrollTop: currentTop,
            scrollHeight: container.scrollHeight,
            clientHeight: container.clientHeight,
          })
          state.lastRatio = ratio
          state.lastMode = mode
          state.lastTop = currentTop
          state.lastMax = maxScroll
        }
      }
    }

    state.rafId = requestAnimationFrame(tick)
  }

  state.rafId = requestAnimationFrame(tick)
  scrollCleanups.push(() => {
    cancelAnimationFrame(state.rafId)
  })
}

function cleanupScrollSync() {
  while (scrollCleanups.length) {
    const dispose = scrollCleanups.pop()
    try {
      dispose?.()
    } catch (error) {
      console.warn('Failed to cleanup editor scroll listener:', error)
    }
  }
}

function resolveScrollableContainer(element, mode) {
  const candidates = []

  if (element.closest) {
    candidates.push(element.closest(`.vditor-${mode}`))
    candidates.push(element.closest('.vditor-content'))
    candidates.push(element.closest('.vditor'))
  }

  if (element.parentElement) {
    candidates.push(element.parentElement)
  }

  candidates.push(element)

  for (const candidate of candidates) {
    if (!(candidate instanceof HTMLElement)) continue
    if (isScrollable(candidate)) {
      return candidate
    }
  }

  let current = element.parentElement
  while (current && current !== document.body) {
    if (isScrollable(current)) {
      return current
    }
    current = current.parentElement
  }

  return element
}

function isScrollable(el) {
  if (!(el instanceof HTMLElement)) return false
  if (el === document.body || el === document.documentElement) return false
  const style = window.getComputedStyle(el)
  const overflowY = style.overflowY
  if (overflowY === 'hidden') return false
  if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
    return el.scrollHeight > el.clientHeight + 2
  }
  return el.scrollHeight > el.clientHeight + 2
}

defineExpose({ getHTML, exportMarkdown, importMarkdown })
</script>

<style scoped>
.editor-wrap { height: 100%; min-height: 0; display: flex; }
.vditor-host { border-top: 1px solid var(--border); flex: 1; min-height: 0; }
:deep(.vditor) { background: var(--panel); color: var(--text); border: none; }
:deep(.vditor .vditor-toolbar) {
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}
/* 提升深色模式下工具栏可读性 */
:deep(.vditor .vditor-toolbar) .vditor-tooltipped,
:deep(.vditor .vditor-toolbar) button,
:deep(.vditor .vditor-toolbar) svg,
:deep(.vditor .vditor-toolbar) path {
  color: var(--text) !important;
  fill: var(--text) !important;
  stroke: var(--text) !important;
}
/* Vditor 工具栏按钮悬停和激活状态，使用统一主题色 */
:deep(.vditor .vditor-toolbar button:hover) {
  background: color-mix(in srgb, var(--accent) 15%, var(--panel)) !important;
  border-color: var(--accent) !important;
  color: var(--text) !important;
  fill: var(--text) !important;
  stroke: var(--text) !important;
  transform: translateY(-1px);
}
:deep(.vditor .vditor-toolbar button:active) {
  background: color-mix(in srgb, var(--accent) 25%, var(--panel)) !important;
  transform: translateY(0px);
}
/* Vditor 工具栏按钮激活状态（选中状态）*/
:deep(.vditor .vditor-toolbar button.vditor-toolbar--current) {
  background: color-mix(in srgb, var(--accent) 20%, var(--panel)) !important;
  border-color: var(--accent) !important;
  color: var(--text) !important;
}
/* Vditor 分隔符样式 */
:deep(.vditor .vditor-toolbar .vditor-toolbar__divider) {
  background: var(--border) !important;
}
/* Vditor 下拉菜单样式 */
:deep(.vditor .vditor-panel) {
  background: var(--panel) !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 15%, transparent) !important;
}
:deep(.vditor .vditor-panel button) {
  color: var(--text) !important;
  background: transparent !important;
  border: none !important;
}
:deep(.vditor .vditor-panel button:hover) {
  background: color-mix(in srgb, var(--accent) 15%, var(--panel)) !important;
}
/* Vditor tooltip 样式 */
:deep(.vditor-tooltipped__tip) {
  background: var(--panel) !important;
  color: var(--text) !important;
  border: 1px solid var(--border) !important;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 10%, transparent) !important;
}
:deep(.vditor-reset) { color: var(--text); }
:deep(.vditor-reset a) { color: var(--accent); }
:deep(.vditor-reset blockquote) { border-left: 3px solid var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
</style>
