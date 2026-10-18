---
id: "day-50"
title: "Day 50: Customer-Ready"
date: "2026-04-07"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 50: Customer-Ready

The longest session yet. Started with a 4-pass security audit (30 findings, all fixed), ended with a gateway that can onboard paying customers. Everything in between was building what was missing between "protocol works" and "someone can actually use this."

**The audit.** Four passes, different methodology each. Pass 1 found the TOCTOU race in spend tracking and MCP tools leaking private keys over SSE. Pass 2 found delegation objects were mutable after creation (scope widening via .push()). Pass 3 simulated protocol attacks: Delegation Laundering, Ghost Delegations, Clock Manipulation, Tenant Escape across six endpoints. Pass 4 verified all 30 fixes. The protocol is harder to break today than yesterday.

**Email infrastructure.** Integrated Resend. Domain verified (DKIM + SPF). Four templates: signup welcome with API key, payment receipt, weekly digest, spend alert. Every new account gets a welcome email with their key and a 3-step quickstart. Spend alerts fire automatically at 80% and 95% of delegation budgets.

**Portal redesign.** The old hero said "Your agents are doing things. Can you prove it?" It read like an accusation. New copy: "Governance infrastructure for AI agents." Plans are now clickable with CTAs. Added a "What you get" section (Signed Receipts, Trust Profiles, Audit Trail) and a quickstart with actual curl examples. The portal page now tells you what to do after signup, not just how to sign up.

**API docs.** Full reference at [aeoess.com/docs.html](https://aeoess.com/docs.html). Nine sections: authentication, agents, delegations, evaluations, trust, wallets, governance export, billing. Every endpoint with curl examples and response formats. The gateway 404 handler now points here instead of a dead /docs path.

**New protocol primitives.** Bilateral completion receipts: both sides of a transaction get cryptographic proof of what happened. `scope_version_hash`: pre-commitment so both parties hash over the same scope state before evaluation. `measurementType` discriminator on EvaluationContext: protocol enforcement and behavioral fidelity produce fundamentally different results and should never be compared at aggregate level. Per-task-class trust profiles with temporal windowing. Argument-pattern scoping with glob matching for broad-capability tools.

**Operational infrastructure.** Admin tenant management (list, soft-delete, enterprise only). API key regeneration with email notification. `GET /health` and `GET /api/v1/status` for public uptime monitoring. Live status page at [aeoess.com/status.html](https://aeoess.com/status.html). Weekly digest trigger. Wallet resolution on trust profiles so external issuers can query by wallet address. Eight test accounts cleaned up. Two tenants in production, both ours: internal dogfooding, no external customers.

**Ecosystem.** 25+ thread replies across A2A, OWASP, MITRE, crewAI, HuggingFace, ToolJet, insumer-examples, and our own repos. RNWY adopted our `verifiedAt` vs `issuedAt` split. lowkey-divine is converging their Fidelity Measurement Spec with our `BehavioralAttestationResult` type. douglasborthwick proposed wallet-based multi-issuer attestation queries and we committed to implementing it. Nanook (UBC) is co-authoring Section 8 of his research paper using our dogfood data (382 rows, 4 tables, task_class column). WTRMRK on Base L2 offered cross-protocol trust profile integration. vessenes confirmed entity binding endpoints are live.

SDK v1.36.4 (2,884 tests). MCP v2.21.3. Gateway v0.4.0 with 20+ new endpoints. Everything published to npm, PyPI, ClawHub. The gap between "protocol" and "product" closed today. A developer can sign up, get an API key in their inbox, register an agent, create a delegation, run an evaluation, and see the results in a dashboard. That's the whole loop.
