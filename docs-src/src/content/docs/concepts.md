---
title: Core concepts
description: Identity, delegation, enforcement, commerce and reputation in APS, with the status label of each.
---

The protocol rests on a single rule: authority can only decrease at each transfer point. A login authorizes a session. APS authorizes a specific action, at a specific time, under a specific policy, for a specific principal.

The gateway is both judge and executor. Authority can only decrease at each transfer point.

## Identity

Status: [Canonical](/docs/evidence/#status-labels).

Ed25519 passports with grades 0 to 3, key rotation, and did:aps identifiers. APS also accepts did:key, did:web, SPIFFE SVIDs, and OAuth tokens, including a verifier-first binding for the IETF ID-JAG draft, the grant layer under Okta's Cross-App Access, so an agent can carry the identity your stack already issues.

## Delegation

Status: [Canonical](/docs/evidence/#status-labels).

Scoped authority with monotonic narrowing. Sub-delegation can only reduce scope, never add to it. Cascade revocation propagates through the full chain, so revoking a parent authority invalidates everything derived from it.

## Enforcement

Status: [Canonical](/docs/evidence/#status-labels).

A three signature action chain: the agent signs the intent, the policy engine signs the evaluation, the agent signs the execution receipt. Because the evaluation sits between intent and execution, the agent cannot act without being checked.

## Commerce

Status: [Production-Extension](/docs/evidence/#status-labels).

A five gate preflight for payments: valid passport, scope check, spend limit, merchant allowlist, and idempotency, with configurable human approval thresholds above a value you set.

## Reputation

Status: [Production-Extension](/docs/evidence/#status-labels).

Bayesian trust scoring across five tiers. Authority is earned per scope, not globally, and passport grades compound with behavioral history.
