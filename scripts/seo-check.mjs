#!/usr/bin/env node
// Metadata regression check for the published pages. Zero dependencies.
//
// Fails when: a JSON-LD block does not parse; a structured-data URL on this
// site points at a page that does not exist or at an anchor that page does not
// hold; a sitemap entry names a missing file or a noindex page; an indexable
// page lacks a title, description or canonical; the blog pages or the sitemap
// dates have drifted from their generators.
//   node scripts/seo-check.mjs

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://agent-passport.org'
const problems = []
const read = (f) => readFileSync(join(root, f), 'utf8')

const pages = [
  ...readdirSync(root).filter((f) => f.endsWith('.html') && f !== 'cat-preview.html'),
  ...readdirSync(join(root, 'terms')).filter((f) => f.endsWith('.html')).map((f) => `terms/${f}`),
]

function fileFor(url) {
  const path = url.slice(SITE.length).replace(/^\//, '').split('#')[0].split('?')[0]
  if (path === '') return 'index.html'
  if (path.endsWith('/')) return `${path}index.html`
  if (/\.[a-z0-9]+$/.test(path)) return path
  return `${path}.html`
}

const ids = new Map()
const idsOf = (file) => {
  if (!ids.has(file)) ids.set(file, new Set([...read(file).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])))
  return ids.get(file)
}

function walk(value, visit) {
  if (Array.isArray(value)) value.forEach((v) => walk(v, visit))
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === 'string') visit(k, v)
      else walk(v, visit)
    }
  }
}

for (const page of pages) {
  const html = read(page)
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html)
  for (const [, block] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let data
    try {
      data = JSON.parse(block)
    } catch (e) {
      problems.push(`${page}: JSON-LD does not parse (${e.message})`)
      continue
    }
    walk(data, (key, v) => {
      if (!['url', 'item', '@id', 'inDefinedTermSet'].includes(key) || !v.startsWith(SITE)) return
      if (key === '@id' && v.includes('#') && !v.includes('.html#')) return // entity identifiers
      const file = fileFor(v)
      if (!existsSync(join(root, file))) problems.push(`${page}: structured data names ${v}, no ${file}`)
      else if (v.includes('#') && !idsOf(file).has(v.split('#')[1])) problems.push(`${page}: structured data names ${v}, anchor not on that page`)
    })
  }
  if (noindex || page === '404.html' || page.startsWith('arch-') || page === 'opensource.html') continue
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${page}: no title`)
  if (!/<meta name="description" content="[^"]+"/.test(html)) problems.push(`${page}: no description`)
  if (!/<link rel="canonical" href="[^"]+"/.test(html)) problems.push(`${page}: no canonical`)
}

for (const [, loc] of read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const file = fileFor(loc)
  if (!existsSync(join(root, file))) problems.push(`sitemap: ${loc} has no ${file}`)
  else if (/<meta name="robots" content="[^"]*noindex/.test(read(file))) problems.push(`sitemap: ${loc} is noindex`)
}

for (const script of ['build-blog-pages.mjs', 'sitemap-lastmod.mjs']) {
  try {
    execFileSync('node', [join(root, 'scripts', script), '--check'], { cwd: root, stdio: 'pipe' })
  } catch (e) {
    problems.push(`${script} --check: ${String(e.stderr || e.message).trim()}`)
  }
}

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`seo-check: ${pages.length} pages, structured data, sitemap and generators all consistent.`)
