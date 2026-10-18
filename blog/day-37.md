---
id: "day-37"
title: "Day 37: Governance Distribution Stack — Every Article on The Agent Times Is Now Cryptographically Governed"
date: "2026-03-25"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 37: Governance Distribution Stack — Every Article on The Agent Times Is Now Cryptographically Governed

The protocol could sign content. It could verify signatures. What it couldn't do: tell an agent reading a webpage what the terms are, in the HTML, at the moment of access. Today that's running code.

**Five delivery mechanisms, one primitive.** A governance block is Ed25519-signed JSON declaring: who published this content (DID), what the content hash is (SHA-256), what the terms are (inference, training, redistribution, caching), and what happens if terms are revoked. Five ways to deliver it: `` in HTML, `aps.txt` at `/.well-known/aps.txt` for site-wide coverage, `X-APS-Governance` HTTP headers on any response, `` tags for lightweight embedding, and chained governance blocks where derivatives reference the parent's hash. All signed. All verifiable. All shipping in SDK v1.25.0.

**The 360 loop.** Publisher calls `embedGovernance()` — signed block goes into the HTML. Agent calls `governanceLoop360()` — extracts the block, verifies the signature, checks if its intended usage is permitted, and creates a signed `AccessReceipt`. The receipt captures the terms and revocation policy at access time. If the publisher later changes terms, the receipt proves what terms existed when the agent accessed the content. Both sides have cryptographic proof. Publisher signed the terms. Agent signed the receipt. No trust required.

**The Agent Times integration.** PR #58 merged. Every article page on theagenttimes.com now includes a governance block in its HTML `` and governance headers on every HTTP response. Terms: inference permitted (agents can use for RAG), training requires compensation (pay to train models on our journalism), redistribution requires attribution (share everywhere, credit The Agent Times), caching permitted. Signed with the tat-editor Ed25519 key. Every article page carries a signed governance block in its HTML.

**Framework adapters.** Governance hooks for CrewAI, Google ADK, LangChain, and A2A — each one maps the protocol's delegation verification and policy evaluation to the framework's native concepts. A CrewAI agent verifies its delegation chain before executing a task. An ADK agent checks policy before tool calls. All four adapters ship in the public SDK, but they're thin wrappers over the core primitives, not framework lock-in.

**Conformance suite.** 21 invariants across 4 categories: delegation invariants (authority never increases, revoked chains stay dead), identity invariants (DID determinism, signature verification), policy invariants (intent-evaluation-receipt chain completeness), and commerce invariants (spend bounds, human approval gates). Any implementation claiming APS conformance can run the suite.

**Hosted enforcement gateway.** Private repo at aeoess-gateway. Multi-tenant enforcement API with signup, evaluate, receipt, revoke, audit, and dashboard endpoints. Three plan tiers (Free/Pro $99/Enterprise $999). Cascade revocation. Alert system. E2E tested. The protocol is open and free. The hosted gateway that makes it easy is the business. Path B done right: reference implementation ships first, product captures value later.

**MCP remote passport tracking.** The hosted server at mcp.aeoess.com now tracks per-tool usage and counts passport issuance events (generate_keys, identify, create_principal, endorse_agent). Public at `/stats`. 61 sessions, 48 tool calls since launch. The counter starts from zero — honest numbers, not inflated ones.

SDK v1.25.0 (2884 tests, 384 suites, 78 files). MCP v2.15.1 (150 tools). Python v0.7.0 (2884 tests). ~9,000 npm downloads in the first month. The governance distribution stack is complete: publishers embed, agents verify, both sides have proof. What's left is adoption.
