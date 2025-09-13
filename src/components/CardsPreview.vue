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
              <div class="bg-html" v-html="coverBgHtml"></div>
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
        <div v-else class="inner">
          <div class="content-html content-rich" v-html="c.html"></div>
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
import { ref, watch, nextTick, onMounted } from 'vue'
import * as htmlToImage from 'html-to-image'

const props = defineProps({
  html: { type: String, default: '' },
  cardTheme: { type: String, default: 'card-theme-slate' },
  pageTheme: { type: String, default: 'dark' }, // 'light' | 'dark'
})

// pageTheme 通过 CSS 继承从父组件获取，无需再次应用类名

const stripRef = ref(null)
const cards = ref([])
const exporting = ref(false)
const currentCardIndex = ref(0)
let scrollTimeout = null
let isUserClick = false

const cover = ref({ title: '标题', summary: '摘要', wordCount: 0, minutes: 1 })
const coverBgHtml = ref('')

watch(() => [props.html, props.cardTheme], async () => {
  await nextTick()
  await generate()
})

onMounted(async () => { await generate() })

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
  if (!props.html) { cards.value = []; return }
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
  const contentH = cardH - pad * 2 - 20 // 预留底部空间，避免切割

  // Offscreen measurer
  const temp = document.createElement('div')
  temp.style.position = 'absolute'
  temp.style.visibility = 'hidden'
  temp.style.width = contentW + 'px'
  temp.style.height = contentH + 'px'
  temp.style.padding = pad + 'px'
  temp.style.overflow = 'hidden'
  temp.className = `card-theme ${props.cardTheme} ${props.pageTheme}`
  document.body.appendChild(temp)

  const generated = [{ type: 'cover' }]
  let acc = []
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const probe = document.createElement('div')
    probe.className = 'content-html content-rich'
    
    // 特殊处理图片，确保图片能完整显示
    if (block.type === 'img') {
      // 创建临时测试元素，应用图片样式
      const imgTestProbe = document.createElement('div')
      imgTestProbe.className = 'content-html content-rich'
      imgTestProbe.innerHTML = block.html
      temp.innerHTML = ''
      temp.appendChild(imgTestProbe)
      
      // 等待图片加载，样式由CSS处理
      const img = imgTestProbe.querySelector('img')
      
      // 测试加入当前累积内容
      const testProbe = document.createElement('div')
      testProbe.className = 'content-html content-rich'
      testProbe.innerHTML = acc.map(b => b.html).join('') + block.html
      temp.innerHTML = ''
      temp.appendChild(testProbe)
      
      // 图片样式由CSS处理
      
      // 给一些时间让布局稳定
      await new Promise(resolve => setTimeout(resolve, 50))
      
      if (testProbe.scrollHeight <= contentH) {
        acc.push(block)
      } else {
        if (acc.length) generated.push({ type: 'content', html: acc.map(b => b.html).join('') })
        acc = [block]
      }
    } else {
      // 测试加入当前块是否会超出
      probe.innerHTML = acc.map(b => b.html).join('') + block.html
      temp.innerHTML = ''
      temp.appendChild(probe)
      
      if (probe.scrollHeight > contentH) {
        // 如果当前累积内容不为空，先生成一张卡片
        if (acc.length) {
          generated.push({ type: 'content', html: acc.map(b => b.html).join('') })
        }
        
        // 如果是标题类型，尝试与下一个内容组合
        if (['h1', 'h2', 'h3', 'h4'].includes(block.type) && i + 1 < blocks.length) {
          const nextBlock = blocks[i + 1]
          const combinedProbe = document.createElement('div')
          combinedProbe.className = 'content-html content-rich'
          combinedProbe.innerHTML = block.html + nextBlock.html
          temp.innerHTML = ''
          temp.appendChild(combinedProbe)
          
          if (combinedProbe.scrollHeight <= contentH) {
            // 标题和下一个内容可以组合在一起
            acc = [block, nextBlock]
            i++ // 跳过下一个块，因为已经处理了
          } else {
            acc = [block]
          }
        } else {
          // 新卡片仅包含当前块，必要时对块进行拆分/截断
          if (block.type === 'ul' || block.type === 'ol') {
            const { fitHtml, remainHtml } = splitListToFit(block.html, contentH, temp)
            acc = [{ type: block.type, html: fitHtml, element: null }]
            if (remainHtml) {
              blocks.splice(i + 1, 0, { type: block.type, html: remainHtml, element: null })
            }
          } else {
            acc = [block]
            
            // 检查单个元素是否过大
            probe.innerHTML = block.html
            if (probe.scrollHeight > contentH) {
              // 如果单个元素太大，尝试截断（但不截断图片和标题）
              if (block.type !== 'img' && !['h1', 'h2', 'h3', 'h4'].includes(block.type)) {
                const truncated = truncateContent(block.html, contentH, temp)
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
}

function truncateContent(html, maxHeight, container) {
  const probe = document.createElement('div')
  probe.className = 'content-html content-rich'
  
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
      probe.innerHTML = element.outerHTML
      container.innerHTML = ''
      container.appendChild(probe)
      
      if (probe.scrollHeight <= maxHeight) {
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
function splitListToFit(html, maxHeight, container) {
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
    probe.appendChild(fitList.cloneNode(true))
    container.innerHTML = ''
    container.appendChild(probe)

    if (probe.scrollHeight <= maxHeight) {
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
    try {
      const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 3, backgroundColor: bg })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `uni-card-${i++}.png`
      a.click()
    } catch (e) {
      console.error('导出失败', e)
    }
  }
  exporting.value = false
}

onMounted(() => {
  if (stripRef.value) {
    stripRef.value.addEventListener('scroll', handleScroll)
  }
})

defineExpose({ exportAll })
</script>
