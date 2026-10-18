// Markdown for the dev log, both directions, zero dependencies.
//
// New posts are written as blog/<id>.md with a front matter block and a
// Markdown body. build-blog-pages.mjs renders them into the HTML pages.
// Older posts were written in HTML, and dated posts are never rewritten, so
// their HTML stays the record and the build derives a Markdown copy of each
// one. Either way every post is published as /blog/<id>.md, which is the copy
// an agent should read.
//
// The renderer covers what the posts use: paragraphs, ### headings, bold,
// italics, inline code, links, images, bullet and numbered lists, fenced code,
// block quotes, and raw HTML lines passed through untouched.

export function parseFrontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) throw new Error('markdown post without a front matter block')
  const meta = {}
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue
    const kv = line.match(/^([a-z_]+):\s*(.*)$/)
    if (!kv) throw new Error(`bad front matter line: ${line}`)
    let v = kv[2].trim()
    if (v.startsWith('"') && v.endsWith('"')) v = JSON.parse(v)
    meta[kv[1]] = v
  }
  return { meta, body: m[2].replace(/^\n+/, '').replace(/\s+$/, '') + '\n' }
}

const q = (s) => JSON.stringify(String(s))

export function frontMatter(meta) {
  const order = ['id', 'title', 'date', 'kind', 'source', 'image', 'image_alt', 'author', 'canonical']
  const lines = ['---']
  for (const k of order) if (meta[k] !== undefined && meta[k] !== '') lines.push(`${k}: ${q(meta[k])}`)
  lines.push('---')
  return lines.join('\n')
}

const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escAttr = (s) => escHtml(s).replace(/"/g, '&quot;')

// Inline Markdown to HTML. Code spans are cut out first so nothing inside them
// is touched, then links, images, bold and italics.
export function inline(src) {
  const codes = []
  let s = src.replace(/`([^`]+)`/g, (_m, c) => {
    codes.push(`<code>${escHtml(c)}</code>`)
    return `\u0000${codes.length - 1}\u0000`
  })
  // Escape bare ampersands and angle brackets, but leave HTML tags and entities a writer typed on purpose.
  s = s.replace(/&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;')
  s = s.replace(/<(?![a-zA-Z/!])/g, '&lt;')
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) => `<img src="${escAttr(url)}" alt="${escAttr(alt)}" loading="lazy">`)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => `<a href="${escAttr(url)}">${text}</a>`)
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
  return s.replace(/\u0000(\d+)\u0000/g, (_m, i) => codes[Number(i)])
}

export function mdToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out = []
  let i = 0
  const para = []
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`)
    para.length = 0
  }
  while (i < lines.length) {
    const line = lines[i]
    if (/^```/.test(line)) {
      flush()
      const buf = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++])
      i++
      out.push(`<pre><code>${escHtml(buf.join('\n'))}</code></pre>`)
      continue
    }
    if (!line.trim()) { flush(); i++; continue }
    const h = line.match(/^(#{3,4})\s+(.*)$/)
    if (h) { flush(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue }
    if (/^>\s?/.test(line)) {
      flush()
      const buf = []
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''))
      out.push(`<blockquote>${mdToHtml(buf.join('\n')).trim()}</blockquote>`)
      continue
    }
    const li = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/)
    if (li) {
      flush()
      const tag = /\d/.test(li[2]) ? 'ol' : 'ul'
      const items = []
      while (i < lines.length) {
        const m = lines[i].match(/^\s*([-*]|\d+\.)\s+(.*)$/)
        if (m) { items.push(m[2]); i++; continue }
        if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) { items[items.length - 1] += ' ' + lines[i].trim(); i++; continue }
        break
      }
      out.push(`<${tag}>\n${items.map((t) => `<li>${inline(t)}</li>`).join('\n')}\n</${tag}>`)
      continue
    }
    if (/^<[a-zA-Z!/]/.test(line.trim()) && !para.length) {
      // A raw HTML block runs to the next blank line and is passed through as written.
      const buf = []
      while (i < lines.length && lines[i].trim()) buf.push(lines[i++])
      out.push(buf.join('\n'))
      continue
    }
    para.push(line.trim())
    i++
  }
  flush()
  return out.join('\n\n')
}

// One rendered article, in the same shape as the hand-written ones.
export function articleHtml(meta, body) {
  // class stays exactly "post": the page builder finds posts by that opening.
  const parts = [
    `<article class="post" id="${escAttr(meta.id)}" data-kind="${escAttr(meta.kind || 'story')}" data-source="md">`,
    `<h2>${inline(meta.title)}</h2>`,
    `<p class="post-date">${escHtml(meta.date)}</p>`,
  ]
  if (meta.image) {
    parts.push('')
    parts.push(
      `<img src="${escAttr(meta.image)}" alt="${escAttr(meta.image_alt || '')}" width="1280" height="720" loading="lazy" style="display:block;width:100%;height:auto;border-radius:8px;margin:12px 0 18px">`
    )
  }
  parts.push('')
  parts.push(mdToHtml(body))
  parts.push('</article>')
  return parts.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML to Markdown, for posts that were written in HTML
// ─────────────────────────────────────────────────────────────────────────────

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
}

function inlineToMd(html) {
  let s = html
  s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/g, (_m, c) => '`' + decodeEntities(c.replace(/<[^>]+>/g, '')) + '`')
  s = s.replace(/<img\b[^>]*>/g, (tag) => {
    const src = (tag.match(/\ssrc="([^"]*)"/) || [])[1] || ''
    const alt = (tag.match(/\salt="([^"]*)"/) || [])[1] || ''
    return `![${alt}](${src})`
  })
  s = s.replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (_m, href, text) => `[${text.trim()}](${href})`)
  s = s.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/g, (_m, _t, t) => `**${t.trim()}**`)
  s = s.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/g, (_m, _t, t) => `*${t.trim()}*`)
  s = s.replace(/<br\s*\/?>/g, '\n')
  s = s.replace(/<[^>]+>/g, '')
  return decodeEntities(s).replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim()
}

export function htmlPostToMd(postHtml, meta) {
  let body = postHtml
    .replace(/^<!--[\s\S]*?-->\n/, '')
    .replace(/^<article[^>]*>\n?/, '')
    .replace(/\n?<\/article>\s*$/, '')
    .replace(/<h2[^>]*>[\s\S]*?<\/h2>/, '')
    .replace(/<(p|time)[^>]*class="post-date"[^>]*>[\s\S]*?<\/\1>/, '')
  const blocks = []
  // Walk top-level blocks in order. Self-closing img has no closing tag.
  const tokens = body.split(/(?=<(?:p|h3|h4|pre|ul|ol|blockquote|img)\b)/)
  for (const t of tokens) {
    const tag = (t.match(/^<([a-z0-9]+)/) || [])[1]
    if (!tag) {
      const text = inlineToMd(t)
      if (text) blocks.push(text)
      continue
    }
    if (tag === 'img') {
      blocks.push(inlineToMd(t.match(/^<img[^>]*>/)[0]))
      const rest = inlineToMd(t.replace(/^<img[^>]*>/, ''))
      if (rest) blocks.push(rest)
      continue
    }
    const inner = (t.match(new RegExp(`^<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)) || [])[1]
    if (inner === undefined) {
      const text = inlineToMd(t)
      if (text) blocks.push(text)
      continue
    }
    if (tag === 'h3' || tag === 'h4') blocks.push(`${tag === 'h3' ? '###' : '####'} ${inlineToMd(inner)}`)
    else if (tag === 'pre') blocks.push('```\n' + decodeEntities(inner.replace(/<[^>]+>/g, '')).replace(/\n+$/, '') + '\n```')
    else if (tag === 'ul' || tag === 'ol') {
      let n = 0
      const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => `${tag === 'ol' ? `${++n}.` : '-'} ${inlineToMd(m[1]).replace(/\n/g, ' ')}`)
      blocks.push(items.join('\n'))
    } else if (tag === 'blockquote') blocks.push(inlineToMd(inner).split('\n').map((l) => `> ${l}`).join('\n'))
    else {
      const text = inlineToMd(inner)
      if (text) blocks.push(text)
    }
  }
  const fm = frontMatter({ ...meta, source: 'html', author: 'Tymofii Pidlisnyi' })
  return `${fm}\n\n# ${meta.title}\n\n${blocks.join('\n\n')}\n`.replace(/\n{3,}/g, '\n\n')
}
