#!/usr/bin/env node
// Copyright 2026 Tymofii Pidlisnyi. Apache-2.0 license. See LICENSE.
// Self test for sync-shell.mjs: the site nav is replaced, a bp-pager
// nav and an in-page table of contents survive, the footer is replaced.
// Usage: node scripts/test-sync-shell.mjs   (exit 0 = pass)

import assert from 'node:assert/strict'
import { applyCanonical } from './sync-shell.mjs'

const canonicalNav = '<nav class="nav-links">\n  <a href="/docs/">Docs</a>\n  <a href="blog.html">Dev Log</a>\n</nav>'
const canonicalFooter = '<footer class="footer-wrap" role="contentinfo"><section class="bodies">IETF</section></footer>'

const pagerTop = '<nav class="bp-pager bp-pager-top" aria-label="Dev log pages"><a href="blog-2.html">2</a></nav>'
const pagerBottom = '<nav class="bp-pager bp-pager-bottom" aria-label="Dev log pages"><a href="blog-2.html">2</a></nav>'
const toc = '<nav class="toc" aria-label="On this page"><a href="#a">A</a></nav>'

const page = `<!doctype html>
<html><head><title>Dev Log</title></head>
<body>
<header class="nav"><nav class="nav-links">
  <a href="https://agent-passport.org/blog.html">Dev Log</a>
</nav></header>
${pagerTop}
<main>${toc}<p>Post body.</p></main>
${pagerBottom}
<footer class="footer-wrap"><p>old footer</p></footer>
</body></html>`

const { html, actions } = applyCanonical(page, canonicalNav, canonicalFooter)

// Site nav replaced, no duplicate collapse reported.
assert.ok(html.includes(canonicalNav), 'canonical nav present')
assert.ok(!html.includes('https://agent-passport.org/blog.html'), 'old site nav gone')
const navAction = actions.find(a => a.tag === 'nav')
assert.equal(navAction.type, 'replace')
assert.equal(navAction.collapsedExtra, 0, 'no nav counted as duplicate')

// Non-site navs survive byte for byte.
assert.ok(html.includes(pagerTop), 'top pager survives')
assert.ok(html.includes(pagerBottom), 'bottom pager survives')
assert.ok(html.includes(toc), 'table of contents survives')
assert.equal((html.match(/<nav\b/g) || []).length, 4, 'four navs remain')

// Footer replaced.
assert.ok(html.includes(canonicalFooter), 'canonical footer present')
assert.ok(!html.includes('old footer'), 'old footer gone')

// A second run is a no-op.
const again = applyCanonical(html, canonicalNav, canonicalFooter)
assert.equal(again.html, html, 'idempotent')
assert.ok(again.actions.every(a => a.type === 'skip'), 'second run skips')

// A page with only a pager gets a site nav inserted and keeps the pager.
const pagerOnly = `<html><body>\n${pagerTop}\n<footer>x</footer></body></html>`
const ins = applyCanonical(pagerOnly, canonicalNav, canonicalFooter)
assert.equal(ins.actions.find(a => a.tag === 'nav').type, 'insert')
assert.ok(ins.html.includes(pagerTop), 'pager survives insert path')

console.log('test-sync-shell: all assertions passed')
