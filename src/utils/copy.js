// Build HTML suitable for WeChat posting by reading actual theme CSS variables
// from styles/themes.css. We compute colors/typography via a hidden probe element
// with classes: `editor-theme <theme>`, then generate minimal content CSS.

import juice from 'juice'

function getThemeVars(theme = 'classic') {
  // Detect current page theme from DOM
  const hasDark = !!document.querySelector('.theme-dark')
  const hasLight = !!document.querySelector('.theme-light')
  const pageThemeClass = hasDark ? 'theme-dark' : (hasLight ? 'theme-light' : 'theme-light')

  // Create a themed wrapper so descendant selectors like
  // `.theme-light .card-theme.ocean` resolve correctly
  const wrapper = document.createElement('div')
  wrapper.className = pageThemeClass
  wrapper.style.position = 'absolute'
  wrapper.style.left = '-9999px'
  wrapper.style.pointerEvents = 'none'
  wrapper.style.visibility = 'hidden'

  const probe = document.createElement('div')
  probe.className = `card-theme ${theme}`
  wrapper.appendChild(probe)
  document.body.appendChild(wrapper)

  const cs = getComputedStyle(probe)

  // 动态读取所有主题相关的CSS变量 - 使用card主题变量
  const vars = {
    // 基础颜色变量
    text: cs.getPropertyValue('--card-text').trim() || cs.color || '#2b2b2b',
    muted: cs.getPropertyValue('--card-muted').trim() || '#6b7280',
    accent: cs.getPropertyValue('--card-accent').trim() || '#7c5cff',
    quote: cs.getPropertyValue('--card-accent').trim() || cs.getPropertyValue('--quote-color').trim() || '#8fb3ff',
    codeBg: cs.getPropertyValue('--card-bg').trim() || cs.getPropertyValue('--code-bg').trim() || '#f4f4f6',
    bg: cs.getPropertyValue('--card-bg').trim() || cs.backgroundColor || '#ffffff',
    border: cs.getPropertyValue('--card-border').trim() || cs.borderColor || 'rgba(0,0,0,0.12)',

    // 字体变量 - 动态读取或使用微信平台优化字体
    hFont: cs.getPropertyValue('--header-font').trim() || cs.getPropertyValue('--font-family').trim() || cs.fontFamily || '"Microsoft YaHei", "PingFang SC", "Source Han Sans SC", "Noto Sans CJK SC", "Hiragino Sans GB", sans-serif',
    bodyFont: cs.getPropertyValue('--body-font').trim() || cs.getPropertyValue('--font-family').trim() || cs.fontFamily || '"Microsoft YaHei", "PingFang SC", "Source Han Sans SC", "Noto Sans CJK SC", "Hiragino Sans GB", sans-serif',
    codeFont: cs.getPropertyValue('--code-font').trim() || 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',

    // 其他可能的主题变量
    shadow: cs.getPropertyValue('--shadow').trim() || cs.boxShadow || 'rgba(0,0,0,0.1)',
    overlay: cs.getPropertyValue('--overlay').trim() || 'rgba(0,0,0,0.5)',
    borderRadius: cs.getPropertyValue('--border-radius').trim() || cs.borderRadius || '6px',

    // 动态间距和尺寸
    headerMargin: cs.getPropertyValue('--header-margin').trim() || '1.2em 0 .6em 0',
    paragraphMargin: cs.getPropertyValue('--paragraph-margin').trim() || '.9em 0',
    blockquotePadding: cs.getPropertyValue('--blockquote-padding').trim() || '12px 16px',
    blockquoteMargin: cs.getPropertyValue('--blockquote-margin').trim() || '16px 0',
    codePadding: cs.getPropertyValue('--code-padding').trim() || '2px 6px',
    preCodePadding: cs.getPropertyValue('--pre-padding').trim() || '12px',
    listPadding: cs.getPropertyValue('--list-padding').trim() || '24px',
    listMargin: cs.getPropertyValue('--list-margin').trim() || '12px 0',
    listItemMargin: cs.getPropertyValue('--list-item-margin').trim() || '4px 0',
    imageMargin: cs.getPropertyValue('--image-margin').trim() || '16px 0',
    tableMargin: cs.getPropertyValue('--table-margin').trim() || '16px 0',
    tableCellPadding: cs.getPropertyValue('--table-cell-padding').trim() || '8px 12px',
    hrMargin: cs.getPropertyValue('--hr-margin').trim() || '24px 0',

    // 字体大小比例 - 动态读取或使用默认比例
    h1Scale: parseFloat(cs.getPropertyValue('--h1-scale').trim()) || 1.75,
    h2Scale: parseFloat(cs.getPropertyValue('--h2-scale').trim()) || 1.5,
    h3Scale: parseFloat(cs.getPropertyValue('--h3-scale').trim()) || 1.25,
    h4Scale: parseFloat(cs.getPropertyValue('--h4-scale').trim()) || 1.125,
    h5Scale: parseFloat(cs.getPropertyValue('--h5-scale').trim()) || 1.0,
    h6Scale: parseFloat(cs.getPropertyValue('--h6-scale').trim()) || 0.875,
    codeScale: parseFloat(cs.getPropertyValue('--code-scale').trim()) || 0.9,

    // 行高比例
    headerLineHeightScale: parseFloat(cs.getPropertyValue('--header-line-height-scale').trim()) || 0.9,
    codeLineHeight: cs.getPropertyValue('--code-line-height').trim() || '1.4',

    // 边框和阴影相关
    borderWidth: cs.getPropertyValue('--border-width').trim() || cs.borderWidth || '1px',
    borderStyle: cs.getPropertyValue('--border-style').trim() || cs.borderStyle || 'solid',
    tableBorderWidth: cs.getPropertyValue('--table-border-width').trim() || '1px',
    h1BorderWidth: cs.getPropertyValue('--h1-border-width').trim() || '2px',
    quoteBorderWidth: cs.getPropertyValue('--quote-border-width').trim() || '4px',
    linkBorderWidth: cs.getPropertyValue('--link-border-width').trim() || '1px',
    hrHeight: cs.getPropertyValue('--hr-height').trim() || '1px',

    // 透明度和特效
    quoteOpacity: cs.getPropertyValue('--quote-opacity').trim() || '1a',
    tableHoverOpacity: cs.getPropertyValue('--table-hover-opacity').trim() || '1a',
    tableEvenRowOpacity: cs.getPropertyValue('--table-even-row-opacity').trim() || '99',
    hrOpacity: parseFloat(cs.getPropertyValue('--hr-opacity').trim()) || 0.6,

    // 字体权重
    headerFontWeight: cs.getPropertyValue('--header-font-weight').trim() || cs.fontWeight || '700',
    strongFontWeight: cs.getPropertyValue('--strong-font-weight').trim() || '700',
    thFontWeight: cs.getPropertyValue('--th-font-weight').trim() || '700',

    // 文本装饰和对齐
    textDecoration: cs.getPropertyValue('--link-text-decoration').trim() || 'underline',
    tableTextAlign: cs.getPropertyValue('--table-text-align').trim() || 'left',
    tableCellVerticalAlign: cs.getPropertyValue('--table-cell-vertical-align').trim() || 'top',

    // 计算样式属性
    fontSize: cs.fontSize || '16px',
    lineHeight: cs.lineHeight || '1.6',
    fontWeight: cs.fontWeight || '400',
    letterSpacing: cs.letterSpacing || 'normal',
    textAlign: cs.textAlign || 'left',
    wordSpacing: cs.wordSpacing || 'normal',
    textIndent: cs.textIndent || '0px',
    textTransform: cs.textTransform || 'none',
    whiteSpace: cs.whiteSpace || 'normal',

    // 间距和尺寸
    marginTop: cs.marginTop || '0px',
    marginRight: cs.marginRight || '0px',
    marginBottom: cs.marginBottom || '0px',
    marginLeft: cs.marginLeft || '0px',
    paddingTop: cs.paddingTop || '20px',
    paddingRight: cs.paddingRight || '20px',
    paddingBottom: cs.paddingBottom || '20px',
    paddingLeft: cs.paddingLeft || '20px',

    // 边框和背景
    borderRadius: cs.borderRadius || '0px',
    borderWidth: cs.borderWidth || '0px',
    borderStyle: cs.borderStyle || 'none',
    borderColor: cs.borderColor || 'transparent',
    backgroundColor: cs.backgroundColor || 'transparent',
    backgroundImage: cs.backgroundImage || 'none',

    // 阴影和其他效果
    boxShadow: cs.boxShadow || 'none',
    textShadow: cs.textShadow || 'none',
    opacity: cs.opacity || '1',
    transform: cs.transform || 'none',
    filter: cs.filter || 'none'
  }

  // 清理probe元素
  document.body.removeChild(wrapper)

  return vars
}

function buildThemeCssFromVars(theme = 'classic') {
  const v = getThemeVars(theme)
  return `
    .article{
      font-family:${v.bodyFont};
      font-size:${v.fontSize};
      line-height:${v.lineHeight};
      font-weight:${v.fontWeight};
      letter-spacing:${v.letterSpacing};
      word-spacing:${v.wordSpacing};
      text-align:${v.textAlign};
      text-transform:${v.textTransform};
      color:${v.text};
      background:${v.bg};
      background-color:${v.backgroundColor !== 'transparent' ? v.backgroundColor : v.bg};
      max-width:none;
      margin:${v.marginTop} ${v.marginRight} ${v.marginBottom} ${v.marginLeft};
      padding:${v.paddingTop} ${v.paddingRight} ${v.paddingBottom} ${v.paddingLeft};
      border-radius:${v.borderRadius};
      border:${v.borderWidth} ${v.borderStyle} ${v.borderColor};
      box-shadow:${v.boxShadow};
      text-shadow:${v.textShadow};
      opacity:${v.opacity};
    }

    .article h1,.article h2,.article h3,.article h4,.article h5,.article h6{
      font-family:${v.hFont};
      font-weight:${v.headerFontWeight};
      color:${v.text};
      margin:${v.headerMargin};
      line-height:${parseFloat(v.lineHeight) * v.headerLineHeightScale};
      letter-spacing:${v.letterSpacing};
    }

    .article h1{
      font-size:${parseFloat(v.fontSize) * v.h1Scale}px;
      color:${v.accent} !important;
      border-bottom:${v.h1BorderWidth} solid ${v.accent} !important;
      padding-bottom:8px !important;
    }

    .article h2{
      font-size:${parseFloat(v.fontSize) * v.h2Scale}px;
      color:${v.accent} !important;
    }

    .article h3{
      font-size:${parseFloat(v.fontSize) * v.h3Scale}px;
    }

    .article h4{
      font-size:${parseFloat(v.fontSize) * v.h4Scale}px;
    }

    .article h5{
      font-size:${parseFloat(v.fontSize) * v.h5Scale}px;
    }

    .article h6{
      font-size:${parseFloat(v.fontSize) * v.h6Scale}px;
    }

    .article p{
      margin:${v.paragraphMargin};
      text-align:${v.textAlign === 'left' ? 'justify' : v.textAlign};
      line-height:${v.lineHeight};
      text-indent:${v.textIndent};
      word-spacing:${v.wordSpacing};
      letter-spacing:${v.letterSpacing};
    }

    .article a{
      color:${v.accent} !important;
      text-decoration:${v.textDecoration} !important;
      border-bottom:${v.linkBorderWidth} solid ${v.accent} !important;
      text-shadow:${v.textShadow !== 'none' ? v.textShadow : 'none'};
    }

    .article blockquote{
      border-left:${v.quoteBorderWidth} solid ${v.quote} !important;
      background-color:${v.quote}${v.quoteOpacity} !important;
      background:${v.quote}${v.quoteOpacity} !important;
      padding:${v.blockquotePadding} !important;
      margin:${v.blockquoteMargin} !important;
      border-radius:${v.borderRadius} !important;
      color:${v.text} !important;
      font-style:italic !important;
      box-shadow:${v.boxShadow !== 'none' ? v.boxShadow : 'none'};
    }

    .article pre{
      background-color:${v.codeBg} !important;
      background:${v.codeBg} !important;
      color:${v.text} !important;
      padding:${v.preCodePadding} !important;
      border-radius:${v.borderRadius} !important;
      overflow:auto;
      margin:${v.imageMargin} !important;
      font-family:${v.codeFont} !important;
      font-size:${parseFloat(v.fontSize) * v.codeScale}px !important;
      line-height:${v.codeLineHeight} !important;
      border:${v.borderWidth !== '0px' ? `${v.tableBorderWidth} solid ${v.borderColor}` : 'none'};
    }

    .article code{
      background-color:${v.codeBg} !important;
      background:${v.codeBg} !important;
      padding:${v.codePadding} !important;
      border-radius:${parseFloat(v.borderRadius) * 0.5}px !important;
      font-family:${v.codeFont} !important;
      font-size:${parseFloat(v.fontSize) * v.codeScale}px !important;
      color:${v.text} !important;
    }

    .article ul,.article ol{
      padding-left:${v.listPadding};
      margin:${v.listMargin};
      line-height:${v.lineHeight};
    }

    .article li{
      margin:${v.listItemMargin};
      color:${v.text};
    }

    .article img{
      max-width:100%;
      border-radius:${v.borderRadius};
      margin:${v.imageMargin};
      display:block;
      box-shadow:${v.boxShadow !== 'none' ? v.boxShadow : 'none'};
    }

    .article table{
      border-collapse:collapse;
      width:100%;
      margin:${v.tableMargin};
      border:${v.tableBorderWidth} solid ${v.border};
      border-radius:${v.borderRadius};
      overflow:hidden;
      box-shadow:${v.boxShadow !== 'none' ? v.boxShadow : v.shadow};
      background-color:${v.bg};
    }

    .article th,.article td{
      border:${v.tableBorderWidth} solid ${v.border};
      border-collapse:collapse;
      padding:${v.tableCellPadding};
      text-align:${v.tableTextAlign};
      color:${v.text};
      vertical-align:${v.tableCellVerticalAlign};
      word-wrap:break-word;
    }

    .article th{
      background-color:${v.muted ? `${v.muted}33` : v.codeBg} !important;
      background:${v.muted ? `${v.muted}33` : v.codeBg} !important;
      font-weight:${v.thFontWeight};
      color:${v.accent || v.text} !important;
      border:${v.tableBorderWidth} solid ${v.border} !important;
      border-bottom:${v.h1BorderWidth} solid ${v.border} !important;
    }

    .article tbody tr:nth-child(even) td{
      background-color:${v.bg ? `${v.bg}${v.tableEvenRowOpacity}` : v.codeBg} !important;
      background:${v.bg ? `${v.bg}${v.tableEvenRowOpacity}` : v.codeBg} !important;
    }

    .article tbody tr:hover td{
      background-color:${v.muted ? `${v.muted}${v.tableHoverOpacity}` : v.codeBg} !important;
    }

    .article hr{
      border:none;
      height:${v.hrHeight};
      background:${v.border || v.muted};
      margin:${v.hrMargin};
      opacity:${parseFloat(v.opacity) * v.hrOpacity};
    }

    .article strong, .article b{
      color:${v.accent};
      font-weight:${v.strongFontWeight};
    }

    .article em, .article i{
      color:${v.accent};
      font-style:italic;
    }
  `
}

// Utility function for converting camelCase to kebab-case (currently unused but kept for future use)
// function camelToKebab(s){return s.replace(/[A-Z]/g, m=>'-'+m.toLowerCase())}

// 修改 HTML 结构，移动嵌套列表到正确位置
function modifyHtmlStructure(htmlString) {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlString

  // 移动 `li > ul` 和 `li > ol` 到 `li` 后面
  tempDiv.querySelectorAll('li > ul, li > ol').forEach((originalItem) => {
    originalItem.parentElement.insertAdjacentElement('afterend', originalItem)
  })

  return tempDiv.innerHTML
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
    applyLinkTags: false,
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

// 创建空白节点用于兼容复制
function createEmptyNode() {
  const node = document.createElement('p')
  node.style.fontSize = '0'
  node.style.lineHeight = '0'
  node.style.margin = '0'
  node.innerHTML = '&nbsp;'
  return node
}

// 处理微信图片尺寸
function solveWeChatImage(container) {
  const images = container.getElementsByTagName('img')

  Array.from(images).forEach((image) => {
    const width = image.getAttribute('width')
    const height = image.getAttribute('height')
    if (width) {
      image.removeAttribute('width')
      image.style.width = width + (width.includes('px') ? '' : 'px')
    }
    if (height) {
      image.removeAttribute('height')
      image.style.height = height + (height.includes('px') ? '' : 'px')
    }
  })
}

export function buildWechatHtml(innerHtml, theme='classic'){
  const css = buildThemeCssFromVars(theme)

  // 构建完整的 HTML
  const fullHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="article">${innerHtml}</div></body></html>`

  let processedHtml
  try {
    // 使用 juice 合并 CSS
    processedHtml = mergeCss(fullHtml)
  } catch (error) {
    console.warn('Juice processing failed:', error)
    // 如果 juice 失败，回退到原始 HTML
    processedHtml = fullHtml
  }

  return processedHtml
}

// 处理微信公众号内容的主要函数 - 使用 juice 将 CSS 转换为内联样式
export function processClipboardContent(innerHtml, theme = 'classic', primaryColor) {
  // 先修改 HTML 结构
  let html = modifyHtmlStructure(innerHtml)


  // 构建完整的 HTML 包含样式
  const fullHtml = buildWechatHtml(html, theme)

  // 处理颜色变量替换
  let processedFullHtml = fullHtml
  if (primaryColor) {
    processedFullHtml = processedFullHtml
      .replace(/var\(--md-primary-color\)/g, primaryColor)
      .replace(/--md-primary-color:.+?;/g, '')
      .replace(/hsl\(var\(--foreground\)\)/g, '#3f3f3f')
      .replace(/var\(--blockquote-background\)/g, '#f7f7f7')
      // 处理变换属性的特殊情况
      .replace(/([^-])top:(.*?)em/g, '$1transform: translateY($2em)')
  }

  // 使用 juice 将 CSS 样式转换为内联样式
  let juicedHtml
  try {
    juicedHtml = mergeCss(processedFullHtml)
  } catch (error) {
    console.warn('Juice CSS inlining failed:', error)
    // 如果 juice 失败，回退到手动处理
    juicedHtml = processedFullHtml
  }

  // 解析处理后的 HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(juicedHtml, 'text/html')
  const container = doc.querySelector('.article') || doc.body

  if (!container) {
    return innerHtml
  }

  // 创建临时容器做最少的必要处理
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = container.innerHTML

  // 只保留juice无法处理的关键安全和兼容性修复
  // 1) 确保链接安全
  tempDiv.querySelectorAll('a').forEach((a) => {
    a.setAttribute('target','_blank')
    const href = a.getAttribute('href') || ''
    if (!href || href.startsWith('javascript:')) a.removeAttribute('href')
  })

  // 2) 为表格添加HTML属性以增强兼容性
  tempDiv.querySelectorAll('table').forEach((table) => {
    table.setAttribute('cellpadding', '0')
    table.setAttribute('cellspacing', '0')

    // 为表格单元格添加bgcolor属性作为后备
    table.querySelectorAll('th').forEach((th) => {
      const bgColor = th.style.backgroundColor || '#f8f9fa'
      th.setAttribute('bgcolor', bgColor)
    })

    table.querySelectorAll('td').forEach((td) => {
      const bgColor = td.style.backgroundColor || '#ffffff'
      td.setAttribute('bgcolor', bgColor)
    })
  })

  // 处理图片尺寸兼容性
  solveWeChatImage(tempDiv)

  // 添加空白节点用于兼容 SVG 复制
  const beforeNode = createEmptyNode()
  const afterNode = createEmptyNode()
  tempDiv.insertBefore(beforeNode, tempDiv.firstChild)
  tempDiv.appendChild(afterNode)

  // 直接返回处理后的内容，juice已经处理了所有样式转换
  return tempDiv.innerHTML
}

// Basic sanitization and normalization inspired by doocs/md utils.processClipboardContent
const ALLOWED_TAGS = new Set(['p','h1','h2','h3','h4','h5','h6','strong','b','em','i','u','s','blockquote','pre','code','ul','ol','li','a','img','table','thead','tbody','tr','th','td','hr','br','span'])
const ALLOWED_ATTRS = {
  // 链接属性
  a: new Set(['href','target','rel','title','name','download']),

  // 图片属性
  img: new Set(['src','alt','title','width','height','loading','crossorigin','referrerpolicy','sizes','srcset','usemap']),

  // 表格相关属性
  table: new Set(['border','cellpadding','cellspacing','width','height','align','bgcolor','summary']),
  td: new Set(['colspan','rowspan','align','valign','width','height','bgcolor','scope','headers']),
  th: new Set(['colspan','rowspan','align','valign','width','height','bgcolor','scope','abbr']),
  tr: new Set(['align','valign','bgcolor']),
  thead: new Set(['align','valign']),
  tbody: new Set(['align','valign']),
  tfoot: new Set(['align','valign']),
  caption: new Set(['align']),
  col: new Set(['span','width','align','valign']),
  colgroup: new Set(['span','width','align','valign']),

  // 列表属性
  ol: new Set(['type','start','reversed']),
  ul: new Set(['type']),
  li: new Set(['type','value']),

  // 表单相关属性 (谨慎使用)
  input: new Set(['type','value','placeholder','readonly','disabled','checked','maxlength','size']),
  textarea: new Set(['rows','cols','placeholder','readonly','disabled','maxlength']),
  select: new Set(['size','multiple','disabled']),
  option: new Set(['value','selected','disabled']),
  label: new Set(['for']),

  // 媒体元素
  video: new Set(['src','width','height','poster','controls','autoplay','loop','muted','preload']),
  audio: new Set(['src','controls','autoplay','loop','muted','preload']),
  source: new Set(['src','type','media']),

  // 其他元素
  iframe: new Set(['src','width','height','frameborder','allowfullscreen','sandbox','loading']),
  embed: new Set(['src','type','width','height']),
  object: new Set(['data','type','width','height','name']),
  param: new Set(['name','value']),

  // 语义化元素
  blockquote: new Set(['cite']),
  q: new Set(['cite']),
  cite: new Set([]),
  abbr: new Set(['title']),
  dfn: new Set(['title']),
  time: new Set(['datetime']),

  // 分组元素
  div: new Set(['align']),
  p: new Set(['align']),
  span: new Set([]),

  // 标题元素
  h1: new Set(['align']),
  h2: new Set(['align']),
  h3: new Set(['align']),
  h4: new Set(['align']),
  h5: new Set(['align']),
  h6: new Set(['align'])
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
      const attrName = attr.name.toLowerCase()

      // 总是保留的属性
      if (attrName === 'style') return

      // 允许的自定义数据属性
      if (attrName.startsWith('data-')) {
        // 特殊处理图片的 data-src
        if (tag === 'img' && attrName === 'data-src') return
        // 其他 data 属性根据需要保留
        if (['data-id', 'data-type', 'data-value'].includes(attrName)) return
      }

      // ARIA 属性支持 (提升可访问性)
      if (attrName.startsWith('aria-')) {
        if (['aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden'].includes(attrName)) return
      }

      // Role 属性
      if (attrName === 'role') return

      // 检查是否在白名单中
      if (!allow.has(attrName)) {
        el.removeAttribute(attr.name)
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

// Process themed content element for WeChat compatibility
function processThemedContentForWechat(contentElement, pageTheme, cardTheme) {
  // Clone the element to avoid modifying the original
  const clonedElement = contentElement.cloneNode(true)

  // Sanitize the HTML
  // let processedHtml = sanitizeForWeChat(clonedElement.innerHTML)

  // Create a temporary container to process the HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = clonedElement.innerHTML

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

// Convert to fragment-only HTML (without doctype/head), suitable for pasting into WeChat editor directly
export function convertToWechatFragment(innerHtml, theme='classic', primaryColor) {
  // 1) sanitize HTML first
  const sanitized = sanitizeForWeChat(innerHtml)

  // 2) process with new logic
  return processClipboardContent(sanitized, theme, primaryColor)
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
  const processedFragment = processThemedContentForWechat(contentElement, pageTheme, cardTheme)
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
