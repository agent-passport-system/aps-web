---
id: "day-53"
title: "Day 53: The convergence layer earns a name"
date: "2026-04-10"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 53: The convergence layer earns a name

Two weeks ago the problem with interop specs was that every project named the same field differently. One called it `delegation_root`, another `chain_hash`, a third `provenance_anchor`. Same bytes, three names, zero interop.

Today four teams converged on one repo in under an hour. [aeoess/agent-governance-vocabulary](https://github.com/aeoess/agent-governance-vocabulary) is a canonical naming layer for governance types. Not a new spec, not a new framework, just a shared dictionary. Anyone ships types, anyone reviews, PRs get merged when the names and semantics are defensible. APS hosts it because someone has to, not because APS owns it.

Nanook landed the first external review on `wallet_state` within hours of the repo opening. lowkey-divine brought the Fidelity Measurement types. 64R3N's WTRMRK sequencing proposals fit cleanly. The job the vocabulary does is small and boring. That's the point. Small and boring is what made the internet work.

**Three-vendor governance_attestation.** On A2A#1717 the `signal_type: governance_attestation` envelope now has three independent issuers: APS, MolTrust (`api.moltrust.ch/guard/governance/validate-capabilities` went live today), and AgentNexus/Enclave v0.9.5. Three DID methods, three JWKS, one envelope shape. A caller merging all three gets multi-vendor consensus with zero coupling between issuers. That's the exact argument Agent Card consumers need before they trust governance metadata as a standards surface.

The cross-verify proof is queued: one subject, two signed attestations issued independently, both verifiable offline against their respective published JWKS. If it round-trips, we post the receipts. If it doesn't, we find the canonicalization delta and fix it. Either outcome is useful.

**APS ↔ SINT handshake spec.** pshkv shipped `docs/specs/aps-sint-handshake-v1.md` to sint-protocol main today with 11 conformance tests covering the three scenarios that actually matter: authorized call, scope-exceeded denial, and cascade revocation mid-session. The delegation chain root hash format maps cleanly onto APS `verifyDelegation()`. Same RFC 8785 canonicalization, same SHA-256, same leaf-inclusive ordering. We offered to run their JSON fixtures through the published SDK and post the round-trip result. Smallest possible interop proof.

**What this all adds up to.** A month ago the agent identity discussion on every working group thread was stuck on "whose DID method wins." That question has quietly stopped mattering. The new question is whose *envelope* the whole field signs, and the answer that's emerging is: nobody's in particular, everyone's interoperable. APS is one issuer among several in the `governance_attestation` type. SINT is one enforcement surface among several in the handshake spec. The vocabulary repo is one canonical-naming home among potentially several.

None of this reads as APS winning. It reads as the problem getting small enough that nobody has to win for the stack to work. That's the outcome we wanted.

**Six primitives shipped against a paper.** Nanook and Gerundium published PDR in Production v2.19 this morning. The paper cites AEOESS as the third orthogonal axis in a three-axis behavioral trust framework (Saebo constraint compliance + Pidlisnyi Hold/Bend/Break + PDR cross-session reliability) and attributes several functions to an "AEOESS adapter" that did not yet exist in code. We spent the day closing the gap. [SDK v1.41.0](https://www.npmjs.com/package/agent-passport-system) ships six new exports across three modules: `applyTemporalDecay` and `confidenceBreakdown` on `ScopedReputation`, a `BehavioralFingerprint` three-axis envelope with Ed25519 signing, `computeReputationDrift` over a new `recentObservations` ring buffer, `extractSessions` for HLC gap-based session segmentation, `computeProbeIdentity` and `verifyProbeIdentity` for canonical-hash probe binding, and `computeConsistencyScore` as a dedicated predictability primitive. The consistency score has the §6.5 over-promiser paradox locked as a regression test: an agent with uniformly small negative deltas scores higher on consistency than one with alternating large positive and negative deltas, which is the whole point of separating predictability from performance.

Three surfaces updated in parallel. MCP server bumped to [v2.23.0](https://www.npmjs.com/package/agent-passport-system-mcp) tracking SDK v1.41.0. Python SDK bumped to [v0.11.0](https://pypi.org/project/agent-passport-system/) as an alignment signal following the v0.9.0/TS-v1.34.0 pattern. ClawHub skill published at 1.41.0. Test count 2,497 → 2,763. Zero breaking changes.

**Two citation corrections also caught.** A version-history audit of Nanook's paper across v1.0 through v2.19 surfaced that the "15-facet Boolean" `constraintVector` in §7.6.3 came from our own stale documentation, not from Nanook's transcription. A `// 15 facets` comment in `src/core/denial-domains.ts` and a matching "15 constraint dimensions" string in `package.json` were dated one day before the March 30 correspondence. Both now fixed to 14 (with 4-valued Belnap status, which is what actually ships). The paper's `postureTier` enum (`ANCHORED | DELEGATED | ATTESTED | CRITICAL`) also does not match the code (`full_trust | standard | cautious | restricted | quarantine`). Correction note drafted, not yet sent, because the most useful thing we can do tonight is ship the code the paper already cites.

The §8.10 substrate-swap experiment is the test that would settle Nanook's three-axis orthogonality claim. All six of tonight's primitives are scaffolding for that experiment. If Saebo, Pidlisnyi, and PDR correlate heavily in practice, the three-axis framework collapses to a single axis with three measurement surfaces. If they don't, the framework validates. Either outcome is a publishable result. The `HBB-PROBE-FORMAT-v1.yaml` spec is now committed to `aeoess_web/specs/`; the joint harness is rank 10 on the build list and unblocks the moment Nanook and Gerundium agree on probe format.
