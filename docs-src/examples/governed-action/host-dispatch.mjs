// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
// The aps-mcp-1 host pre-dispatch profile: an MCP host checks an APS authorization
// before it dispatches tools/call. The tool runs only when every check passes.

import {
  APS_MCP_AUTHORIZATION_META, issueApsMcpAuthorizationV1, createApsMcpToolCallMiddleware,
  verifyAuthorityDelegationChain, scopeGrantCovers, InMemoryAuthorityRevocationStore,
  createAuthorityRevocationResolver,
} from 'agent-passport-system'
import { agent, grant, resolveKey } from './governed-action.mjs'

const MCP_SERVER = 'https://notes.example'
const issuedAt = new Date().toISOString()

/** @type {import('agent-passport-system').HistoricalKeyResolver} */
const resolveHistoricalKey = ({ controller, verification_method, at }) => {
  const key = resolveKey(controller, verification_method, at)
  return typeof key === 'string' ? { state: 'resolved', public_key_hex: key } : { state: 'not_found' }
}

const store = new InMemoryAuthorityRevocationStore()
store.track(grant.delegation_id)
const resolveRevocation = createAuthorityRevocationResolver(store, { resolveVerificationKey: resolveKey })

// Host-owned state: consumed action references and emitted receipts.
const consumed = new Set()
/** @type {unknown[]} */
const receipts = []
let toolCalls = 0

const guard = createApsMcpToolCallMiddleware({
  mcp_server: MCP_SERVER,
  resolve_key: resolveHistoricalKey,
  // Single use: the host records the action reference before dispatch.
  consume_action_ref: actionRef => {
    if (consumed.has(actionRef)) return false
    consumed.add(actionRef)
    return true
  },
  // The host's own authority decision: the delegation chain and its scope.
  evaluate_authority: authorization => {
    const chain = authorization.delegation_ref === grant.delegation_id ? [grant] : []
    if (chain.length === 0) return { state: 'deny', code: 'DELEGATION_NOT_HELD' }
    const result = verifyAuthorityDelegationChain(chain, {
      now: '2026-10-28T10:00:00.000Z', resolveVerificationKey: resolveKey,
      trustRoot: root => root.issuer === 'did:example:principal', resolveRevocation,
    })
    if (result.state === 'indeterminate') return { state: 'indeterminate', code: result.failures[0].code }
    if (result.state !== 'valid') return { state: 'deny', code: result.failures[0].code }
    const covered = authorization.scope_required.every(s => grant.authority.scope.grants.some(g => scopeGrantCovers(g, s)))
    return covered ? { state: 'permit', code: 'OK' } : { state: 'deny', code: 'SCOPE_NOT_GRANTED' }
  },
  emit_receipt: (authorization, authority) => { receipts.push({ action_ref: authorization.action_ref, authority: authority.state }) },
})

// The MCP server's tool. Only `guard` calls it.
const dispatch = async (/** @type {import('agent-passport-system').McpToolCallRequest} */ request) => {
  toolCalls += 1
  return { content: [{ type: 'text', text: `note ${request.params.arguments?.id}` }] }
}

/** @param {string} tool @param {Record<string, unknown>} args @param {string} scope @param {string} nonce */
const authorize = (tool, args, scope, nonce) => issueApsMcpAuthorizationV1({
  agent_id: agent.id, verification_method: agent.vm, delegation_ref: grant.delegation_id,
  mcp_server: MCP_SERVER, tool_name: tool, arguments: args, scope_required: [scope], nonce,
  // The middleware checks this window against the system clock and takes no clock option.
  issued_at: issuedAt, expires_at: new Date(Date.parse(issuedAt) + 5 * 60_000).toISOString(),
  private_key_hex: agent.privateKey,
})
/** @param {string} tool @param {Record<string, unknown>} args @param {unknown} authorization */
const request = (tool, args, authorization) => /** @type {import('agent-passport-system').McpToolCallRequest} */ ({
  method: 'tools/call',
  params: { name: tool, arguments: args, ...(authorization ? { _meta: { [APS_MCP_AUTHORIZATION_META]: authorization } } : {}) },
})

/** @param {string} label @param {import('agent-passport-system').McpToolCallRequest} req @param {boolean} authenticated */
async function attempt(label, req, authenticated = true) {
  const before = toolCalls
  try {
    const result = await guard(req, { transport_authenticated: authenticated }, dispatch)
    console.log(label.padEnd(24), JSON.stringify({ outcome: 'dispatched', tool_called: toolCalls > before, text: /** @type {any} */ (result).content[0].text }))
  } catch (e) {
    console.log(label.padEnd(24), JSON.stringify({ outcome: 'refused', code: /** @type {any} */ (e).code ?? /** @type {Error} */ (e).message, tool_called: toolCalls > before }))
  }
}

const args = { id: 'project-x' }
const auth = authorize('notes_read', args, 'notes:read:project-x', '20000000000000000000000000000001')
await attempt('allowed', request('notes_read', args, auth))
await attempt('replay', request('notes_read', args, auth))
await attempt('changed arguments', request('notes_read', { id: 'project-y' }, authorize('notes_read', args, 'notes:read:project-x', '20000000000000000000000000000002')))
await attempt('no authorization', request('notes_read', args, null))
await attempt('unauthenticated', request('notes_read', args, authorize('notes_read', args, 'notes:read:project-x', '20000000000000000000000000000003')), false)
await attempt('out of scope', request('notes_write', args, authorize('notes_write', args, 'notes:write:project-x', '20000000000000000000000000000004')))
console.log('tool calls:', toolCalls, 'receipts emitted:', JSON.stringify(receipts.map(r => /** @type {any} */ (r).authority)))
