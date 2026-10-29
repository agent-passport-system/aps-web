// Runs docs-src/examples/governed-action outside the repository: copies it to a temp
// directory, installs from its lockfile, runs `npm test`, then runs `node run.mjs` and
// compares the output with expected-output.txt byte for byte. It also checks that every
// js block on the Quickstart page is a verbatim excerpt of the example source.
// Usage: node docs-src/scripts/run-example.mjs
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const src = join(root, 'docs-src/examples/governed-action')
const work = mkdtempSync(join(tmpdir(), 'aps-governed-action-'))
const files = ['governed-action.mjs', 'run.mjs', 'test.mjs', 'package.json', 'package-lock.json', 'tsconfig.json', 'expected-output.txt']
for (const f of files) cpSync(join(src, f), join(work, f))

// NODE_ENV=production makes npm skip dev dependencies, and the typecheck needs them.
const env = { ...process.env }
delete env.NODE_ENV
const run = (cmd, args) => execFileSync(cmd, args, { cwd: work, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })

let failed = 0
try {
  run('npm', ['ci', '--include=dev', '--no-audit', '--no-fund'])
  const test = run('npm', ['test'])
  const summary = test.split('\n').filter(l => /^ℹ (tests|pass|fail) /.test(l))
  console.log('npm test:', summary.join(', '))
  const output = run('node', ['run.mjs'])
  const expected = readFileSync(join(work, 'expected-output.txt'), 'utf8')
  if (output === expected) console.log('node run.mjs: output matches expected-output.txt')
  else { console.log('node run.mjs: output differs from expected-output.txt'); failed++ }
} catch (e) {
  console.log(`example failed: ${e.message}`)
  if (e.stdout) console.log(e.stdout)
  if (e.stderr) console.log(e.stderr)
  failed++
}

// Every js block on the Quickstart must appear verbatim in the example source.
const page = readFileSync(join(root, 'docs-src/src/content/docs/quickstart.md'), 'utf8')
const source = ['governed-action.mjs', 'run.mjs', 'test.mjs'].map(f => readFileSync(join(src, f), 'utf8')).join('\n')
const blocks = [...page.matchAll(/^```js\n([\s\S]*?)^```/gm)].map(m => m[1])
const missing = blocks.filter(b => !source.includes(b))
console.log(`quickstart js blocks: ${blocks.length}, not found verbatim in the example: ${missing.length}`)
for (const b of missing) console.log('---\n' + b.slice(0, 200))
failed += missing.length

// Every text block on the Quickstart that starts with {"case" must be a line of the expected output.
const expectedLines = new Set(readFileSync(join(src, 'expected-output.txt'), 'utf8').split('\n'))
const caseLines = [...page.matchAll(/^\{"case".*$/gm)].map(m => m[0])
const badLines = caseLines.filter(l => !expectedLines.has(l))
console.log(`quickstart case lines: ${caseLines.length}, not in expected-output.txt: ${badLines.length}`)
failed += badLines.length

rmSync(work, { recursive: true, force: true })
process.exit(failed ? 1 : 0)
