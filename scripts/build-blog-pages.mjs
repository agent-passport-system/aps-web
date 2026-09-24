#!/usr/bin/env node
// Split the dev log across numbered pages.
//
// blog.html is page 1 and stays the hand-edited file: a new post goes in
// immediately after the <main class="blog-feed"> line, newest first, the same
// way it always has. Running this script afterwards re-chunks every post
// across blog.html and blog-2.html .. blog-N.html, rewrites the pagers, and
// re-inlines the post index that blog-nav.js reads.
//
// The script is its own inverse in the sense that matters: it reads the posts
// back out of the files it wrote, so running it twice in a row is a no-op.
// Post order is document order, newest first, never re-sorted.
//
// Zero dependencies. Run via: node scripts/build-blog-pages.mjs

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const PAGE_SIZE = 20
const SITE = 'https://agent-passport.org'
const MAX_PAGE_FILES = 200 // stale-file sweep bound

const PAGER_TOP_START = '<!-- BUILD:BLOG_PAGER_TOP_START -->'
const PAGER_TOP_END = '<!-- BUILD:BLOG_PAGER_TOP_END -->'
const PAGER_BOT_START = '<!-- BUILD:BLOG_PAGER_BOTTOM_START -->'
const PAGER_BOT_END = '<!-- BUILD:BLOG_PAGER_BOTTOM_END -->'
const INDEX_START = '<!-- BUILD:BLOG_INDEX_START -->'
const INDEX_END = '<!-- BUILD:BLOG_INDEX_END -->'
const HEAD_START = '<!-- BUILD:BLOG_HEAD_START -->'
const HEAD_END = '<!-- BUILD:BLOG_HEAD_END -->'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pageFile = (n) => (n === 1 ? 'blog.html' : `blog-${n}.html`)
const pageUrl = (n) => `/${pageFile(n)}`

// ─────────────────────────────────────────────────────────────────────────────
// Reading posts back out of a page
// ─────────────────────────────────────────────────────────────────────────────
// Every entry is an <article class="post" ...> opened at the start of a line and
// closed by a bare </article> on its own line. That shape has held for all 191
// entries since the feed started. Anything else is a hand-edit this script must
// not silently swallow, so it throws instead.

function splitPosts(html) {
  const lines = html.split('\n')
  const posts = []
  let open = null
  let buf = []
  for (const line of lines) {
    if (line.startsWith('<article class="post"')) {
      if (open !== null) throw new Error(`nested <article class="post"> near: ${line.slice(0, 80)}`)
      open = line
      buf = [line]
      continue
    }
    if (open !== null) {
      buf.push(line)
      if (line === '</article>') {
        posts.push(buf.join('\n'))
        open = null
        buf = []
      }
    }
  }
  if (open !== null) throw new Error('unclosed <article class="post">')
  return posts
}

// The divider comment that precedes recent entries travels with its post.
function withDivider(html, postHtml) {
  const at = html.indexOf(postHtml)
  if (at < 0) return postHtml
  const before = html.slice(0, at)
  const m = before.match(/(<!-- [^\n]*DAY [^\n]*-->)\n$/)
  return m ? `${m[1]}\n${postHtml}` : postHtml
}

function postMeta(postHtml) {
  const id = (postHtml.match(/^<article class="post" id="([^"]+)"/) || [])[1]
  if (!id) throw new Error(`post without an id: ${postHtml.slice(0, 120)}`)
  let date = (postHtml.match(/class="post-date"[^>]*datetime="([^"]+)"/) || [])[1]
  if (!date) {
    const m = postHtml.match(/class="post-date"[^>]*>\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/)
    if (m) date = m[1]
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error(`post ${id} has no ISO date`)
  const h = postHtml.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)
  const title = h ? decode(h[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim() : id
  const day = (id.match(/^day-(\d+)/) || [])[1]
  return { id, date, title, day: day ? Number(day) : null }
}

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ─────────────────────────────────────────────────────────────────────────────
// Collect every post across every existing page, newest first
// ─────────────────────────────────────────────────────────────────────────────

function collect() {
  const all = []
  const seen = new Set()
  for (let n = 1; n <= MAX_PAGE_FILES; n++) {
    const p = join(root, pageFile(n))
    if (!existsSync(p)) {
      if (n === 1) throw new Error('blog.html is missing')
      break
    }
    const html = readFileSync(p, 'utf8')
    for (const post of splitPosts(html)) {
      const meta = postMeta(post)
      if (seen.has(meta.id)) throw new Error(`duplicate post id across pages: ${meta.id}`)
      seen.add(meta.id)
      all.push({ ...meta, html: withDivider(html, post) })
    }
  }
  return all
}

// ─────────────────────────────────────────────────────────────────────────────
// Page shell: everything blog.html has around its posts
// ─────────────────────────────────────────────────────────────────────────────

function shellOf(html) {
  const openAt = html.indexOf('\n<article class="post"')
  const closeAt = html.lastIndexOf('\n</article>')
  if (openAt < 0 || closeAt < 0) throw new Error('blog.html has no posts to take a shell from')
  let head = html.slice(0, openAt + 1)
  let tail = html.slice(closeAt + '\n</article>'.length)
  // Drop anything an earlier run inserted, so the shell is the hand-written part.
  head = stripBlock(head, PAGER_TOP_START, PAGER_TOP_END)
  head = stripBlock(head, INDEX_START, INDEX_END)
  head = stripBlock(head, HEAD_START, HEAD_END)
  // A divider comment belonging to the first post is part of that post, not the shell.
  head = head.replace(/<!-- [^\n]*DAY [^\n]*-->\n$/, '')
  tail = stripBlock(tail, PAGER_BOT_START, PAGER_BOT_END)
  // Normalise the seams so repeated runs do not accumulate blank lines.
  head = head.replace(/\n+$/, '')
  tail = tail.replace(/^\n+/, '\n\n')
  return { head, tail }
}

function stripBlock(s, start, end) {
  for (;;) {
    const a = s.indexOf(start)
    if (a < 0) return s
    const b = s.indexOf(end, a)
    if (b < 0) throw new Error(`unterminated ${start}`)
    let after = b + end.length
    if (s[after] === '\n') after += 1
    s = s.slice(0, a) + s.slice(after)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pager
// ─────────────────────────────────────────────────────────────────────────────
// Numbers are windowed so the control stays one line once the log passes
// twenty pages: first, last, and the current page with two on each side.

function pageWindow(current, total) {
  const keep = new Set([1, total])
  for (let n = current - 2; n <= current + 2; n++) if (n >= 1 && n <= total) keep.add(n)
  const sorted = [...keep].sort((a, b) => a - b)
  const out = []
  let prev = 0
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push(null)
    out.push(n)
    prev = n
  }
  return out
}

function rangeLabel(chunk) {
  const newest = chunk[0].date
  const oldest = chunk[chunk.length - 1].date
  return newest === oldest ? human(newest) : `${human(oldest)} to ${human(newest)}`
}

function human(iso) {
  const [y, m, d] = iso.split('-')
  return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`
}

function pager(current, chunks, totalPosts, place) {
  const total = chunks.length
  const bits = []
  bits.push(`<nav class="bp-pager bp-pager-${place}" aria-label="Dev log pages">`)
  bits.push(
    `<p class="bp-pager-count">Page ${current} of ${total} · ${totalPosts} entries · ${esc(rangeLabel(chunks[current - 1]))}</p>`
  )
  bits.push('<div class="bp-pager-row">')
  if (current > 1) {
    bits.push(
      `<a class="bp-pager-step" rel="prev" href="${pageUrl(current - 1)}" title="${esc(rangeLabel(chunks[current - 2]))}">← Newer</a>`
    )
  } else {
    bits.push('<span class="bp-pager-step is-off" aria-hidden="true">← Newer</span>')
  }
  bits.push('<ol class="bp-pager-pages">')
  for (const n of pageWindow(current, total)) {
    if (n === null) {
      bits.push('<li class="bp-pager-gap" aria-hidden="true">…</li>')
      continue
    }
    if (n === current) {
      bits.push(`<li><a class="bp-pager-n is-on" href="${pageUrl(n)}" aria-current="page">${n}</a></li>`)
    } else {
      bits.push(
        `<li><a class="bp-pager-n" href="${pageUrl(n)}" title="${esc(rangeLabel(chunks[n - 1]))}" aria-label="Page ${n}, ${esc(rangeLabel(chunks[n - 1]))}">${n}</a></li>`
      )
    }
  }
  bits.push('</ol>')
  if (current < total) {
    bits.push(
      `<a class="bp-pager-step" rel="next" href="${pageUrl(current + 1)}" title="${esc(rangeLabel(chunks[current]))}">Older →</a>`
    )
  } else {
    bits.push('<span class="bp-pager-step is-off" aria-hidden="true">Older →</span>')
  }
  bits.push('</div>')
  bits.push('</nav>')
  return bits.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// Inlined index
// ─────────────────────────────────────────────────────────────────────────────
// blog-nav.js needs every entry, not just this page's, to group the jump bar by
// month and to send a #day-N deep link to the page that actually holds it.
// Inlined rather than fetched so a deep link resolves on the first paint and
// with no second request.

function indexBlock(chunks) {
  const posts = []
  chunks.forEach((chunk, i) => {
    for (const p of chunk) posts.push({ i: p.id, p: i + 1, d: p.date, t: p.title })
  })
  const payload = { pageSize: PAGE_SIZE, pages: chunks.length, posts }
  return `<script type="application/json" id="bp-index">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-page head
// ─────────────────────────────────────────────────────────────────────────────

function headFor(head, current, chunks) {
  const total = chunks.length
  const range = rangeLabel(chunks[current - 1])
  const rel = []
  rel.push(HEAD_START)
  if (current > 1) rel.push(`<link rel="prev" href="${SITE}${pageUrl(current - 1)}">`)
  if (current < total) rel.push(`<link rel="next" href="${SITE}${pageUrl(current + 1)}">`)
  rel.push(HEAD_END)
  let out = head

  if (current > 1) {
    const suffix = ` Page ${current} of ${total}, ${range}.`
    out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>Blog page ${current} | APS</title>`)
    out = out.replace(
      /<link rel="canonical" href="[^"]*">/,
      `<link rel="canonical" href="${SITE}${pageUrl(current)}">`
    )
    out = out.replace(
      /<meta property="og:url" content="[^"]*">/,
      `<meta property="og:url" content="${SITE}${pageUrl(current)}">`
    )
    out = out.replace(
      /<meta property="og:title" content="[^"]*">/,
      `<meta property="og:title" content="Blog page ${current} | APS">`
    )
    out = out.replace(
      /(<meta name="description" content=")([^"]*)(">)/,
      (_m, a, b, c) => a + b + esc(suffix) + c
    )
    out = out.replace(
      /(<meta property="og:description" content=")([^"]*)(">)/,
      (_m, a, b, c) => a + b + esc(suffix) + c
    )
    // Page 1 keeps its hand-written blogPost descriptions. Every other page
    // gets a plain list of what is actually on it.
    out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ldFor(current, chunks))
  }

  return out.replace('</head>', `${rel.join('\n')}\n</head>`)
}

function ldFor(current, chunks) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `APS Dev Log, page ${current} of ${chunks.length}`,
    url: `${SITE}${pageUrl(current)}`,
    isPartOf: { '@type': 'Blog', name: 'APS Dev Log', url: `${SITE}/blog.html` },
    inLanguage: 'en',
    hasPart: chunks[current - 1].map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      datePublished: p.date,
      author: { '@type': 'Person', name: 'Tymofii Pidlisnyi' },
      url: `${SITE}${pageUrl(current)}#${p.id}`,
    })),
  }
  return `<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n</script>`
}

// ─────────────────────────────────────────────────────────────────────────────
// Sitemap
// ─────────────────────────────────────────────────────────────────────────────
// Every page is a real URL, so every page belongs in sitemap.xml, and the
// boundaries move as entries are added. Keeping the list here is the only way
// it stays right. lastmod is the newest entry on the page.

function writeSitemap(chunks) {
  const path = join(root, 'sitemap.xml')
  if (!existsSync(path)) return
  const xml = readFileSync(path, 'utf8')
  const line = (n, mod) =>
    `  <url><loc>${SITE}${pageUrl(n)}</loc><lastmod>${mod}</lastmod></url>`
  const block = chunks.map((chunk, i) => line(i + 1, chunk[0].date)).join('\n')

  const rows = xml.split('\n')
  const isBlogRow = (l) => /<loc>[^<]*\/blog(-\d+)?\.html<\/loc>/.test(l)
  const first = rows.findIndex(isBlogRow)
  if (first < 0) {
    console.log('sitemap.xml has no blog.html entry, left alone')
    return
  }
  const kept = rows.filter((l, i) => !isBlogRow(l) || i === first)
  kept[kept.indexOf(rows[first])] = block
  const out = kept.join('\n')
  if (out === xml) return
  writeFileSync(path, out)
  console.log(`sitemap.xml  ${chunks.length} blog page URLs`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Build
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const blogPath = join(root, 'blog.html')
  const shell = shellOf(readFileSync(blogPath, 'utf8'))
  const all = collect()
  if (!all.length) throw new Error('no posts found')

  const chunks = []
  for (let i = 0; i < all.length; i += PAGE_SIZE) chunks.push(all.slice(i, i + PAGE_SIZE))

  const index = indexBlock(chunks)

  chunks.forEach((chunk, i) => {
    const n = i + 1
    const html = [
      headFor(shell.head, n, chunks),
      `${INDEX_START}\n${index}\n${INDEX_END}`,
      `${PAGER_TOP_START}\n${pager(n, chunks, all.length, 'top')}\n${PAGER_TOP_END}`,
      chunk.map((p) => p.html).join('\n\n'),
      `${PAGER_BOT_START}\n${pager(n, chunks, all.length, 'bottom')}\n${PAGER_BOT_END}`,
    ].join('\n') + shell.tail
    writeFileSync(join(root, pageFile(n)), html)
    const kb = (Buffer.byteLength(html) / 1024).toFixed(0)
    console.log(`${pageFile(n).padEnd(13)} ${String(chunk.length).padStart(2)} entries  ${kb.padStart(4)}K  ${rangeLabel(chunk)}`)
  })

  writeSitemap(chunks)

  // Drop page files left over from a shorter run.
  for (let n = chunks.length + 1; n <= MAX_PAGE_FILES; n++) {
    const p = join(root, pageFile(n))
    if (!existsSync(p)) break
    unlinkSync(p)
    console.log(`removed stale ${pageFile(n)}`)
  }

  console.log(`\n${all.length} entries across ${chunks.length} pages at ${PAGE_SIZE} per page.`)
}

main()
