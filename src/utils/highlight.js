import hljs from 'highlight.js'
// 不导入默认样式，使用自定义样式

// Initialize highlight.js
hljs.configure({
  ignoreUnescapedHTML: true,
  languages: [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala',
    'html', 'css', 'scss', 'less', 'xml', 'json', 'yaml',
    'bash', 'shell', 'powershell', 'sql', 'markdown'
  ]
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