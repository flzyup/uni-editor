// Utilities to parse article HTML, compute reading metrics, and pack into 4:3 cards

export function textMetrics(text) {
  const plain = (text || '').replace(/\s+/g, '')
  const zhCount = (plain.match(/[\u4e00-\u9fa5]/g) || []).length
  const nonZh = plain.length - zhCount
  const words = nonZh > 0 ? Math.ceil(nonZh / 5) : 0
  const total = zhCount + words
  const minutes = Math.max(1, Math.ceil(total / 350))
  return { words: total, minutes }
}

export function firstHeadingAndSummary(doc){
  const h = doc.querySelector('h1, h2, h3')
  const title = h?.textContent?.trim() || '无标题'
  let summary = ''
  const ps = Array.from(doc.querySelectorAll('p')).map(p=>p.textContent?.trim()).filter(Boolean)
  if (ps.length) {
    summary = ps[0]
    if (summary.length > 80) summary = summary.slice(0,78) + '…'
  }
  return { title, summary }
}

export function blocksFromHtml(html){
  const doc = new DOMParser().parseFromString(html || '', 'text/html')
  // Flatten to block-level segments
  const allowed = ['P','H2','H3','H4','H5','H6','UL','OL','PRE','BLOCKQUOTE','IMG','TABLE']
  const result = []
  function pushEl(el){
    const tag = el.tagName
    const outer = el.outerHTML
    let char = 0
    if (tag === 'IMG' || tag === 'TABLE' || tag === 'PRE') char = 160
    else char = (el.textContent || '').trim().length
    result.push({ type: tag.toLowerCase(), char, html: outer })
  }
  const bodyChildren = Array.from(doc.body.querySelectorAll(allowed.join(',')))
  bodyChildren.forEach(pushEl)
  return result
}

export function packBlocksToCards(blocks) {
  const cards = []
  let current = []
  let chars = 0
  const limit = 420 // approx chars per 4:3 card
  for (const b of blocks) {
    if (chars > 0 && chars + b.char > limit) {
      cards.push({ type: 'content', html: current.map(x=>x.html).join('\n') })
      current = []
      chars = 0
    }
    current.push(b)
    chars += b.char
  }
  if (current.length) cards.push({ type: 'content', html: current.map(x=>x.html).join('\n') })
  return cards
}

export function buildCoverCard(html, explicitTitle){
  const doc = new DOMParser().parseFromString(html || '', 'text/html')
  const { title, summary } = firstHeadingAndSummary(doc)
  const t = explicitTitle?.trim() || title
  const { words, minutes } = textMetrics(doc.body.textContent || '')
  return { type: 'cover', title: t, summary, wordCount: words, minutes }
}

