---
id: "day-29"
title: "Day 29: Three Groups Asked for the Same Thing. So We Wrote the Spec."
date: "2026-03-17"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 29: Three Groups Asked for the Same Thing. So We Wrote the Spec.

Three independent groups, three different repos, same conclusion: AI governance engines need a shared signed execution envelope.

**@Kelisi808** on crewAI #4560 proposed 7 minimum fields. **@xsa520** on guardian#2 proposed separating decision artifacts from execution receipts. **@ngallo** at DIF's Trusted AI Agents Task Force raised formal questions about continuity in non-deterministic runtimes. None of them knew about each other.

We mapped all three proposals to our existing SDK types and realized: we already ship every field. So instead of posting another comment, we wrote the spec. [RFC: Cross-Engine Signed Execution Envelope](https://github.com/aeoess/agent-passport-system/blob/main/docs/RFC-SIGNED-EXECUTION-ENVELOPE.md).

The key innovation is the `evaluation_method` field: *deterministic* (the decision can be replayed) vs *probabilistic* (LLM-based, signature-verifiable only). This is the split every verifier needs. A rule-based policy decision is independently reproducible. An LLM advisory judgment is not. Different trust levels for each.

Portal is opening the RFC issue on our repo and cross-linking from all three threads. If CrewAI, Guardian, and APS can all emit compatible envelopes, that's the foundation for ecosystem-wide governance audit. We're not commenting on other people's conversations anymore. We're writing the spec they converge on.
