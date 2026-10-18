#!/usr/bin/env node
// Split the dev log across numbered pages.
//
// A new post is written as blog/<id>.md with source "md" in its front matter
// (see scripts/blog-md.mjs). The build renders it into the pages next to the
// posts of its date. Older posts were written in HTML inside blog.html and the
// other pages, newest first, and they stay that way because dated posts are
// never rewritten. Every post, either kind, is also published as
// blog/<id>.md, and blog/index.md lists them all. Running this script afterwards re-chunks every post
// across blog.html and blog-2.html .. blog-N.html, rewrites the pagers, and
// re-inlines the post index that blog-nav.js reads.
//
// The script is its own inverse in the sense that matters: it reads the posts
// back out of the files it wrote, so running it twice in a row is a no-op.
// Post order is document order, newest first, never re-sorted.
//
// Zero dependencies.
//   node scripts/build-blog-pages.mjs           rewrite every page
//   node scripts/build-blog-pages.mjs --check   report drift, write nothing
//
// --check exists because propagate.mjs rewrites blog.html only. The other
// pages copy their head and hero from blog.html, so a propagation run leaves
// them behind until this script runs again. --check exits 1 when that has
// happened, which is what a pre-push or self-check pass wants.

import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync, mkdirSync } from 'node:fs'
import { parseFrontMatter, articleHtml, htmlPostToMd } from './blog-md.mjs'
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
      // Posts rendered from blog/<id>.md are rebuilt from their source every run.
      if (/^<article [^>]*data-source="md"/.test(post)) continue
      const meta = postMeta(post)
      if (seen.has(meta.id)) throw new Error(`duplicate post id across pages: ${meta.id}`)
      seen.add(meta.id)
      all.push({ ...meta, html: withDivider(html, post) })
    }
  }
  return all
}

// ─────────────────────────────────────────────────────────────────────────────
// Posts written in Markdown
// ─────────────────────────────────────────────────────────────────────────────
// blog/<id>.md with source "md" is the source of that post. Each one is placed
// above the first HTML post that is not newer than it, so a story dated to an
// old day sits next to that day's dev log.

const MD_DIR = join(root, 'blog')

function mdPosts() {
  if (!existsSync(MD_DIR)) return []
  const out = []
  for (const f of readdirSync(MD_DIR).filter((f) => f.endsWith('.md') && f !== 'index.md')) {
    const { meta, body } = parseFrontMatter(readFileSync(join(MD_DIR, f), 'utf8'))
    if (meta.source !== 'md') continue
    if (`${meta.id}.md` !== f) throw new Error(`${f}: id in front matter is ${meta.id}`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date || '')) throw new Error(`${f}: no ISO date`)
    if (!meta.title) throw new Error(`${f}: no title`)
    // Strip the leading "# title" line, the page shows the title from front matter.
    const text = body.replace(/^# [^\n]*\n+/, '')
    out.push({ id: meta.id, date: meta.date, title: meta.title, day: null, kind: meta.kind || 'story', md: true, html: articleHtml(meta, text) })
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? -1 : 1))
}

function merge(htmlPosts, md) {
  const all = [...htmlPosts]
  const ids = new Set(all.map((p) => p.id))
  // Oldest first, so posts sharing a date keep the newest-first order of the sort above.
  for (const p of [...md].reverse()) {
    if (ids.has(p.id)) throw new Error(`post id ${p.id} exists as both HTML and Markdown`)
    ids.add(p.id)
    let at = all.findIndex((q) => !q.md && q.date <= p.date)
    if (at < 0) at = all.length
    all.splice(at, 0, p)
  }
  return all
}

function kindOf(p) {
  if (p.kind) return p.kind
  return /^day-\d/.test(p.id) ? 'devlog' : 'article'
}

// Every post is published as /blog/<id>.md. Markdown sources are already
// there, HTML posts get a derived copy, and blog/index.md lists them all.
function markdownFiles(all) {
  const files = new Map()
  for (const p of all) {
    if (p.md) continue
    const html = p.html.replace(/^<!--[^\n]*-->\n/, '')
    files.set(join(MD_DIR, `${p.id}.md`), htmlPostToMd(html, { id: p.id, title: p.title, date: p.date, kind: kindOf(p), canonical: '' }))
  }
  const lines = [
    '# Agent Passport System blog',
    '',
    'Every post by Tymofii Pidlisnyi, newest first. Dev log posts are named by day and record what changed. Stories tell what happened around the work. Each link is the post as Markdown.',
    '',
  ]
  for (const p of all) lines.push(`- ${p.date} [${p.title}](${SITE}/blog/${p.id}.md) (${kindOf(p)})`)
  files.set(join(MD_DIR, 'index.md'), lines.join('\n') + '\n')
  return files
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
    for (const p of chunk) posts.push(p.kind === 'story' ? { i: p.id, p: i + 1, d: p.date, t: p.title, k: 's' } : { i: p.id, p: i + 1, d: p.date, t: p.title })
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
  rel.push(`<link rel="alternate" type="text/markdown" href="${SITE}/blog/index.md" title="All posts as Markdown">`)
  if (current > 1) rel.push(`<link rel="prev" href="${SITE}${pageUrl(current - 1)}">`)
  if (current < total) rel.push(`<link rel="next" href="${SITE}${pageUrl(current + 1)}">`)
  rel.push(HEAD_END)
  let out = head

  if (current > 1) {
    const desc = esc(`Agent Passport System dev log, page ${current} of ${total}, with entries from ${range}.`)
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
    out = out.replace(/(<meta name="description" content=")([^"]*)(">)/, (_m, a, _b, c) => a + desc + c)
    out = out.replace(/(<meta property="og:description" content=")([^"]*)(">)/, (_m, a, _b, c) => a + desc + c)
  }
  // Every page, page 1 included, describes exactly the posts it holds. A
  // hand-written list on page 1 drifted to 65 anchors that had moved to other
  // pages, so structured data is now always generated from the page itself.
  out = out.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ldFor(current, chunks))

  return out.replace('</head>', `${rel.join('\n')}\n</head>`)
}

const AUTHOR = { '@type': 'Person', '@id': `${SITE}/#tymofii-pidlisnyi`, name: 'Tymofii Pidlisnyi' }

function ldFor(current, chunks) {
  const posts = chunks[current - 1].map((p) => ({
    '@type': 'BlogPosting',
    headline: p.title,
    datePublished: p.date,
    author: AUTHOR,
    url: `${SITE}${pageUrl(current)}#${p.id}`,
  }))
  const ld =
    current === 1
      ? {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'APS Dev Log',
          url: `${SITE}/blog.html`,
          inLanguage: 'en',
          author: AUTHOR,
          blogPost: posts,
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `APS Dev Log, page ${current} of ${chunks.length}`,
          url: `${SITE}${pageUrl(current)}`,
          isPartOf: { '@type': 'Blog', name: 'APS Dev Log', url: `${SITE}/blog.html` },
          inLanguage: 'en',
          hasPart: posts,
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
// RSS feed
// ─────────────────────────────────────────────────────────────────────────────
// The feed used to be written by hand and stopped at Day 137. It is now built
// from the same posts as the pages: the newest FEED_SIZE entries, each linking
// to the page that actually holds it.

const FEED_SIZE = 20
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function rfc822(iso) {
  const d = new Date(`${iso}T12:00:00Z`)
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${DOW[d.getUTCDay()]}, ${dd} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} 12:00:00 GMT`
}

function summaryOf(postHtml) {
  for (const m of postHtml.matchAll(/<p(?![^>]*class="post-date")[^>]*>([\s\S]*?)<\/p>/g)) {
    const text = decode(m[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
    if (text) return text.length > 400 ? `${text.slice(0, 397).replace(/\s+\S*$/, '')}...` : text
  }
  return ''
}

function feedXml(chunks) {
  const items = []
  chunks.forEach((chunk, i) => {
    for (const p of chunk) items.push({ ...p, page: i + 1 })
  })
  const rows = items.slice(0, FEED_SIZE).map((p) => {
    const link = `${SITE}${pageUrl(p.page)}#${p.id}`
    return [
      '  <item>',
      `    <title>${esc(p.title)}</title>`,
      `    <link>${link}</link>`,
      `    <guid isPermaLink="false">${SITE}/blog#${p.id}</guid>`,
      `    <pubDate>${rfc822(p.date)}</pubDate>`,
      `    <description>${esc(summaryOf(p.html))}</description>`,
      '  </item>',
    ].join('\n')
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>',
    '  <title>Agent Passport System Dev Log</title>',
    `  <link>${SITE}/blog.html</link>`,
    `  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>`,
    '  <description>Day-by-day record of building the Agent Passport System, by Tymofii Pidlisnyi.</description>',
    '  <language>en</language>',
    `  <lastBuildDate>${rfc822(items[0].date)}</lastBuildDate>`,
    ...rows,
    '</channel></rss>',
    '',
  ].join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// Build
// ─────────────────────────────────────────────────────────────────────────────

const CHECK = process.argv.includes('--check')

function main() {
  const blogPath = join(root, 'blog.html')
  const shell = shellOf(readFileSync(blogPath, 'utf8'))
  const all = merge(collect(), mdPosts())
  if (!all.length) throw new Error('no posts found')
  const mdFiles = markdownFiles(all)

  const chunks = []
  for (let i = 0; i < all.length; i += PAGE_SIZE) chunks.push(all.slice(i, i + PAGE_SIZE))

  const index = indexBlock(chunks)
  const stale = []

  chunks.forEach((chunk, i) => {
    const n = i + 1
    const html = [
      headFor(shell.head, n, chunks),
      `${INDEX_START}\n${index}\n${INDEX_END}`,
      `${PAGER_TOP_START}\n${pager(n, chunks, all.length, 'top')}\n${PAGER_TOP_END}`,
      chunk.map((p) => p.html).join('\n\n'),
      `${PAGER_BOT_START}\n${pager(n, chunks, all.length, 'bottom')}\n${PAGER_BOT_END}`,
    ].join('\n') + shell.tail
    const target = join(root, pageFile(n))
    if (CHECK) {
      const current = existsSync(target) ? readFileSync(target, 'utf8') : null
      if (current !== html) stale.push(pageFile(n))
      return
    }
    writeFileSync(target, html)
    const kb = (Buffer.byteLength(html) / 1024).toFixed(0)
    console.log(`${pageFile(n).padEnd(13)} ${String(chunk.length).padStart(2)} entries  ${kb.padStart(4)}K  ${rangeLabel(chunk)}`)
  })

  if (CHECK) {
    for (let n = chunks.length + 1; n <= MAX_PAGE_FILES; n++) {
      if (!existsSync(join(root, pageFile(n)))) break
      stale.push(`${pageFile(n)} (should not exist)`)
    }
    for (const [p, text] of mdFiles) {
      if (!existsSync(p) || readFileSync(p, 'utf8') !== text) stale.push(p.slice(root.length + 1))
    }
    if (stale.length) {
      console.error(`Blog pages out of date: ${stale.join(', ')}`)
      console.error('Run: node scripts/build-blog-pages.mjs')
      process.exit(1)
    }
    console.log(`${all.length} entries across ${chunks.length} pages, all current.`)
    return
  }

  writeSitemap(chunks)
  const feed = feedXml(chunks)
  const feedPath = join(root, 'feed.xml')
  if (!existsSync(feedPath) || readFileSync(feedPath, 'utf8') !== feed) {
    writeFileSync(feedPath, feed)
    console.log(`feed.xml     ${Math.min(FEED_SIZE, all.length)} newest entries`)
  }

  if (!existsSync(MD_DIR)) mkdirSync(MD_DIR)
  let wrote = 0
  for (const [p, text] of mdFiles) {
    if (existsSync(p) && readFileSync(p, 'utf8') === text) continue
    writeFileSync(p, text)
    wrote++
  }
  // A derived copy whose post no longer exists goes too. Markdown sources are never removed here.
  for (const f of readdirSync(MD_DIR).filter((f) => f.endsWith('.md'))) {
    const p = join(MD_DIR, f)
    if (mdFiles.has(p)) continue
    const head = readFileSync(p, 'utf8').slice(0, 400)
    if (/\nsource: "html"/.test(head)) { unlinkSync(p); console.log(`removed stale blog/${f}`) }
  }
  if (wrote) console.log(`blog/*.md     ${wrote} Markdown files written`)

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
