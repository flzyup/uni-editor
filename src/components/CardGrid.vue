<template>
  <div class="cards-grid" :class="{ exporting: exporting }" ref="gridRef">
    <div v-for="(c, idx) in cards" :key="idx" class="card card-theme" :class="cardTheme">
      <div v-if="c.type==='cover'" class="inner cover">
        <div>
          <div class="badge">封面</div>
          <div class="title">{{ cover.title }}</div>
          <div class="summary">{{ cover.summary }}</div>
        </div>
        <div class="meta">
          <span>全文 {{ cover.wordCount }} 字</span>
          <span>阅读约 {{ cover.minutes }} 分钟</span>
        </div>
      </div>
      <div v-else class="inner">
        <div class="content-html" v-html="c.html"></div>
      </div>
    </div>
    <!-- hidden measurer to compute width -->
    <div ref="measureRef" style="visibility:hidden; position:absolute; inset:-9999px; width:320px; height:0"></div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import * as htmlToImage from 'html-to-image'

const props = defineProps({
  html: { type: String, default: '' },
  cardTheme: { type: String, default: 'card-theme-slate' },
})

const gridRef = ref(null)
const measureRef = ref(null)
const cards = ref([])
const exporting = ref(false)

const cover = ref({ title: '标题', summary: '摘要', wordCount: 0, minutes: 1 })

watch(() => [props.html, props.cardTheme], async () => {
  await nextTick()
  generate()
})

onMounted(() => { generate() })

function extractCoverData(root) {
  const h = root.querySelector('h1, h2, h3')
  const title = h ? h.textContent.trim() : '无标题'
  const p = root.querySelector('p')
  const summary = p ? p.textContent.trim().slice(0, 80) : ''
  const text = root.textContent || ''
  const wordCount = [...text].filter(ch => /\S/.test(ch)).length
  const minutes = Math.max(1, Math.ceil(wordCount / 400))
  cover.value = { title, summary, wordCount, minutes }
}

function generate() {
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
        blocks.push(el.outerHTML)
      }
    } else if (node.nodeType === 3) {
      const text = node.textContent.trim()
      if (text) blocks.push(`<p>${text}</p>`)
    }
  })

  const width = measureCardWidth()
  const maxHeight = Math.floor(width * 0.75) - 28 // inner padding

  // Use offscreen measurer
  const temp = document.createElement('div')
  temp.style.position = 'absolute'
  temp.style.visibility = 'hidden'
  temp.style.width = width + 'px'
  temp.style.padding = '14px'
  temp.className = `card-theme ${props.cardTheme}`
  document.body.appendChild(temp)

  const generated = [{ type: 'cover' }]
  let acc = []
  for (const html of blocks) {
    const probe = document.createElement('div')
    probe.className = 'content-html'
    probe.innerHTML = acc.join('') + html
    temp.innerHTML = ''
    temp.appendChild(probe)
    if (probe.scrollHeight > maxHeight) {
      if (acc.length) generated.push({ type: 'content', html: acc.join('') })
      acc = [html]
    } else {
      acc.push(html)
    }
  }
  if (acc.length) generated.push({ type: 'content', html: acc.join('') })

  cards.value = generated
  document.body.removeChild(temp)
}

function measureCardWidth() {
  // try to measure first card width; fallback to 320
  const grid = gridRef.value
  if (!grid) return 320
  const first = grid.querySelector('.card')
  if (first) return Math.floor(first.getBoundingClientRect().width)
  const rect = grid.getBoundingClientRect()
  const cols = Math.max(1, Math.floor(rect.width / 300))
  return Math.floor((rect.width - (cols-1)*12) / cols)
}

async function exportAll() {
  if (!gridRef.value) return
  exporting.value = true
  await nextTick()
  const nodes = Array.from(gridRef.value.querySelectorAll('.card'))
  let i = 1
  for (const node of nodes) {
    const cs = window.getComputedStyle(node)
    const bg = cs.backgroundColor || '#ffffff'
    try {
      const dataUrl = await htmlToImage.toPng(node, { pixelRatio: 2, backgroundColor: bg })
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

defineExpose({ exportAll })
</script>

<style scoped>
</style>

