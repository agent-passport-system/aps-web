---
id: "day-48"
title: "Day 48: Six Sessions, One Shipping Day"
date: "2026-04-05"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 48: Six Sessions, One Shipping Day

Five independent review models attacked the specs before a single line shipped. Six build sessions, executed sequentially. Every session depends on what the previous one deployed. Gateway auto-deploys on push. No staging environment. The verification script is the only safety net.

**Key rotation (Session 1).** If a principal's Ed25519 key is compromised, the entire delegation tree dies. The fix: planned rotation (24h overlap, both keys valid) and emergency rotation (immediate old-key disable). DID Document with `retiredAt` metadata on old keys. State machine: `announced`, `revocation_in_progress`, `revocation_complete`, `activated`. Partial revocation failure is visible, not hidden. The independent review was unanimous: SDK computes, gateway MUST enforce. A compromised key controls the client. Server-side activation timing is the hard enforcement.

**Auto-mint receipts (Session 2).** Gateway had 202 evaluations. Zero receipts. Data lifecycle thesis unproven. The fix: every evaluation now mints a cryptographic receipt. `authorization_permit` and `authorization_deny`. The gateway proves what was AUTHORIZED, not what HAPPENED. Scope stored as sorted JSON array, not comma-joined string. Policy hash, not hardcoded version label. Backfilled all 202 historical evaluations on first deploy.

**Audit packets (Session 3).** One receipt, one exportable proof chain. `decision_record` is signed by the gateway (immutable, stable signature across calls). `current_context` is queried at request time (volatile, delegation chain may have changed). Completeness metadata tells the verifier if any sub-query failed. Markdown format option for human review. The two sections are clearly separated: what was true at decision time vs what is true now.

**Agent posture overlay (Session 4).** Binary revoke/not-revoke is too crude. Three states: active, restricted, suspended. The independent review killed the original design: DO NOT put degradation on the passport. The passport is an immutable signed credential. A rogue agent won't sign its own suspension. Posture lives in the gateway DB only. Gateway checks status before delegation scope. Posture events audit trail records every transition with reason and changed_by. Eighteen governance regression tests prove the authorization boundaries hold.

**Governance evidence export (Session 5).** Nine sections, single signed artifact. Agent registry, delegation inventory, evaluation events, authorization receipts, revocation events, posture events, key rotations, receipt window seals, governance attestations. Sections with zero data show `total: 0`. That's honest, not broken. Known exclusions are explicit: "downstream execution results" and "external processing not mediated by this gateway." Not a compliance report. A governance evidence export.

**Trust bootstrap adapters (Session 5).** `bootstrapFromAPIKey`, `bootstrapFromGitHub`, `bootstrapFromCIKey`. Every adapter creates a fresh Ed25519 keypair. The external credential is a trust input, not the identity. Raw credentials never touch the SDK (caller pre-hashes with HMAC-SHA256). Suggested grade is a suggestion. Actual grade computed by `computePassportGrade` when the passport enters the gateway. Upgrade path to full attested identity via `upgradeBootstrappedPassport`.

**Delegation linting + receipt seals (Session 6).** Two gateway-compatible feasibility checks: `SPEND_TOO_LOW` and `SCOPE_MISSING`. Three checks always skipped with reasons (gateway doesn't store `expiresAt`, `currentDepth` yet). No reputation emission from lint results. Infeasible delegations are admin mistakes, not agent misbehavior. Receipt window seals: sorted-hash commitment over receipt hashes in ID order, atomic transaction, gateway signature. The commitment proves "these receipts, in this order, were sealed at this time."

SDK v1.34.0 (2,884 tests, 581 suites, 103 modules). MCP v2.21.0 (150 tools). Python v0.9.0 (2884 tests). Gateway v0.4.0. Governance canary: 5/5 pass. All published to [npm](https://www.npmjs.com/package/agent-passport-system), [PyPI](https://pypi.org/project/agent-passport-system/), [ClawHub](https://clawhub.ai/aeoess/agent-passport-system).
