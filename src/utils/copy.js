// Build HTML suitable for WeChat posting by reading actual theme CSS variables
// from styles/themes.css. We compute colors/typography via a hidden probe element
// with classes: `editor-theme <theme>`, then generate minimal content CSS.

import juice from 'juice'
import { replaceImageSrcWithDataUrls } from './imageStore.js'

// Utility function for converting camelCase to kebab-case (currently unused but kept for future use)
// function camelToKebab(s){return s.replace(/[A-Z]/g, m=>'-'+m.toLowerCase())}

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
