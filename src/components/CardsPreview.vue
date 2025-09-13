<template>
  <div class="card-container">
    <div class="cards-strip" :class="{ exporting: exporting }" ref="stripRef">
      <div v-for="(c, idx) in cards" :key="idx" class="card card-theme" :class="[cardTheme, { active: idx === currentCardIndex }]" @click="scrollToCard(idx)">
        <div v-if="c.type==='cover'" class="inner cover">
          <div class="cover-background" v-if="cover.coverImage">
            <img :src="cover.coverImage" alt="封面图片" />
            <div class="cover-overlay"></div>
          </div>
          <div class="cover-content">
            <div class="badge">封面</div>
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
          <div class="content-html" v-html="c.html"></div>
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
})

const stripRef = ref(null)
const cards = ref([])
const exporting = ref(false)
const currentCardIndex = ref(0)
let scrollTimeout = null
let isUserClick = false

const cover = ref({ title: '标题', summary: '摘要', wordCount: 0, minutes: 1 })

watch(() => [props.html, props.cardTheme], async () => {
  await nextTick()
  await generate()
})

onMounted(async () => { await generate() })

function extractCoverData(root) {
  const h = root.querySelector('h1, h2, h3')
  const title = h ? h.textContent.trim() : '无标题'
  const p = root.querySelector('p')
  const summary = p ? p.textContent.trim().slice(0, 80) : ''
  const text = root.textContent || ''
  const wordCount = [...text].filter(ch => /\S/.test(ch)).length
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
  temp.className = `card-theme ${props.cardTheme}`
  document.body.appendChild(temp)

  const generated = [{ type: 'cover' }]
  let acc = []
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const probe = document.createElement('div')
    probe.className = 'content-html'
    probe.style.fontSize = '14px'
    probe.style.lineHeight = '1.6'
    
    // 特殊处理图片，确保图片能完整显示
    if (block.type === 'img') {
      // 创建临时测试元素，应用图片样式
      const imgTestProbe = document.createElement('div')
      imgTestProbe.className = 'content-html'
      imgTestProbe.style.fontSize = '14px'
      imgTestProbe.style.lineHeight = '1.6'
      imgTestProbe.innerHTML = block.html
      temp.innerHTML = ''
      temp.appendChild(imgTestProbe)
      
      // 等待图片加载，样式由CSS处理
      const img = imgTestProbe.querySelector('img')
      
      // 测试加入当前累积内容
      const testProbe = document.createElement('div')
      testProbe.className = 'content-html'
      testProbe.style.fontSize = '14px'
      testProbe.style.lineHeight = '1.6'
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
          combinedProbe.className = 'content-html'
          combinedProbe.style.fontSize = '14px'
          combinedProbe.style.lineHeight = '1.6'
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
      } else {
        acc.push(block)
      }
    }
  }
  
  if (acc.length) generated.push({ type: 'content', html: acc.map(b => b.html).join('') })

  cards.value = generated
  document.body.removeChild(temp)
}

function truncateContent(html, maxHeight, container) {
  const probe = document.createElement('div')
  probe.className = 'content-html'
  probe.style.fontSize = '14px'
  probe.style.lineHeight = '1.6'
  
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

