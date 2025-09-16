<template>
  <div class="card-container">
    <!-- 左侧子Tab导航 -->
    <div class="sub-tabs">
      <button class="sub-tab" :class="{ active: currentTab === 'cover' }" @click="setCurrentTab('cover')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
        {{ t('cardsPreview.cover') }}
      </button>
      <button class="sub-tab" :class="{ active: currentTab === 'cards' }" @click="setCurrentTab('cards')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="9" rx="1"/>
          <rect x="14" y="3" width="7" height="5" rx="1"/>
          <rect x="14" y="12" width="7" height="9" rx="1"/>
          <rect x="3" y="16" width="7" height="5" rx="1"/>
        </svg>
        {{ t('cardsPreview.cards') }}
      </button>
    </div>

    <!-- 封面设计页面 -->
    <div v-if="currentTab === 'cover'" class="cover-design-page">
      <!-- 封面预览和布局选择区域 -->
      <div class="cover-left-section">
        <div class="cover-preview-section">
          <div class="preview-container">
            <div class="card card-theme cover-preview" :class="[pageTheme, cardTheme, `cover-layout-${currentCoverLayout}`]">
              <div class="inner cover">
                <div class="cover-background">
                  <template v-if="cover.coverImage">
                    <img :src="cover.coverImage" alt="封面图片" :style="coverImageStyle" />
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
                    <div
                      v-if="currentCoverLayout !== 'minimal'"
                      class="summary"
                    >{{ truncatedSummary }}</div>
                  </div>
                </div>
                <div class="meta">
                  <span>全文 {{ cover.wordCount }} 字</span>
                  <span>阅读需 {{ cover.minutes }} 分钟</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="layout-selection-section">
          <h3>{{ t('cardsPreview.layoutSelection') }}</h3>
          <div class="layout-grid">
            <div
              v-for="layout in coverLayouts"
              :key="layout.id"
              class="layout-card"
              :class="{ active: currentCoverLayout === layout.id }"
              @click="changeCoverLayout(layout.id)"
            >
              <div class="layout-preview" v-html="layout.icon"></div>
              <div class="layout-info">
                <div class="layout-name">{{ layout.name }}</div>
                <div class="layout-desc">{{ layout.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 内容编辑面板 -->
  <div class="cover-edit-panel">
    <div class="edit-section">
      <h3>{{ t('cardsPreview.contentEdit') }}</h3>
      <div class="content-edit-form">
        <div class="form-group">
          <label>{{ t('cardsPreview.title') }}</label>
          <input v-model="cover.title" type="text" class="form-input" :placeholder="t('cardsPreview.titlePlaceholder')">
        </div>
        <div class="form-group">
          <label>{{ t('cardsPreview.summary') }}</label>
          <textarea v-model="cover.summary" class="form-textarea" rows="6" :placeholder="t('cardsPreview.summaryPlaceholder')"></textarea>
        </div>
      </div>
    </div>

    <div class="edit-section">
      <h3>{{ t('cardsPreview.backgroundImage') }}</h3>
      <div class="image-upload-area">
        <input type="file" ref="imageInput" @change="handleImageUpload" accept="image/*" style="display: none;">
        <div class="upload-zone" @click="$refs.imageInput?.click()">
          <div v-if="cover.coverImage" class="current-image">
            <img :src="cover.coverImage" alt="当前图片">
            <div class="image-overlay">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21,15 16,10 5,21"/>
              </svg>
              <span>{{ t('cardsPreview.clickToReplace') }}</span>
            </div>
          </div>
          <div v-else class="upload-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            <span>{{ t('cardsPreview.clickToUpload') }}</span>
            <small>{{ t('cardsPreview.imageFormats') }}</small>
          </div>
        </div>
        <!-- 常用图片填充选项 -->
        <div class="content-edit-form" style="margin-top: 12px;">
          <div class="form-group">
            <label>{{ t('cardsPreview.fillMode') }}</label>
            <select class="select" v-model="cover.imageFit" @change="persistCoverData">
              <option value="cover">{{ t('cardsPreview.fillCover') }}</option>
              <option value="contain">{{ t('cardsPreview.fillContain') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('cardsPreview.alignPosition') }}</label>
            <select class="select" v-model="cover.imagePosition" @change="persistCoverData">
              <option value="center center">{{ t('cardsPreview.alignCenter') }}</option>
              <option value="top center">{{ t('cardsPreview.alignTop') }}</option>
              <option value="bottom center">{{ t('cardsPreview.alignBottom') }}</option>
              <option value="left center">{{ t('cardsPreview.alignLeft') }}</option>
              <option value="right center">{{ t('cardsPreview.alignRight') }}</option>
              <option value="top left">{{ t('cardsPreview.alignTopLeft') }}</option>
              <option value="top right">{{ t('cardsPreview.alignTopRight') }}</option>
              <option value="bottom left">{{ t('cardsPreview.alignBottomLeft') }}</option>
              <option value="bottom right">{{ t('cardsPreview.alignBottomRight') }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
    </div>

    <!-- 卡片列表页面 -->
    <div v-else class="cards-page">
      <div class="cards-strip" :class="{ exporting: exporting }" ref="stripRef">
        <div
          v-for="(c, idx) in cards"
          :key="idx"
          class="card card-theme"
          :class="[pageTheme, cardTheme, { active: idx === currentCardIndex }]"
          @click="scrollToCard(idx)"
        >
          <template v-if="c.type === 'cover'">
            <div class="inner cover" :class="`cover-layout-${currentCoverLayout}`">
              <div class="cover-background">
                <template v-if="cover.coverImage">
                  <img :src="cover.coverImage" alt="封面图片" :style="coverImageStyle" />
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
                  <div v-if="currentCoverLayout !== 'minimal'" class="summary">{{ truncatedSummary }}</div>
                </div>
              </div>
              <div class="meta">
                <span>全文 {{ cover.wordCount }} 字</span>
                <span>阅读需 {{ cover.minutes }} 分钟</span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="inner" style="position: relative;">
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
          </template>
        </div>
      </div>

      <!-- 卡片导航（仅在卡片页面显示） -->
      <div v-if="cards.length > 0" class="card-navigation">
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
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import * as htmlToImage from 'html-to-image'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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

const cover = ref({
  title: '',
  summary: '',
  wordCount: 0,
  minutes: 1,
  originalSummary: '',
  imageFit: 'cover', // 'cover' | 'contain'
  imagePosition: 'center center',
})
const coverBgHtml = ref('')
const imageInput = ref(null)

// 计算摘要截断
const truncatedSummary = computed(() => {
  const maxLength = 80
  if (cover.value.summary && cover.value.summary.length > maxLength) {
    return cover.value.summary.substring(0, maxLength) + '...'
  }
  return cover.value.summary
})

// 背景图片样式（填充/对齐）
const coverImageStyle = computed(() => ({
  objectFit: cover.value.imageFit || 'cover',
  objectPosition: cover.value.imagePosition || 'center center',
}))


// 封面布局相关
const COVER_LAYOUT_KEY = 'uni.coverLayout'
const CURRENT_TAB_KEY = 'uni.currentTab'
const currentCoverLayout = ref('center')
const currentTab = ref('cover') // 'cover' | 'cards'

// 6种封面布局配置
const coverLayouts = computed(() => [
  {
    id: 'minimal',
    name: t('coverLayouts.minimal'),
    description: t('coverLayouts.minimalDesc'),
    icon: '<div style="background: #4f46e5; border-radius: 2px; width: 20px; height: 8px; margin: 8px auto;"></div>'
  },
  {
    id: 'center',
    name: t('coverLayouts.center'),
    description: t('coverLayouts.centerDesc'),
    icon: '<div style="background: #4f46e5; border-radius: 2px; width: 20px; height: 8px; margin: 2px auto;"></div><div style="background: #9ca3af; border-radius: 1px; width: 16px; height: 6px; margin: 2px auto;"></div>'
  },
  {
    id: 'image-top',
    name: t('coverLayouts.imageTop'),
    description: t('coverLayouts.imageTopDesc'),
    icon: '<div style="background: #94a3b8; border-radius: 2px; width: 20px; height: 8px; margin: 0 auto 1px;"></div><div style="background: #4f46e5; border-radius: 1px; width: 16px; height: 4px; margin: 0 auto 1px;"></div><div style="background: #9ca3af; border-radius: 1px; width: 12px; height: 3px; margin: 0 auto;"></div>'
  },
  {
    id: 'image-bottom',
    name: t('coverLayouts.imageBottom'),
    description: t('coverLayouts.imageBottomDesc'),
    icon: '<div style="background: #4f46e5; border-radius: 1px; width: 16px; height: 4px; margin: 0 auto 1px;"></div><div style="background: #9ca3af; border-radius: 1px; width: 12px; height: 3px; margin: 0 auto 1px;"></div><div style="background: #94a3b8; border-radius: 2px; width: 20px; height: 8px; margin: 0 auto;"></div>'
  },
  {
    id: 'magazine',
    name: t('coverLayouts.magazine'),
    description: t('coverLayouts.magazineDesc'),
    icon: '<div style="background: #4f46e5; border-radius: 2px; width: 16px; height: 6px; margin: 2px auto 1px;"></div><div style="background: #9ca3af; border-radius: 1px; width: 10px; height: 4px; margin: 1px 0;"></div>'
  },
  {
    id: 'three-section',
    name: t('coverLayouts.threeSection'),
    description: t('coverLayouts.threeSectionDesc'),
    icon: '<div style="background: #4f46e5; border-radius: 1px; width: 16px; height: 3px; margin: 1px auto;"></div><div style="background: #94a3b8; border-radius: 2px; width: 20px; height: 8px; margin: 1px auto;"></div><div style="background: #9ca3af; border-radius: 1px; width: 12px; height: 3px; margin: 1px auto;"></div>'
  }
])

watch(() => [props.html, props.cardTheme, props.scale], async () => {
  await nextTick()
  await generate()
}, { immediate: false })

onMounted(async () => {
  // 恢复保存的封面布局和数据
  restoreCoverLayout()
  restoreCoverData()
  restoreCurrentTab()

  // 如果挂载时已经有 HTML 内容，立即生成卡片
  if (props.html && props.html.trim()) {
    await generate()
  }
})

function extractCoverData(root) {
  // 标题：优先使用第一个 H1/H2/H3
  const h = root.querySelector('h1, h2, h3')
  const title = h ? h.textContent.trim() : t('cardsPreview.title')

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

  // 只有当当前封面数据为空时才更新，保持用户编辑的内容
  if (!cover.value.title && !cover.value.summary) {
    cover.value = {
      title,
      summary,
      wordCount,
      minutes,
      coverImage,
      originalSummary: summary, // 保存完整摘要
      imageFit: cover.value.imageFit || 'cover',
      imagePosition: cover.value.imagePosition || 'center center',
    }
  } else {
    // 只更新字数、阅读时间和封面图
    cover.value.wordCount = wordCount
    cover.value.minutes = minutes
    if (!cover.value.coverImage) {
      cover.value.coverImage = coverImage
    }
  }
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


  // 测试测量逻辑是否正确工作
  const testProbe = createScaledProbe()
  testProbe.innerHTML = '<p>This is a test paragraph to verify measurement works correctly.</p>'
  temp.innerHTML = ''
  temp.appendChild(testProbe)
  await new Promise(resolve => setTimeout(resolve, 10))
  const testHeight = testProbe.scrollHeight

  const generated = []
  let acc = []
  
  for (let i = 0; i < blocks.length; i++) {
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

    })
  }, 200)


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

  // 确保封面卡片始终在第一位
  const finalCards = [{ type: 'cover' }, ...generated]
  cards.value = finalCards
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
    
    const finalLeft = Math.max(0, Math.min(scrollLeft, maxScrollLeft))
    stripRef.value.scrollTo({ left: finalLeft, behavior: 'smooth' })
    // 兜底：直接设置 scrollLeft，避免影响其他容器
    setTimeout(() => {
      const actual = stripRef.value?.scrollLeft ?? 0
      if (Math.abs(actual - finalLeft) > 10 && stripRef.value) {
        stripRef.value.scrollLeft = finalLeft
      }
    }, 180)
    
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
    
    cards.value.forEach((_, index) => {
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
  // 总是导出所有卡片（包括封面），不管在哪个tab
  await exportAllCards()
}



async function exportAllCards() {
  // 保存当前tab状态
  const originalTab = currentTab.value

  try {
    // 强制切换到卡片模式来生成和导出所有卡片
    currentTab.value = 'cards'
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 500)) // 等待DOM更新和样式应用

    const result = await doExportAllCards()
    return result
  } finally {
    // 无论成功还是失败，都恢复原来的tab
    currentTab.value = originalTab
    await nextTick()
  }
}

async function doExportAllCards() {
  if (!stripRef.value) return

  exporting.value = true
  await nextTick()

  // 只导出卡片列表中的所有卡片（包括封面卡片）
  const nodes = Array.from(stripRef.value.querySelectorAll('.card'))

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const isCover = node.querySelector('.cover') || node.classList.contains('cover')

    let suffix
    if (isCover) {
      suffix = '00-封面'
    } else {
      // 内容卡片编号，需要考虑封面卡片的存在
      const coverExists = nodes.some(n => n.querySelector('.cover') || n.classList.contains('cover'))
      const contentIndex = coverExists ? i : i + 1 // 如果有封面，内容卡片从当前索引开始；否则从索引+1开始
      suffix = String(contentIndex).padStart(2, '0')
    }

    await exportSingleCard(node, suffix, isCover)
  }

  alert(t('messages.exportSuccess'))
  exporting.value = false
}

async function exportSingleCard(node, suffix, isCover = false) {
  const cs = window.getComputedStyle(node)
  const bg = cs.backgroundColor || '#ffffff'

  try {
    const dataUrl = await htmlToImage.toPng(node, {
      pixelRatio: 2,
      backgroundColor: bg
    })

    if (!dataUrl || dataUrl.length < 100) {
      return
    }

    // 使用标题名称作为文件名前缀
    const title = cover.value.title || t('cardsPreview.title')
    const sanitizedTitle = title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 50)

    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${sanitizedTitle}-${suffix}.png`
    a.click()

    // 添加小延迟避免浏览器阻止多个下载
    await new Promise(resolve => setTimeout(resolve, 200))
  } catch (e) {
    // 静默处理错误
  }
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

        // 检查是否滚动成功，如未成功则直接设置 scrollLeft 兜底
        setTimeout(() => {
          const actualScrollLeft = stripRef.value?.scrollLeft || 0
          if (stripRef.value && Math.abs(actualScrollLeft - finalScrollLeft) > 10) {
            stripRef.value.scrollLeft = finalScrollLeft
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

// 子页签切换时，动态注册/注销滚动监听，并进入卡片页时对齐位置
watch(currentTab, async (tab) => {
  await nextTick()
  if (tab === 'cards') {
    if (stripRef.value) {
      stripRef.value.removeEventListener('scroll', handleScroll)
      stripRef.value.addEventListener('scroll', handleScroll)
    }
    // 进入卡片页后滚动到当前索引
    const idx = Math.min(currentCardIndex.value, Math.max(0, cards.value.length - 1))
    scrollToCard(idx)
  } else {
    if (stripRef.value) {
      stripRef.value.removeEventListener('scroll', handleScroll)
    }
  }
})

// 封面布局相关函数
function changeCoverLayout(layoutId) {
  currentCoverLayout.value = layoutId
  persistCoverLayout()
  persistCoverData()
}

function loadCoverLayout() {
  try {
    const saved = localStorage.getItem(COVER_LAYOUT_KEY)
    return saved || 'center'
  } catch {
    return 'center'
  }
}

function persistCoverLayout() {
  try {
    localStorage.setItem(COVER_LAYOUT_KEY, currentCoverLayout.value)
  } catch {
    // localStorage 不可用时忽略错误
  }
}

function restoreCoverLayout() {
  currentCoverLayout.value = loadCoverLayout()
}

// Tab切换相关函数
function setCurrentTab(tab) {
  currentTab.value = tab
  persistCurrentTab()
}

function loadCurrentTab() {
  try {
    const saved = localStorage.getItem(CURRENT_TAB_KEY)
    return saved || 'cover'
  } catch {
    return 'cover'
  }
}

function persistCurrentTab() {
  try {
    localStorage.setItem(CURRENT_TAB_KEY, currentTab.value)
  } catch {
    // localStorage 不可用时忽略错误
  }
}

function restoreCurrentTab() {
  currentTab.value = loadCurrentTab()
}

// 图片上传函数
function handleImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    alert(t('messages.invalidImageFormat'))
    return
  }

  // 检查文件大小（限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert(t('messages.imageSizeExceeded'))
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    cover.value.coverImage = e.target?.result
    persistCoverData()
  }
  reader.readAsDataURL(file)

  // 清空输入框，允许重复上传同一文件
  event.target.value = ''
}

function persistCoverData() {
  try {
    const coverData = {
      title: cover.value.title,
      summary: cover.value.summary,
      originalSummary: cover.value.originalSummary,
      coverImage: cover.value.coverImage,
      layout: currentCoverLayout.value,
      imageFit: cover.value.imageFit,
      imagePosition: cover.value.imagePosition,
    }
    localStorage.setItem('uni.coverData', JSON.stringify(coverData))
  } catch {
    // localStorage 不可用时忽略错误
  }
}

// 监听封面数据变化
watch([() => cover.value.title, () => cover.value.summary], () => {
  persistCoverData()
}, { deep: true })

function restoreCoverData() {
  try {
    const saved = localStorage.getItem('uni.coverData')
    if (saved) {
      const coverData = JSON.parse(saved)
      if (coverData.title) cover.value.title = coverData.title
      if (coverData.summary) cover.value.summary = coverData.summary
      if (coverData.originalSummary) cover.value.originalSummary = coverData.originalSummary
      if (coverData.coverImage) cover.value.coverImage = coverData.coverImage
      if (coverData.layout) currentCoverLayout.value = coverData.layout
      if (coverData.imageFit) cover.value.imageFit = coverData.imageFit
      if (coverData.imagePosition) cover.value.imagePosition = coverData.imagePosition
    }
  } catch {
    // localStorage 不可用时忽略错误
  }
}

defineExpose({ exportAll })
</script>
