// Route and anchor check for the built docs in docs/.
//   1. Every sidebar slug in astro.config.mjs has a built page.
//   2. Every page under docs-src/src/content/docs has a built page.
//   3. Every <loc> in docs/sitemap-0.xml has a built page, and every built page except
//      404.html is in the sitemap.
//   4. No built file under docs/ is ignored by git, so a commit of the build carries every
//      file. A broad ignore rule once hid docs/specs/index.html this way.
//   5. Every internal link with a #fragment, on every built page, names an id that exists
//      in the target page.
// Usage: node docs-src/scripts/check-routes.mjs
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const docsRoot = join(siteRoot, 'docs')
const base = 'https://agent-passport.org'
const problems = []

const walk = (/** @type {string} */ d) => readdirSync(d).flatMap(f => {
  const p = join(d, f)
  return statSync(p).isDirectory() ? walk(p) : [p]
})
const builtFiles = walk(docsRoot)
const pages = builtFiles.filter(p => p.endsWith('index.html'))
const routeOf = (/** @type {string} */ file) => '/' + relative(siteRoot, dirname(file)) + '/'
const routes = new Set(pages.map(routeOf))
const pageFor = (/** @type {string} */ route) => join(siteRoot, route, 'index.html')

// 1. Sidebar
const config = readFileSync(join(siteRoot, 'docs-src/astro.config.mjs'), 'utf8')
const slugs = [...config.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1])
for (const slug of slugs) {
  const route = slug === 'index' ? '/docs/' : `/docs/${slug}/`
  if (!routes.has(route)) problems.push(`sidebar slug "${slug}" has no built page ${route}`)
}

// 2. Source pages
const sources = readdirSync(join(siteRoot, 'docs-src/src/content/docs')).filter(f => /\.mdx?$/.test(f))
for (const f of sources) {
  const slug = f.replace(/\.mdx?$/, '')
  const route = slug === 'index' ? '/docs/' : `/docs/${slug}/`
  if (!routes.has(route)) problems.push(`source page ${f} has no built page ${route}`)
}

// 3. Sitemap
const sitemap = readFileSync(join(docsRoot, 'sitemap-0.xml'), 'utf8')
const locs = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(base, '')))
for (const loc of locs) if (!routes.has(loc)) problems.push(`sitemap route ${loc} has no built page`)
for (const route of routes) if (!locs.has(route)) problems.push(`built page ${route} is not in docs/sitemap-0.xml`)

// 4. Git ignore
// git check-ignore exits 0 when some path is ignored, 1 when none is, and above 1 on error.
const checkIgnore = spawnSync('git', ['check-ignore', '--no-index', '--stdin'], {
  cwd: siteRoot, input: builtFiles.map(f => relative(siteRoot, f)).join('\n'), encoding: 'utf8',
})
if (checkIgnore.status !== 0 && checkIgnore.status !== 1) problems.push(`git check-ignore failed: ${checkIgnore.stderr}`)
const ignored = checkIgnore.stdout.split('\n').filter(Boolean)
for (const f of ignored) problems.push(`built file ${f} is ignored by git`)

// 5. Anchors
/** @type {Map<string, Set<string>>} */
const ids = new Map()
const idsOf = (/** @type {string} */ file) => {
  if (!ids.has(file)) ids.set(file, new Set([...readFileSync(file, 'utf8').matchAll(/\sid="([^"]+)"/g)].map(m => m[1])))
  return /** @type {Set<string>} */ (ids.get(file))
}
let anchors = 0
for (const file of builtFiles.filter(p => p.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8')
  for (const [, raw] of html.matchAll(/\shref="([^"]*#[^"]*)"/g)) {
    const url = raw.replaceAll('&amp;', '&')
    if (/^(https?:|mailto:)/.test(url)) continue
    const [path, fragment] = url.split('#')
    if (!fragment) continue
    let target = file
    if (path) {
      const p = path.startsWith('/') ? join(siteRoot, path) : resolve(dirname(file), path)
      target = p.endsWith('.html') ? p : join(p, 'index.html')
    }
    if (!target.startsWith(docsRoot)) continue
    anchors++
    if (!existsSync(target)) problems.push(`${relative(siteRoot, file)}: ${raw} points at a missing page`)
    else if (!idsOf(target).has(decodeURIComponent(fragment))) problems.push(`${relative(siteRoot, file)}: ${raw} has no id "${fragment}" in ${relative(siteRoot, target)}`)
  }
}

console.log(`sidebar slugs: ${slugs.length}, source pages: ${sources.length}, built pages: ${routes.size}, sitemap routes: ${locs.size}`)
console.log(`built files checked against .gitignore: ${builtFiles.length}, ignored: ${ignored.length}`)
console.log(`internal links with a fragment: ${anchors}`)
console.log(`problems: ${problems.length}`)
for (const p of problems) console.log(`  ${p}`)
process.exit(problems.length ? 1 : 0)
