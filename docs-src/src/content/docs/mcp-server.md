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

The sequence below ran against agent-passport-system-mcp 8.1.0 over stdio, with tool calls sent from an MCP client.

1. `identify` with `public_key` and `private_key`. The server holds that key pair for the session and uses it as the issuer key.
2. `issue_authority_delegation`:

```json
{ "subject": "did:example:agent", "grants": ["notes:read:*"], "spend_unit": "example:credit", "spend_per_action": 5, "spend_cumulative": 10 }
```

The response carries the signed record under `delegation`. Its `issuer` is `aps:ed25519:<the server's public key>`, its validity window is one hour by default (`ttl_hours`), and the server tracks its ID in an in-memory revocation store. Keep the record. The server stores only its revocation status.

3. `check_authority_delegation` with `{ "delegation": <the record> }`, response excerpt:

```text
"issued_by_this_server": true,
"state": "valid",
"valid": true,
"failures": []
```

4. `revoke_delegation` with `{ "delegation": <the record>, "reason_code": "task_complete" }` returns a signed `AuthorityRevocationV1` under `revocation`, with `"inserted": true` and `"verification": "valid"`.
5. `check_authority_delegation` again, response excerpt:

```text
"state": "invalid",
"valid": false,
"failures": [
  {
    "code": "REVOKED",
```

Observed limits of this route:

- `issue_authority_delegation` runs only on a local server. With `MCP_REMOTE=1` or `MCP_TRANSPORT=sse` it returns `Refused: issue_authority_delegation runs only on a local (stdio) server.`
- The revocation store is process memory. After a restart, checking the same record with the same key gave `"state": "indeterminate"` with `REVOCATION_UNKNOWN`. A restart never turns an unknown status into `valid`.
- `revoke_delegation` on a legacy ID (`del_...`) from `create_delegation` returns `Refused: this is a legacy delegation`.
- The process store is not shared. Another verifier learns of a revocation only if you give it the `AuthorityRevocationV1` record.

## Host pre-dispatch authorization

The SDK's `aps-mcp-1` profile describes how a host checks an APS authorization before it dispatches an MCP `tools/call`. The profile is specified in [`MCP-AUTHORIZATION-PROFILE.md`](https://github.com/agent-passport-system/agent-passport-system/blob/f95c9168187cbac0493099fe4a7cddaff653bf39/docs/MCP-AUTHORIZATION-PROFILE.md). Installing this MCP server or choosing a tool profile does not put that check in front of other servers' tools.

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
