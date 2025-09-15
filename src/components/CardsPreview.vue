<template>
  <div class="card-container">
    <div class="cards-strip" :class="{ exporting: exporting }" ref="stripRef">
      <div v-for="(c, idx) in cards" :key="idx" class="card card-theme" :class="[pageTheme, cardTheme, { active: idx === currentCardIndex }]" @click="scrollToCard(idx)">
        <div v-if="c.type==='cover'" class="inner cover">
          <div class="cover-background">
            <template v-if="cover.coverImage">
              <img :src="cover.coverImage" alt="封面图片" />
            </template>
            <template v-else-if="coverBgHtml">
              <div
                class="bg-html"
                v-html="coverBgHtml"
                :style="{
                  transform: `scale(${props.scale})`,
                  transformOrigin: 'top left',
                  width: `${100 / props.scale}%`,
                  height: `${100 / props.scale}%`,
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  boxSizing: 'border-box',
                  padding: '0 16px'
                }"
              ></div>
            </template>
            <div class="cover-overlay"></div>
          </div>
          <div class="cover-content">
            <div class="title-overlay">
              <div class="title">{{ cover.title }}</div>
              <div class="summary">{{ cover.summary }}</div>
            </div>
          </div>
          <div class="meta">
            <span>全文 {{ cover.wordCount }} 字</span>
            <span>阅读需 {{ cover.minutes }} 分钟</span>
          </div>
        </div>
        <div v-else class="inner" style="position: relative;">
          <div
            class="content-html content-rich scaled-content"
            v-html="c.html"
            :style="{
              transform: `scale(${props.scale})`,
              transformOrigin: 'top left',
              width: `${100 / props.scale}%`,
              height: `${100 / props.scale}%`,
              position: 'absolute',
              top: '0',
              left: '0',
              boxSizing: 'border-box',
              padding: '0 16px'
            }"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- 卡片导航 -->
    <div v-if="cards.length > 1" class="card-navigation">
      <div class="nav-dots">
        <button 
          v-for="(card, idx) in cards" 
          :key="idx"
          class="nav-dot" 
          :class="{ active: idx === currentCardIndex }"
          @click="scrollToCard(idx)"
        >
          {{ idx + 1 }}
        </button>
      </div>
      <div class="nav-controls">
        <button 
          class="nav-btn" 
          :disabled="currentCardIndex === 0"
          @click="scrollToCard(currentCardIndex - 1)"
        >
          ◀
        </button>
        <span class="nav-info">{{ currentCardIndex + 1 }} / {{ cards.length }}</span>
        <button 
          class="nav-btn" 
          :disabled="currentCardIndex === cards.length - 1"
          @click="scrollToCard(currentCardIndex + 1)"
        >
          ▶
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import * as htmlToImage from 'html-to-image'

const props = defineProps({
  html: { type: String, default: '' },
  cardTheme: { type: String, default: 'card-theme-slate' },
  pageTheme: { type: String, default: 'theme-dark' }, // 'theme-light' | 'theme-dark'
  scale: { type: Number, default: 0.75 }, // 缩放比例 0.5-1.0
})

// pageTheme 通过 CSS 继承从父组件获取，无需再次应用类名

const stripRef = ref(null)
const cards = ref([])
const exporting = ref(false)
const currentCardIndex = ref(0)
const CARD_INDEX_KEY = 'uni.currentCardIndex'
let scrollTimeout = null
let isUserClick = false

const cover = ref({ title: '标题', summary: '摘要', wordCount: 0, minutes: 1 })
const coverBgHtml = ref('')

watch(() => [props.html, props.cardTheme, props.scale], async () => {
  await nextTick()
  await generate()
}, { immediate: false })

onMounted(async () => {
  // 如果挂载时已经有 HTML 内容，立即生成卡片
  if (props.html && props.html.trim()) {
    await generate()
  }
})

function extractCoverData(root) {
  // 标题：优先使用第一个 H1/H2/H3
  const h = root.querySelector('h1, h2, h3')
  const title = h ? h.textContent.trim() : '无标题'

  // 摘要：从内容中排除第一个 H1，再取其余文本的前 80 个字符
  const clone = root.cloneNode(true)
  const firstH1 = clone.querySelector('h1')
  if (firstH1) firstH1.remove()
  const rawText = (clone.textContent || '').replace(/\s+/g, ' ').trim()
  const summary = (() => {
    const chars = Array.from(rawText)
    if (chars.length <= 80) return rawText
    return chars.slice(0, 80).join('') + '…'
  })()

  // 字数与预计阅读时长（按非空白字符）
  const fullText = root.textContent || ''
  const wordCount = [...fullText].filter(ch => /\S/.test(ch)).length
  const minutes = Math.max(1, Math.ceil(wordCount / 400))

  // 提取第一张图片作为封面图
  const firstImg = root.querySelector('img')
  const coverImage = firstImg ? firstImg.src : null

  cover.value = { title, summary, wordCount, minutes, coverImage }
}

async function generate() {
  if (!props.html) {
    cards.value = []
    currentCardIndex.value = 0
    persistCardIndex()
    return
  }
  const parser = new DOMParser()
  const doc = parser.parseFromString(props.html, 'text/html')
  const content = doc.body
  extractCoverData(content)

  const blocks = []
  content.childNodes.forEach(node => {
    if (node.nodeType === 1) {
      const el = node
      const tag = el.tagName.toLowerCase()
      if (['p','h1','h2','h3','h4','blockquote','pre','ul','ol','table','img'].includes(tag)) {
        blocks.push({ type: tag, html: el.outerHTML, element: el })
      }
    } else if (node.nodeType === 3) {
      const text = node.textContent.trim()
      if (text) blocks.push({ type: 'p', html: `<p>${text}</p>`, element: null })
    }
  })

  // Fixed card size (324x540), inner padding 16
  const cardW = 324
  const cardH = 540
  const pad = 16
  const contentW = cardW - pad * 2
  // 实际内容区域高度，需要与渲染时的设置保持一致
  const physicalContentH = cardH - pad * 2
  // 测量时使用的高度，确保与渲染时一致 - 使用物理高度而不是缩放后的高度
  const contentH = physicalContentH

  console.log(`Container dimensions: cardH=${cardH}, pad=${pad}, physicalContentH=${physicalContentH}, contentH=${contentH}, scale=${props.scale}`)

  // Offscreen measurer - 创建一个和实际卡片完全一致的测量容器
  const temp = document.createElement('div')
  temp.style.position = 'absolute'
  temp.style.visibility = 'hidden'
  temp.style.width = contentW + 'px'
  temp.style.height = contentH + 'px'
  temp.style.padding = pad + 'px'
  temp.style.overflow = 'hidden'
  temp.style.position = 'relative' // 和实际 inner 容器一样
  temp.className = `card card-theme ${props.cardTheme} ${props.pageTheme}`
  document.body.appendChild(temp)

  // 回到简单可靠的测量方法
  function createScaledProbe() {
    const probe = document.createElement('div')
    probe.className = 'content-html content-rich'
    probe.style.width = (contentW / props.scale) + 'px' // 使用未缩放的宽度进行测量
    probe.style.height = (physicalContentH / props.scale) + 'px' // 使用物理内容高度
    probe.style.boxSizing = 'border-box'
    probe.style.padding = '0 16px'
    probe.style.overflow = 'hidden'
    probe.style.position = 'relative' // 确保正确的定位上下文
    probe.style.fontFamily = 'var(--font-family-base, "Microsoft YaHei", sans-serif)'
    probe.style.lineHeight = '1.6'
    probe.style.fontSize = '16px'
    probe.style.wordBreak = 'break-word'
    return probe
  }

  console.log(`=== Generate started: ${blocks.length} blocks total ===`)

  // 测试测量逻辑是否正确工作
  const testProbe = createScaledProbe()
  testProbe.innerHTML = '<p>This is a test paragraph to verify measurement works correctly.</p>'
  temp.innerHTML = ''
  temp.appendChild(testProbe)
  await new Promise(resolve => setTimeout(resolve, 10))
  const testHeight = testProbe.scrollHeight
  console.log(`Measurement test: testHeight=${testHeight}, expected range: 20-100px`)

  blocks.forEach((block, i) => {
    console.log(`Block ${i}: ${block.type}`)
  })

  const generated = [{ type: 'cover' }]
  let acc = []
  
  for (let i = 0; i < blocks.length; i++) {
    console.log(`\n--- Processing block ${i}/${blocks.length-1}: ${blocks[i].type} ---`)
    const block = blocks[i]
    const probe = createScaledProbe()
    
    // 特殊处理图片，确保图片能完整显示
    if (block.type === 'img') {
      // 创建临时测试元素，应用图片样式
      const imgTestProbe = createScaledProbe()
      imgTestProbe.innerHTML = block.html
      temp.innerHTML = ''
      temp.appendChild(imgTestProbe)
      
      // 等待图片加载，样式由CSS处理
      const img = imgTestProbe.querySelector('img')
      
      // 测试加入当前累积内容
      const testProbe = createScaledProbe()
      testProbe.innerHTML = acc.map(b => b.html).join('') + block.html
      temp.innerHTML = ''
      temp.appendChild(testProbe)
      
      // 图片样式由CSS处理
      
      // 给一些时间让布局稳定
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // 回到简单可靠的测量方法：scrollHeight * scale
      const scaledHeight = testProbe.scrollHeight * props.scale
      console.log('Image block test:', {
        scrollHeight: testProbe.scrollHeight,
        scaledHeight: scaledHeight.toFixed(1),
        scale: props.scale,
        contentH,
        fits: scaledHeight <= contentH
      })
      if (scaledHeight <= contentH) {
        acc.push(block)
      } else {
        if (acc.length) generated.push({ type: 'content', html: acc.map(b => b.html).join('') })
        acc = [block]
      }
    } else {
      // 创建新的probe元素，确保每次测量都是干净的
      const freshProbe = createScaledProbe()
      freshProbe.innerHTML = acc.map(b => b.html).join('') + block.html
      temp.innerHTML = ''
      temp.appendChild(freshProbe)

      // 给一些时间让布局稳定
      await new Promise(resolve => setTimeout(resolve, 10))

      const scaledHeight = freshProbe.scrollHeight * props.scale
      const content = acc.map(b => b.type).join('+') + '+' + block.type

      // 更智能的空间利用：如果接近边界但没有超出太多，就允许
      const overage = scaledHeight - contentH
      const allowableOverage = 15 / props.scale // 按缩放比例调整允许的超出量
      const shouldCreateNewCard = overage > allowableOverage

      console.log(`Regular block test: ${content} | scroll:${freshProbe.scrollHeight} | scaled:${scaledHeight.toFixed(1)} | contentH:${contentH} | overage:${overage.toFixed(1)} | newCard:${shouldCreateNewCard} | scale:${props.scale}`)
      console.log(`  Block content preview: ${block.html.substring(0, 50).replace(/\n/g, ' ').replace(/<[^>]*>/g, '')}...`)
      console.log(`  Probe styles: width=${freshProbe.style.width}, height=${freshProbe.style.height}`)

      if (shouldCreateNewCard) {
        // 如果当前累积内容不为空，先生成一张卡片
        if (acc.length) {
          generated.push({ type: 'content', html: acc.map(b => b.html).join('') })
        }

        // 如果是标题类型，尝试与下一个内容组合
        if (['h1', 'h2', 'h3', 'h4'].includes(block.type) && i + 1 < blocks.length) {
          const nextBlock = blocks[i + 1]
          const combinedProbe = createScaledProbe()
          combinedProbe.innerHTML = block.html + nextBlock.html
          temp.innerHTML = ''
          temp.appendChild(combinedProbe)

          const combinedScaledHeight = combinedProbe.scrollHeight * props.scale
          if (combinedScaledHeight <= contentH) {
            // 标题和下一个内容可以组合在一起
            acc = [block, nextBlock]
            i++ // 跳过下一个块，因为已经处理了
          } else {
            acc = [block]
          }
        } else {
          // 新卡片仅包含当前块，必要时对块进行拆分/截断
          if (block.type === 'ul' || block.type === 'ol') {
            const { fitHtml, remainHtml } = splitListToFit(block.html, physicalContentH, temp, props.scale)
            acc = [{ type: block.type, html: fitHtml, element: null }]
            if (remainHtml) {
              blocks.splice(i + 1, 0, { type: block.type, html: remainHtml, element: null })
            }
          } else {
            acc = [block]

            // 检查单个元素是否过大
            const singleProbe = createScaledProbe()
            singleProbe.innerHTML = block.html
            temp.innerHTML = ''
            temp.appendChild(singleProbe)
            const singleScaledHeight = singleProbe.scrollHeight * props.scale
            console.log('Single block check:', {
              type: block.type,
              scrollHeight: singleProbe.scrollHeight,
              scaledHeight: singleScaledHeight.toFixed(1),
              contentH,
              tooLarge: singleScaledHeight > contentH
            })
            if (singleScaledHeight > contentH) {
              // 如果单个元素太大，尝试截断（但不截断图片和标题）
              if (block.type !== 'img' && !['h1', 'h2', 'h3', 'h4'].includes(block.type)) {
                const truncated = truncateContent(block.html, contentH, temp, props.scale)
                acc = [{ type: block.type, html: truncated, element: null }]
              }
            }
          }
        }
      } else {
        acc.push(block)
      }
    }
  }
  
  if (acc.length) generated.push({ type: 'content', html: acc.map(b => b.html).join('') })

  console.log(`=== Generate completed: ${generated.length} cards generated ===`)

  // Debug actual content heights after generation
  setTimeout(() => {
    const cards = document.querySelectorAll('.card .scaled-content .content-html')
    cards.forEach((contentEl, i) => {
      const scaledContentContainer = contentEl.closest('.scaled-content')
      const cardEl = contentEl.closest('.card')
      const innerEl = contentEl.closest('.inner')

      // Get computed styles
      const contentStyle = window.getComputedStyle(contentEl)
      const cardStyle = window.getComputedStyle(cardEl)
      const innerStyle = window.getComputedStyle(innerEl)

      const cardHeight = cardEl?.offsetHeight || 0
      const cardWidth = cardEl?.offsetWidth || 0
      const innerHeight = innerEl?.offsetHeight || 0
      const innerWidth = innerEl?.offsetWidth || 0
      const contentHeight = contentEl.scrollHeight
      const contentWidth = contentEl.scrollWidth
      const scaledContentHeight = contentHeight * props.scale
      const scaledContentWidth = contentWidth * props.scale
      const availableHeight = innerHeight
      const availableWidth = innerWidth

      // Check for overflow
      const isOverflowingHeight = scaledContentHeight > availableHeight
      const isOverflowingWidth = scaledContentWidth > availableWidth

      console.log(`=== Card ${i} Debug Info ===`)
      console.log('Card dimensions:', { width: cardWidth, height: cardHeight })
      console.log('Inner dimensions:', { width: innerWidth, height: innerHeight })
      console.log('Content scroll dimensions:', { width: contentWidth, height: contentHeight })
      console.log('Scaled content dimensions:', { width: scaledContentWidth, height: scaledContentHeight })
      console.log('Overflow check:', {
        heightOverflow: isOverflowingHeight ? `${scaledContentHeight - availableHeight}px` : 'none',
        widthOverflow: isOverflowingWidth ? `${scaledContentWidth - availableWidth}px` : 'none'
      })
      console.log('CSS properties:', {
        contentTransform: contentStyle.transform,
        contentPosition: contentStyle.position,
        innerOverflow: innerStyle.overflow,
        cardOverflow: cardStyle.overflow,
        contentBoxSizing: contentStyle.boxSizing
      })

      const utilization = availableHeight > 0 ? ((scaledContentHeight / availableHeight) * 100).toFixed(1) : '0.0'
      const wastedSpace = availableHeight - scaledContentHeight
      console.log('Utilization:', `${utilization}% (${scaledContentHeight}/${availableHeight})`)
      console.log('Wasted space:', wastedSpace)
      console.log('Scale factor:', props.scale)
      console.log('====================')
    })
  }, 200)

  generated.forEach((card, i) => {
    if (card.type === 'cover') {
      console.log(`Card ${i}: cover`)
    } else {
      const content = card.html.length > 100 ? card.html.substring(0, 100) + '...' : card.html
      console.log(`Card ${i}: content (${card.html.length} chars) - ${content.replace(/\n/g, ' ').replace(/<[^>]*>/g, '')}`)

      // 测试这张卡片的实际高度利用率
      setTimeout(() => {
        const testProbe = createScaledProbe()
        testProbe.innerHTML = card.html
        temp.appendChild(testProbe)
        setTimeout(() => {
          const scaledHeight = testProbe.scrollHeight * props.scale
          const utilization = contentH > 0 ? ((scaledHeight / contentH) * 100).toFixed(1) : '0'
          console.log(`  -> Final card ${i} utilization: ${scaledHeight.toFixed(1)}/${contentH} = ${utilization}%`)
          temp.removeChild(testProbe)
        }, 50)
      }, i * 20)
    }
  })

  // Determine cover background when no image: use second card content HTML if available
  if (!cover.value.coverImage) {
    const second = generated[1]
    if (second && second.type === 'content' && second.html) {
      coverBgHtml.value = `<div class=\"content-html content-rich\">${second.html}</div>`
    } else {
      coverBgHtml.value = ''
    }
  } else {
    coverBgHtml.value = ''
  }

  cards.value = generated
  document.body.removeChild(temp)

  // 恢复保存的卡片索引，确保不超出范围
  restoreCardPosition(generated)
}

function truncateContent(html, maxHeight, container, scale) {
  // 对于图片，直接返回
  if (html.includes('<img')) return html

  // 对于文本内容，尝试截断
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const element = doc.body.firstElementChild

  if (element && element.textContent) {
    const text = element.textContent
    let truncated = text

    // 二分法查找合适的长度
    let left = 0
    let right = text.length

    while (left < right) {
      const mid = Math.floor((left + right + 1) / 2)
      truncated = text.substring(0, mid) + (mid < text.length ? '...' : '')
      element.textContent = truncated

      // 创建新的测量元素
      const probe = document.createElement('div')
      probe.className = 'content-html content-rich'
      probe.style.width = (292 / scale) + 'px' // 使用未缩放的宽度进行测量
      probe.style.height = (508 / scale) + 'px' // 使用物理内容高度
      probe.style.boxSizing = 'border-box'
      probe.style.padding = '0 16px'
      probe.style.overflow = 'hidden'
      probe.style.position = 'relative'
      probe.innerHTML = element.outerHTML

      container.innerHTML = ''
      container.appendChild(probe)

      const unscaledHeight = probe.scrollHeight
      const scaledHeight = unscaledHeight * scale
      if (scaledHeight <= maxHeight) {
        left = mid
      } else {
        right = mid - 1
      }
    }

    truncated = text.substring(0, left) + (left < text.length ? '...' : '')
    element.textContent = truncated
    return element.outerHTML
  }

  return html
}

// 针对列表（ul/ol）按 li 进行拆分，保证结构正确不被压平
function splitListToFit(html, maxHeight, container, scale) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const list = doc.body.firstElementChild
  if (!list || !['UL','OL'].includes(list.tagName)) {
    return { fitHtml: html, remainHtml: '' }
  }

  const isOrdered = list.tagName === 'OL'
  const originalStart = isOrdered ? parseInt(list.getAttribute('start') || '1') : null
  const items = Array.from(list.children).filter(el => el.tagName === 'LI')

  const fitList = document.createElement(list.tagName.toLowerCase())
  if (isOrdered && originalStart && originalStart !== 1) fitList.setAttribute('start', String(originalStart))

  let fitCount = 0
  for (let idx = 0; idx < items.length; idx++) {
    const liClone = items[idx].cloneNode(true)
    fitList.appendChild(liClone)

    // 测量当前 fitList 高度
    const probe = document.createElement('div')
    probe.className = 'content-html content-rich'
    probe.style.width = (292 / scale) + 'px' // 使用未缩放的宽度进行测量
    probe.style.height = (508 / scale) + 'px' // 使用物理内容高度
    probe.style.boxSizing = 'border-box'
    probe.style.padding = '0 16px'
    probe.style.overflow = 'hidden'
    probe.style.position = 'relative'
    probe.appendChild(fitList.cloneNode(true))
    container.innerHTML = ''
    container.appendChild(probe)

    const unscaledHeight = probe.scrollHeight
    const scaledHeight = unscaledHeight * scale
    if (scaledHeight <= maxHeight) {
      fitCount = idx + 1
      continue
    } else {
      // 超出，撤回最后一个
      fitList.removeChild(fitList.lastElementChild)
      break
    }
  }

  // 所有项都能放下
  if (fitCount >= items.length) {
    return { fitHtml: list.outerHTML, remainHtml: '' }
  }

  // 构建剩余列表
  const remainList = document.createElement(list.tagName.toLowerCase())
  if (isOrdered) {
    const start = (originalStart || 1) + fitCount
    if (start !== 1) remainList.setAttribute('start', String(start))
  }
  for (let i = fitCount; i < items.length; i++) {
    remainList.appendChild(items[i].cloneNode(true))
  }

  return { fitHtml: fitList.outerHTML, remainHtml: remainList.outerHTML }
}

function scrollToCard(index) {
  if (!stripRef.value || index < 0 || index >= cards.value.length) return

  // 标记这是用户点击触发的滚动
  isUserClick = true

  // 直接设置当前索引，确保立即响应
  currentCardIndex.value = index
  persistCardIndex()
  
  const cardElements = stripRef.value.querySelectorAll('.card')
  const targetCard = cardElements[index]
  if (targetCard) {
    // 计算目标卡片应该滚动到的位置，使其居中显示
    const stripWidth = stripRef.value.clientWidth
    const cardWidth = 324 + 16 // 卡片宽度 + gap
    const cardOffsetLeft = index * cardWidth + 16 // 加上左padding
    const scrollLeft = cardOffsetLeft - (stripWidth / 2) + (324 / 2) // 居中计算
    
    // 计算最大滚动距离，确保最后一张卡片能完全显示
    const totalWidth = cards.value.length * cardWidth + 16 + 32 // 总宽度包括左右padding
    const maxScrollLeft = Math.max(0, totalWidth - stripWidth)
    
    stripRef.value.scrollTo({
      left: Math.max(0, Math.min(scrollLeft, maxScrollLeft)),
      behavior: 'smooth'
    })
    
    // 等待滚动完成后重置标记
    setTimeout(() => {
      isUserClick = false
    }, 500)
  }
}

function handleScroll() {
  if (!stripRef.value) return
  
  // 如果是用户点击触发的滚动，不要更新索引
  if (isUserClick) return
  
  // 防抖处理，避免频繁更新
  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    if (isUserClick) return // 再次检查，确保不会覆盖用户选择
    
    const stripScrollLeft = stripRef.value.scrollLeft
    const stripWidth = stripRef.value.clientWidth
    const stripCenter = stripScrollLeft + stripWidth / 2
    
    // 计算哪个卡片最接近中心
    const cardWidth = 324 + 16 // 卡片宽度 + gap
    const paddingLeft = 16
    
    let closestIndex = 0
    let closestDistance = Infinity
    
    cards.value.forEach((card, index) => {
      const cardCenter = paddingLeft + index * cardWidth + 324 / 2
      const distance = Math.abs(cardCenter - stripCenter)
      
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    
    currentCardIndex.value = closestIndex
    persistCardIndex()
  }, 150)
}

async function exportAll() {
  if (!stripRef.value) return
  exporting.value = true
  await nextTick()
  const nodes = Array.from(stripRef.value.querySelectorAll('.card'))
  let i = 1
  for (const node of nodes) {
    const cs = window.getComputedStyle(node)
    const bg = cs.backgroundColor || '#ffffff'

    // 特殊处理封面页面，确保blur效果被正确导出
    let processedNode = node
    let needsCleanup = false

    if (node.classList.contains('cover')) {
      // 克隆封面节点以避免修改原始DOM
      processedNode = node.cloneNode(true)

      // 确保blur效果在克隆的节点中正确应用
      const bgHtml = processedNode.querySelector('.bg-html')
      if (bgHtml) {
        // 临时移除可能导致导出问题的样式
        bgHtml.style.willChange = 'auto'
        bgHtml.style.contain = 'none'

        // 确保transform和filter样式被正确继承
        const computedStyle = window.getComputedStyle(bgHtml)
        bgHtml.style.filter = computedStyle.filter
        bgHtml.style.opacity = computedStyle.opacity
        bgHtml.style.transform = computedStyle.transform
      }

      needsCleanup = true
    }

    try {
      const dataUrl = await htmlToImage.toPng(processedNode, {
        pixelRatio: 3,
        backgroundColor: bg,
        // 提高导出质量，特别是对于有复杂效果的元素
        quality: 1.0,
        // 确保包含所有样式
        includeQueryParams: true,
        // 处理可能的跨域图片
        skipFonts: false,
        // 增加超时时间
        timeout: 30000
      })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `uni-card-${i++}.png`
      a.click()
    } catch (e) {
      console.error('导出失败', e)
    }

    // 如果创建了临时节点，需要清理
    if (needsCleanup && processedNode !== node) {
      // 临时节点会在下次垃圾回收时被清理
    }
  }
  exporting.value = false
}

function loadCardIndex() {
  try {
    const saved = localStorage.getItem(CARD_INDEX_KEY)
    const index = saved ? parseInt(saved, 10) : 0
    return isNaN(index) ? 0 : Math.max(0, index)
  } catch {
    return 0
  }
}

function persistCardIndex() {
  try {
    localStorage.setItem(CARD_INDEX_KEY, String(currentCardIndex.value))
  } catch {
    // localStorage 不可用时忽略错误
  }
}

function restoreCardPosition(generatedCards) {
  const savedIndex = loadCardIndex()

  if (savedIndex >= 0 && savedIndex < generatedCards.length) {
    currentCardIndex.value = savedIndex

    // 如果是第0张卡片，不需要滚动
    if (savedIndex === 0) {
      return
    }

    // 等待DOM完全渲染
    nextTick(() => {
      setTimeout(() => {
        if (!stripRef.value) return

        // 检查组件是否可见
        const rect = stripRef.value.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) {
          setTimeout(() => restoreCardPosition(generatedCards), 200)
          return
        }

        const cardElements = stripRef.value.querySelectorAll('.card')
        if (cardElements.length <= savedIndex) {
          return
        }

        // 直接设置滚动位置，不使用动画
        const stripWidth = stripRef.value.clientWidth
        const cardWidth = 324 + 16 // 卡片宽度 + gap
        const cardOffsetLeft = savedIndex * cardWidth + 16 // 加上左padding
        const scrollLeft = cardOffsetLeft - (stripWidth / 2) + (324 / 2) // 居中计算

        const totalWidth = generatedCards.length * cardWidth + 16 + 32
        const maxScrollLeft = Math.max(0, totalWidth - stripWidth)
        const finalScrollLeft = Math.max(0, Math.min(scrollLeft, maxScrollLeft))

        stripRef.value.scrollLeft = finalScrollLeft

        // 检查是否滚动成功，如果失败则使用scrollIntoView作为备选
        setTimeout(() => {
          const actualScrollLeft = stripRef.value?.scrollLeft || 0
          if (stripRef.value && Math.abs(actualScrollLeft - finalScrollLeft) > 10) {
            const targetCard = cardElements[savedIndex]
            if (targetCard) {
              targetCard.scrollIntoView({
                behavior: 'auto',
                block: 'nearest',
                inline: 'center'
              })
            }
          }
        }, 100)
      }, 300)
    })
  } else {
    currentCardIndex.value = 0
    persistCardIndex()
  }
}

onMounted(() => {
  if (stripRef.value) {
    stripRef.value.addEventListener('scroll', handleScroll)
  }
})

onBeforeUnmount(() => {
  if (stripRef.value) {
    stripRef.value.removeEventListener('scroll', handleScroll)
  }
})

defineExpose({ exportAll })
</script>
