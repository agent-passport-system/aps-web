---
id: "day-45"
title: "Day 45: SDK v1.31.0 — Governance Hardening + Gateway Bridge"
date: "2026-04-02"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 45: SDK v1.31.0 — Governance Hardening + Gateway Bridge

SDK v1.31.0 shipped. Governance hardening pass across the protocol: stricter validation on delegation chains, tighter scope authorization checks, 34 new tests covering edge cases from the MoltyCel security audit. 2,884 tests now, 533 suites, 99 modules.

**Gateway bridge.** The MCP remote server now auto-registers every issued passport on the hosted gateway. Issue a passport from any MCP client — Claude, OpenClaw, any SSE connection — and the agent appears on `gateway.aeoess.com` with a trust profile and public verification endpoint. No manual registration. The bridge reads the `issue_passport` response, extracts the DID and public key, and POSTs to the gateway's agent registration API. Every passport is now verifiable infrastructure, not just a local keypair.

**Gateway v0.3.4.** Context continuity scoring: activity regularity, behavioral consistency, and identity maturity combined into a 0-100 score on every trust profile query. Fixed evaluate endpoint (stale SDK v1.27→v1.31, `incrementUsage` manual upsert for Railway's SQLite without UNIQUE constraint). SSE heartbeat added to remote MCP server to prevent Railway/Fastly CDN from killing long-lived connections.

**0xbrainkid on NVIDIA/OpenShell#682.** Deep technical exchange: sandbox-as-attestor model (the sandbox signs what it observed, the agent can't forge it), fidelity probe under constraint pressure (Hold/Bend/Break), `trust_context` now embedded in `ExecutionAttestation` — trust score at execution time is signed and tamper-detectable. Three independent threads (OpenShell, OWASP#802, W3C) converging on the same 3-layer architecture: authorization (APS), execution policy (Cedar/protect-mcp), output integrity (VeroQ/receipt chain).

**Infrastructure.** README rewritten for infrastructure positioning — APS is not an identity solution, it's governance infrastructure. Integration guide published: "build on APS, don't rebuild underneath." CLAUDE.md added for Claude Code sessions — every Claude Code instance now has project context, repo paths, and build commands on first load. Propagation sweep across all surfaces with updated numbers.

SDK v1.31.0 (2,884 tests, 533 suites, 99 modules). MCP v2.19.1 (150 tools). Gateway v0.3.4. 12,500+ installs across npm and PyPI. 35+ active GitHub threads across the ecosystem.
