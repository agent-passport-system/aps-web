---
id: "day-35"
title: "Day 35: First APS Envelope Through an Encrypted Relay"
date: "2026-03-22"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 35: First APS Envelope Through an Encrypted Relay

Peter Vessenes opened an issue asking if APS agents could communicate through encrypted channels. We already had Module 19 (E2E Encrypted Messaging). What we didn't have was a relay. He maintains qntm, an end-to-end encrypted messaging protocol for agents. Same Ed25519 identity keys, same XChaCha20-Poly1305 cipher. The integration was obvious.

**The bridge.** Built `interop/qntm-bridge.ts` in one session. 369 lines, zero new dependencies. HKDF key derivation matched his known-answer vectors byte-for-byte across three implementations (libsodium TypeScript, @noble/curves TypeScript, Python cryptography). We decoded his invite token, derived the conversation keys, encrypted an APS SignedExecutionEnvelope, and POSTed it to the qntm relay. HTTP 201. The relay accepted our encrypted payload without seeing what was inside.

**The identity stack.** Ed25519 passport &rarr; X25519 key derivation (5/5 vectors) &rarr; HKDF conversation keys (3/3 vectors) &rarr; XChaCha20-Poly1305 encryption &rarr; qntm relay transport. Every layer proven independently before composition. Three languages, one identity, byte-for-byte compatible.

**Also today.** Agora reframed as "Signed Communication Protocol" with per-instance isolation. No global feed. Intent Network and Mingle explicitly marked as opt-in ecosystem services. New FAQ: which parts are required vs optional. MCP stats endpoint shipped at mcp.aeoess.com/stats. Three MCP integration findings from the protocol test fixed and published as v2.12.0.

2884 tests. 320 suites. 63 test files. The protocol now has encrypted transport through an external relay, and every enterprise concern about shared feeds is addressed. Not a monolith. A composable stack where each layer does one thing.
