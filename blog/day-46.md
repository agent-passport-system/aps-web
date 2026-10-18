---
id: "day-46"
title: "Day 46: Bring Your Own Identity — The Interop Stack"
date: "2026-04-03"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 46: Bring Your Own Identity — The Interop Stack

APS is not an identity system. Today it stopped looking like one. Four new modules shipped that accept external identity credentials and route them through the enforcement boundary. did:key, did:web, SPIFFE SVIDs, OAuth tokens — all feed into the same gateway. Identity is the input. Enforcement is the product.

**did:key + did:web interop.** `toDIDKey()` converts Ed25519 public keys to W3C did:key format. `fromDIDKey()` parses back. `resolveDIDWeb()` fetches DID Documents over HTTPS. `passportToDIDKeyDocument()` creates a W3C DID Document with `alsoKnownAs` bridging did:key to did:aps. Any standard DID verifier can now check an APS passport without knowing APS exists.

**SPIFFE + OAuth bridge.** `importSPIFFESVID()` converts a SPIFFE Secure Workload ID into a Tier 1 infrastructure attestation — the agent gets Grade 2 automatically. `importOAuthToken()` converts OAuth claims into APS delegation parameters — the OAuth scope becomes the delegation ceiling. Deterministic agent IDs: same OAuth subject always maps to the same APS agent via `sha256(iss:sub)`.

**VC wrapper + credential request.** W3C Verifiable Credentials with did:key identifiers and SPIFFE evidence attachments. Selective disclosure: verifier requests specific claims, agent reveals only what's asked for. Full pipeline tested: SPIFFE agent → VC → selective presentation → OAuth-authenticated verifier.

**Competitive repositioning.** Mapped the full landscape: DID/VC (identity), OpenID4VC (exchange), SPIFFE (runtime), OAuth (delegation). Together they cover 70% of what APS does. The 30% gap — enforcement boundary, monotonic narrowing, cascade revocation, data lifecycle — is the moat. New positioning across all surfaces: "Enforcement and accountability layer for AI agents. Bring your own identity."

**Full audit.** 5-phase production readiness check: build integrity, cross-connection verification, logic verification, dependency audit, export completeness. All phases PASS. 430 exported functions, 428 types, 0 vulnerabilities, 0 strict mode violations. 25 circular deps (22 type-only). 7 core modules without dedicated tests (covered by integration tests).

**Cross-language.** All 4 interop modules ported to Python SDK v0.8.0. Cross-language verification: TypeScript `toDIDKey()` and Python `to_did_key()` produce byte-identical output for the same Ed25519 key. Same for SPIFFE subject hashes and OAuth agent IDs. 197 Python tests. Published to PyPI.

**Microsoft AGT PR#598.** imran-siddique reviewed, requested 6 changes. All addressed: fail-closed signature verification (critical fix — format-only fallback was worse than no verification), dep pinning, input validation, README trimmed to technical style, 3 new signature tests. Awaiting re-review.

SDK v1.32.0 (2,884 tests, 559 suites, 103 modules). Python SDK v0.8.0 (2884 tests). MCP v2.19.1 (150 tools). Gateway v0.3.4. 27+ GitHub posts across 15 threads. YC application finalized. Every competitor is now a feeder.
