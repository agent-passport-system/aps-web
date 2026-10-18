---
id: "day-99-matrix-v2-substrate-cycle-2"
title: "Day 99: Substrate cycle 2 ships. Three new attestation envelope signal types in alpha.6."
date: "2026-05-26"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 99: Substrate cycle 2 ships. Three new attestation envelope signal types in alpha.6.

The matrix v2 scoping post on [A2A #1734](https://github.com/a2aproject/A2A/discussions/1734) named five candidate gap classes for a cross-implementation trust-evidence-format substrate window. Two were already built in cycle 1 earlier today. Three more shipped tonight in [agent-passport-system 2.6.0-alpha.6](https://www.npmjs.com/package/agent-passport-system/v/2.6.0-alpha.6): `memory_provenance`, `cross_issuer_attestation`, and `behavioral_drift_window`. Each is a new `signal_type` with a signed envelope, validation rules, and a test file. Each holds tight v0.1 scope and pushes computation, policy, and verification of constituent integrity to downstream consumers.

`memory_provenance` is OWASP ASI06 substrate. The envelope traces a memory entry back to a trusted source under a declared `reduction_map_ref`, so a verifier can recover what was originally stored, what transformation was applied, and which agent committed it. The SDK validates Ed25519 signature and shape. Verification of the original source content against `source_ref` and validation of the reduction map against a registered transformation stay with the consumer. 20 tests, six structured failure reasons covering shape, ID format, signature, source-fields, timestamp, and source-hash format.

`cross_issuer_attestation` is the federation primitive for the envelope family. A composer agent signs a bundle of references to N constituent envelopes, where each constituent can be from a different issuer and a different `signal_type`. The composer signature attaches the composer to that specific bundle. Tampering with any constituent reference invalidates the composer signature. Downstream verifies each constituent independently. 10 tests, with explicit duplicate-hash and reorder coverage so the federation primitive cannot be silently rewritten in flight. Cross-protocol composition between APS and AIIF is a separate artifact, deferred to a position paper.

`behavioral_drift_window` is the longitudinal extension of single-event attestations like `cognitive_attestation` and `governance_attestation`. The envelope bundles N constituent attestation hashes across a declared time window with caller-supplied metric placeholders: `decision_count`, `class_distribution`, optional `confidence_mean` and `confidence_stddev`, optional `baseline_ref` paired with `divergence_score`. The SDK validates internal shape consistency only. *It does not compute drift.* Drift analytics stay in `@aeoess/gateway` per the public-private boundary that landed in April. The envelope is for audit, handoff, and point-in-time evidence, complementary to the existing streaming family (`divergence_signal`, `baseline_revision`, `observation_window`, `trust_velocity`, `decision_lineage`, the `recentObservations` ring buffer on `ScopedReputation`, and the `DecisionLineageReceipt`) in production since SDK v1.41.0 and co-issued with the PDR project per Nanook PDR v2.19 §6.6. 26 tests, twelve documented edge cases.

Test count moved from 3,008 to 3,064, across five new module directories under `src/v2/`. Each signal type shipped with its envelope schema, validation rules, and a dedicated test file, and the release went out to the SDK, MCP, and Python packages in one pass.

The discipline pattern that matters here is the public-private boundary holding under load. Building three modules in parallel, the one with the most product-intelligence-shaped affordances was `behavioral_drift_window`, and it had every opportunity to drift across the boundary. The boundary held: each metric field is a placeholder, the SDK validates internal consistency only, recomputation is named as a downstream responsibility in the `verify.ts` comments. The protocol stays a public primitive, the analytics stay private. The substrate window can deliver the receipt shape without the SDK quietly turning into the product.
