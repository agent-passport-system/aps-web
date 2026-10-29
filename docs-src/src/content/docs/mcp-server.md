---
title: MCP server
description: Install and configure the APS MCP server locally or over SSE, choose a tool profile, and see what it reads, writes and contacts.
---

The MCP server exposes APS functions as MCP tools. With the default profile, `tools/list` returns 154 tools. The current release is agent-passport-system-mcp 8.1.0 on [npm](https://www.npmjs.com/package/agent-passport-system-mcp), which runs on Node.js 20 or later and depends on agent-passport-system 8.0.1. The source is at [agent-passport-system/agent-passport-mcp](https://github.com/agent-passport-system/agent-passport-mcp).

Exposing a tool to an agent does not place a check in front of other tools the agent can call. To gate calls to an MCP server you do not control, the host has to check authority before it dispatches `tools/call`. See [Host pre-dispatch authorization](#host-pre-dispatch-authorization).

## Local install

The local server runs over stdio on your machine.

```bash
npm install agent-passport-system-mcp@8.1.0
npx agent-passport-system-mcp setup
```

`setup` adds an `agent-passport` entry to the Claude Desktop and Cursor configuration files in your home directory. Restart the client afterwards.

## Manual config

If setup does not detect your client, add this to your MCP config file:

```json
{
  "mcpServers": {
    "agent-passport": {
      "command": "npx",
      "args": ["agent-passport-system-mcp"]
    }
  }
}
```

## Hosted endpoint

`npx agent-passport-system-mcp setup --remote` writes `"type": "sse"` and `"url": "https://mcp.aeoess.com/sse"` into the client configuration, with no credentials. The [remote server README](https://github.com/agent-passport-system/agent-passport-remote-mcp/blob/b0cfb7f055fa9e6f65c18c51fb121ff1b326bbc7/README.md) at commit `b0cfb7f` says the hosted endpoint is temporarily restricted while the deployment is updated, that anonymous connections return HTTP 401, and that self-hosting is unaffected. Its self-hosted server takes an optional `API_KEY`. Use the local server.

## Profiles

The default profile is `full`, all 154 tools. `APS_PROFILE=essential` registers 28 tools. The counts are what `tools/list` returned for each profile, and both include `list_profiles`.

Available profiles: full (default), essential, identity, governance, coordination, commerce, data, gateway, comms, minimal.

A profile decides which tools the server registers. `list_tools_for_scope` returns the tools that match the scope strings you pass it. Both choose what a client sees. Neither one authorizes a call.

The 154 includes tools that only return a migration notice. `commerce_preflight` returns `isError: true` with `"error": "commerce_preflight_moved_to_gateway"`, and the Gateway group below is removed and returns migration notices too.

## Current authority: issue, check, revoke, check

`create_delegation` and `verify_delegation` work on the legacy `Delegation` format. `verify_delegation` does not consult revocation, and `revoke_delegation` refuses a legacy record. To get a revocable record, use `issue_authority_delegation`, which signs an `AuthorityDelegationV1` with the server's key.

The sequence:

1. `identify` with `public_key` and `private_key`. The server holds that key pair for the session and uses it as the issuer key.
2. `issue_authority_delegation`:

```json
{ "subject": "did:example:agent", "grants": ["notes:read:*"], "spend_unit": "example:credit", "spend_per_action": 5, "spend_cumulative": 10 }
```

The response carries the signed record under `delegation`. Its `issuer` is `aps:ed25519:<the server's public key>`, its validity window is one hour by default (`ttl_hours`), and the server tracks its ID in an in-memory revocation store. Keep the record. The server stores only its revocation status.

3. `check_authority_delegation` with `{ "delegation": <the record> }`.
4. `revoke_delegation` with `{ "delegation": <the record>, "reason_code": "task_complete" }`. It returns a signed `AuthorityRevocationV1` under `revocation`.
5. `check_authority_delegation` again.

The program `recipe.mjs` in [`docs-src/examples/mcp-authority/`](https://github.com/agent-passport-system/aps-web/tree/main/docs-src/examples/mcp-authority) runs these calls from an MCP client against agent-passport-system-mcp 8.1.0 over stdio, then a legacy revoke, a restart and an issue in remote mode. It prints only the fields that do not change between runs. Its output:

```text
tools/list, default profile: 154
tools/list, APS_PROFILE=essential: 28
commerce_preflight: {"isError":true,"error":"commerce_preflight_moved_to_gateway"}
issue_authority_delegation arguments: {"subject":"did:example:agent","grants":["notes:read:*"],"spend_unit":"example:credit","spend_per_action":5,"spend_cumulative":10}
issued: {"record_type":"aps:authority-delegation:v1","issuer_is_server_key":true,"delegation_id_form":true,"validity_ms":3600000,"spend":{"mode":"bounded","unit":"example:credit","per_action":"5","cumulative":"10"}}
check before revoke: {"issued_by_this_server":true,"state":"valid","valid":true,"failures":[]}
revoke_delegation: {"record_type":"aps:authority-revocation:v1","inserted":true,"verification":"valid"}
check after revoke: {"issued_by_this_server":true,"state":"invalid","valid":false,"failures":["REVOKED"]}
revoke_delegation on a legacy id: {"isError":true,"text":"Refused: this is a legacy delegation (create_delegation / sub_delegate, id del_...)"}
check in the issuing process: {"issued_by_this_server":true,"state":"valid","valid":true,"failures":[]}
check after a restart, same key: {"issued_by_this_server":true,"state":"indeterminate","valid":false,"failures":["REVOCATION_UNKNOWN"]}
issue with MCP_REMOTE=1: {"isError":true,"text":"Refused: issue_authority_delegation runs only on a local (stdio) server"}
```

What the output shows:

- `issue_authority_delegation` runs only on a local server. With `MCP_REMOTE=1` or `MCP_TRANSPORT=sse` it refuses.
- The revocation store is process memory. After a restart, checking the same record with the same key gives `indeterminate` with `REVOCATION_UNKNOWN`. A restart never turns an unknown status into `valid`.
- `revoke_delegation` on a legacy ID (`del_...`) from `create_delegation` is refused.
- The process store is not shared. Another verifier learns of a revocation only if you give it the `AuthorityRevocationV1` record.

## Host pre-dispatch authorization

The SDK's `aps-mcp-1` profile is how a host checks an APS authorization before it dispatches an MCP `tools/call`. It is specified in [`MCP-AUTHORIZATION-PROFILE.md`](https://github.com/agent-passport-system/agent-passport-system/blob/f95c9168187cbac0493099fe4a7cddaff653bf39/docs/MCP-AUTHORIZATION-PROFILE.md). The agent signs an `ApsMcpAuthorizationV1` with `issueApsMcpAuthorizationV1`, bound to the server URI, the tool name, a hash of the arguments, the required scope, a nonce and a validity window, and sends it in the request's `_meta` under `org.agent-passport/authorization`. The host wraps its dispatch in `createApsMcpToolCallMiddleware`, which in 8.0.1 runs these steps in order and throws an `ApsMcpAuthorizationError` with a `code` at the first failure:

1. The transport is authenticated. The host says so through `context.transport_authenticated`.
2. The method is `tools/call`.
3. The authorization verifies: shape, signature through the host's `resolve_key` at the authorization's `issued_at`, server, tool, arguments hash, and the time window against the system clock. The middleware takes no clock option.
4. `consume_action_ref` records the authorization's `action_ref`. Returning `false` refuses a replay.
5. `evaluate_authority` makes the host's own authority decision and returns `permit`, `deny` or `indeterminate`. The middleware does not check the delegation chain itself.
6. Only then does it call `dispatch`, and afterwards `emit_receipt`.

The action reference is consumed in step 4, before the authority decision, so an authorization that `evaluate_authority` denies cannot be sent again. The value `emit_receipt` returns is attached to the tool result under the `_meta` key `org.agent-passport/receipt`.

The host owns the replay store, the authority decision and the receipt. Installing this MCP server or choosing a tool profile does not place this check in front of any other server's tools.

This program is `host-dispatch.mjs` in `docs-src/examples/governed-action/`. It uses the Quickstart grant, and its `evaluate_authority` verifies the chain and checks scope:

```js
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
```

Its output with agent-passport-system 8.0.1:

```text
allowed                  {"outcome":"dispatched","tool_called":true,"text":"note project-x"}
replay                   {"outcome":"refused","code":"MCP_ACTION_REPLAY","tool_called":false}
changed arguments        {"outcome":"refused","code":"MCP_ARGUMENTS_MISMATCH","tool_called":false}
no authorization         {"outcome":"refused","code":"MCP_AUTHORIZATION_MALFORMED","tool_called":false}
unauthenticated          {"outcome":"refused","code":"MCP_TRANSPORT_UNAUTHENTICATED","tool_called":false}
out of scope             {"outcome":"refused","code":"SCOPE_NOT_GRANTED","tool_called":false}
tool calls: 1 receipts emitted: ["permit"]
```

The tool ran once. Every refused call threw before `dispatch`, and only the permitted call produced a receipt.

## Tools

The full tool list, grouped by layer with a description of each tool, is in the [MCP server README](https://github.com/agent-passport-system/agent-passport-mcp/blob/ea28a88a51d3760290f97df3dbe94c89d83afcc8/README.md#tools-154). The groups are:

- Meta
- Identity and key rotation
- Delegation and escalation
- Principal identity
- Reputation-gated authority
- Coordination and provisional statements
- Agora and agent messaging
- Governance, charters, provenance, attribution
- Commerce (`commerce_preflight` returns a migration notice)
- Data governance
- Gateway (removed, stubs return a migration notice)
- Intent Network
- Time and reserve attestation
- Attribution weights
- Attribution settlement
- Capability token
- Mutual authentication

Every tool carries MCP annotations. **Read-only** means the tool writes no file, calls no mutating remote endpoint and changes no session state other tools read. **Destructive** means it deletes, revokes, supersedes, overwrites or irreversibly consumes something. **Network** means it can contact an external host. The hint values live in `src/toolAnnotations.ts`.

## Network and local files

The server makes outbound requests only from the tools below. Every other tool works offline.

| Host | Tools | What is sent |
|------|-------|--------------|
| `api.aeoess.com` (override with `INTENT_API_URL`) | `search_matches`, `get_digest` (GET), `request_intro` (POST), `respond_to_intro` (PUT), `remove_intent_card` (DELETE) | The session agent ID and public key as `X-Agent-Id` and `X-Public-Key` headers, plus the tool arguments and a signature where the tool signs |
| `api.github.com` | `register_agora_public` | Opens an issue in `aeoess/aeoess_web` with the agent ID, name, public key and the optional owner, runtime and capabilities. The token comes from the `token` argument, or from the `GITHUB_TOKEN` environment variable when the argument is absent. With no token the tool makes no request and returns a `github.com` URL to open by hand |
| `AEOESS_GATEWAY_URL` (for example `gateway.aeoess.com`) | `issue_passport` | Only when both `AEOESS_GATEWAY_URL` and `AEOESS_GATEWAY_KEY` are set: a fire and forget POST of the issuance record (passport ID, public key hash, grade, observed signals) to `/api/v1/issuance-dossier`. Off by default |

`gateway.aeoess.com` and `aeoess.com` also appear as plain URLs inside some tool responses (the removed gateway stubs and the `latest.json` the Agora writes). The server does not fetch them. `npx agent-passport-system-mcp setup --remote` writes `https://mcp.aeoess.com/sse` into the client config, and the client then tries to connect to that hosted server instead of running this one locally. See [Hosted endpoint](#hosted-endpoint) for its access status.

Local files the server reads or writes, all under the user's home directory unless overridden:

| Path | Tools | Access |
|------|-------|--------|
| `~/.agent-passport-tasks.json` | coordination tools (`create_task_brief`, `assign_agent`, `accept_assignment`, `submit_evidence`, `review_evidence`, `handoff_evidence`, `submit_deliverable`, `complete_task`) | read at startup, written by those tools |
| `AGORA_PATH`, default `~/aeoess_web/agora/messages.json` and `latest.json` beside it | `post_agora_message` | read at startup, written on post |
| `AGENTS_PATH`, default `~/aeoess_web/agora/agents.json` | `list_agents` | read |
| `COMMS_PATH`, default `~/aeoess_web/comms/` | `send_message`, `broadcast`, `check_messages` (writes only with `mark_read`) | read and written |
| `APS_NULLIFIER_DIR`, default `~/.agent-passport-nullifiers/` | `aps_capability_sign_effect` | SHA-256 hashes identifying consumed tokens, with redemption timestamps. Raw preimages are not stored. Written on redemption |
| Claude Desktop and Cursor MCP config files | the `setup` command, not a tool | adds the `agent-passport` server entry |

Keys are never written to disk by the server. `identify` holds the agent key pair in process memory for the session, and `AGENT_KEY` / `AGENT_PRIVATE_KEY` supply it from the environment. `generate_keys`, `issue_passport` and `rotate_key` return private keys in the tool response, and `generate_keys` and `issue_passport` redact them when the server runs in remote mode. `create_principal` keeps the principal key in memory and returns the full private key once on a local (stdio) server, redacted in remote mode as in `generate_keys`. It refuses to replace an existing principal unless called with `replace=true`. Many signing tools take a private key as an argument and use it for that call only. Session state (delegations, endorsements, charters, intents) lives in memory and is lost on restart.

## Related: agent-passport-access-shim

Adapter that emits a signed AccessReceipt for each governed MCP `tools/call`: [agent-passport-access-shim on npm](https://www.npmjs.com/package/agent-passport-access-shim). Receipts verify with the SDK or in the browser at [agent-passport.org/verify.html](https://agent-passport.org/verify.html).
