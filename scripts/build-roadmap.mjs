#!/usr/bin/env node
// Pre-render roadmap.yaml into a static HTML block inside roadmap.html.
// Visitors with JavaScript disabled, screen readers, search engines, and AI
// crawlers see the full roadmap as semantic HTML. The SVG timeline still
// hydrates on top via the existing client-side script when JS is available.
//
// Zero dependencies. Uses a small YAML parser tailored to roadmap.yaml's
// restricted dialect (top-level sequence of mappings, scalar fields,
// `links` list of {url,label}, optional `dependencies` list of strings).
// Run via: node scripts/build-roadmap.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const yamlPath = join(root, 'roadmap.yaml')
const htmlPath = join(root, 'roadmap.html')

const START = '<!-- BUILD:ROADMAP_START -->'
const END = '<!-- BUILD:ROADMAP_END -->'

const STATUS_GROUPS = [
  ['active', 'Active'],
  ['in_progress', 'In progress'],
  ['planned', 'Planned'],
  ['next-up', 'Next up'],
  ['done', 'Shipped'],
  ['backlog', 'Backlog'],
  ['killed', 'Killed (with rationale)'],
]

const WORKSTREAM_LABELS = {
  protocol: 'Protocol',
  product: 'Product',
  research: 'Research',
  comms: 'Comms',
  ops: 'Ops',
  ecosystem: 'Ecosystem',
  standards: 'Standards',
}

// ─────────────────────────────────────────────────────────────────────────────
// Minimal YAML parser for roadmap.yaml
// ─────────────────────────────────────────────────────────────────────────────
// Supports: top-level sequence of block-style mappings; scalar fields with
// quoted strings (single + double, with \" / \\ / \n escapes); integer
// scalars; nested `links:` block of `- url: ... / label: ...` mappings;
// nested `dependencies:` block of scalar items. Comments and blank lines
// are ignored. No anchors, no flow style, no folded scalars.
function parseRoadmapYAML(text) {
  const rawLines = text.split('\n')
  const lines = rawLines
    .map((l, i) => ({ raw: l, i }))
    .filter(({ raw }) => {
      const trimmed = raw.trim()
      return trimmed !== '' && !trimmed.startsWith('#')
    })

  const items = []
  let cur = null
  let listKey = null              // current nested-list key on cur (links | dependencies)
  let listEntry = null            // current mapping inside `links` (keeps url+label)
  let listEntryIndent = -1

  for (const { raw, i } of lines) {
    const indent = raw.length - raw.replace(/^\s+/, '').length
    const body = raw.slice(indent)

    if (indent === 0 && body.startsWith('- ')) {
      // New top-level item
      if (cur) items.push(cur)
      cur = {}
      listKey = null
      listEntry = null
      const inline = body.slice(2)
      const kv = parseKV(inline, i)
      if (kv) cur[kv.key] = kv.value
      continue
    }

    if (!cur) continue

    if (indent === 2 && !body.startsWith('-')) {
      // Top-level field on current item
      listKey = null
      listEntry = null
      const kv = parseKV(body, i)
      if (!kv) throw err(`unparseable field`, i, raw)
      if (kv.value === '' && (body.endsWith(':') || body.endsWith(': '))) {
        // Empty value introduces a nested block (links / dependencies).
        listKey = kv.key
        cur[kv.key] = []
      } else {
        cur[kv.key] = kv.value
      }
      continue
    }

    if (listKey && indent >= 4 && body.startsWith('- ')) {
      // New entry in nested list
      listEntry = null
      listEntryIndent = indent
      const inline = body.slice(2).trimEnd()
      if (inline.includes(':')) {
        // Mapping entry (links: - url: ...)
        listEntry = {}
        const kv = parseKV(inline, i)
        if (kv) listEntry[kv.key] = kv.value
        cur[listKey].push(listEntry)
      } else {
        // Scalar entry (dependencies: - foo-bar)
        cur[listKey].push(stripQuotes(inline))
      }
      continue
    }

    if (listKey && listEntry && indent > listEntryIndent) {
      // Continuation of mapping in current list entry (e.g. label: ...)
      const kv = parseKV(body, i)
      if (kv) listEntry[kv.key] = kv.value
      continue
    }

    // Anything else: ignore (best-effort tolerance)
  }
  if (cur) items.push(cur)

  // Coerce day_start / day_end to numbers
  for (const it of items) {
    if (typeof it.day_start === 'string') it.day_start = Number(it.day_start)
    if (typeof it.day_end === 'string') it.day_end = Number(it.day_end)
  }

  return items
}

function parseKV(line, lineIdx) {
  // Find the first ':' that is not inside a quoted string.
  let inS = false, inD = false, esc = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (esc) { esc = false; continue }
    if (c === '\\') { esc = true; continue }
    if (!inD && c === "'") inS = !inS
    else if (!inS && c === '"') inD = !inD
    else if (!inS && !inD && c === ':') {
      const key = line.slice(0, i).trim()
      const rest = line.slice(i + 1).trim()
      return { key, value: parseScalar(rest, lineIdx) }
    }
  }
  return null
}

function parseScalar(raw, lineIdx) {
  if (raw === '' || raw === '~' || raw === 'null') return raw === '' ? '' : null
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (/^-?\d+$/.test(raw)) return Number(raw)
  if (raw.startsWith('"')) return unescapeDouble(raw, lineIdx)
  if (raw.startsWith("'")) return unescapeSingle(raw, lineIdx)
  // Strip trailing comments only when preceded by whitespace
  const comment = raw.match(/\s+#.*$/)
  if (comment) raw = raw.slice(0, comment.index)
  return raw.trim()
}

function unescapeDouble(raw, lineIdx) {
  // Strict: must start with " and end with " (single-line YAML double-quoted)
  if (!raw.endsWith('"')) throw err(`unterminated double-quoted scalar`, lineIdx, raw)
  const inner = raw.slice(1, -1)
  let out = ''
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i]
    if (c === '\\' && i + 1 < inner.length) {
      const n = inner[i + 1]
      if (n === '"') { out += '"'; i++ }
      else if (n === '\\') { out += '\\'; i++ }
      else if (n === 'n') { out += '\n'; i++ }
      else if (n === 't') { out += '\t'; i++ }
      else if (n === 'r') { out += '\r'; i++ }
      else { out += c }
    } else {
      out += c
    }
  }
  return out
}

function unescapeSingle(raw, lineIdx) {
  if (!raw.endsWith("'")) throw err(`unterminated single-quoted scalar`, lineIdx, raw)
  return raw.slice(1, -1).replace(/''/g, "'")
}

function stripQuotes(s) {
  if (s.startsWith('"') && s.endsWith('"')) return unescapeDouble(s, -1)
  if (s.startsWith("'") && s.endsWith("'")) return unescapeSingle(s, -1)
  return s
}

function err(msg, idx, raw) {
  return new Error(`build-roadmap: ${msg} at line ${idx + 1}: ${raw}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────────────────────────────────────
function escape(value) {
  if (value === undefined || value === null) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(value) {
  return escape(value)
}

function renderItem(item) {
  const ws = WORKSTREAM_LABELS[item.workstream] ?? item.workstream ?? 'unassigned'
  const dayRange = item.day_end && item.day_end !== item.day_start
    ? `Day ${item.day_start}–${item.day_end}`
    : `Day ${item.day_start}`

  const links = Array.isArray(item.links) ? item.links : []
  const deps = Array.isArray(item.dependencies) ? item.dependencies : []

  const parts = []
  parts.push(`<article class="rm-item rm-item-${escapeAttr(item.status || 'unspecified')}" id="${escapeAttr(item.id)}">`)
  parts.push(`<header class="rm-item-h">`)
  parts.push(`<h3 class="rm-item-title">${escape(item.title)}</h3>`)
  parts.push(`<p class="rm-item-meta">`)
  parts.push(`<span class="rm-item-day">${escape(dayRange)}</span> `)
  parts.push(`<span class="rm-item-ws">${escape(ws)}</span> `)
  parts.push(`<span class="rm-item-status">${escape(item.status || 'unspecified')}</span>`)
  parts.push(`</p>`)
  parts.push(`</header>`)

  if (item.description) {
    parts.push(`<p class="rm-item-desc">${escape(item.description)}</p>`)
  }

  if (item.kill_note) {
    parts.push(`<p class="rm-item-kill"><strong>Killed:</strong> ${escape(item.kill_note)}</p>`)
  }

  if (deps.length > 0) {
    const depItems = deps.map((d) => `<code>${escape(d)}</code>`).join(', ')
    parts.push(`<p class="rm-item-deps"><strong>Depends on:</strong> ${depItems}</p>`)
  }

  if (links.length > 0) {
    const rendered = links
      .filter((l) => l && l.url)
      .map((l) => `<li><a href="${escapeAttr(l.url)}">${escape(l.label || l.url)}</a></li>`)
      .join('')
    if (rendered) {
      parts.push(`<ul class="rm-item-links">${rendered}</ul>`)
    }
  }

  parts.push(`</article>`)
  return parts.join('\n')
}

function renderGroup(label, items) {
  if (items.length === 0) return ''
  const sorted = [...items].sort((a, b) => {
    if (a.day_start !== b.day_start) return (b.day_start || 0) - (a.day_start || 0)
    return String(a.id).localeCompare(String(b.id))
  })
  const itemsHtml = sorted.map(renderItem).join('\n')
  return `<section class="rm-group rm-group-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">
<h2 class="rm-group-title">${escape(label)} <span class="rm-group-count">(${sorted.length})</span></h2>
${itemsHtml}
</section>`
}

function build() {
  const yamlText = readFileSync(yamlPath, 'utf8')
  const items = parseRoadmapYAML(yamlText).filter((i) => i && i.id)

  const byStatus = new Map(STATUS_GROUPS.map(([key]) => [key, []]))
  const otherStatus = []
  for (const item of items) {
    if (byStatus.has(item.status)) {
      byStatus.get(item.status).push(item)
    } else {
      otherStatus.push(item)
    }
  }

  const groupsHtml = STATUS_GROUPS
    .map(([key, label]) => renderGroup(label, byStatus.get(key) || []))
    .filter(Boolean)
    .join('\n')

  const otherHtml = otherStatus.length > 0
    ? renderGroup('Other (no status declared)', otherStatus)
    : ''

  const generated = `<noscript class="rm-noscript-hint"><div class="rm-noscript-msg">JavaScript is disabled — showing the full roadmap as a list. With JavaScript on, this page renders an interactive timeline above.</div></noscript>
<div class="rm-static" id="rm-static" aria-label="Roadmap (static fallback)">
<p class="rm-static-intro">${items.length} roadmap items, grouped by status. Updated from <a href="https://github.com/aeoess/aeoess_web/blob/main/roadmap.yaml">roadmap.yaml</a>. Day 1 is 2026-02-17.</p>
${groupsHtml}
${otherHtml}
</div>`

  const html = readFileSync(htmlPath, 'utf8')
  const startIdx = html.indexOf(START)
  const endIdx = html.indexOf(END)
  if (startIdx === -1 || endIdx === -1) {
    throw new Error(`Markers ${START} / ${END} not found in roadmap.html. Add them around the static-fallback block.`)
  }
  if (endIdx < startIdx) {
    throw new Error(`Marker order is reversed in roadmap.html`)
  }

  const before = html.slice(0, startIdx + START.length)
  const after = html.slice(endIdx)
  const next = `${before}\n${generated}\n${after}`

  writeFileSync(htmlPath, next, 'utf8')
  process.stdout.write(`build-roadmap: rendered ${items.length} items into roadmap.html\n`)
}

build()
