// Writes llms/quickstart.txt, llms/api.txt and llms/cli.txt from the docs pages, so the
// machine-readable copies carry the same tested samples as the pages.
// Usage: node docs-src/scripts/build-llms.mjs [--check]
//   --check exits 1 when a written file would differ from the one on disk.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const pages = [
  ['quickstart.md', 'llms/quickstart.txt'],
  ['api.md', 'llms/api.txt'],
  ['cli.md', 'llms/cli.txt'],
  ['compatibility.md', 'llms/compatibility.txt'],
]
const check = process.argv.includes('--check')
let stale = 0

for (const [page, out] of pages) {
  const src = readFileSync(join(root, 'docs-src/src/content/docs', page), 'utf8')
  const front = src.match(/^---\n([\s\S]*?)\n---\n/)
  const title = front?.[1].match(/^title:\s*"?(.*?)"?$/m)?.[1] ?? page
  const description = front?.[1].match(/^description:\s*"?(.*?)"?$/m)?.[1] ?? ''
  const body = src.slice(front ? front[0].length : 0)
    // Site-relative links become absolute so the file reads on its own.
    .replace(/\]\(\/docs\//g, '](https://agent-passport.org/docs/')
    .trim()
  const slug = page.replace(/\.md$/, '')
  const text = [
    `# Agent Passport System: ${title}`,
    '',
    `> ${description}`,
    '',
    `Generated from https://agent-passport.org/docs/${slug}/ by docs-src/scripts/build-llms.mjs. Edit the page, not this file.`,
    '',
    body,
    '',
  ].join('\n')
  const target = join(root, out)
  let current = ''
  try { current = readFileSync(target, 'utf8') } catch {}
  if (current === text) continue
  if (check) { console.log(`stale: ${out}`); stale++ } else { writeFileSync(target, text); console.log(`wrote ${out}`) }
}
// llms-full.txt carries the quickstart body between two markers.
{
  const target = join(root, 'llms-full.txt')
  const full = readFileSync(target, 'utf8')
  const begin = '<!-- BEGIN generated from docs-src/src/content/docs/quickstart.md by docs-src/scripts/build-llms.mjs -->'
  const end = '<!-- END generated -->'
  const i = full.indexOf(begin), j = full.indexOf(end)
  if (i < 0 || j < i) { console.log('llms-full.txt: markers missing'); process.exit(1) }
  const src = readFileSync(join(root, 'docs-src/src/content/docs/quickstart.md'), 'utf8')
  const body = src.replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/\]\(\/docs\//g, '](https://agent-passport.org/docs/')
    .replace(/^## /gm, '### ')
    .trim()
  const next = full.slice(0, i + begin.length) + '\n' + body + '\n' + full.slice(j)
  if (next !== full) {
    if (check) { console.log('stale: llms-full.txt quickstart block'); stale++ } else { writeFileSync(target, next); console.log('wrote llms-full.txt quickstart block') }
  }
}
if (check) console.log(stale ? `${stale} llms file(s) out of date` : 'llms files match the pages')
process.exit(stale ? 1 : 0)
