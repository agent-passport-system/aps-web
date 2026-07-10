// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
//
// Builds assets/verify.js: an offline, browser-side evidence-bundle inspector
// bundled FROM the published SDK (agent-passport-system@3.3.1). The APS
// verification is the SDK's own verifyEvidenceBundle + computeClaimBoundaryReport,
// unchanged; only node:crypto is aliased to a browser shim (SHA-256 + Ed25519
// via @noble), and Buffer is injected.
//
// This tooling is LOCAL-ONLY. aps-web gitignores package.json + node_modules;
// the committed artifacts are src-verify/, this script, and assets/verify.js.
// Reinstall before running:
//   npm i -D esbuild@^0.28.1 @noble/ed25519@^2 @noble/hashes@^1 buffer@^6 agent-passport-system@3.3.1
//   node scripts/build-verify.mjs
//
// Deep-imports the SDK's evidence-bundle dist file by absolute path so we bundle
// ONLY the verify subtree (crypto-only node deps), not the whole index graph
// (which reaches node:fs via unrelated modules). The path is aliased to the
// bare specifier `aps-sdk/evidence-bundle` used by src-verify/index.js.

import { build } from 'esbuild'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// The published SDK's compiled verifier. Its "exports" map is import-only and
// blocks resolving package.json/deep subpaths, so reference the installed
// package directory directly (agent-passport-system is a top-level dep).
const sdkPkgDir = path.join(root, 'node_modules/agent-passport-system')
const sdkEvidenceBundle = path.join(sdkPkgDir, 'dist/src/core/evidence-bundle.js')
if (!fs.existsSync(sdkEvidenceBundle)) {
  throw new Error(`SDK evidence-bundle dist not found at ${sdkEvidenceBundle}`)
}

const shim = path.join(root, 'src-verify/node-crypto-shim.js')
const bufferInject = path.join(root, 'src-verify/buffer-inject.js')

const sdkVersion = JSON.parse(
  fs.readFileSync(path.join(sdkPkgDir, 'package.json'), 'utf8'),
).version

await build({
  entryPoints: [path.join(root, 'src-verify/index.js')],
  outfile: path.join(root, 'assets/verify.js'),
  bundle: true,
  format: 'iife',
  globalName: 'APSVerify',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  legalComments: 'none',
  banner: {
    js: `/* APS evidence-bundle inspector. Bundled from agent-passport-system@${sdkVersion}. */`,
  },
  alias: {
    'aps-sdk/evidence-bundle': sdkEvidenceBundle,
    // The verify path's only node built-in is crypto; alias both spellings.
    'node:crypto': shim,
    crypto: shim,
  },
  inject: [bufferInject],
})

console.log(`built assets/verify.js from agent-passport-system@${sdkVersion}`)
