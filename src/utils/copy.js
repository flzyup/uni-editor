// Build HTML suitable for WeChat posting: include minimal inline style for current theme

const themeCssMap = {
  classic: `
    .article{font-family:Inter,'PingFang SC','Hiragino Sans GB',sans-serif;line-height:1.8;color:#2b2b2b;max-width:none;margin:0;padding:20px}
    .article h1,.article h2,.article h3,.article h4{font-weight:700;color:#111;margin:1.2em 0 0.6em 0}
    .article h1{font-size:24px;border-bottom:2px solid #7c5cff;padding-bottom:8px}
    .article h2{font-size:20px;color:#7c5cff}
    .article h3{font-size:18px}
    .article p{margin:0.8em 0;text-align:justify}
    .article a{color:#7c5cff;text-decoration:none;border-bottom:1px solid #7c5cff}
    .article blockquote{border-left:4px solid #8fb3ff;background:#f4f8ff;padding:12px 16px;margin:16px 0;border-radius:4px;font-style:italic}
    .article pre{background:#0b0e14;color:#e6edf3;padding:12px;border-radius:8px;overflow:auto;margin:16px 0}
    .article code{background:#f4f4f6;color:#e85e5e;padding:2px 6px;border-radius:4px;font-family:'Fira Code',monospace}
    .article ul,.article ol{padding-left:24px;margin:12px 0}
    .article li{margin:4px 0}
    .article img{max-width:100%;border-radius:8px;margin:16px 0}
    .article table{border-collapse:collapse;width:100%;margin:16px 0}
    .article th,.article td{border:1px solid #ddd;padding:8px 12px;text-align:left}
    .article th{background:#f8f9fa;font-weight:600}
  `,
  minimal: `
    .article{font-family:Inter,'PingFang SC',sans-serif;line-height:1.75;color:#222;max-width:none;margin:0;padding:20px}
    .article h1,.article h2,.article h3,.article h4{font-weight:600;color:#111;margin:1.4em 0 0.6em 0}
    .article h1{font-size:24px;color:#3cc8a6}
    .article h2{font-size:20px;color:#3cc8a6}
    .article p{margin:0.8em 0;text-align:justify}
    .article a{color:#3cc8a6;text-decoration:none}
    .article blockquote{border-left:4px solid #66e0c8;background:#eefbf7;padding:12px 16px;margin:16px 0;border-radius:4px}
    .article pre{background:#f8f9fa;color:#333;padding:12px;border-radius:8px;border:1px solid #e9ecef;margin:16px 0}
    .article code{background:#f1f3f4;color:#d73a49;padding:2px 6px;border-radius:4px}
    .article ul,.article ol{padding-left:24px;margin:12px 0}
    .article img{max-width:100%;border-radius:8px;margin:16px 0}
  `,
  night: `
    .article{font-family:Inter,'PingFang SC',sans-serif;line-height:1.8;color:#2c3e50;max-width:none;margin:0;padding:20px}
    .article h1,.article h2,.article h3,.article h4{font-weight:700;margin:1.2em 0 0.6em 0}
    .article h1{font-size:24px;color:#1e3a8a;border-bottom:2px solid #60a5fa;padding-bottom:8px}
    .article h2{font-size:20px;color:#1e40af}
    .article p{margin:0.8em 0;text-align:justify}
    .article a{color:#2563eb;text-decoration:none;border-bottom:1px solid #93c5fd}
    .article blockquote{border-left:4px solid #93c5fd;background:#eff6ff;padding:12px 16px;margin:16px 0;border-radius:4px}
    .article pre{background:#1e293b;color:#f1f5f9;padding:12px;border-radius:8px;margin:16px 0}
    .article code{background:#e0f2fe;color:#0c4a6e;padding:2px 6px;border-radius:4px}
    .article ul,.article ol{padding-left:24px;margin:12px 0}
    .article img{max-width:100%;border-radius:8px;margin:16px 0}
  `,
  coffee: `
    .article{font-family:'Noto Serif SC','Times New Roman',serif;line-height:1.85;color:#2b2119;max-width:none;margin:0;padding:20px}
    .article h1,.article h2,.article h3,.article h4{font-weight:700;color:#8b4513;margin:1.2em 0 0.6em 0}
    .article h1{font-size:26px;border-bottom:2px solid #d4a373;padding-bottom:8px}
    .article h2{font-size:22px;color:#a0522d}
    .article p{margin:1em 0;text-align:justify;text-indent:2em}
    .article a{color:#b36b3e;text-decoration:none;border-bottom:1px solid #d4a373}
    .article blockquote{border-left:4px solid #e9c46a;background:#fefcf0;padding:12px 16px;margin:16px 0;border-radius:4px;font-style:italic}
    .article pre{background:#3c2415;color:#f5deb3;padding:12px;border-radius:8px;margin:16px 0}
    .article code{background:#fff8dc;color:#8b4513;padding:2px 6px;border-radius:4px}
    .article ul,.article ol{padding-left:24px;margin:12px 0}
    .article img{max-width:100%;border-radius:8px;margin:16px 0;box-shadow:0 4px 8px rgba(139,69,19,0.2)}
  `,
  paper: `
    .article{font-family:'Noto Serif SC','Georgia',serif;line-height:1.9;color:#1f2937;max-width:none;margin:0;padding:24px;background:#fefefe}
    .article h1,.article h2,.article h3,.article h4{font-weight:700;color:#374151;margin:1.4em 0 0.6em 0}
    .article h1{font-size:28px;color:#0f766e;text-align:center;margin-bottom:1em}
    .article h2{font-size:22px;color:#0f766e;border-bottom:1px solid #e5e7eb;padding-bottom:4px}
    .article p{margin:1em 0;text-align:justify;text-indent:2em}
    .article a{color:#0ea5a4;text-decoration:none}
    .article blockquote{border-left:4px solid #0ea5a4;background:#f0fdfa;padding:16px 20px;margin:20px 0;border-radius:4px;font-style:italic}
    .article pre{background:#f9fafb;color:#374151;padding:12px;border-radius:8px;border:1px solid #d1d5db;margin:16px 0}
    .article code{background:#f3f4f6;color:#7c2d12;padding:2px 6px;border-radius:4px}
    .article ul,.article ol{padding-left:28px;margin:16px 0}
    .article img{max-width:100%;border-radius:8px;margin:20px 0;border:1px solid #e5e7eb}
  `,
  pop: `
    .article{font-family:Inter,'PingFang SC',sans-serif;line-height:1.75;color:#1a0b2e;max-width:none;margin:0;padding:20px;background:linear-gradient(135deg,#fef7ff 0%,#faf5ff 100%)}
    .article h1,.article h2,.article h3,.article h4{font-weight:700;margin:1.2em 0 0.6em 0}
    .article h1{font-size:26px;color:#a21caf;text-shadow:0 2px 4px rgba(162,28,175,0.3)}
    .article h2{font-size:22px;color:#c026d3}
    .article p{margin:0.8em 0;text-align:justify}
    .article a{color:#ff6ad5;text-decoration:none;font-weight:500;border-bottom:2px solid #ff6ad5}
    .article blockquote{border-left:4px solid #ffd166;background:linear-gradient(135deg,#fff9e0 0%,#fef3c7 100%);padding:12px 16px;margin:16px 0;border-radius:8px;box-shadow:0 2px 8px rgba(255,209,102,0.3)}
    .article pre{background:#2d1b69;color:#e879f9;padding:12px;border-radius:8px;margin:16px 0;box-shadow:0 4px 12px rgba(45,27,105,0.4)}
    .article code{background:#fce7f3;color:#be185d;padding:2px 6px;border-radius:4px;font-weight:500}
    .article ul,.article ol{padding-left:24px;margin:12px 0}
    .article img{max-width:100%;border-radius:12px;margin:16px 0;box-shadow:0 8px 24px rgba(162,28,175,0.2)}
  `,
}

export function buildWechatHtml(innerHtml, theme='classic'){
  const style = themeCssMap[theme] || themeCssMap.classic
  // wrap into a single container to keep styles coherent on paste
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${style}</style></head><body><div class="article">${innerHtml}</div></body></html>`
  return html
}

