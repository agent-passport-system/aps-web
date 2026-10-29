// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
//
// Runs the agent-passport binary of agent-passport-system 8.0.1 the way the CLI page shows
// it, in a fresh temp directory with HOME pointed at it, and prints each command, its exit
// code and the lines of its output that do not change between runs.
import { spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { makeBundles } from './make-bundle.mjs'

const modules = new URL('./node_modules', import.meta.url).pathname
const pkgDir = join(modules, 'agent-passport-system')
const bin = join(pkgDir, JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8')).bin['agent-passport'])
const work = mkdtempSync(join(tmpdir(), 'aps-cli-'))
cpSync(new URL('./regulated', import.meta.url), join(work, 'regulated'), { recursive: true })
// The page runs the CLI in a project with the package installed, so the work directory gets one.
symlinkSync(modules, join(work, 'node_modules'))
makeBundles(work)

/** @param {string[]} args @param {(out: string) => string} [pick] @param {string} [display] */
function cli(args, pick = out => out.trim(), display) {
  const r = spawnSync(process.execPath, [bin, ...args], { cwd: work, env: { PATH: process.env.PATH ?? '', HOME: work }, encoding: 'utf8' })
  console.log(`$ npx agent-passport ${display ?? args.map(a => (/\s/.test(a) ? JSON.stringify(a) : a)).join(' ')}`)
  console.log(`exit ${r.status}`)
  const shown = pick(`${r.stdout}${r.stderr}`)
  if (shown) console.log(shown)
  console.log('')
  return r
}
/** @param {RegExp} re */
const lines = re => (/** @type {string} */ out) => out.split('\n').filter(l => re.test(l)).join('\n')

// A local session. Output lines with keys, IDs and dates are left out.
cli(['join', '--name', 'my-agent', '--owner', 'alice', '--no-register'], lines(/Joined/))
cli(['status'], () => '')
cli(['verify', '.passport/agent.json'], lines(/Self-signed passport accepted/))
// An issuer key that never countersigned this passport.
const issuer = '7'.repeat(64)
cli(['verify', '.passport/agent.json', '--trusted-issuer', issuer], lines(/^\s*Issuer:/))
const publicKey = JSON.parse(readFileSync(join(work, '.passport/agent.json'), 'utf8')).publicKey
// The page reads the key with node -p. The printed command shows that form.
cli(['delegate', '--to', publicKey, '--scope', 'code_execution', '--limit', '500'], () => '',
  `delegate --to "$(node -p "require('./.passport/agent.json').publicKey")" --scope code_execution --limit 500`)
cli(['work', '--scope', 'code_execution', '--type', 'implementation', '--summary', 'Built it'], () => '')
cli(['work', '--scope', 'web_search', '--summary', 'Searched'])
cli(['audit', '--floor', 'node_modules/agent-passport-system/values/floor.yaml'], () => '')

// Evidence bundles.
cli(['verify-bundle', 'bundle.json', '--json'])
cli(['verify-bundle', 'bundle.json', '--strict'])
cli(['verify-bundle', 'tampered.json', '--json'])
cli(['verify-bundle', 'wrong-key.json', '--json'])

// Regulated action receipts, from the SDK's aps-regulated-action-v0 conformance vectors.
const disposition = (/** @type {string} */ out) => { const j = JSON.parse(out); return JSON.stringify({ disposition: j.disposition, violations: j.violations, judgment_correctness: j.judgment_correctness }) }
cli(['verify-regulated', '--receipt', 'regulated/v06-receipt.json', '--context', 'regulated/v06-context.json'], disposition)
cli(['verify-regulated', '--receipt', 'regulated/v01-receipt.json', '--context', 'regulated/v01-context.json'], disposition)

rmSync(work, { recursive: true, force: true })
