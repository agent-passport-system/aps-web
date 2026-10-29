// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
//
// Drives agent-passport-system-mcp 8.1.0 over stdio from an MCP client: tool counts per
// profile, the commerce_preflight migration notice, then the current authority sequence
// identify, issue_authority_delegation, check_authority_delegation, revoke_delegation,
// check_authority_delegation, then a legacy revoke, a restart and a remote-mode issue.
// Each server runs with HOME set to a fresh temp directory. Prints only fields that do not
// change between runs. The fixed key seed is for this example only.
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { publicKeyFromPrivate } from 'agent-passport-system'
import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const server = createRequire(import.meta.url).resolve('agent-passport-system-mcp/build/bin.js')
const home = mkdtempSync(join(tmpdir(), 'aps-mcp-home-'))

/** @param {Record<string, string>} extraEnv */
async function session(extraEnv = {}) {
  const transport = new StdioClientTransport({
    command: process.execPath, args: [server],
    env: { PATH: process.env.PATH ?? '', HOME: home, ...extraEnv }, stderr: 'ignore',
  })
  const client = new Client({ name: 'aps-docs-example', version: '0.0.0' })
  await client.connect(transport)
  /** @param {string} name @param {Record<string, unknown>} args */
  const call = async (name, args) => {
    const r = await client.callTool({ name, arguments: args })
    const text = /** @type {{text: string}[]} */ (r.content).map(c => c.text).join('')
    return { isError: !!r.isError, text }
  }
  return { client, call, close: () => client.close() }
}
/** @param {string} label @param {unknown} value */
const show = (label, value) => console.log(`${label}: ${JSON.stringify(value)}`)

const privateKey = createHash('sha256').update('aps-docs-example-seed:mcp-operator').digest('hex')
const identity = { public_key: publicKeyFromPrivate(privateKey), private_key: privateKey, agent_id: 'docs-operator' }

// Profiles choose which tools are registered.
let s = await session()
show('tools/list, default profile', (await s.client.listTools()).tools.length)
const essential = await session({ APS_PROFILE: 'essential' })
show('tools/list, APS_PROFILE=essential', (await essential.client.listTools()).tools.length)
await essential.close()
const preflight = await s.call('commerce_preflight', { merchant_name: 'example', amount: 1, delegation_id: 'del_x', currency: 'usd', agent_id: 'docs-operator' })
show('commerce_preflight', { isError: preflight.isError, error: JSON.parse(preflight.text).error })

// The current record: issue, check, revoke, check.
await s.call('identify', identity)
const issueArgs = { subject: 'did:example:agent', grants: ['notes:read:*'], spend_unit: 'example:credit', spend_per_action: 5, spend_cumulative: 10 }
console.log('issue_authority_delegation arguments:', JSON.stringify(issueArgs))
const issued = await s.call('issue_authority_delegation', issueArgs)
const delegation = JSON.parse(issued.text).delegation
show('issued', {
  record_type: delegation.record_type,
  issuer_is_server_key: delegation.issuer === `aps:ed25519:${identity.public_key}`,
  delegation_id_form: /^sha256:[0-9a-f]{64}$/.test(delegation.delegation_id),
  validity_ms: Date.parse(delegation.authority.time.not_after) - Date.parse(delegation.authority.time.not_before),
  spend: delegation.authority.spend,
})
/** @param {{text: string}} r */
const state = r => { const j = JSON.parse(r.text); return { issued_by_this_server: j.issued_by_this_server, state: j.state, valid: j.valid, failures: j.failures.map((/** @type {{code: string}} */ f) => f.code) } }
show('check before revoke', state(await s.call('check_authority_delegation', { delegation })))
const revoked = JSON.parse((await s.call('revoke_delegation', { delegation, reason_code: 'task_complete' })).text)
show('revoke_delegation', { record_type: revoked.revocation.record_type, inserted: revoked.inserted, verification: revoked.verification })
show('check after revoke', state(await s.call('check_authority_delegation', { delegation })))

// A legacy delegation cannot be revoked.
const legacy = await s.call('create_delegation', { delegated_to: 'did:example:agent', scope: ['notes:read'] })
const legacyId = (legacy.text.match(/del_[A-Za-z0-9_-]+/) ?? [''])[0]
const legacyRevoke = await s.call('revoke_delegation', { delegation_id: legacyId, reason_code: 'task_complete' })
show('revoke_delegation on a legacy id', { isError: legacyRevoke.isError, text: legacyRevoke.text.split('. ')[0] })

// A second record, then a restart: the in-memory revocation store is gone.
const second = JSON.parse((await s.call('issue_authority_delegation', { subject: 'did:example:agent', grants: ['notes:read:*'], spend_unbounded: true })).text).delegation
show('check in the issuing process', state(await s.call('check_authority_delegation', { delegation: second })))
await s.close()
s = await session()
await s.call('identify', identity)
show('check after a restart, same key', state(await s.call('check_authority_delegation', { delegation: second })))
await s.close()

// Root issuance is local only.
s = await session({ MCP_REMOTE: '1' })
await s.call('identify', identity)
const remote = await s.call('issue_authority_delegation', { subject: 'did:example:agent', grants: ['notes:read:*'], spend_unbounded: true })
show('issue with MCP_REMOTE=1', { isError: remote.isError, text: remote.text.split('. ')[0] })
await s.close()
rmSync(home, { recursive: true, force: true })
