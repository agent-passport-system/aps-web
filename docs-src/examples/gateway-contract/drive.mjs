// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
// Drives a local agent-passport-gateway built from commit 2dad6916 through one integration:
// signup, operator elevation, agent registration, root designation, a delegation, then
// /evaluate for a permitted and a denied action in observe and enforce mode, the stored
// evaluation receipts, and a check of the deny receipt's JWS against /.well-known/jwks.json.
// The script starts the gateway as a child process on a fresh database and stops it at the end.
// The printed API key is truncated, and the signup response's `message` text is left out.
// Usage: node drive.mjs <gateway checkout with dist/ built>
import { spawn } from 'node:child_process'
import { createPublicKey, verify } from 'node:crypto'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const gatewayDir = process.argv[2]
const PORT = '3291'
const base = `http://127.0.0.1:${PORT}`
const dbDir = mkdtempSync(join(tmpdir(), 'aps-gateway-'))
const env = { PATH: process.env.PATH, HOME: dbDir, PORT, DB_PATH: join(dbDir, 'gateway.db'), GATEWAY_OPERATOR_EMAIL: 'operator@example.com', CORS_ORIGIN: '*' }

let server
async function start() {
  server = spawn('node', ['dist/server.js'], { cwd: gatewayDir, env, stdio: ['ignore', 'ignore', 'ignore'] })
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${base}/healthz`)).ok) return } catch {}
    await new Promise(r => setTimeout(r, 100))
  }
  throw new Error('gateway did not start')
}
async function stop() { server.kill('SIGTERM'); await new Promise(r => server.once('exit', r)) }

let apiKey = ''
async function call(method, path, body, auth = true) {
  const headers = { 'content-type': 'application/json' }
  if (auth) headers.authorization = `Bearer ${apiKey}`
  const res = await fetch(base + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  return { status: res.status, body: await res.json() }
}
const show = (label, req, res) => {
  console.log(`## ${label}`)
  if (req) console.log('request:', JSON.stringify(req))
  console.log(`response ${res.status}:`, JSON.stringify(res.body, (k, v) => k === 'api_key' ? `${String(v).slice(0, 8)}...(redacted)` : k === 'message' ? undefined : v))
  console.log('')
}

await start()
const health = await call('GET', '/healthz', null, false)
show('GET /healthz', null, health)

const signupReq = { name: 'Docs operator', email: 'operator@example.com' }
const signup = await call('POST', '/api/v1/signup', signupReq, false)
apiKey = signup.body.api_key
show('POST /api/v1/signup', signupReq, signup)

// The operator role is applied by a startup migration, so restart once after signup.
await stop(); await start()

const evalReq = { agent_id: 'docs-agent', action_type: 'read:note', action_target: 'project-x', scope_required: 'notes:read' }
show('POST /api/v1/evaluate without an API key', evalReq, await call('POST', '/api/v1/evaluate', evalReq, false))

const principal = { agent_id: 'docs-principal', public_key: '11'.repeat(32), name: 'Principal' }
const agent = { agent_id: 'docs-agent', public_key: '22'.repeat(32), name: 'Agent' }
show('POST /api/v1/agents (principal)', principal, await call('POST', '/api/v1/agents', principal))
show('POST /api/v1/agents (agent)', agent, await call('POST', '/api/v1/agents', agent))
const delegReq = { parent_agent_id: 'docs-agent', child_agent_id: 'docs-principal', scope: ['notes:read'] }
show('POST /api/v1/delegations from an agent that is not a root', delegReq, await call('POST', '/api/v1/delegations', delegReq))
const rootReq = { agent_id: 'docs-principal' }
show('POST /api/v1/root-designations', rootReq, await call('POST', '/api/v1/root-designations', rootReq))
const grantReq = { parent_agent_id: 'docs-principal', child_agent_id: 'docs-agent', scope: ['notes:read'], spend_limit: 10, max_depth: 1 }
show('POST /api/v1/delegations', grantReq, await call('POST', '/api/v1/delegations', grantReq))

show('GET /api/v1/modes', null, await call('GET', '/api/v1/modes'))
show('POST /api/v1/evaluate, in scope', evalReq, await call('POST', '/api/v1/evaluate', evalReq))
const denyReq = { ...evalReq, scope_required: 'notes:write' }
show('POST /api/v1/evaluate, out of scope, observe mode', denyReq, await call('POST', '/api/v1/evaluate', denyReq))
const modeReq = { mode: 'enforce' }
show('PUT /api/v1/modes', modeReq, await call('PUT', '/api/v1/modes', modeReq))
show('POST /api/v1/evaluate, out of scope, enforce mode', denyReq, await call('POST', '/api/v1/evaluate', denyReq))

const receipts = await call('GET', '/api/v1/receipts/recent')
console.log('## GET /api/v1/receipts/recent, one line per receipt, in the order returned')
for (const r of receipts.body.receipts) {
  console.log(JSON.stringify({ verdict: r.verdict, event_type: r.event_type, reason_code: r.reason_code, delegation_id: r.delegation_id ? 'set' : null, receipt_hash: r.receipt_hash ? 'set' : null, gateway_signature: r.gateway_signature ? `${r.gateway_signature.split('.').length}-part JWS` : null }))
}
console.log('')

// Check one deny receipt's JWS against the gateway's published key.
const jwks = await call('GET', '/.well-known/jwks.json', null, false)
const deny = receipts.body.receipts.find(r => r.gateway_signature)
const [h, p, s] = deny.gateway_signature.split('.')
const key = createPublicKey({ key: jwks.body.keys[0], format: 'jwk' })
const ok = verify(null, Buffer.from(`${h}.${p}`), key, Buffer.from(s, 'base64url'))
const payload = JSON.parse(Buffer.from(p, 'base64url').toString())
console.log('## deny receipt JWS')
console.log('header:', Buffer.from(h, 'base64url').toString())
console.log('payload keys:', Object.keys(payload).sort().join(','))
console.log('payload receipt_hash equals stored receipt_hash:', payload.receipt_hash === deny.receipt_hash)
console.log('signature verifies under jwks.json key', jwks.body.keys[0].kid + ':', ok)

await stop()
