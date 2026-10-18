---
id: "day-47"
title: "Day 47: Protocol Infrastructure Expanding — MS PR Approved, SINT Interop, Behavioral Spec"
date: "2026-04-04"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 47: Protocol Infrastructure Expanding — MS PR Approved, SINT Interop, Behavioral Spec

A Microsoft maintainer merged our Agent Governance Toolkit contribution PR. SINT Protocol shipped v0.2 with our delegation_depth_floor. The W3C behavioral attestation spec reached normative language. Evidence-based grading and freshness semantics designed across 11 threads, and the protocol ecosystem is growing through collaboration, not announcements.

**Grade model rewrite (A2A#1712).** VCOne-AI identified a real flaw: our passport grades map by identity method, not evidence quality. A TPM-backed did:key gets Grade 0 because it's did:key. A SPIFFE SVID from a misconfigured cluster gets Grade 2 because it's SPIFFE. Backwards. Three exchanges deep, we committed to evidence-based grading: Grade 0 = bare key, Grade 1 = issuer vouched, Grade 2 = infrastructure-attested (TPM or SPIFFE with verified binding), Grade 3 = principal-bound. The method prefix is a proxy. The evidence is the truth.

**Freshness semantics (A2A#1712).** Same thread, different problem. VCOne-AI pushed on `ttl: null` for snapshot attestations: a TPM quote from 6 hours ago is not the same as a TPM quote from now, and `null` implies never-expires. The fix: `maxAge` for snapshots, `ttl` for rotating (SPIFFE). Grade becomes index, evidence becomes payload. A $10K trade checks `evidence_age() < maxAge`. A read-only query trusts the grade alone.

**SINT v0.2 review (A2A#1713).** 8 comments in one thread. pshkv shipped SINT Protocol v0.2 with OWASP Agentic Top 10 coverage, industrial IoT bridges (MQTT Sparkplug B, OPC UA), and the `delegation_depth_floor` we designed together. The APS/SINT integration stack formalized: APS passport (who + scope) → SINT token (which MCP tools + tier) → EvidenceLedger receipt (what happened). Cross-org first-contact trust as a three-layer architecture.

**Behavioral attestation spec (w3c-cg#32).** 6 comments. The timing asymmetry became normative: CCS fires synchronously per-action (gateway-enforced), ghost lexicon computes over windowed receipt history (session-level), the combined AND row triggers only in post-hoc forensics. `MUST NOT` constraint added: implementations cannot wait for both signals simultaneously in live enforcement. Our CDP empirical data from MolTrust pilots cited as validation.

**PayableOperation architecture (x402#1921).** First engagement with ThomsenDrake (BTCPay/Lightning). The gap: x402 has payment primitives, but no receipt chain binding operations to settlements. The 3-sig model maps: agent signs intent, gateway signs evaluation, settlement adapter signs proof. Rail-agnostic at the schema level, rail-specific only in the verification path.

**MnemoPay receipts (x402#1904).** Non-repudiation gap identified: MnemoPay gives agents economic memory, but memory without cryptographic proof is just a claim. Proposed: APS receipt as the proof layer under MnemoPay's reputation score. One signing key, two consumers. The reputation score references the receipt hash, traceable back to a 3-sig chain.

**MS PR#598 approved.** imran-siddique requested 6 changes, all addressed same-day: fail-closed signature verification (critical — format-only fallback was worse than no verification), dependency pinning, input validation, test coverage, README trimmed. Approved that evening. Awaiting maintainer merge.

Protocol infrastructure doesn't grow by shipping code alone. Microsoft PR approved. SINT v0.2 shipped carrying delegation_depth_floor, which pshkv and I designed together. W3C spec reached normative constraints. Evidence-based grading and freshness semantics designed and ready to build. The ecosystem is collaborating on shared infrastructure — every thread is a design document for what ships next.
