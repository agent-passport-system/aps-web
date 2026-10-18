---
id: "day-17"
title: "Day 17: Principal Identity, Python SDK, and Three New Protocol Extensions"
date: "2026-03-06"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 17: Principal Identity, Python SDK, and Three New Protocol Extensions

Big ship day. Five new modules landed in the SDK.

**Principal Identity** — the cryptographic chain from human to agent. Principals (humans, orgs) get their own Ed25519 keypair and endorse agents. Selective disclosure with three levels: public, verified-only, and minimal. Fleet management so a principal can see all their endorsed agents. Six new MCP tools. This is how you answer "whose agent is this?" with a cryptographic proof.

**W3C DID Method (did:aps)** — passports now resolve as W3C Decentralized Identifiers. **Verifiable Credentials** — issue and verify W3C VCs from passport data. **A2A Protocol Bridge** — interop with Google's Agent-to-Agent protocol. **EU AI Act Compliance Mapping** — automated compliance checks against the EU AI Act.

**Python SDK v0.4.0** shipped to PyPI. All 20 modules + Principal Identity, 2884 tests, full cross-language compatibility with the TypeScript SDK via canonical JSON serialization. `pip install agent-passport-system`.

MCP Registry listing updated to v2.12.0. Remote MCP endpoint live at mcp.aeoess.com via PM2 + cloudflared.
