// Runs the examples under docs-src/examples outside the repository and checks the pages
// against them. Each example is copied to a temp directory and installed from its lockfile.
//   governed-action: `npm test`, then every script's output compared with its expected file
//     byte for byte, and every js block on the pages that quote it found verbatim in the source.
//   mcp-authority and cli-verify: `npm test`, which compares the output with expected-output.txt.
// Then the pages are checked against what ran:
//   api.md: every line of every ts block equals a signature the TypeScript checker prints for
//     that export of the installed agent-passport-system.
//   quickstart.md: every {"case" line is a line of expected-output.txt, every json block a
//     substring of it.
//   mcp-server.md: the recipe output block equals mcp-authority/expected-output.txt.
//   cli.md: every command output shown in a text block that starts with "$ npx agent-passport"
//     is a substring of cli-verify/expected-output.txt.
//   gateway.md: every json block equals a request or response recorded in
//     gateway-contract/run-output.txt, and every text block line is a line of it.
// Usage: node docs-src/scripts/run-example.mjs
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const examples = join(root, 'docs-src/examples')
const pages = join(root, 'docs-src/src/content/docs')
const page = (/** @type {string} */ name) => readFileSync(join(pages, name), 'utf8')
const blocks = (/** @type {string} */ text, /** @type {string} */ lang) => [...text.matchAll(new RegExp('^```' + lang + '\\n([\\s\\S]*?)^```', 'gm'))].map(m => m[1])

// NODE_ENV=production makes npm skip dev dependencies, and the typecheck needs them.
const env = { ...process.env }
delete env.NODE_ENV
let failed = 0
const fail = (/** @type {string} */ msg) => { console.log(msg); failed++ }

/** Copy an example to a temp dir, install it from its lockfile, return a runner. */
function install(/** @type {string} */ name) {
  const work = mkdtempSync(join(tmpdir(), `aps-${name}-`))
  cpSync(join(examples, name), work, { recursive: true, filter: src => !src.includes('node_modules') })
  const run = (/** @type {string} */ cmd, /** @type {string[]} */ args) => execFileSync(cmd, args, { cwd: work, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  run('npm', ['ci', '--include=dev', '--no-audit', '--no-fund'])
  return { work, run }
}
function attempt(/** @type {string} */ label, /** @type {() => void} */ fn) {
  try { fn() } catch (e) {
    const err = /** @type {any} */ (e)
    fail(`${label} failed: ${err.message}`)
    if (err.stdout) console.log(err.stdout)
    if (err.stderr) console.log(err.stderr)
  }
}

// governed-action
const ga = join(examples, 'governed-action')
const gaScripts = ['governed-action.mjs', 'run.mjs', 'test.mjs', 'chain.mjs', 'canonicalizers.mjs', 'receipt-axes.mjs', 'host-dispatch.mjs', 'api-errors.mjs']
const gaOutputs = [['run.mjs', 'expected-output.txt'], ['chain.mjs', 'expected-chain.txt'], ['canonicalizers.mjs', 'expected-canonicalizers.txt'],
  ['receipt-axes.mjs', 'expected-receipt-axes.txt'], ['host-dispatch.mjs', 'expected-host-dispatch.txt'], ['api-errors.mjs', 'expected-api-errors.txt']]
/** @type {string | null} */
let gaWork = null
attempt('governed-action', () => {
  const { work, run } = install('governed-action')
  gaWork = work
  const test = run('npm', ['test'])
  console.log('governed-action npm test:', test.split('\n').filter(l => /^ℹ (tests|pass|fail) /.test(l)).join(', '))
  for (const [script, expectedFile] of gaOutputs) {
    const output = run('node', [script])
    if (output === readFileSync(join(work, expectedFile), 'utf8')) console.log(`node ${script}: output matches ${expectedFile}`)
    else fail(`node ${script}: output differs from ${expectedFile}`)
  }
})

// Every js block on these pages must appear verbatim in the governed-action source.
const gaSource = gaScripts.map(f => readFileSync(join(ga, f), 'utf8')).join('\n')
for (const name of ['quickstart.md', 'authority.md', 'signed-bytes.md', 'receipt-verification.md', 'mcp-server.md']) {
  const js = blocks(page(name), 'js')
  const missing = js.filter(b => !gaSource.includes(b))
  console.log(`${name} js blocks: ${js.length}, not found verbatim in the example: ${missing.length}`)
  for (const b of missing) fail('---\n' + b.slice(0, 200))
}

// Quickstart case lines and json blocks come from the run output.
const gaExpected = readFileSync(join(ga, 'expected-output.txt'), 'utf8')
const expectedLines = new Set(gaExpected.split('\n'))
const caseLines = [...page('quickstart.md').matchAll(/^\{"case".*$/gm)].map(m => m[0])
const badLines = caseLines.filter(l => !expectedLines.has(l))
console.log(`quickstart case lines: ${caseLines.length}, not in expected-output.txt: ${badLines.length}`)
failed += badLines.length
const qsJson = blocks(page('quickstart.md'), 'json')
const badJson = qsJson.filter(b => !gaExpected.includes(b))
console.log(`quickstart json blocks: ${qsJson.length}, not in expected-output.txt: ${badJson.length}`)
failed += badJson.length

// api.md signatures, checked with the TypeScript checker in the governed-action install.
attempt('api signatures', () => {
  if (!gaWork) throw new Error('governed-action install missing')
  const sigLines = blocks(page('api.md'), 'ts').flatMap(b => b.split('\n')).filter(Boolean)
  const names = [...new Set(sigLines.map(l => l.split('(')[0]))]
  const script = `
    import ts from 'typescript'
    const entry = new URL('./node_modules/agent-passport-system/dist/src/index.d.ts', import.meta.url).pathname
    const program = ts.createProgram([entry], { strict: true, skipLibCheck: true })
    const checker = program.getTypeChecker()
    const exps = new Map(checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry))).map(s => [s.name, s]))
    for (const n of ${JSON.stringify(names)}) {
      let s = exps.get(n)
      if (!s) { console.log(n + ': NOT EXPORTED'); continue }
      if (s.flags & ts.SymbolFlags.Alias) s = checker.getAliasedSymbol(s)
      for (const sig of checker.getTypeOfSymbolAtLocation(s, s.declarations[0]).getCallSignatures())
        console.log(n + checker.signatureToString(sig, undefined, ts.TypeFormatFlags.NoTruncation))
    }`
  const declared = new Set(execFileSync('node', ['--input-type=module', '-e', script], { cwd: gaWork, encoding: 'utf8' }).split('\n'))
  const wrong = sigLines.filter(l => !declared.has(l))
  console.log(`api.md signature lines: ${sigLines.length}, not matching the 8.0.1 declarations: ${wrong.length}`)
  for (const l of wrong) fail('  ' + l.slice(0, 160))
})
if (gaWork) rmSync(gaWork, { recursive: true, force: true })

// mcp-authority and cli-verify
for (const name of ['mcp-authority', 'cli-verify']) {
  attempt(name, () => {
    const { work, run } = install(name)
    console.log(`${name} npm test: ${run('npm', ['test']).trim().split('\n').pop()}`)
    rmSync(work, { recursive: true, force: true })
  })
}
const mcpExpected = readFileSync(join(examples, 'mcp-authority/expected-output.txt'), 'utf8')
const mcpHas = blocks(page('mcp-server.md'), 'text').includes(mcpExpected)
console.log(`mcp-server.md recipe output block equals mcp-authority/expected-output.txt: ${mcpHas}`)
if (!mcpHas) failed++
const cliExpected = readFileSync(join(examples, 'cli-verify/expected-output.txt'), 'utf8')
const cliRuns = blocks(page('cli.md'), 'text').filter(b => b.startsWith('$ npx agent-passport')).flatMap(b => b.split(/\n\n(?=\$ npx agent-passport)/)).map(b => b.endsWith('\n') ? b : b + '\n')
const cliBad = cliRuns.filter(b => !cliExpected.includes(b))
console.log(`cli.md command outputs: ${cliRuns.length}, not in cli-verify/expected-output.txt: ${cliBad.length}`)
failed += cliBad.length

// gateway.md excerpts against the recorded gateway run.
const gwRun = readFileSync(join(examples, 'gateway-contract/run-output.txt'), 'utf8')
const gwRecorded = [...gwRun.matchAll(/^(?:request|response \d+): (.*)$/gm)].map(m => JSON.stringify(JSON.parse(m[1])))
const gwLines = new Set(gwRun.split('\n'))
const gwPage = page('gateway.md')
const gwSection = gwPage.slice(gwPage.indexOf('## Integration contract'), gwPage.indexOf('## Agent Passport Gateway'))
const gwJson = blocks(gwSection, 'json')
const gwJsonBad = gwJson.filter(b => !gwRecorded.includes(JSON.stringify(JSON.parse(b))))
const gwText = blocks(gwSection, 'text').flatMap(b => b.split('\n')).filter(Boolean)
const gwTextBad = gwText.filter(l => !gwLines.has(l))
console.log(`gateway.md json blocks: ${gwJson.length}, not recorded in run-output.txt: ${gwJsonBad.length}. text lines: ${gwText.length}, not in run-output.txt: ${gwTextBad.length}`)
failed += gwJsonBad.length + gwTextBad.length

process.exit(failed ? 1 : 0)
