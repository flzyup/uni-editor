import hljs from 'highlight.js/lib/core'
// 按需导入常用语言，减少包体积
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import c from 'highlight.js/lib/languages/c'
import csharp from 'highlight.js/lib/languages/csharp'
import php from 'highlight.js/lib/languages/php'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import html from 'highlight.js/lib/languages/xml' // xml包含html
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import markdown from 'highlight.js/lib/languages/markdown'

// 注册语言
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('c', c)
hljs.registerLanguage('csharp', csharp)
hljs.registerLanguage('php', php)
hljs.registerLanguage('go', go)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('html', html)
hljs.registerLanguage('xml', html)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('markdown', markdown)

// 配置
hljs.configure({
  ignoreUnescapedHTML: true
})

// Highlight code blocks in HTML content
export function highlightCodeBlocks(html) {
  if (!html) return html

  // Create a DOM parser
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Find all code blocks
  const codeBlocks = doc.querySelectorAll('pre code')

  codeBlocks.forEach(block => {
    // Skip if already highlighted
    if (block.classList.contains('hljs')) return

    // Get language from class name (e.g., language-javascript)
    let language = null
    for (const className of block.classList) {
      if (className.startsWith('language-')) {
        language = className.replace('language-', '')
        break
      }
    }

    // Auto-detect language if not specified
    if (!language) {
      const result = hljs.highlightAuto(block.textContent)
      language = result.language
    }

    // Highlight the code
    try {
      let highlighted
      if (language && hljs.getLanguage(language)) {
        highlighted = hljs.highlight(block.textContent, { language })
      } else {
        highlighted = hljs.highlightAuto(block.textContent)
      }

      // Apply highlighting
      block.innerHTML = highlighted.value
      block.classList.add('hljs', `language-${highlighted.language || 'text'}`)

      // Add language label
      const pre = block.parentElement
      if (pre && pre.tagName.toLowerCase() === 'pre') {
        // Remove existing language label
        const existingLabel = pre.querySelector('.code-language')
        if (existingLabel) existingLabel.remove()

        // Add language label
        if (highlighted.language) {
          const label = document.createElement('div')
          label.className = 'code-language'
          label.textContent = highlighted.language.toUpperCase()
          pre.appendChild(label)
        }
      }
    } catch (e) {
      // Fallback: just add hljs class
      block.classList.add('hljs')
    }
  })

  // Also highlight inline code (basic)
  const inlineCodes = doc.querySelectorAll('code:not(pre code)')
  inlineCodes.forEach(code => {
    if (!code.classList.contains('hljs-inline')) {
      code.classList.add('hljs-inline')
    }
  })

  return doc.body.innerHTML
}

// Export hljs for direct use if needed
export { hljs }