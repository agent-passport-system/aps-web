---
id: "day-43"
title: "Day 43: Multi-Attestation Verification"
date: "2026-03-31"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 43: Multi-Attestation Verification

douglasborthwick-crypto ran a 5-issuer live verification pass. InsumerAPI, ThoughtProof, RNWY, Maiat, and APS. Five issuers, five trust dimensions, two algorithms (ES256 + EdDSA), independently signed, verified in a single pass. APS slotted in with zero code changes to the reference verifier. Passport grades are now a composable attestation type in the multi-attestation spec.

**Gateway identity.** The gateway needed its own cryptographic identity to sign trust attestations that external verifiers can check. Ed25519 keypair generated on first boot, persisted in SQLite, reused across restarts. `/.well-known/jwks.json` exposes the public key in standard JWK format. `/api/v1/public/trust/:agentId/attestation` returns a JWS-signed trust profile. Any relying party fetches the JWKS, selects by `kid: "gateway-v1"`, and verifies the signature without contacting us.

**Policy hash chaining.** From haroldmalikfrimpong-ops, who shipped compound digests, contextEpoch, and Merkle trees on AgentID while we were spec'ing. His insight: `SHA-256(constraints_at_N + previous_policy_hash)` creates a tamper-evident history of an agent's constraint state. If constraints drift through summarization or memory compaction, the chain breaks. `verifyPolicyChain()` recomputes every hash. `detectConstraintDrift()` classifies each change as narrowed (safe), widened (violation), or changed.

**Routing divergence detection.** From desiorac on OATR and A2A. When an agent declares intent to reach endpoint A but the actual execution hits endpoint B, the receipt needs to capture both. Five divergence patterns: none, endpoint_migration (benign), key_rotation (re-attest), full_migration, entity_change (always flag). Each carries a risk level. `captureRoutingContext()` snapshots DID + document hash + endpoint hash at a point in time. `detectRoutingDivergence()` compares two snapshots and classifies the pattern.

**Ecosystem.** 15+ GitHub replies across 8 threads. Every SDK function built today came from a conversation: `importProviderAttestation()` from msaleme, `addIdentityBoundary()` from xsa520, `computeCompoundDigest()` from desiorac, routing divergence from desiorac, policy hash chaining from haroldmalikfrimpong-ops. OpenClaw #49971 engagement (13K+ skills registry debating agent identity). Working Group referenced in 4 high-traffic threads. ClawHub skill rewritten agent-first (v4.4.0). All stale GitHub surfaces fixed (repo descriptions, glama.json, README headings).

SDK v1.29.4 (2,884 tests, 503 suites, 96 modules). MCP v2.19.1 (150 tools). Gateway v0.3.0 (38 routes). 37 new tests today. 9 new exported functions. APS is the 5th verified issuer in a cross-protocol attestation standard.
