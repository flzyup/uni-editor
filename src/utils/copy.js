// Build HTML suitable for WeChat posting: include minimal inline style for current theme

const themeCssMap = {
  classic: `body{color:#111;}.article{font-family:Inter,'PingFang SC','Hiragino Sans GB',sans-serif;line-height:1.9;color:#2b2b2b}.article h1,.article h2,.article h3{font-weight:700}.article blockquote{border-left:4px solid #8fb3ff;background:#f4f8ff;padding:8px 12px}.article pre{background:#0b0e14;color:#e6edf3;padding:12px;border-radius:8px}.article code{background:#f4f4f6;padding:2px 6px;border-radius:4px}.article table{border-collapse:collapse;width:100%}.article th,.article td{border:1px solid #ddd;padding:6px 8px}`,
  minimal: `.article{font-family:Inter,'PingFang SC',sans-serif;line-height:1.9;color:#222}.article a{color:#3cc8a6;text-decoration:none}.article blockquote{border-left:4px solid #66e0c8;background:#eefbf7;padding:8px 12px}`,
  night: `.article{font-family:Inter,'PingFang SC',sans-serif;line-height:1.9;color:#111}.article h1,.article h2{color:#0b1a33}.article blockquote{border-left:4px solid #93c5fd;background:#eaf3ff}`,
  coffee: `.article{font-family:'Noto Serif SC',serif;line-height:1.95;color:#2b2119}.article a{color:#b36b3e}.article blockquote{border-left:4px solid #e9c46a;background:#fff9e6}`,
  paper: `.article{font-family:'Noto Serif SC',serif;line-height:1.95;color:#1f2937}.article h1,.article h2{font-weight:700}.article code{background:#efefe8;padding:2px 6px;border-radius:4px}`,
  pop: `.article{font-family:Inter,'PingFang SC',sans-serif;line-height:1.9;color:#1f1d2b}.article a{color:#ff6ad5}.article blockquote{border-left:4px solid #ffd166;background:#fff6e0}`,
}

export function buildWechatHtml(innerHtml, theme='classic'){
  const style = themeCssMap[theme] || themeCssMap.classic
  // wrap into a single container to keep styles coherent on paste
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${style}</style></head><body><div class="article">${innerHtml}</div></body></html>`
  return html
}

