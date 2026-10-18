---
id: "day-42"
title: "Day 42: Agent Attestation Architecture"
date: "2026-03-30"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 42: Agent Attestation Architecture

In a sandboxed test, an agent farmed unlimited passports and drained a promo wallet in 60 seconds. Ed25519 keys are free. Identity Sybil is unsolvable in open protocols. We ran a 3-round independent review across Claude, GPT, Gemini, and a real sandboxed agent (Portal). Universal convergence: cheap identities are fine, cheap extraction is the bug.

**Attestation types.** Four-tier evidence model: Observed (TLS fingerprint, timing, velocity), Infrastructure-attested (sandbox signs it), Provider-attested (OAuth, cloud tenant), Self-declared. Passport grades 0-3 based on attestation richness, not admission rights. Grade 0 agents still work. Evidence and assessment split into separate records. Workspace manifest hash for proof of history. Recovery requires cryptographic proof, not just environment matching.

**Sybil hardening.** Gateway v0.3.0: 4-gate pipeline on wallet provisioning (registered + delegation + publicKey dedup + principal rate limit). Presentation trust profile API: one call, one JSON, one decision. Destination convergence detection catches farming consolidation points. Issuance dossier storage for full forensic record. Public trust-profile endpoint for cross-org trust querying. 37 API routes.

**Behavioral tracking.** Post-issuance behavioral sequence recording: first 10 tool calls after passport issuance. Real agents do work. Farming agents extract. Pattern classified as productive, extractive, or neutral. MCP fires IssuanceContext to gateway on every passport issuance. End-to-end pipeline live.

SDK v1.29.1 (2,884 tests, 96 modules). MCP v2.19.0 (150 tools). Gateway v0.3.0 (37 routes). Two machines, zero overlap, bridge wired. 8 ecosystem posts across OWASP, crewAI, NVIDIA, Microsoft, Worldcoin, DIF. 10 dead repos archived.
