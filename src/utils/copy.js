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
    text: cs.getPropertyValue('--card-text').trim() || '#2b2b2b',
    muted: cs.getPropertyValue('--card-muted').trim() || '#6b7280',
    accent: cs.getPropertyValue('--card-accent').trim() || '#7c5cff',
    quote: cs.getPropertyValue('--card-accent').trim() || '#8fb3ff', // 使用accent颜色作为引用色
    codeBg: cs.getPropertyValue('--card-bg').trim() || '#f4f4f6', // 使用稍微深一点的背景色
    bg: cs.getPropertyValue('--card-bg').trim() || '#ffffff',
    border: cs.getPropertyValue('--card-border').trim() || 'rgba(255,255,255,0.08)',

    // 字体变量 - 针对微信平台优化字体
    hFont: '"Microsoft YaHei", "PingFang SC", "Source Han Sans SC", "Noto Sans CJK SC", "Hiragino Sans GB", sans-serif',
    bodyFont: '"Microsoft YaHei", "PingFang SC", "Source Han Sans SC", "Noto Sans CJK SC", "Hiragino Sans GB", sans-serif',

    // 其他可能的主题变量
    shadow: cs.getPropertyValue('--shadow').trim() || 'rgba(0,0,0,0.1)',
    overlay: cs.getPropertyValue('--overlay').trim() || 'rgba(0,0,0,0.5)',
    borderRadius: cs.getPropertyValue('--border-radius').trim() || '6px', // 默认圆角

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
    paddingTop: cs.paddingTop || '0px',
    paddingRight: cs.paddingRight || '0px',
    paddingBottom: cs.paddingBottom || '0px',
    paddingLeft: cs.paddingLeft || '0px',

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
      padding:${v.paddingTop || '20px'} ${v.paddingRight || '20px'} ${v.paddingBottom || '20px'} ${v.paddingLeft || '20px'};
      border-radius:${v.borderRadius};
      border:${v.borderWidth} ${v.borderStyle} ${v.borderColor};
      box-shadow:${v.boxShadow};
      text-shadow:${v.textShadow};
      opacity:${v.opacity};
    }

    .article h1,.article h2,.article h3,.article h4,.article h5,.article h6{
      font-family:${v.hFont};
      font-weight:700;
      color:${v.text};
      margin:1.2em 0 .6em 0;
      line-height:${parseFloat(v.lineHeight) * 0.9 || '1.4'};
      letter-spacing:${v.letterSpacing};
    }

    .article h1{
      font-size:${parseFloat(v.fontSize) * 1.75 || '28px'}px;
      color:${v.accent};
      border-bottom:2px solid ${v.accent};
      padding-bottom:8px;
    }

    .article h2{
      font-size:${parseFloat(v.fontSize) * 1.5 || '24px'}px;
      color:${v.accent};
    }

    .article h3{
      font-size:${parseFloat(v.fontSize) * 1.25 || '20px'}px;
    }

    .article h4{
      font-size:${parseFloat(v.fontSize) * 1.125 || '18px'}px;
    }

    .article h5{
      font-size:${v.fontSize};
    }

    .article h6{
      font-size:${parseFloat(v.fontSize) * 0.875 || '14px'}px;
    }

    .article p{
      margin:.9em 0;
      text-align:${v.textAlign === 'left' ? 'justify' : v.textAlign};
      line-height:${v.lineHeight};
      text-indent:${v.textIndent};
      word-spacing:${v.wordSpacing};
      letter-spacing:${v.letterSpacing};
    }

    .article a{
      color:${v.accent};
      text-decoration:none;
      border-bottom:1px solid ${v.accent}33;
      text-shadow:${v.textShadow !== 'none' ? v.textShadow : 'none'};
    }

    .article blockquote{
      border-left:4px solid ${v.quote};
      background:${v.quote}1f;
      padding:12px 16px;
      margin:16px 0;
      border-radius:${v.borderRadius || '6px'};
      color:${v.text};
      font-style:italic;
      box-shadow:${v.boxShadow !== 'none' ? v.boxShadow : 'none'};
    }

    .article pre{
      background:${v.codeBg};
      color:${v.text};
      padding:12px;
      border-radius:${v.borderRadius || '8px'};
      overflow:auto;
      margin:16px 0;
      font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      font-size:${parseFloat(v.fontSize) * 0.9 || '14px'}px;
      line-height:1.4;
      border:${v.borderWidth !== '0px' ? `1px solid ${v.borderColor}` : 'none'};
    }

    .article code{
      background:${v.codeBg};
      padding:2px 6px;
      border-radius:${parseFloat(v.borderRadius) * 0.5 || '4px'}px;
      font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
      font-size:${parseFloat(v.fontSize) * 0.9 || '14px'}px;
      color:${v.text};
    }

    .article ul,.article ol{
      padding-left:24px;
      margin:12px 0;
      line-height:${v.lineHeight};
    }

    .article li{
      margin:4px 0;
      color:${v.text};
    }

    .article img{
      max-width:100%;
      border-radius:${v.borderRadius || '8px'};
      margin:16px 0;
      display:block;
      box-shadow:${v.boxShadow !== 'none' ? v.boxShadow : 'none'};
    }

    .article table{
      border-collapse:collapse;
      width:100%;
      margin:16px 0;
      border:1px solid ${v.border || '#d1d5db'};
      border-radius:${v.borderRadius || '6px'};
      overflow:hidden;
      box-shadow:${v.boxShadow !== 'none' ? v.boxShadow : '0 2px 4px rgba(0,0,0,0.1)'};
      background-color:${v.bg};
    }

    .article th,.article td{
      border:1px solid ${v.border || '#d1d5db'};
      border-collapse:collapse;
      padding:8px 12px;
      text-align:left;
      color:${v.text};
      vertical-align:top;
      word-wrap:break-word;
    }

    .article th{
      background-color:${v.muted ? `${v.muted}33` : '#f8f9fa'} !important;
      background:${v.muted ? `${v.muted}33` : '#f8f9fa'} !important;
      font-weight:700;
      color:${v.accent || v.text} !important;
      border:1px solid ${v.border || '#d1d5db'} !important;
      border-bottom:2px solid ${v.border || '#d1d5db'} !important;
    }

    .article tbody tr:nth-child(even) td{
      background-color:${v.bg ? `${v.bg}99` : '#f9f9f9'} !important;
      background:${v.bg ? `${v.bg}99` : '#f9f9f9'} !important;
    }

    .article tbody tr:hover td{
      background-color:${v.muted ? `${v.muted}1a` : '#f0f0f0'} !important;
    }

    .article hr{
      border:none;
      height:1px;
      background:${v.border || v.muted};
      margin:24px 0;
      opacity:${parseFloat(v.opacity) * 0.6 || '0.6'};
    }

    .article strong, .article b{
      color:${v.accent};
      font-weight:700;
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

// 处理微信公众号内容的主要函数
export function processClipboardContent(innerHtml, theme = 'classic', primaryColor) {
  // 先修改 HTML 结构
  let html = modifyHtmlStructure(innerHtml)

  // 获取主题变量用于后续样式处理
  const themeVars = getThemeVars(theme)

  // 构建完整的 HTML 并使用 juice 合并样式
  const fullHtml = buildWechatHtml(html, theme)

  // 创建临时容器处理内容
  const tempDiv = document.createElement('div')
  const parser = new DOMParser()
  const doc = parser.parseFromString(fullHtml, 'text/html')
  const container = doc.querySelector('.article') || doc.body

  if (!container) {
    return innerHtml
  }

  // 处理颜色变量替换
  let processedHtml = container.innerHTML
  if (primaryColor) {
    processedHtml = processedHtml
      .replace(/var\(--md-primary-color\)/g, primaryColor)
      .replace(/--md-primary-color:.+?;/g, '')
      .replace(/hsl\(var\(--foreground\)\)/g, '#3f3f3f')
      .replace(/var\(--blockquote-background\)/g, '#f7f7f7')
      // 处理变换属性的特殊情况
      .replace(/([^-])top:(.*?)em/g, '$1transform: translateY($2em)')
  }

  tempDiv.innerHTML = processedHtml

  // 强化关键元素的内联样式，最大化保留在微信中的显示一致性
  const borderColor = themeVars.border || '#d1d5db'
  const tableBg = themeVars.bg || '#ffffff'
  const borderRadius = themeVars.borderRadius || '6px'
  const textColor = themeVars.text || '#1f2937'
  const accent = themeVars.accent || '#7c5cff'

  // 1) 头部标题：确保颜色和间距内联
  tempDiv.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((h) => {
    const tag = h.tagName.toLowerCase()
    const base = `color:${textColor};font-weight:700;margin:1.2em 0 .6em 0;`
    const size = tag === 'h1' ? 'font-size:175%;' : tag === 'h2' ? 'font-size:150%;' : tag === 'h3' ? 'font-size:125%;' : tag === 'h4' ? 'font-size:112.5%;' : tag === 'h5' ? 'font-size:100%;' : 'font-size:87.5%;'
    const accentCss = (tag === 'h1' || tag === 'h2') ? `color:${accent};` : ''
    h.setAttribute('style', `${base}${size}${accentCss}${h.getAttribute('style') || ''}`)
  })

  // 2) 链接：用下边框模拟下划线，避免被清理
  tempDiv.querySelectorAll('a').forEach((a) => {
    const style = `color:${accent};text-decoration:none;border-bottom:1px solid ${accent}33;`
    a.setAttribute('style', `${style}${a.getAttribute('style') || ''}`)
    // 强制安全属性
    a.setAttribute('target','_blank')
    const href = a.getAttribute('href') || ''
    if (!href || href.startsWith('javascript:')) a.removeAttribute('href')
  })

  // 3) 图片：半径与自适应
  tempDiv.querySelectorAll('img').forEach((img) => {
    const style = `max-width:100%;height:auto;display:block;border-radius:${borderRadius};margin:16px 0;`
    img.setAttribute('style', `${style}${img.getAttribute('style') || ''}`)
  })

  // 4) 代码块：背景与半径
  tempDiv.querySelectorAll('pre').forEach((pre) => {
    const style = `background:${themeVars.codeBg || tableBg};color:${textColor};padding:12px;border-radius:${borderRadius};overflow:auto;margin:16px 0;`
    pre.setAttribute('style', `${style}${pre.getAttribute('style') || ''}`)
  })
  tempDiv.querySelectorAll('code').forEach((code) => {
    const style = `background:${themeVars.codeBg || tableBg};color:${textColor};padding:2px 6px;border-radius:4px;`
    code.setAttribute('style', `${style}${code.getAttribute('style') || ''}`)
  })

  // 5) 表格：使用外层 wrapper 提供圆角裁切，避免 table 的圆角被微信打平
  const tables = tempDiv.querySelectorAll('table')
  tables.forEach(table => {
    // 创建包装器
    const wrapper = document.createElement('div')
    wrapper.setAttribute('style', `border:1px solid ${borderColor};border-radius:${borderRadius};overflow:hidden;background-color:${tableBg};margin:16px 0;`)
    // 插入包装器并移动表格
    const parent = table.parentElement
    if (parent) {
      parent.insertBefore(wrapper, table)
      wrapper.appendChild(table)
    }
    // 设置表格样式
    table.setAttribute('cellpadding', '0')
    table.setAttribute('cellspacing', '0')
    table.setAttribute('bgcolor', tableBg)
    table.style.borderCollapse = 'collapse'
    table.style.width = '100%'
    table.style.backgroundColor = tableBg
    table.style.border = 'none'
    table.style.margin = '0'

    // 处理表头 - 使用主题变量
    const ths = table.querySelectorAll('th')
    const thBg = themeVars.muted ? `${themeVars.muted}33` : '#f8f9fa'
    const thColor = themeVars.accent || themeVars.text || '#374151'

    ths.forEach((th, index) => {
      const isFirstTh = index === 0
      const isLastTh = index === ths.length - 1
      let borderRadius = ''

      // 为表头的第一个和最后一个单元格添加圆角
      if (isFirstTh && isLastTh) {
        borderRadius = `border-top-left-radius: ${themeVars.borderRadius || '6px'}; border-top-right-radius: ${themeVars.borderRadius || '6px'};`
      } else if (isFirstTh) {
        borderRadius = `border-top-left-radius: ${themeVars.borderRadius || '6px'};`
      } else if (isLastTh) {
        borderRadius = `border-top-right-radius: ${themeVars.borderRadius || '6px'};`
      }

      // 使用多种方式确保样式不被过滤
      th.setAttribute('style', `background-color: ${thBg} !important; background: ${thBg} !important; font-weight: 700; color: ${thColor} !important; border: 1px solid ${borderColor} !important; padding: 8px 12px; text-align: left; ${borderRadius}`)
      th.setAttribute('bgcolor', thBg)
      th.style.setProperty('background-color', thBg, 'important')
      th.style.setProperty('background', thBg, 'important')
      th.style.setProperty('color', thColor, 'important')
      th.style.setProperty('border', `1px solid ${borderColor}`, 'important')
      th.style.fontWeight = '700'
      th.style.padding = '8px 12px'
      th.style.textAlign = 'left'

      // 设置圆角
      const radiusValue = themeVars.borderRadius || '6px'
      if (isFirstTh && isLastTh) {
        th.style.borderTopLeftRadius = radiusValue
        th.style.borderTopRightRadius = radiusValue
      } else if (isFirstTh) {
        th.style.borderTopLeftRadius = radiusValue
      } else if (isLastTh) {
        th.style.borderTopRightRadius = radiusValue
      }
    })

    // 处理表格单元格 - 使用主题变量
    const tds = table.querySelectorAll('td')
    const allRows = table.querySelectorAll('tr')
    const lastRowIndex = allRows.length - 1
    const cellColor = themeVars.text || '#374151'
    const evenRowBg = themeVars.bg ? `${themeVars.bg}99` : '#f9f9f9'
    const oddRowBg = tableBg

    tds.forEach((td) => {
      const row = td.parentElement
      const rowIndex = Array.from(row.parentElement.children).indexOf(row)
      const isEvenRow = rowIndex % 2 === 1 // 偶数行 (0-based)
      const bgColor = isEvenRow ? evenRowBg : oddRowBg

      // 检查是否为最后一行的单元格
      const isLastRow = rowIndex === lastRowIndex
      const cellIndex = Array.from(row.children).indexOf(td)
      const isFirstCell = cellIndex === 0
      const isLastCell = cellIndex === row.children.length - 1

      let cellBorderRadius = ''
      const radiusValue = themeVars.borderRadius || '6px'
      if (isLastRow) {
        if (isFirstCell && isLastCell) {
          cellBorderRadius = `border-bottom-left-radius: ${radiusValue}; border-bottom-right-radius: ${radiusValue};`
        } else if (isFirstCell) {
          cellBorderRadius = `border-bottom-left-radius: ${radiusValue};`
        } else if (isLastCell) {
          cellBorderRadius = `border-bottom-right-radius: ${radiusValue};`
        }
      }

      // 使用多种方式设置样式
      td.setAttribute('style', `background-color: ${bgColor} !important; background: ${bgColor} !important; border: 1px solid ${borderColor} !important; padding: 8px 12px; color: ${cellColor}; text-align: left; vertical-align: top; ${cellBorderRadius}`)
      td.setAttribute('bgcolor', bgColor)
      td.style.setProperty('background-color', bgColor, 'important')
      td.style.setProperty('background', bgColor, 'important')
      td.style.setProperty('border', `1px solid ${borderColor}`, 'important')
      td.style.padding = '8px 12px'
      td.style.color = cellColor
      td.style.textAlign = 'left'
      td.style.verticalAlign = 'top'

      // 设置底部圆角
      if (isLastRow) {
        if (isFirstCell && isLastCell) {
          td.style.borderBottomLeftRadius = radiusValue
          td.style.borderBottomRightRadius = radiusValue
        } else if (isFirstCell) {
          td.style.borderBottomLeftRadius = radiusValue
        } else if (isLastCell) {
          td.style.borderBottomRightRadius = radiusValue
        }
      }
    })

    // 为整行也设置背景色
    const trs = table.querySelectorAll('tr')
    trs.forEach((tr, index) => {
      const isEvenRow = index % 2 === 1
      const bgColor = isEvenRow ? evenRowBg : oddRowBg
      if (index > 0) { // 跳过表头行
        tr.setAttribute('bgcolor', bgColor)
        tr.style.backgroundColor = bgColor
      }
    })
  })

  // 处理图片尺寸
  solveWeChatImage(tempDiv)

  // 添加空白节点用于兼容 SVG 复制
  const beforeNode = createEmptyNode()
  const afterNode = createEmptyNode()
  tempDiv.insertBefore(beforeNode, tempDiv.firstChild)
  tempDiv.appendChild(afterNode)

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

// Convert to fragment-only HTML (without doctype/head), suitable for pasting into WeChat editor directly
export function convertToWechatFragment(innerHtml, theme='classic', primaryColor) {
  // 1) sanitize HTML first
  const sanitized = sanitizeForWeChat(innerHtml)

  // 2) process with new logic
  return processClipboardContent(sanitized, theme, primaryColor)
}

// Copy to clipboard following doocs/md approach: provide both text/html and text/plain
export async function copyToWechat(innerHtml, theme='classic', primaryColor = '#7c5cff') {
  const fragment = convertToWechatFragment(innerHtml, theme, primaryColor)
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>${fragment}</body></html>`
  const text = new DOMParser().parseFromString(innerHtml || '', 'text/html').body.textContent || ''

  try {
    console.log('Generated HTML for copy:', html)
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
