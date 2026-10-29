---
title: The gateway
description: The enforcement boundary that evaluates each action against delegation and policy, and how to run the open source gateway.
---

The SDK gives you the primitives. The gateway is the enforcement boundary that runs them as a service: it is both judge and executor, evaluating each action against the delegation and policy before it happens and emitting the signed receipt.

The protocol and SDK are open source. The hosted gateway is a separate product for teams that want enforcement, audit evidence, and tenant isolation without running the infrastructure themselves. If that is your situation, get in touch at [signal@aeoess.com](mailto:signal@aeoess.com).

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

Edit `.env` to set `DB_PATH` and any optional integrations such as Stripe or the Nano payment rail. Only `PORT` and `DB_PATH` are required to run the gateway locally with SQLite.

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

Runs the server directly from TypeScript source with `tsx`, listening on the `PORT` from `.env` (default `3200`). `GET /healthz` returns the health check.

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

### Container build

A `Dockerfile` is included for container builds using `node:22-slim`, with `better-sqlite3` compiled at build time.

The `deploy/` directory contains Terraform, Helm, Docker and air gapped deployment variants for running the gateway in your own infrastructure. See `deploy/README.md`.
