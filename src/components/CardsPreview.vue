<template>
  <div class="cards-pane">
    <div class="cards-toolbar">
      <label>卡片主题</label>
      <select v-model="cardTheme">
        <option v-for="t in cardThemes" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
      <button @click="rebuild">重新生成</button>
      <div class="spacer" />
      <button class="primary" @click="saveAll">保存卡片</button>
    </div>

    <div class="cards-grid">
      <div v-for="(card, idx) in cards" :key="idx" class="card card-theme" :class="cardTheme" ref="setCardRef">
        <div class="card-inner">
          <template v-if="idx === 0 && card.type === 'cover'">
            <div class="chip">Uni Editor</div>
            <div class="cover-title">{{ card.title }}</div>
            <div class="cover-sub">{{ card.summary }}</div>
            <div class="cover-meta">
              <div>全文 {{ card.wordCount }} 字</div>
              <div>阅读需 {{ card.minutes }} 分钟</div>
            </div>
          </template>
          <template v-else>
            <div class="card-content" v-html="card.html"></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { blocksFromHtml, packBlocksToCards, buildCoverCard } from '../utils/article.js'
import { toPng } from 'html-to-image'

const props = defineProps({
  contentHtml: { type: String, default: '' },
  markdown: { type: String, default: '' },
  title: { type: String, default: '' },
  editorTheme: { type: String, default: 'classic' },
})

const cardThemes = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'forest', label: 'Forest' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'grape', label: 'Grape' },
  { value: 'slate', label: 'Slate' },
  { value: 'sand', label: 'Sand' },
  { value: 'paper', label: 'Paper（浅色）' },
]
const cardTheme = ref('minimal')

const cards = ref([])
const cardEls = ref([])
function setCardRef(el) {
  if (el) cardEls.value.push(el)
}

function rebuild(){
  const blocks = blocksFromHtml(props.contentHtml)
  const bodyCards = packBlocksToCards(blocks)
  const cover = buildCoverCard(props.contentHtml, props.title)
  cards.value = [cover, ...bodyCards]
  // reset refs
  cardEls.value = []
}

watch(() => props.contentHtml, () => rebuild())
onMounted(() => rebuild())

async function saveAll(){
  // Ensure rebuild has happened
  if (!cards.value.length) rebuild()
  // Render each card to a PNG at 2x/3x pixel ratio
  let i = 1
  for (const el of cardEls.value) {
    try {
      const dataUrl = await toPng(el, { pixelRatio: 3, cacheBust: true })
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `card_${i}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      i++
    } catch (e) {
      console.error('导出失败', e)
      alert('部分卡片导出失败，请重试')
    }
  }
}
</script>

<style scoped>
.cards-pane { display:flex; flex-direction:column; min-height:0; }
</style>
