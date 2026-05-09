// Build HTML suitable for WeChat posting by reading actual theme CSS variables
// from styles/themes.css. We compute colors/typography via a hidden probe element
// with classes: `editor-theme <theme>`, then generate minimal content CSS.

import juice from 'juice'
import { replaceImageSrcWithDataUrls } from './imageStore.js'

// Utility function for converting camelCase to kebab-case (currently unused but kept for future use)
// function camelToKebab(s){return s.replace(/[A-Z]/g, m=>'-'+m.toLowerCase())}

/** Read a CSS custom property as a resolved color string (e.g. rgb(...) / #...) */
function readThemeColor(themeEl, varName, fallback) {
  const raw = getComputedStyle(themeEl).getPropertyValue(varName).trim()
  return raw || fallback
}

/** Alpha-blend a resolved CSS color toward transparent (for borders/fills). */
function cssColorWithAlpha(cssColor, alpha, themedWrapper) {
  const probe = document.createElement('span')
  probe.style.color = cssColor
  themedWrapper.appendChild(probe)
  const rgb = getComputedStyle(probe).color
  themedWrapper.removeChild(probe)
  const m = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (!m) return cssColor
  return `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${alpha})`
}

/**
 * Juice / 公众号编辑器无法依赖保留的 &lt;style&gt; 与 :has()；
 * 无序列表竖条来自伪元素，任务列表使用原生 checkbox（粘贴常被剥离）。
 * 在 juice 之后写入纯内联的真实节点，便于粘贴到公众号后台。
 *
 * 列表项内常为块级子节点（如 &lt;p&gt;），若仅在 li 开头插入 inline 标记，
 * 标记会独占一行、正文另起一行。此处统一用「单行表格」左窄右宽，与邮件/HTML 粘贴兼容。
 */
function materializeWechatLists(container, themeEl, themedWrapper) {
  const accent = readThemeColor(themeEl, '--card-accent', '#8b5cf6')
  const cardText = readThemeColor(themeEl, '--card-text', '#334155')
  const borderUnchecked = cssColorWithAlpha(accent, 0.45, themedWrapper)
  const fillUnchecked = cssColorWithAlpha(accent, 0.06, themedWrapper)
  const ulRailColor = cssColorWithAlpha(accent, 0.15, themedWrapper)
  const ulMarkerColor = cssColorWithAlpha(accent, 0.6, themedWrapper)
  const glow1 = cssColorWithAlpha(accent, 0.8, themedWrapper)
  const glow2 = cssColorWithAlpha(accent, 0.4, themedWrapper)
  const strongBg = cssColorWithAlpha(accent, 0.15, themedWrapper)
  const codeBg = cssColorWithAlpha(accent, 0.12, themedWrapper)
  const codeFg = cssColorWithAlpha(accent, 0.9, themedWrapper)
  const codeBd = cssColorWithAlpha(accent, 0.2, themedWrapper)

  function isMarkerSpan(el) {
    if (!el || el.nodeType !== 1 || el.tagName !== 'SPAN') return false
    return (
      el.hasAttribute('data-wechat-ul-marker') ||
      el.hasAttribute('data-wechat-ul-rail') ||
      el.hasAttribute('data-wechat-ol-marker') ||
      el.hasAttribute('data-wechat-task-marker') ||
      el.hasAttribute('data-wechat-strong')
    )
  }

  function isJuicePseudoSpan(span) {
    if (!span || span.nodeType !== 1 || span.tagName !== 'SPAN') return false
    if (isMarkerSpan(span)) return false
    const st = span.getAttribute('style') || ''
    return /position\s*:\s*absolute/i.test(st)
  }

  function stripJuicePseudoSpans(root) {
    Array.from(root.querySelectorAll('span')).forEach((span) => {
      if (isJuicePseudoSpan(span)) span.remove()
    })
  }

  function replaceBoldWithSpan(el) {
    const span = document.createElement('span')
    span.setAttribute('data-wechat-strong', '1')
    span.setAttribute(
      'style',
      `display:inline;color:${accent};font-weight:700;background:${strongBg};padding:1px 3px;border-radius:3px;white-space:normal;word-break:normal;`
    )
    while (el.firstChild) span.appendChild(el.firstChild)
    el.replaceWith(span)
    return span
  }

  function normalizeInline(el) {
    const tag = el.tagName.toLowerCase()
    if (tag === 'strong' || tag === 'b') {
      replaceBoldWithSpan(el)
      return
    }
    if (tag === 'code') {
      if (el.closest && el.closest('pre')) return
      el.setAttribute(
        'style',
        `display:inline;color:${codeFg};background:${codeBg};padding:1px 5px;border-radius:4px;font-size:0.9em;font-weight:500;border:1px solid ${codeBd};white-space:normal;word-break:normal;`
      )
      return
    }
    if (tag === 'em') {
      el.setAttribute('style', 'display:inline;font-style:italic;white-space:normal;')
      return
    }
    if (tag === 'span' && !isMarkerSpan(el) && !isJuicePseudoSpan(el)) {
      const st = el.getAttribute('style') || ''
      if (/background|box-shadow/i.test(st)) {
        el.setAttribute(
          'style',
          `${st.replace(/display\s*:\s*(inline-block|block)\s*;?/gi, '')};display:inline;vertical-align:baseline;white-space:normal;word-break:normal;`
        )
      }
    }
  }

  function unwrapDirectParagraphsInLi(li) {
    Array.from(li.children).forEach((child, index) => {
      if (child.tagName !== 'P') return
      if (index > 0) li.insertBefore(document.createElement('br'), child)
      while (child.firstChild) li.insertBefore(child.firstChild, child)
      child.remove()
    })
  }

  function wrapListItemInlineBody(li) {
    if (li.querySelector(':scope > [data-wechat-list-body]')) return

    const body = document.createElement('span')
    body.setAttribute('data-wechat-list-body', '1')
    body.setAttribute(
      'style',
      'display:inline;text-align:left;word-break:normal;overflow-wrap:break-word;white-space:normal;'
    )

    Array.from(li.childNodes).forEach((node) => {
      if (node.nodeType === 1) {
        if (isMarkerSpan(node)) return
        if (['UL', 'OL'].includes(node.tagName)) return
      }
      body.appendChild(node)
    })

    const firstNestedList = Array.from(li.children).find((child) => ['UL', 'OL'].includes(child.tagName))
    if (firstNestedList) {
      li.insertBefore(body, firstNestedList)
    } else {
      li.appendChild(body)
    }
  }

  container.querySelectorAll('ul, ol').forEach((list) => {
    const isNested = !!list.closest('li')
    let st = (list.getAttribute('style') || '').trim()
    st = st.replace(/margin[^:]*\s*:[^;]+;?/gi, '')
    st = st.replace(/padding-left\s*:[^;]+;?/gi, '')
    const patch = isNested
      ? 'margin-top:8px;margin-bottom:8px;margin-left:8px;padding-left:10px;'
      : 'margin-top:8px;margin-bottom:8px;padding-left:2px;'
    list.setAttribute('style', st ? `${st};${patch}` : patch)
  })

  container.querySelectorAll('li').forEach((li) => {
    stripJuicePseudoSpans(li)
    li.querySelectorAll('strong, b, code, em, span').forEach(normalizeInline)
    li.querySelectorAll(':scope > p').forEach((p) => {
      let st = (p.getAttribute('style') || '').trim()
      st = st.replace(/text-align\s*:\s*[^;]+;?/gi, '')
      st = st.replace(/margin-top\s*:\s*[^;]+;?/gi, '')
      st = st.replace(/margin-bottom\s*:\s*[^;]+;?/gi, '')
      p.setAttribute(
        'style',
        st ? `${st};text-align:left;margin:0;word-break:normal;overflow-wrap:break-word;white-space:normal;`
          : 'text-align:left;margin:0;word-break:normal;overflow-wrap:break-word;white-space:normal;'
      )
    })
    unwrapDirectParagraphsInLi(li)
    li.querySelectorAll('strong + br, b + br, code + br, em + br, span + br').forEach((br) => br.remove())
  })

  container.querySelectorAll('ul > li').forEach((li) => {
    const cb = li.querySelector(':scope > input[type="checkbox"]')
    if (!cb) return
    const checked = cb.checked
    cb.remove()

    const box = document.createElement('span')
    box.setAttribute('data-wechat-task-marker', '1')
    box.setAttribute(
      'style',
      checked
        ? `display:inline-block;width:18px;height:18px;border-radius:5px;background:${accent};border:2px solid ${accent};text-align:center;line-height:14px;color:#ffffff;font-size:12px;font-weight:bold;box-sizing:border-box;flex-shrink:0;margin-top:2px;`
        : `display:inline-block;width:18px;height:18px;border-radius:5px;border:2px solid ${borderUnchecked};background:${fillUnchecked};box-sizing:border-box;flex-shrink:0;margin-top:2px;`
    )
    if (checked) box.textContent = '✓'
    li.insertBefore(box, li.firstChild)

    const prev = (li.getAttribute('style') || '').trim()
    const patch = 'list-style:none;position:relative;margin:8px 5px;padding-left:6px;padding-right:4px;display:flex;align-items:flex-start;gap:10px;line-height:1.6;'
    li.setAttribute('style', prev ? `${prev};${patch}` : patch)
  })

  container.querySelectorAll('ul > li').forEach((li) => {
    if (li.querySelector(':scope > [data-wechat-task-marker]')) return
    stripJuicePseudoSpans(li)

    const rail = document.createElement('span')
    rail.setAttribute('data-wechat-ul-rail', '1')
    rail.setAttribute(
      'style',
      `position:absolute;top:0.3em;bottom:0.4em;left:2px;width:1px;background:${ulRailColor};z-index:1;`
    )
    const marker = document.createElement('span')
    marker.setAttribute('data-wechat-ul-marker', '1')
    marker.setAttribute(
      'style',
      `position:absolute;top:0.3em;left:1px;width:3px;height:1em;background:${ulMarkerColor};border-radius:1.5px;z-index:2;`
    )
    li.insertBefore(rail, li.firstChild)
    li.insertBefore(marker, li.firstChild)

    const prev = (li.getAttribute('style') || '').trim()
    wrapListItemInlineBody(li)

    const patch = 'list-style:none;position:relative;margin:8px 5px;padding-left:16px;line-height:1.7;text-align:left;word-break:normal;overflow-wrap:break-word;white-space:normal;'
    li.setAttribute('style', prev ? `${prev};${patch}` : patch)
  })

  container.querySelectorAll('ol').forEach((ol) => {
    const start = parseInt(ol.getAttribute('start') || '1', 10) || 1
    const items = Array.from(ol.children).filter((c) => c.tagName === 'LI')
    items.forEach((li, index) => {
      stripJuicePseudoSpans(li)
      li.querySelectorAll(':scope > span:not([data-wechat-ol-marker])').forEach((span) => {
        if (isJuicePseudoSpan(span)) span.remove()
      })
      if (li.querySelector(':scope > [data-wechat-ol-marker]')) return

      const badge = document.createElement('span')
      badge.setAttribute('data-wechat-ol-marker', '1')
      badge.textContent = String(start + index)
      badge.setAttribute(
        'style',
        `position:absolute;top:50%;left:0;transform:translateY(-50%);min-width:16px;height:16px;border-radius:8px;background:${accent};color:#ffffff;font-size:10px;line-height:16px;font-weight:bold;text-align:center;padding:0 4px;box-sizing:border-box;box-shadow:0 0 6px ${glow1}, 0 0 12px ${glow2};z-index:2;`
      )
      li.insertBefore(badge, li.firstChild)
      wrapListItemInlineBody(li)

      const prev = (li.getAttribute('style') || '').trim()
      const patch = 'list-style:none;position:relative;margin:4px 0;padding-left:24px;color:' + cardText + ';line-height:1.7;text-align:left;word-break:normal;overflow-wrap:break-word;white-space:normal;'
      li.setAttribute('style', prev ? `${prev};${patch}` : patch)
    })
  })

  container.querySelectorAll('style').forEach((el) => el.remove())
}

// 合并 CSS 到内联样式
function mergeCss(html) {
  return juice(html, {
    inlinePseudoElements: true,
    preserveImportant: true,
    removeStyleTags: true,
    preserveFontFaces: true,
    preserveMediaQueries: false,
    preserveKeyFrames: false,
    applyStyleTags: true,
    applyLinkTags: true,
    applyWidthAttributes: true,
    applyHeightAttributes: true,
    applyAttributesTableElements: true,
    // 确保表格样式被正确内联
    webResources: {
      images: false,
      svgs: false,
      scripts: false,
      relativeTo: false
    }
  })
}

// Process themed content element for WeChat compatibility
async function processThemedContentForWechat(contentElement, pageTheme, cardTheme) {
  // Clone the element to avoid modifying the original
  const clonedElement = contentElement.cloneNode(true)

  // Sanitize the HTML
  // let processedHtml = sanitizeForWeChat(clonedElement.innerHTML)

  // Create a temporary container to process the HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = clonedElement.innerHTML

  // Replace blob URLs with Data URLs so that pasted content remains visible outside the app
  await replaceImageSrcWithDataUrls(tempDiv)

  // Apply inline styles to preserve formatting in WeChat
  enhanceInlineStyles(tempDiv, pageTheme, cardTheme)

  // Return the processed HTML
  return tempDiv.innerHTML
}

// Resolve CSS custom properties (variables) to their computed values
function resolveCssVariables(cssText, referenceElement) {
  // Find the themed container for getting computed styles
  const themedElement = document.querySelector('.article-preview-container .article-content') || referenceElement || document.body

  // Get computed styles to resolve CSS variables
  const computedStyle = getComputedStyle(themedElement)

  // Replace CSS variables with their computed values
  return cssText.replace(/var\(([^)]+)\)/g, (match, variableName) => {
    // Clean the variable name (remove spaces, fallbacks)
    const cleanVarName = variableName.split(',')[0].trim()

    try {
      // Get the computed value of the CSS variable
      const value = computedStyle.getPropertyValue(cleanVarName)
      if (value && value.trim()) {
        return value.trim()
      }
    } catch (e) {
      console.debug('Could not resolve CSS variable:', cleanVarName)
    }

    // If we can't resolve the variable, return the original
    return match
  })
}

// Apply juice CSS-to-inline conversion for WeChat compatibility
function enhanceInlineStyles(container, pageTheme = 'theme-light', cardTheme = 'classic') {
  // Use the passed theme parameters instead of querying the DOM
  const currentPageTheme = pageTheme.startsWith('.') ? pageTheme : `.${pageTheme}`
  const currentCardTheme = cardTheme

  // Create a temporary themed wrapper to ensure proper context for CSS variable resolution
  const themedWrapper = document.createElement('div')
  themedWrapper.className = `${currentPageTheme} card-theme ${currentCardTheme}`
  themedWrapper.style.position = 'absolute'
  themedWrapper.style.left = '-9999px'
  themedWrapper.style.pointerEvents = 'none'
  themedWrapper.style.visibility = 'hidden'

  const themedContainer = document.createElement('div')
  themedContainer.className = `article-content content-rich ${pageTheme} card-theme ${currentCardTheme}`
  themedContainer.innerHTML = container.innerHTML

  themedWrapper.appendChild(themedContainer)
  document.body.appendChild(themedWrapper)

  const relevantSelectors = [
    '.content-rich',
    currentPageTheme,
    `.card-theme.${currentCardTheme}`,
    // Also include combinations
    `${currentPageTheme} .content-rich`,
    `${currentPageTheme} .card-theme.${currentCardTheme}`,
    `.card-theme.${currentCardTheme} .content-rich`,
    `${currentPageTheme} .card-theme.${currentCardTheme} .content-rich`
  ]

  // Extract existing CSS from the page, filtering for relevant rules
  const existingStyles = []

  // Get all stylesheets from the document
  for (const stylesheet of document.styleSheets) {
    try {
      // Check if we can access this stylesheet
      if (stylesheet.href && !stylesheet.href.startsWith(window.location.origin)) {
        // Skip external stylesheets due to CORS
        continue
      }

      // Try to access the CSS rules
      const rules = stylesheet.cssRules
      if (rules) {
        for (const rule of rules) {
          if (rule instanceof CSSStyleRule) {
            const selectorText = rule.selectorText
            // Check if this rule is relevant to our theme context
            const isRelevant = relevantSelectors.some(selector =>
              selectorText && (
                selectorText.includes(selector) ||
                selectorText.includes('.content-rich') ||
                selectorText.includes(currentPageTheme) ||
                selectorText.includes(`.card-theme.${currentCardTheme}`)
              )
            )

            if (isRelevant) {
              
              // Resolve CSS variables to their computed values
              const resolvedCss = resolveCssVariables(rule.cssText, themedContainer)
              existingStyles.push(resolvedCss)
            }
          }
        }
      }
    } catch (e) {
      // Skip stylesheets we can't access due to CORS or other security restrictions
      console.debug('Skipping stylesheet due to access restrictions:', stylesheet.href || 'inline')
    }
  }

  let css = existingStyles.join('\n')

  // Create a complete HTML document with the existing CSS and themed content
  const fullHtml = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>${css}</style>
      </head>
      <body>
        <div class="article content-rich ${pageTheme} card-theme ${currentCardTheme}">${themedContainer.innerHTML}</div>
      </body>
    </html>
  `
  // Use juice to convert CSS to inline styles
  let juicedHtml
  try {
    juicedHtml = mergeCss(fullHtml)
  } catch (error) {
    console.warn('Juice CSS inlining failed in enhanceInlineStyles:', error)
    return // Return without changes if juice fails
  }

  // Parse the result and extract the content
  const parser = new DOMParser()
  const doc = parser.parseFromString(juicedHtml, 'text/html')
  const articleContent = doc.querySelector('.article')

  if (articleContent) {
    // Replace the container's content with the juice-processed content
    container.innerHTML = articleContent.innerHTML
  }

  materializeWechatLists(container, themedContainer, themedWrapper)

  // Only add essential post-processing that juice can't handle
  // 1) Ensure link safety
  container.querySelectorAll('a').forEach((link) => {
    link.setAttribute('target', '_blank')
    const href = link.getAttribute('href') || ''
    if (!href || href.startsWith('javascript:')) link.removeAttribute('href')
  })

  // 2) Add HTML attributes for table compatibility
  container.querySelectorAll('table').forEach((table) => {
    table.setAttribute('cellpadding', '0')
    table.setAttribute('cellspacing', '0')

    table.querySelectorAll('th').forEach((th) => {
      const bgColor = th.style.backgroundColor || '#f8f9fa'
      th.setAttribute('bgcolor', bgColor)
    })

    table.querySelectorAll('td').forEach((td) => {
      const bgColor = td.style.backgroundColor || '#ffffff'
      td.setAttribute('bgcolor', bgColor)
    })
  })

  // Clean up the temporary themed element
  document.body.removeChild(themedWrapper)
}


// Copy to clipboard by reading from the existing themed preview element
export async function copyToWechat(cardTheme, appTheme = 'light') {
  // Find the article preview container with applied theme styles
  const previewContainer = document.querySelector('.article-preview-container')
  if (!previewContainer) {
    console.error('Article preview container not found')
    return false
  }

  // Find the content element with classes "article-content" and "content-rich"
  const contentElement = previewContainer.querySelector('.article-content.content-rich')
  if (!contentElement) {
    console.error('Article content element not found')
    return false
  }

  // Get plain text for fallback
  const text = contentElement.textContent || ''

  // Use the passed theme parameters from Vue
  const pageTheme = appTheme === 'dark' ? 'theme-dark' : 'theme-light'

  // Process the themed content for WeChat compatibility
  const processedFragment = await processThemedContentForWechat(contentElement, pageTheme, cardTheme)
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>${processedFragment}</body></html>`

  try {
    const item = new window.ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' })
    })
    await navigator.clipboard.write([item])
    return true
  } catch (e) {
    console.warn('Clipboard write failed:', e)
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (e2) {
      console.error('All clipboard methods failed:', e2)
      return false
    }
  }
}
