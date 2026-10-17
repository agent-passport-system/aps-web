#!/usr/bin/env node
// Set every non-blog <lastmod> in sitemap.xml from the page's own history.
//
// A page's date is the last commit that touched its file, skipping mechanical
// commits that do not change what the page says: number propagation, chore and
// shell sync by subject, and any sitewide sweep that touched more than
// SWEEP_FILES HTML files at once (menu, footer, link or preview-image changes). A file with uncommitted edits is dated today, so running this
// before a commit dates the pages that commit changes. Blog page rows belong to
// build-blog-pages.mjs, which dates them from their newest entry, and are left
// alone here.
//
// Zero dependencies.
//   node scripts/sitemap-lastmod.mjs           rewrite sitemap.xml
//   node scripts/sitemap-lastmod.mjs --check   report drift, write nothing

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://agent-passport.org'
const MECHANICAL = /^(propagate|chore|shell|sync)\b/i
const SWEEP_FILES = 10
const sweepCache = new Map()

function isSweep(hash) {
  if (!sweepCache.has(hash)) {
    const files = git('show', '--name-only', '--format=', hash).split('\n').filter((f) => f.endsWith('.html'))
    sweepCache.set(hash, files.length > SWEEP_FILES)
  }
  return sweepCache.get(hash)
}

const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()

function fileFor(loc) {
  const path = loc.slice(SITE.length).replace(/^\//, '')
  if (path === '') return 'index.html'
  if (path.endsWith('/')) return `${path}index.html`
  if (/\.[a-z]+$/.test(path)) return path
  return `${path}.html`
}

function today() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function dateOf(file) {
  if (git('status', '--porcelain', '--', file)) return today()
  const log = git('log', '--format=%H%x09%as%x09%s', '--', file)
  for (const line of log.split('\n')) {
    const [hash, date, subject = ''] = line.split('\t')
    if (date && !MECHANICAL.test(subject) && !isSweep(hash)) return date
  }
  return null
}

const path = join(root, 'sitemap.xml')
const xml = readFileSync(path, 'utf8')
const drift = []
const out = xml.replace(
  /<loc>([^<]+)<\/loc>(\s*)<lastmod>([^<]+)<\/lastmod>/g,
  (whole, loc, gap, current) => {
    if (/\/blog(-\d+)?\.html$/.test(loc)) return whole
    const file = fileFor(loc)
    if (!existsSync(join(root, file))) throw new Error(`sitemap names ${loc}, but ${file} does not exist`)
    const date = dateOf(file)
    if (!date || date === current) return whole
    drift.push(`${loc}  ${current} -> ${date}`)
    return `<loc>${loc}</loc>${gap}<lastmod>${date}</lastmod>`
  }
)

if (process.argv.includes('--check')) {
  if (drift.length) {
    console.error(`sitemap lastmod out of date:\n  ${drift.join('\n  ')}`)
    process.exit(1)
  }
  console.log('sitemap lastmod current.')
} else {
  if (out !== xml) writeFileSync(path, out)
  console.log(drift.length ? drift.join('\n') : 'sitemap lastmod already current.')
}
