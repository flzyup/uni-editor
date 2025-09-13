// Build HTML suitable for WeChat posting: include minimal inline style for current theme

const themeCssMap = {
  classic: `
    .article{font-family:Inter,'PingFang SC','Hiragino Sans GB',sans-serif;line-height:1.8;color:#2b2b2b;max-width:none;margin:0;padding:20px}
    .article h1,.article h2,.article h3,.article h4{font-weight:700;color:#111;margin:1.2em 0 0.6em 0}
    .article h1{font-size:24px;border-bottom:2px solid #7c5cff;padding-bottom:8px}
    .article h2{font-size:20px;color:#7c5cff}
    .article h3{font-size:18px}
    .article p{margin:0.8em 0;text-align:justify}
    .article a{color:#7c5cff;text-decoration:none;border-bottom:1px solid #7c5cff}
    .article blockquote{border-left:4px solid #8fb3ff;background:#f4f8ff;padding:12px 16px;margin:16px 0;border-radius:4px;font-style:italic}
    .article pre{background:#0b0e14;color:#e6edf3;padding:12px;border-radius:8px;overflow:auto;margin:16px 0}
    .article code{background:#f4f4f6;color:#e85e5e;padding:2px 6px;border-radius:4px;font-family:'Fira Code',monospace}
    .article ul,.article ol{padding-left:24px;margin:12px 0}
    .article li{margin:4px 0}
    .article img{max-width:100%;border-radius:8px;margin:16px 0}
    .article table{border-collapse:collapse;width:100%;margin:16px 0}
    .article th,.article td{border:1px solid #ddd;padding:8px 12px;text-align:left}
    .article th{background:#f8f9fa;font-weight:600}
  `,
  minimal: `
    .article{font-family:Inter,'PingFang SC',sans-serif;line-height:1.75;color:#222;max-width:none;margin:0;padding:20px}
    .article h1,.article h2,.article h3,.article h4{font-weight:600;color:#111;margin:1.4em 0 0.6em 0}
    .article h1{font-size:24px;color:#3cc8a6}
    .article h2{font-size:20px;color:#3cc8a6}
    .article p{margin:0.8em 0;text-align:justify}
    .article a{color:#3cc8a6;text-decoration:none}
    .article blockquote{border-left:4px solid #66e0c8;background:#eefbf7;padding:12px 16px;margin:16px 0;border-radius:4px}
    .article pre{background:#f8f9fa;color:#333;padding:12px;border-radius:8px;border:1px solid #e9ecef;margin:16px 0}
    .article code{background:#f1f3f4;color:#d73a49;padding:2px 6px;border-radius:4px}
    .article ul,.article ol{padding-left:24px;margin:12px 0}
    .article img{max-width:100%;border-radius:8px;margin:16px 0}
  `,
  night: `
    .article{font-family:Inter,'PingFang SC',sans-serif;line-height:1.8;color:#2c3e50;max-width:none;margin:0;padding:20px}
    .article h1,.article h2,.article h3,.article h4{font-weight:700;margin:1.2em 0 0.6em 0}
    .article h1{font-size:24px;color:#1e3a8a;border-bottom:2px solid #60a5fa;padding-bottom:8px}
    .article h2{font-size:20px;color:#1e40af}
    .article p{margin:0.8em 0;text-align:justify}
    .article a{color:#2563eb;text-decoration:none;border-bottom:1px solid #93c5fd}
    .article blockquote{border-left:4px solid #93c5fd;background:#eff6ff;padding:12px 16px;margin:16px 0;border-radius:4px}
    .article pre{background:#1e293b;color:#f1f5f9;padding:12px;border-radius:8px;margin:16px 0}
    .article code{background:#e0f2fe;color:#0c4a6e;padding:2px 6px;border-radius:4px}
    .article ul,.article ol{padding-left:24px;margin:12px 0}
    .article img{max-width:100%;border-radius:8px;margin:16px 0}
  `,
  coffee: `
    .article{font-family:'Noto Serif SC','Times New Roman',serif;line-height:1.85;color:#2b2119;max-width:none;margin:0;padding:20px}
    .article h1,.article h2,.article h3,.article h4{font-weight:700;color:#8b4513;margin:1.2em 0 0.6em 0}
    .article h1{font-size:26px;border-bottom:2px solid #d4a373;padding-bottom:8px}
    .article h2{font-size:22px;color:#a0522d}
    .article p{margin:1em 0;text-align:justify;text-indent:2em}
    .article a{color:#b36b3e;text-decoration:none;border-bottom:1px solid #d4a373}
    .article blockquote{border-left:4px solid #e9c46a;background:#fefcf0;padding:12px 16px;margin:16px 0;border-radius:4px;font-style:italic}
    .article pre{background:#3c2415;color:#f5deb3;padding:12px;border-radius:8px;margin:16px 0}
    .article code{background:#fff8dc;color:#8b4513;padding:2px 6px;border-radius:4px}
    .article ul,.article ol{padding-left:24px;margin:12px 0}
    .article img{max-width:100%;border-radius:8px;margin:16px 0;box-shadow:0 4px 8px rgba(139,69,19,0.2)}
  `,
  paper: `
    .article{font-family:'Noto Serif SC','Georgia',serif;line-height:1.9;color:#1f2937;max-width:none;margin:0;padding:24px;background:#fefefe}
    .article h1,.article h2,.article h3,.article h4{font-weight:700;color:#374151;margin:1.4em 0 0.6em 0}
    .article h1{font-size:28px;color:#0f766e;text-align:center;margin-bottom:1em}
    .article h2{font-size:22px;color:#0f766e;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
    .article p{margin:1em 0;text-align:justify;text-indent:2em}
    .article a{color:#0ea5a4;text-decoration:none}
    .article blockquote{border-left:4px solid #0ea5a4;background:#f0fdfa;padding:16px 20px;margin:20px 0;border-radius:4px;font-style:italic}
    .article pre{background:#f9fafb;color:#374151;padding:12px;border-radius:8px;border:1px solid #d1d5db;margin:16px 0}
    .article code{background:#f3f4f6;color:#7c2d12;padding:2px 6px;border-radius:4px}
    .article ul,.article ol{padding-left:28px;margin:16px 0}
    .article img{max-width:100%;border-radius:8px;margin:20px 0;border:1px solid #e5e7eb}
  `,
  pop: `
    .article{font-family:Inter,'PingFang SC',sans-serif;line-height:1.75;color:#1a0b2e;max-width:none;margin:0;padding:20px;background:linear-gradient(135deg,#fef7ff 0%,#faf5ff 100%)}
    .article h1,.article h2,.article h3,.article h4{font-weight:700;margin:1.2em 0 0.6em 0}
    .article h1{font-size:26px;color:#a21caf;text-shadow:0 2px 4px rgba(162,28,175,0.3)}
    .article h2{font-size:22px;color:#c026d3}
    .article p{margin:0.8em 0;text-align:justify}
    .article a{color:#ff6ad5;text-decoration:none;font-weight:500;border-bottom:2px solid #ff6ad5}
    .article blockquote{border-left:4px solid #ffd166;background:linear-gradient(135deg,#fff9e0 0%,#fef3c7 100%);padding:12px 16px;margin:16px 0;border-radius:8px;box-shadow:0 2px 8px rgba(255,209,102,0.3)}
    .article pre{background:#2d1b69;color:#e879f9;padding:12px;border-radius:8px;margin:16px 0;box-shadow:0 4px 12px rgba(45,27,105,0.4)}
    .article code{background:#fce7f3;color:#be185d;padding:2px 6px;border-radius:4px;font-weight:500}
    .article ul,.article ol{padding-left:24px;margin:12px 0}
    .article img{max-width:100%;border-radius:12px;margin:16px 0;box-shadow:0 8px 24px rgba(162,28,175,0.2)}
  `,
}

function camelToKebab(s){return s.replace(/[A-Z]/g, m=>'-'+m.toLowerCase())}

export function buildWechatHtml(innerHtml, theme='classic'){
  const css = themeCssMap[theme] || themeCssMap.classic

  // Create a temporary DOM environment to compute styles
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none'
  document.body.appendChild(iframe)
  
  const doc = iframe.contentDocument
  if (!doc) {
    document.body.removeChild(iframe)
    return ''
  }

  doc.open()
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="article">${innerHtml}</div></body></html>`)
  doc.close()

  const articleRoot = doc.querySelector('.article')
  if (!articleRoot) {
    document.body.removeChild(iframe)
    return ''
  }
  
  const walker = doc.createTreeWalker(articleRoot, NodeFilter.SHOW_ELEMENT)
  const importantProps = [
    'color','background-color','font-family','font-size','font-weight','font-style','line-height','letter-spacing',
    'text-align','border','border-color','border-width','border-style','border-radius','padding','margin',
    'list-style-type','text-decoration-color','text-decoration-line','text-decoration-style', 'text-indent',
    'box-shadow', 'background', 'border-bottom', 'border-left', 'border-top', 'border-right',
    'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
    'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
    'text-shadow', 'border-collapse', 'max-width', 'width', 'height',
    'display', 'flex-direction', 'justify-content', 'align-items', 'gap'
  ]

  while (walker.nextNode()) {
    const node = walker.currentNode
    const computedStyle = iframe.contentWindow.getComputedStyle(node)
    
    let style = ''
    for (const p of importantProps) {
      const val = computedStyle.getPropertyValue(p)
      if (val && val !== 'initial' && val !== 'auto' && val !== '0px' && val !== 'none') {
        style += `${p}:${val};`
      }
    }
    
    if (style) {
      const existingStyle = node.getAttribute('style') || ''
      node.setAttribute('style', existingStyle + ';' + style)
    }
  }

  const finalHtml = articleRoot.innerHTML
  document.body.removeChild(iframe)
  
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><div class="article-container">${finalHtml}</div></body></html>`
}

// Basic sanitization and normalization inspired by doocs/md utils.processClipboardContent
const ALLOWED_TAGS = new Set(['p','h1','h2','h3','h4','h5','h6','strong','b','em','i','u','s','blockquote','pre','code','ul','ol','li','a','img','table','thead','tbody','tr','th','td','hr','br','span'])
const ALLOWED_ATTRS = {
  a: new Set(['href','target','rel','title']),
  img: new Set(['src','alt','title','width','height']),
  td: new Set(['colspan','rowspan','align']),
  th: new Set(['colspan','rowspan','align']),
}

function sanitizeForWeChat(html) {
  const doc = new DOMParser().parseFromString(`<div class="_root">${html || ''}</div>`, 'text/html')
  const root = doc.querySelector('._root')
  if (!root) return html || ''
  
  // Remove disallowed nodes
  root.querySelectorAll('script,style,link,meta,iframe,object,embed,form,video,audio,svg').forEach(n => n.remove())
  
  // Walk and clean attributes/tags
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
  const toRemove = []
  while (walker.nextNode()) {
    const el = walker.currentNode
    const tag = el.tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) {
      // unwrap unknown elements but keep children
      const parent = el.parentElement
      if (parent) {
        while (el.firstChild) parent.insertBefore(el.firstChild, el)
        toRemove.push(el)
      }
      continue
    }
    // Remove classes and inline event handlers
    el.removeAttribute('class')
    Array.from(el.attributes).forEach(attr => {
      const name = attr.name
      if (name.startsWith('on')) el.removeAttribute(name)
    })
    // Whitelist attributes
    const allow = ALLOWED_ATTRS[tag] || new Set()
    Array.from(el.attributes).forEach(attr => {
      if (!allow.has(attr.name)) {
        // always allow data-src -> src fallback for imgs
        if (tag === 'img' && (attr.name === 'data-src' || attr.name === 'referrerpolicy')) return
        if (tag === 'a' && attr.name === 'name') return
        if (attr.name === 'style') return // keep styles; they are inlined by builder
        // otherwise drop
        if (!['style'].includes(attr.name)) el.removeAttribute(attr.name)
      }
    })
    // Ensure links safe
    if (tag === 'a') {
      el.setAttribute('target','_blank')
      const href = el.getAttribute('href') || ''
      if (!href || href.startsWith('javascript:')) el.removeAttribute('href')
    }
  }
  toRemove.forEach(n => n.remove())
  
  // Unwrap spans without attributes
  root.querySelectorAll('span').forEach(sp => {
    if (!sp.attributes.length) {
      const parent = sp.parentElement
      if (parent) {
        while (sp.firstChild) parent.insertBefore(sp.firstChild, sp)
        sp.remove()
      }
    }
  })
  return root.innerHTML
}

export function processClipboardContent(innerHtml, theme='classic') {
  // 1) sanitize HTML  2) convert to themed, inline-styled fragment
  const sanitized = sanitizeForWeChat(innerHtml)
  return convertToWechatFragment(sanitized, theme)
}

// Convert to fragment-only HTML (without doctype/head), suitable for pasting into WeChat editor directly
export function convertToWechatFragment(innerHtml, theme='classic') {
  const full = buildWechatHtml(innerHtml, theme)
  const doc = new DOMParser().parseFromString(full, 'text/html')
  const container = doc.querySelector('.article-container')
  return container ? container.innerHTML : innerHtml
}

// Copy to clipboard following doocs/md approach: provide both text/html and text/plain
export async function copyToWechat(innerHtml, theme='classic') {
  const fragment = processClipboardContent(innerHtml, theme)
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>${fragment}</body></html>`
  const text = new DOMParser().parseFromString(innerHtml || '', 'text/html').body.textContent || ''
  try {
    const item = new window.ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' })
    })
    await navigator.clipboard.write([item])
    return true
  } catch (e) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (e2) {
      return false
    }
  }
}
