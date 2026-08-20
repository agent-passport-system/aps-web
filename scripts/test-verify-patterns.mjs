#!/usr/bin/env node
// Regression test for the propagation VERIFY patterns.
//
// Why this exists. Five propagation defects landed on 2026-08-20, and every one
// of them was a pattern that could not see a real drift:
//   - post-deploy-chain counted `server.tool(` after the API moved to registerTool
//   - composite lines moved one token and froze the rest of the line
//   - the SDK README badge had TEST_COUNT written into the PASSING slot
//   - the npm description drifted with no generator owning it
//   - the verify pass could not see "N MCP tools", only the bare "N tools"
//
// The last one was found by hand: inject a stale value into a skill file, run the
// propagator, watch nothing get reported. A manual probe proves the fix once and
// prevents nothing. This file makes the probe permanent.
//
// The rule these encode: a verify pattern must model MEANING, not FORMATTING.
// If a human reading the line would call the number stale, the pattern must too.
//
// Run: node scripts/test-verify-patterns.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(resolve(HERE, 'propagate.mjs'), 'utf8');

// Lift the REAL getVerifyPatterns out of the propagator and evaluate it, so this
// test exercises the shipped implementation rather than a copy that can drift.
// It is not imported because propagate.mjs runs a full scan on import; making it
// importable needs an export plus a main-module guard, which is the proper fix and
// is queued rather than done at the tail of a long session. Recorded so the next
// reader knows this is second best and why.
function extractFunction(name) {
  const start = SRC.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`${name} not found in propagate.mjs`);
  let i = SRC.indexOf('{', start), depth = 0;
  for (let j = i; j < SRC.length; j++) {
    if (SRC[j] === '{') depth++;
    else if (SRC[j] === '}' && --depth === 0) return SRC.slice(start, j + 1);
  }
  throw new Error(`unbalanced braces in ${name}`);
}

const getVerifyPatterns = new Function(
  `${extractFunction('getVerifyPatterns')}; return getVerifyPatterns;`
)();

function matches(variable, text) {
  const pats = getVerifyPatterns(variable) || [];
  if (!pats.length) throw new Error(`no verify patterns returned for ${variable}`);
  return pats.some(({ regex }) => { regex.lastIndex = 0; return regex.test(text); });
}

const CASES = [
  // [variable, sample line, must be seen, why it is in this list]
  ['TEST_COUNT', 'carrying 4,098 tests including 38 adversarial scenarios', true,
    'comma-grouped count in prose, the shape the skills carried'],
  ['TEST_COUNT', 'tests-4499%20passing%20%2F%204500-brightgreen', true,
    'shields.io badge, the Day-128 gap'],
  ['MCP_TOOL_COUNT', 'Full surface area: 107 modules, 150 tools', true,
    'bare form, always covered'],
  ['MCP_TOOL_COUNT', 'Full surface area (107 modules, 150 MCP tools)', true,
    'THE 2026-08-20 GAP: invisible to verify until the MCP variant was added'],
  ['MCP_TOOL_COUNT', 'a 20-tool profile for slim installs', false,
    'hyphenated adjective, must NOT match'],
  ['LAYER_COUNT', 'across 107 protocol modules', true, 'documented phrase'],
  ['LAYER_COUNT', 'across 32 v2 modules', false,
    'bare "N modules" deliberately unmatched, it collides with subset counts'],
];

let failed = 0;
for (const [variable, sample, expected, why] of CASES) {
  const got = matches(variable, sample);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${variable.padEnd(16)} ${expected ? 'sees' : 'ignores'}: ${JSON.stringify(sample).slice(0, 62)}`);
  if (!ok) console.log(`      ${why}`);
}

console.log(`\n${CASES.length - failed} of ${CASES.length} pattern cases correct`);
if (failed) {
  console.error('\nA verify pattern stopped seeing a drift shape it used to see.');
  console.error('Do not relax the test. Fix the pattern in getVerifyPatterns().');
  process.exit(1);
}
