#!/usr/bin/env node
// Published package metadata must carry NO mutable facts.
//
// Why. On 2026-08-20 two of the three published descriptions were stale on live
// registries: the MCP package said "Tracks SDK v3.3.0" while depending on 4.4.0,
// and PyPI claimed "parity with agent-passport-system npm v3.3.0". Both named a
// version two majors behind, and both had been republished that same day. The SDK
// description carried three benchmark figures and a test count, the same shape
// waiting to happen.
//
// The failure is structural, not clerical. A package description is effectively
// immutable between releases, so any mutable fact placed there is wrong the moment
// the number moves and can only be corrected by shipping a version. Generating the
// text would make the wrong thing accurate more often without removing the class.
//
// So: descriptions say what the package IS. Counts, benchmarks and version-pinned
// claims live in the README, which ships inside every tarball, renders on both
// registry pages, and is already a propagation target with working patterns.
//
// This guard fails a release that puts a mutable fact back.
//
// Run: node scripts/test-package-descriptions.mjs

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const H = homedir();

const TARGETS = [
  { label: 'npm  agent-passport-system',     read: () => JSON.parse(readFileSync(`${H}/agent-passport-system/package.json`, 'utf8')).description },
  { label: 'npm  agent-passport-system-mcp', read: () => JSON.parse(readFileSync(`${H}/agent-passport-mcp/package.json`, 'utf8')).description },
  { label: 'PyPI agent-passport-system',     read: () => (readFileSync(`${H}/agent-passport-python/pyproject.toml`, 'utf8').match(/^description = "(.*)"$/m) || [])[1] },
];

// Each rule names the real incident it prevents, so a future reader can judge it
// rather than guess at intent.
// npm stores only the first 255 characters. Verified 2026-08-20 against the registry
// API: agent-passport-system 4.3.0, 4.3.1 and 4.4.0 are each EXACTLY 255 published, and
// 4.4.0 ends mid-sentence at "292ns Mac M3.". So a long local description silently
// becomes a DIFFERENT artifact on the registry, which is its own drift class: the file
// you review is not the text a user reads. Keep them identical.
const MAX_PUBLISHED = 255;

// project-state.json language_replacements retires these. They were live in shipped
// metadata on 2026-08-20, and one of them survived a description rewrite done with the
// canonical file open, because the rewrite was checking numbers and not wording.
const RETIRED = [
  { from: 'Bayesian reputation', to: 'earned reputation' },
  { from: 'feeless Nano', to: 'wallet binding' },
];

const FORBIDDEN = [
  { name: 'semver',      re: /\bv?\d+\.\d+\.\d+/,                       why: 'MCP shipped "Tracks SDK v3.3.0" while depending on 4.4.0' },
  { name: 'test count',  re: /\d[\d,]*\s+tests\b/i,                     why: 'SDK carried "4,361 tests" through three releases of drift' },
  { name: 'tool count',  re: /\d[\d,]*\s+(?:MCP\s+)?tools\b/i,          why: 'MCP shipped 5.0.0 whose description still said 150 tools' },
  { name: 'module count',re: /\d[\d,]*\s+(?:protocol\s+)?modules\b/i,   why: 'same class, different noun' },
  { name: 'benchmark',   re: /\d+\s*(?:ns|ms|µs)\b/i,                   why: 'hardware figures go stale silently and cannot be corrected without a release' },
];

let failed = 0;
for (const t of TARGETS) {
  const desc = t.read();
  if (!desc) { console.log(`FAIL  ${t.label}: no description found`); failed++; continue; }
  const hits = FORBIDDEN.filter(r => r.re.test(desc));
  if (desc.length > MAX_PUBLISHED) {
    hits.push({ name: 'over 255 chars', re: null,
      why: `npm publishes only the first ${MAX_PUBLISHED}; this is ${desc.length}, so the published text would be a different string` });
  }
  for (const r of RETIRED) {
    if (desc.includes(r.from)) {
      hits.push({ name: 'retired phrasing', re: null,
        why: `project-state.json language_replacements retires "${r.from}" in favour of "${r.to}"` });
    }
  }
  if (hits.length) {
    failed++;
    console.log(`FAIL  ${t.label}`);
    for (const h of hits) {
      if (h.re) console.log(`        ${h.name}: ${JSON.stringify(desc.match(h.re)[0])}`);
      else console.log(`        ${h.name}`);
      console.log(`        why this rule exists: ${h.why}`);
    }
  } else {
    console.log(`ok    ${t.label}  (${desc.length} chars, no mutable facts)`);
  }
}

console.log(`\n${TARGETS.length - failed} of ${TARGETS.length} descriptions clean`);
if (failed) {
  console.error('\nA mutable fact went back into published metadata.');
  console.error('Put the number in the README instead. It ships in the tarball, renders on');
  console.error('the registry page, and propagates. The description should not need a release');
  console.error('to stay true.');
  process.exit(1);
}
