#!/usr/bin/env node
// Tell IndexNow engines (Bing and others) which URLs changed.
//
// The key file at the site root proves ownership; it is public by design.
// Run after a deploy has finished, with the changed paths, or with --since
// to take the pages changed by commits since a ref:
//   node scripts/indexnow.mjs /research.html /faq.html
//   node scripts/indexnow.mjs --since HEAD~1
//   add --dry-run to print the request without sending it
// A 200 or 202 response acknowledges receipt only. It is not indexing.

import { readdirSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const HOST = 'agent-passport.org'
const keyFile = readdirSync(root).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (!keyFile) throw new Error('IndexNow key file missing at the site root')
const key = readFileSync(join(root, keyFile), 'utf8').trim()
if (`${key}.txt` !== keyFile) throw new Error('IndexNow key file content does not match its name')

const args = process.argv.slice(2)
const dry = args.includes('--dry-run')
let paths = args.filter((a) => a.startsWith('/'))
const since = args.indexOf('--since')
if (since >= 0) {
  const ref = args[since + 1]
  const changed = execFileSync('git', ['diff', '--name-only', ref, 'HEAD'], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter((f) => f.endsWith('.html') && !f.startsWith('previews/'))
  paths.push(...changed.map((f) => `/${f.replace(/(^|\/)index\.html$/, '$1')}`))
}
paths = [...new Set(paths)]
if (!paths.length) {
  console.log('No URLs to submit.')
  process.exit(0)
}

const body = {
  host: HOST,
  key,
  keyLocation: `https://${HOST}/${keyFile}`,
  urlList: paths.map((p) => `https://${HOST}${p}`),
}
if (dry) {
  console.log(JSON.stringify(body, null, 2))
  process.exit(0)
}
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
})
console.log(`IndexNow ${res.status} for ${body.urlList.length} URL(s)`)
if (res.status !== 200 && res.status !== 202) process.exit(1)
