#!/usr/bin/env node
// Copyright 2024-2026 Tymofii Pidlisnyi. Apache-2.0 license. See LICENSE.
// ══════════════════════════════════════════════════════════════════
// sync-shell.mjs — propagate canonical nav + footer from index.html
// ══════════════════════════════════════════════════════════════════
// Reads index.html as the source of truth, extracts the first <nav>
// element and the first <footer> element, and applies both to every
// other HTML file in the repo. Files that already match are skipped
// silently. Files with no nav get one inserted after <body>; files
// with no footer get one inserted before </body>.
//
// Usage:
//   node scripts/sync-shell.mjs                      # aeoess_web, write mode
//   node scripts/sync-shell.mjs --dry-run            # print the plan, write nothing
//   node scripts/sync-shell.mjs --repo tymofii       # use ~/tymofii as target
//   node scripts/sync-shell.mjs --repo tymofii --dry-run
//
// What the script does NOT touch:
//   - <head> contents (per-page meta must stay per-page)
//   - <title> tags
//   - <script type="application/ld+json"> blocks (per-page structured data)
//   - Files in the per-repo skip list (see SKIP below)
//
// Edge cases handled:
//   - File with zero <nav> tags        → insert canonical after <body>
//   - File with zero <footer> tags     → insert canonical before </body>
//   - File with multiple <footer> tags → remove all, insert canonical
//     before </body> (the "duplicate footer disease" this fixes)
//   - File already matching canonical  → skip silently
//   - File with no <body> tag          → warn and skip
// ══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ── Per-repo config ────────────────────────────────────────

const REPOS = {
  aeoess_web: {
    root: `${process.env.HOME}/aeoess_web`,
    recursive: false,
    skip: new Set(['board.html']),
    skipDirs: new Set([]),
  },
  tymofii: {
    root: `${process.env.HOME}/tymofii`,
    recursive: true,
    skip: new Set(['board.html', 'forvlad.html', 'ideas-admin.html']),
    skipDirs: new Set([
      'node_modules', '.git', 'assets', 'agora', 'comms',
      'datadividend', 'docs', 'llms', 'files', 'poems', 'skills', 'scripts',
    ]),
  },
}

// ── CLI ────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { repo: 'aeoess_web', dryRun: false }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--repo') args.repo = argv[++i]
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node sync-shell.mjs [--repo <name>] [--dry-run]')
      console.log('  --repo   aeoess_web (default) | tymofii')
      console.log('  --dry-run  Print the plan, write nothing')
      process.exit(0)
    }
  }
  return args
}

// ── Block extraction ────────────────────────────────────────
//
// Tag extraction is deliberately minimal: find the first <tag ...>
// opening, find its matching </tag>, and return the inclusive slice.
// HTML parsing-level robustness (nested elements, CDATA, comments)
// is not needed for the source-of-truth file because we control it,
// but the script DOES need to be robust against consumer pages that
// may have comments. The safeguard is to look for the opening tag
// only at "top-level" positions, i.e. not inside HTML comments or
// inside <script> bodies. We use a two-pass approach: strip comments
// and script bodies to a sentinel-preserved copy, locate the tag
// boundaries there, then slice the original string at those indices.

function findTagRange(html, tagName) {
  // Build a sanitized copy where comments and script bodies are
  // replaced with same-length runs of spaces so the indices remain
  // aligned with the original string.
  const sanitized = sanitizeForTagSearch(html)
  const openRe = new RegExp(`<${tagName}\\b[^>]*>`, 'i')
  const closeRe = new RegExp(`</${tagName}>`, 'i')

  const om = openRe.exec(sanitized)
  if (!om) return null
  const start = om.index
  const closeFromHere = closeRe.exec(sanitized.slice(start + om[0].length))
  if (!closeFromHere) return null
  const end = start + om[0].length + closeFromHere.index + closeFromHere[0].length
  return { start, end }
}

function sanitizeForTagSearch(html) {
  // Replace HTML comments with same-length space runs.
  let out = html.replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length))
  // Replace <script>...</script> bodies with same-length space runs so
  // any tag-like substrings inside inline scripts do not get matched.
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => ' '.repeat(m.length))
  return out
}

function extractBlock(html, tagName) {
  const range = findTagRange(html, tagName)
  if (!range) return null
  return html.slice(range.start, range.end)
}

// Find ALL ranges of a given tag (e.g. to detect the duplicate-footer
// disease and remove every one of them).
function findAllTagRanges(html, tagName) {
  const sanitized = sanitizeForTagSearch(html)
  const openRe = new RegExp(`<${tagName}\\b[^>]*>`, 'gi')
  const closeRe = new RegExp(`</${tagName}>`, 'i')
  const ranges = []
  let m
  while ((m = openRe.exec(sanitized)) !== null) {
    const start = m.index
    const after = sanitized.slice(start + m[0].length)
    const c = closeRe.exec(after)
    if (!c) break
    const end = start + m[0].length + c.index + c[0].length
    ranges.push({ start, end })
    openRe.lastIndex = end
  }
  return ranges
}

// ── File discovery ─────────────────────────────────────────

function listHtmlFiles(cfg) {
  const out = []
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (cfg.skipDirs.has(name)) continue
      const full = resolve(dir, name)
      const st = statSync(full)
      if (st.isDirectory()) {
        if (cfg.recursive) walk(full)
      } else if (name.endsWith('.html') && !cfg.skip.has(name)) {
        out.push(full)
      }
    }
  }
  walk(cfg.root)
  return out.sort()
}

// ── Per-file transform ─────────────────────────────────────

function applyCanonical(html, canonicalNav, canonicalFooter) {
  const actions = []

  // 1. Nav handling. If the file has exactly one nav and it matches
  // canonical, skip. If it has a drifted nav, replace it in place.
  // If it has multiple nav tags, collapse to one (replace the first,
  // remove the rest). If none, insert after <body>.
  const navRanges = findAllTagRanges(html, 'nav')
  if (navRanges.length === 0) {
    // No nav; insert after <body> open tag.
    const bodyOpen = /<body\b[^>]*>/i.exec(sanitizeForTagSearch(html))
    if (!bodyOpen) return { html, actions: [{ type: 'warn', reason: 'no <body> tag' }] }
    const insertAt = bodyOpen.index + bodyOpen[0].length
    html = html.slice(0, insertAt) + '\n' + canonicalNav + '\n' + html.slice(insertAt)
    actions.push({ type: 'insert', tag: 'nav' })
  } else {
    const existingNav = html.slice(navRanges[0].start, navRanges[0].end)
    if (existingNav === canonicalNav && navRanges.length === 1) {
      actions.push({ type: 'skip', tag: 'nav' })
    } else {
      // Replace the first nav with canonical. Remove any additional
      // nav tags in document order from last to first (so indices
      // stay valid as we splice). Offsets must be recomputed after
      // the first replacement.
      // Simplest: replace from LAST to FIRST. Remove additional
      // navs entirely, then replace the first with canonical.
      for (let i = navRanges.length - 1; i > 0; i--) {
        const r = navRanges[i]
        html = html.slice(0, r.start) + html.slice(r.end)
      }
      const firstRange = navRanges[0] // indices still valid because we only touched later ranges
      html = html.slice(0, firstRange.start) + canonicalNav + html.slice(firstRange.end)
      actions.push({
        type: 'replace',
        tag: 'nav',
        collapsedExtra: navRanges.length - 1,
      })
    }
  }

  // 2. Footer handling. Recompute ranges AFTER the nav edit because
  // indices shifted.
  const footerRanges = findAllTagRanges(html, 'footer')
  if (footerRanges.length === 0) {
    // No footer; insert before </body>.
    const bodyClose = /<\/body>/i.exec(sanitizeForTagSearch(html))
    if (!bodyClose) return { html, actions: [{ type: 'warn', reason: 'no </body> tag' }] }
    const insertAt = bodyClose.index
    html = html.slice(0, insertAt) + canonicalFooter + '\n' + html.slice(insertAt)
    actions.push({ type: 'insert', tag: 'footer' })
  } else {
    const existingFooter = html.slice(footerRanges[0].start, footerRanges[0].end)
    if (existingFooter === canonicalFooter && footerRanges.length === 1) {
      actions.push({ type: 'skip', tag: 'footer' })
    } else {
      // Same strategy as nav: drop all extras (back to front), then
      // replace the first.
      for (let i = footerRanges.length - 1; i > 0; i--) {
        const r = footerRanges[i]
        html = html.slice(0, r.start) + html.slice(r.end)
      }
      const firstRange = footerRanges[0]
      html = html.slice(0, firstRange.start) + canonicalFooter + html.slice(firstRange.end)
      actions.push({
        type: 'replace',
        tag: 'footer',
        collapsedExtra: footerRanges.length - 1,
      })
    }
  }

  return { html, actions }
}

// ── Main ───────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv)
  const cfg = REPOS[args.repo]
  if (!cfg) {
    console.error(`Unknown repo: ${args.repo}. Known: ${Object.keys(REPOS).join(', ')}`)
    process.exit(2)
  }
  const indexPath = resolve(cfg.root, 'index.html')
  const indexHtml = readFileSync(indexPath, 'utf8')
  const canonicalNav = extractBlock(indexHtml, 'nav')
  const canonicalFooter = extractBlock(indexHtml, 'footer')
  if (!canonicalNav) {
    console.error(`ERROR: ${indexPath} has no <nav> block to extract.`)
    process.exit(2)
  }
  if (!canonicalFooter) {
    console.error(`ERROR: ${indexPath} has no <footer> block to extract.`)
    process.exit(2)
  }

  console.log(`sync-shell: repo=${args.repo} mode=${args.dryRun ? 'DRY-RUN' : 'WRITE'}`)
  console.log(`  source:  ${indexPath}`)
  console.log(`  nav:     ${canonicalNav.length} bytes`)
  console.log(`  footer:  ${canonicalFooter.length} bytes`)
  console.log('')

  const files = listHtmlFiles(cfg)
  const stats = { total: 0, skipped: 0, updated: 0, inserted: 0, warned: 0, bytesBefore: 0, bytesAfter: 0 }

  for (const full of files) {
    const rel = relative(cfg.root, full)
    if (rel === 'index.html') continue
    stats.total++
    const before = readFileSync(full, 'utf8')
    stats.bytesBefore += before.length

    const { html: after, actions } = applyCanonical(before, canonicalNav, canonicalFooter)

    const warned = actions.find(a => a.type === 'warn')
    if (warned) {
      console.log(`  ⚠ ${rel}: ${warned.reason}`)
      stats.warned++
      stats.bytesAfter += before.length
      continue
    }
    const skipped = actions.every(a => a.type === 'skip')
    if (skipped) {
      stats.skipped++
      stats.bytesAfter += before.length
      continue
    }

    stats.bytesAfter += after.length
    const summary = actions
      .filter(a => a.type !== 'skip')
      .map(a => {
        if (a.type === 'insert') return `+${a.tag}`
        if (a.type === 'replace') return `~${a.tag}${a.collapsedExtra ? `(-${a.collapsedExtra} dup)` : ''}`
        return a.type
      })
      .join(' ')
    const delta = after.length - before.length
    const deltaStr = delta >= 0 ? `+${delta}` : `${delta}`
    console.log(`  ${args.dryRun ? '[dry]' : '[WRITE]'} ${rel.padEnd(34)} ${summary.padEnd(24)} (${deltaStr} bytes)`)

    if (actions.some(a => a.type === 'insert')) stats.inserted++
    if (actions.some(a => a.type === 'replace')) stats.updated++

    if (!args.dryRun) {
      writeFileSync(full, after, 'utf8')
    }
  }

  console.log('')
  console.log('summary:')
  console.log(`  total non-index files:   ${stats.total}`)
  console.log(`  already canonical:       ${stats.skipped}`)
  console.log(`  nav/footer replaced:     ${stats.updated}`)
  console.log(`  nav/footer inserted:     ${stats.inserted}`)
  console.log(`  warned (skipped):        ${stats.warned}`)
  console.log(`  bytes before:            ${stats.bytesBefore}`)
  console.log(`  bytes after:             ${stats.bytesAfter}`)
  console.log(`  delta:                   ${stats.bytesAfter - stats.bytesBefore}`)
  if (args.dryRun) {
    console.log('')
    console.log('DRY RUN: no files were written. Re-run without --dry-run to apply.')
  }
}

// Only run main if invoked as the script entry point.
const __filename = fileURLToPath(import.meta.url)
if (process.argv[1] === __filename) {
  main()
}
