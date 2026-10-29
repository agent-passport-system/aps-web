---
title: The gateway
description: What the open source gateway evaluates and signs, what it leaves to the deployment, and how to build and run it.
---

The SDK gives you the primitives. The open source gateway runs them as an authenticated HTTP service: a caller submits a requested action, and the gateway returns a permit or deny decision against the presented delegation, revocation state and configured policy.

A decision is only a gate when the gateway, or code that obeys its decision, is the only path to the resource. The gateway refuses nothing that never reaches it. An agent that holds its own credentials for the resource can bypass it. Keeping resource credentials behind the boundary is part of the deployment.

The hosted gateway is a separate product. Nothing on this page describes what a hosted deployment does. For that, contact [signal@aeoess.com](mailto:signal@aeoess.com).

## What the public evaluate route signs

These statements describe the public source at commit [`2dad6916`](https://github.com/agent-passport-system/agent-passport-gateway/tree/2dad6916765d3fbaeb805b3b3894892803e47986):

- `POST /api/v1/evaluate` is mounted behind the API key middleware. A request without a key gets HTTP 401 with `Missing API key. Use: Authorization: Bearer aps_live_...`.
- Each evaluation stores an evaluation receipt with a SHA-256 `receipt_hash`. The gateway signs that receipt only for a deny decision. For a permit, `gateway_signature` is null. A signing failure is caught and the receipt is stored without a signature.
- The gateway's lockfile resolves `agent-passport-system` 3.3.1, not 8.0.1. Its delegation formats are those of that SDK line, and the current `AuthorityDelegationV1` record is not among them.

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
