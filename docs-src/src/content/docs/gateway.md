---
title: The gateway
description: What the open source gateway evaluates and signs, what it leaves to the deployment, and how to build and run it.
---

The SDK gives you the primitives. The open source gateway runs them as an authenticated HTTP service: a caller submits a requested action, and the gateway returns a permit or deny decision against the presented delegation, revocation state and configured policy.

A decision is only a gate when the gateway, or code that obeys its decision, is the only path to the resource. The gateway refuses nothing that never reaches it. An agent that holds its own credentials for the resource can bypass it. Keeping resource credentials behind the boundary is part of the deployment.

The hosted gateway is a separate product. Nothing on this page describes what a hosted deployment does. For that, contact [signal@aeoess.com](mailto:signal@aeoess.com).

## Integration contract at commit 2dad6916

Everything in this section describes the public source at commit [`2dad6916`](https://github.com/agent-passport-system/agent-passport-gateway/tree/2dad6916765d3fbaeb805b3b3894892803e47986), version 0.4.1. The responses are from one run of [`drive.mjs`](https://github.com/agent-passport-system/aps-web/blob/main/docs-src/examples/gateway-contract/drive.mjs) against a local build of that commit with a fresh SQLite database, on 28 October 2026. Identifiers and timestamps change on every run. The full output is in `run-output.txt` beside the script.

The gateway's lockfile resolves `agent-passport-system` 3.3.1, not 8.0.1. Its delegations are rows in its own database, and the current `AuthorityDelegationV1` record is not among the formats it reads.

### Authentication and tenant bootstrap

Every `/api/v1` route except signup sits behind an API key. Without one, `POST /api/v1/evaluate` answers HTTP 401:

```json
{
  "error": "Missing API key. Use: Authorization: Bearer aps_live_..."
}
```

`POST /api/v1/signup` with `{"name": ..., "email": ...}` creates a tenant on the free plan and returns its `api_key` once. Send it as `Authorization: Bearer <api_key>`. A tenant whose email matches `GATEWAY_OPERATOR_EMAIL` is given the `admin` role by a migration that runs at startup, so the run restarts the gateway once after signup.

The gateway signs deny receipts with its own Ed25519 key. It generates that key on first start and stores the private key as hex in the `gateway_identity` table of its database. The public key is served at `/.well-known/jwks.json` with `kid` `gateway-v1`.

### Agents, roots and delegations

`POST /api/v1/agents` registers an `agent_id` with a `public_key`. An `agent_id` cannot be registered twice in a tenant. Only a designated root may grant authority that does not narrow an existing delegation. Before the designation, a grant is refused:

```json
{
  "error": "Delegation rejected: the parent has no inbound delegation and is not a designated root. Only a designated root (agents.is_root=1) may grant a fresh-budget delegation."
}
```

`POST /api/v1/root-designations` with `{"agent_id": "docs-principal"}` requires the admin role. Then `POST /api/v1/delegations` with

```json
{
  "parent_agent_id": "docs-principal",
  "child_agent_id": "docs-agent",
  "scope": [
    "notes:read"
  ],
  "spend_limit": 10,
  "max_depth": 1
}
```

returns `{"id": ..., "status": "active"}`. Any holder of the tenant's API key can make these calls. The gateway does not ask the principal or the agent to sign the delegation or the evaluation request. The registered public keys are not used on these routes.

### Evaluate

`POST /api/v1/evaluate` takes `agent_id`, `action_type` and `scope_required`, and optionally `action_target`, `estimated_cost`, `action_args`, `workflow_id`, `risk_tier` and freshness evidence under `freshness`. The response for an action inside the delegation:

```json
{
  "evaluation_id": "3acf5b66-3fc5-427b-b19e-c0aecab84331",
  "verdict": "permit",
  "reason": "Permitted: scope \"notes:read\" authorized",
  "recovery": null,
  "freshness": {
    "risk_tier": 0,
    "outcome": "allow",
    "fresh": null,
    "observed_age_seconds": null,
    "reason_code": "freshness_tier0_no_evidence",
    "revocation_mode": "on-accept"
  },
  "duration_ms": 1,
  "agent_id": "docs-agent",
  "action": {
    "type": "read:note",
    "target": "project-x",
    "scope_required": "notes:read"
  },
  "mode": "observe",
  "effective_verdict": "permit",
  "enforced": false,
  "mode_effect": "permit",
  "would_have_been_denied": false,
  "risk": "low"
}
```

Two fields decide what the caller does:

- `verdict` is the policy result. `effective_verdict` is what the mode lets through. A new tenant runs in `observe` mode, and in `observe` an out of scope request comes back with `"verdict": "deny"` and `"effective_verdict": "permit"`, `"would_have_been_denied": true`. Only `PUT /api/v1/modes` with `{"mode": "enforce"}` (or `emergency`, or `approval` for high risk actions) makes `effective_verdict` a `deny`. After that call the same request returned `"effective_verdict": "deny"`, `"enforced": true`, `"mode_effect": "block"`. In `emergency` mode a high risk permit is blocked as well.
- The freshness tier comes from the part of `action_type` before the first colon. `read:note` is tier 0. An unrecognized class is tier 2, which denies when no freshness evidence is supplied. An `action_type` of `notes.read` has no colon, so it is unrecognized, and without freshness evidence it is denied with `freshness_tier2_no_evidence` even inside the delegation.

### What the route signs

Each evaluation stores an evaluation receipt with a SHA-256 `receipt_hash`. `GET /api/v1/receipts/recent` returned these three for the run, fields shortened:

```text
{"verdict":"permit","event_type":"authorization_permit","reason_code":null,"delegation_id":"set","receipt_hash":"set","gateway_signature":null}
{"verdict":"deny","event_type":"authorization_deny","reason_code":"Denied: Scope \"notes:write\" not in [notes:read]","delegation_id":"set","receipt_hash":"set","gateway_signature":"3-part JWS"}
{"verdict":"deny","event_type":"authorization_deny","reason_code":"Denied: Scope \"notes:write\" not in [notes:read]","delegation_id":"set","receipt_hash":"set","gateway_signature":"3-part JWS"}
```

The permit receipt has no signature. Each deny receipt carries a compact JWS. The run checked one against the published key:

```text
header: {"alg":"EdDSA","kid":"gateway-v1","typ":"JWT"}
payload keys: action_type,agent_id,decision_stage,delegation_id,evaluation_id,event_type,policy_hash,reason_code,receipt_hash,schema_version,scope_requested_json,tenant_id,verdict
payload receipt_hash equals stored receipt_hash: true
signature verifies under jwks.json key gateway-v1: true
```

In the source, a signing failure is caught and the receipt is stored without a signature. A deny receipt records that the gateway refused an evaluation. A permit receipt is only the gateway's own database row, and neither shows what happened at the resource.

### Dispatch placement

The evaluate route returns a decision and calls no resource. The caller's dispatcher reads `effective_verdict` and runs the action only on `permit`. The gateway refuses nothing that never reaches it. Replay protection for the action is also the dispatcher's job. The request has no nonce or action reference, and the two identical out of scope requests in the run produced two evaluations.

Other routes may produce different evidence. Check the route you call.

## Agent Passport Gateway

The source is at [agent-passport-system/agent-passport-gateway](https://github.com/agent-passport-system/agent-passport-gateway).

Agent Passport Gateway is a runtime enforcement service for the Agent Passport System (APS). It evaluates requested actions against the presented delegation chain, revocation state and configured policy, then returns a permit or deny decision.

Callers can register agents, issue delegations that narrow scope, spend limit and delegation depth from parent to child, then submit actions for evaluation. The gateway returns a permit or deny decision and can issue signed APS evidence for it.

It uses the Agent Passport System SDK for canonicalization, signature verification and delegation types.

### Requirements

- Node.js 18 or later
- npm

### Install

```sh
npm ci
```

### Configure

```sh
cp .env.example .env
```

Edit `.env` to set `DB_PATH`, which points at `/data/gateway.db` in the example file, and any optional integrations such as Stripe or the Nano payment rail. Only `PORT` and `DB_PATH` are required to run the gateway locally with SQLite.

`GATEWAY_OPERATOR_EMAIL` identifies the tenant that should receive the `admin` role and access to `/api/v1/admin/*`. It is unset by default, so a fresh deployment elevates nobody by email until you configure it.

`GATEWAY_OPERATOR_EMAIL_ALIASES` is an optional comma separated list of additional verified email addresses that should resolve to the same operator tenant.

These settings are used for operator reconciliation. They are not a revocation mechanism. Unsetting `GATEWAY_OPERATOR_EMAIL` later does not remove the `admin` role from a tenant that already has it.

### Build

```sh
npm run build
```

Compiles TypeScript with `tsc` and copies the regulated action runtime assets into `dist/`.

### Run

```sh
npm run dev
```

Runs the server directly from TypeScript source with `tsx`, listening on the `PORT` from `.env` (default `3200`). `GET /healthz` returns the health check, for example `{"status":"ok","service":"aeoess-gateway","version":"0.4.1"}` at commit `2dad6916`.

To run the compiled build:

```sh
npm start
```

### Type check

```sh
npx tsc --noEmit
```

### Test

```sh
npm test
```

Runs the suite with the Node.js test runner.

Install with `npm ci --include=dev`. If your shell sets `NODE_ENV=production`, npm skips devDependencies and tests that need them, such as `test/trust-profile-jws.test.ts`, fail to import.

The build, start, type check and test commands on this page were run against a `git archive` export of commit `2dad6916` with Node.js 24, and each exited 0. The container build and the `deploy/` variants were not run.

### Container build

A `Dockerfile` is included for container builds using `node:22-slim`, with `better-sqlite3` compiled at build time.

The `deploy/` directory contains Terraform, Helm, Docker and air gapped deployment variants for running the gateway in your own infrastructure. See `deploy/README.md`.
