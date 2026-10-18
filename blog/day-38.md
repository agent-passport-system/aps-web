---
id: "day-38"
title: "Day 38: Institutional Governance Layer in One Session"
date: "2026-03-26"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 38: Institutional Governance Layer in One Session

The spec estimated 12 sessions. It shipped in one. Three phases of institutional governance &mdash; charter, approval, time, reserve, federation &mdash; went from zero lines to 1634 passing tests, 120 MCP tools, and two npm packages published before midnight.

**Phase 1: Charter and Approval.** A charter is the founding document of a multi-agent institution. 19 types define offices, succession rules, quorum policies, incompatibility constraints, dissolution terms. 16 pure functions handle creation, signing, verification, amendment, office transfer, and quorum checks. Multi-class threshold approval lets different signer classes (founders, officers, auditors) each satisfy independent requirements before a decision passes. 2884 tests, including the INV-5 guard: suspended or dissolved charters cannot be amended. A Petri net specification proves 10 invariants across 6 state machines with full transition tables.

**Phase 2: Time, Foreign, Escrow, Gateway Identity.** Hybrid Logical Clocks handle the fundamental problem of distributed time: wall clocks disagree, so every timestamp carries uncertainty bounds. Temporal ordering is three-valued &mdash; definitely_before, concurrent, or incomparable &mdash; because honest uncertainty beats false precision. Foreign counterparty envelopes wrap untrusted entities with mandatory expiry, sandboxing, and monotonic trust upgrade paths. No permanent foreign trust: the envelope expires even if you forget about it. Escrow-aware revocation blocks cascade revocation when active escrows exist, forcing a grace period instead of an instant rug-pull. Gateway identity publishes sovereignty level, trust basis, import policy, and fee model so agents can evaluate gateways before entering them.

**Phase 3: Reserve and Federation.** Reserve attestations let gateways declare their backing with liability semantics and assurance classes ordered by strength (self_attested < peer_audited < third_party_verified < regulatory_certified). False attestation penalties are declared upfront. Federation makes receipts and reputation portable: a foreign receipt envelope imports execution history from another gateway with automatic downgrade, and vouched reputation attests to an agent track record without exposing the underlying receipt history. 2884 tests cover all three phases.

**12 new MCP tools.** create_charter, verify_charter, sign_charter, evaluate_threshold, create_approval_request, add_approval_signature, create_hybrid_timestamp, compare_timestamps, validate_temporal_rights, create_reserve_attestation, vouch_reputation, apply_reputation_downgrade. 150 tools became 120.

**Naming conflicts and the cost of scale.** Two type collisions surfaced at 53 modules: JurisdictionEnvelope (data-lifecycle vs gateway) became GatewayJurisdiction. RevocationStatus (execution-envelope vs escrow) became EscrowRevocationStatus. At this scale, every new type needs a namespace check before it gets a name.

SDK v1.27.0 (2884 tests, 503 suites, 86 files). MCP v2.19.0 (150 tools). Both published. 63 core modules + 32 v2 constitutional modules. ~9,000 npm downloads. The protocol can now model institutions, not just individual agents. Charters define governance. Approval policies enforce it. Time is honest about its uncertainty. Reserves are backed or they say they are not. Federation means agents carry their history with them. Rome is complete.
