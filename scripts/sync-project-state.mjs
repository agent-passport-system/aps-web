#!/usr/bin/env node
// Copyright 2024-2026 Tymofii Pidlisnyi. Apache-2.0 license. See LICENSE.
// ══════════════════════════════════════════════════════════════════
// sync-project-state.mjs — write a single key into project-state.json
// ══════════════════════════════════════════════════════════════════
// Closes the postversion / postpublish gap exposed in 2026-05-03's
// release sweep: `npm version` updates package.json but does not touch
// project-state.json, which propagate.mjs reads as source-of-truth.
// Without this script in the postversion hook, the next propagate run
// sees cache === source-of-truth (both stale) and short-circuits to
// "All files are up to date!" while npm has already shipped the new
// version.
//
// Argv:
//   argv[2]  key   — one of 'sdk' | 'mcp' | 'python' | 'tests'
//   argv[3]  value — version string for sdk/mcp/python, integer for tests
//
// Behavior:
//   - Read aps-web/project-state.json (located via __dirname).
//   - Map the key to the right slot:
//       sdk    → versions.sdk
//       mcp    → versions.mcp
//       python → versions.python
//       tests  → counts.tests (parseInt)
//   - Idempotent: if the file already carries the value, exit 0 silently
//     with a "no-op" message.
//   - Update `updated` field to today's UTC date (YYYY-MM-DD).
//   - Preserve $comment fields, 2-space indent, trailing newline.
//   - Exit 0 on success; non-zero on bad input or write failure.
//
// Usage from a host repo's package.json:
//   "postversion": "node ../aps-web/scripts/sync-project-state.mjs sdk $npm_package_version"
//
// Python release runner (no postversion hook on pyproject.toml):
//   node aps-web/scripts/sync-project-state.mjs python 2.4.0a3
//
// ══════════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_STATE_PATH = join(__dirname, '..', 'project-state.json')

const VALID_KEYS = new Set(['sdk', 'mcp', 'python', 'tests'])

function todayUtc() {
  return new Date().toISOString().slice(0, 10)
}

function usageAndExit(code) {
  console.error(
    'Usage: sync-project-state.mjs <key> <value>\n' +
      "  key:   one of 'sdk', 'mcp', 'python', 'tests'\n" +
      '  value: version string (sdk/mcp/python) or integer (tests)\n' +
      '\n' +
      'Examples:\n' +
      '  node sync-project-state.mjs sdk 2.6.0-alpha.3\n' +
      '  node sync-project-state.mjs tests 2884',
  )
  process.exit(code)
}

const args = process.argv.slice(2)
if (args.length !== 2) usageAndExit(1)
const [key, rawValue] = args
if (!VALID_KEYS.has(key)) {
  console.error(`sync-project-state: unknown key '${key}'`)
  usageAndExit(1)
}

if (!existsSync(PROJECT_STATE_PATH)) {
  console.error(`sync-project-state: project-state.json not found at ${PROJECT_STATE_PATH}`)
  process.exit(1)
}

const state = JSON.parse(readFileSync(PROJECT_STATE_PATH, 'utf8'))

let currentValue
let nextValue
if (key === 'tests') {
  const parsed = parseInt(rawValue, 10)
  if (!Number.isFinite(parsed) || parsed < 0) {
    console.error(`sync-project-state: 'tests' value must be a non-negative integer, got '${rawValue}'`)
    process.exit(1)
  }
  state.counts ??= {}
  currentValue = state.counts.tests
  nextValue = parsed
  if (currentValue === nextValue) {
    console.log(`sync-project-state: counts.tests already at ${nextValue} — no-op.`)
    process.exit(0)
  }
  state.counts.tests = nextValue
} else {
  // sdk | mcp | python
  if (typeof rawValue !== 'string' || rawValue.length === 0) {
    console.error(`sync-project-state: '${key}' value must be a non-empty string`)
    process.exit(1)
  }
  state.versions ??= {}
  currentValue = state.versions[key]
  nextValue = rawValue
  if (currentValue === nextValue) {
    console.log(`sync-project-state: versions.${key} already at ${nextValue} — no-op.`)
    process.exit(0)
  }
  state.versions[key] = nextValue
}

state.updated = todayUtc()

// Stable formatting: 2-space indent, trailing newline.
const serialized = JSON.stringify(state, null, 2) + '\n'
writeFileSync(PROJECT_STATE_PATH, serialized, 'utf8')

const slot = key === 'tests' ? 'counts.tests' : `versions.${key}`
console.log(
  `sync-project-state: ${slot} ${currentValue ?? '(unset)'} → ${nextValue}; updated=${state.updated}`,
)
