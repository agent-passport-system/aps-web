// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
//
// PARITY GATE: runs the BUILT browser bundle (assets/verify.js) over every demo
// bundle and diffs each axis state + exit classification against the SDK CLI's
// `agent-passport verify-bundle --json`. Byte-identical axis/overall states and
// a consistent exit classification are required. Exits non-zero on any diff.
//
//   node scripts/verify-parity.mjs

import vm from 'node:vm'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { webcrypto } from 'node:crypto'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cli = path.join(root, 'node_modules/agent-passport-system/dist/src/cli/index.js')
const bundlesDir = path.join(root, 'assets/demo-bundles')

// exit_reason -> the process exit code the CLI uses for it.
const EXIT_CODE = {
  ok: 0,
  axis_invalid: 2,
  strict_missing: 2,
  bundle_unreadable: 3,
  manifest_signature_failed: 3,
}

// Load the built IIFE into a sandbox and pull out APSVerify.inspectBundle.
function loadBrowserVerifier() {
  const code = fs.readFileSync(path.join(root, 'assets/verify.js'), 'utf8')
  const sandbox = { TextEncoder, TextDecoder, crypto: webcrypto, console }
  vm.createContext(sandbox)
  vm.runInContext(code, sandbox)
  if (!sandbox.APSVerify || typeof sandbox.APSVerify.inspectBundle !== 'function') {
    throw new Error('browser bundle did not expose APSVerify.inspectBundle')
  }
  return sandbox.APSVerify.inspectBundle
}

function cliReport(file) {
  const r = spawnSync('node', [cli, 'verify-bundle', file, '--json'], { encoding: 'utf8' })
  const json = JSON.parse(r.stdout)
  return { axes: json.axes, overall: json.overall, exit_reason: json.exit_reason, exit_code: r.status }
}

const inspectBundle = loadBrowserVerifier()
const files = fs.readdirSync(bundlesDir).filter(f => f.endsWith('.json')).sort()

let diffs = 0
const rows = []
for (const f of files) {
  const file = path.join(bundlesDir, f)
  const cliR = cliReport(file)
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
  const web = inspectBundle(parsed)
  const webExitCode = EXIT_CODE[web.exit_reason]

  const axisDiff = ['authority', 'action', 'revocation', 'evidence']
    .filter(a => cliR.axes[a] !== web.axes[a])
  const overallDiff = cliR.overall !== web.overall
  const reasonDiff = cliR.exit_reason !== web.exit_reason
  const codeDiff = cliR.exit_code !== webExitCode
  const ok = axisDiff.length === 0 && !overallDiff && !reasonDiff && !codeDiff
  if (!ok) diffs++

  rows.push({
    bundle: f,
    ok,
    cli: `${cliR.axes.authority}/${cliR.axes.action}/${cliR.axes.revocation}/${cliR.axes.evidence} overall=${cliR.overall} reason=${cliR.exit_reason} exit=${cliR.exit_code}`,
    web: `${web.axes.authority}/${web.axes.action}/${web.axes.revocation}/${web.axes.evidence} overall=${web.overall} reason=${web.exit_reason} exit=${webExitCode}`,
    diff: ok ? '' : `axes=[${axisDiff}] overall=${overallDiff} reason=${reasonDiff} code=${codeDiff}`,
  })
}

console.log('axes order: authority/action/revocation/evidence\n')
for (const r of rows) {
  console.log(`${r.ok ? 'MATCH' : 'DIFF '}  ${r.bundle}`)
  console.log(`   CLI: ${r.cli}`)
  console.log(`   WEB: ${r.web}`)
  if (r.diff) console.log(`   >>> ${r.diff}`)
}
console.log(`\n${rows.length} bundles, ${diffs} diffs`)
process.exit(diffs === 0 ? 0 : 1)
