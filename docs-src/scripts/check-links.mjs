// Internal link check for the built docs. Reads every docs/**/*.html, takes each
// href and src that is root relative or relative, and checks the target file exists
// under the site root. Writes distinct external URLs to aps-docs-external-urls.txt in the OS temp dir.
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync } from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const docsRoot = join(siteRoot, 'docs')

const files = []
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (p.endsWith('.html')) files.push(p)
  }
}
walk(docsRoot)

const external = new Set()
const broken = []
let checked = 0
for (const file of files) {
  const html = readFileSync(file, 'utf8')
  for (const [, attr, raw] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    const url = raw.replaceAll('&amp;', '&')
    if (/^https?:\/\//.test(url)) { if (attr === 'href') external.add(url.split('#')[0]); continue }
    if (/^(mailto:|data:|javascript:|#)/.test(url) || url === '') continue
    const path = decodeURIComponent(url.split('#')[0].split('?')[0])
    if (path === '') continue
    let target = path.startsWith('/') ? join(siteRoot, path) : resolve(dirname(file), path)
    if (path.endsWith('/')) target = join(target, 'index.html')
    else if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html')
    checked++
    if (!existsSync(target)) broken.push(`${relative(siteRoot, file)}: ${attr}="${raw}"`)
  }
}
writeFileSync(join(tmpdir(), 'aps-docs-external-urls.txt'), [...external].sort().join('\n') + '\n')
console.log(`html files: ${files.length}`)
console.log(`internal links checked: ${checked}`)
console.log(`broken: ${broken.length}`)
for (const b of broken) console.log(`  ${b}`)
console.log(`distinct external urls: ${external.size}`)
process.exit(broken.length ? 1 : 0)
