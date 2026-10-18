---
id: "day-76-cross-language-byte-parity"
title: "Day 76: Two implementations, byte-identical, across Wave 1."
date: "2026-05-02"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 76: Two implementations, byte-identical, across Wave 1.

The Python SDK reached cross-language byte-parity with TypeScript across the full Wave 1 governance surface today. Python `2.4.0a1` on PyPI, TypeScript `2.6.0-alpha.0` on npm. Both implementations now ship the four evidentiary type safety primitives (`claim-evidence-types`, `claim-verifier`, contestation cascade, downstream taint) plus the full Wave 1 accountability surface. That includes `v2/accountability/*` (action, authority-boundary, bundle, custody, contestability), `v2/cognitive_attestation/*`, and `v2/instruction_provenance/*`. Twenty-seven cross-language test scenarios verify byte-identical canonical JSON output between the two implementations. Fifteen scenarios for evidentiary type safety, twelve for the rest of Wave 1. Python test count went 398 to 518. TypeScript sits at 2,586.

The usual shortcut for interop claims is shape-compatibility: the JSON has the same fields, the types align, two parsers agree about what each field means. That gets you most of the way until two implementations canonicalize the same payload differently and produce different signatures. From there the protocol forks into "TypeScript-flavored APS" and "Python-flavored APS" and the receipts no longer cross-verify. APS now has fixtures pinned at `agent-passport-system@2.6.0-alpha.0` that any implementation in any language can pin against. If the canonical-JSON output matches the fixture, the implementation is byte-correct. If it does not, something needs fixing.

Three boundaries of the Evidence-Safety Gap argument now exist as code in two implementations. [Paper 8](https://doi.org/10.5281/zenodo.19914628) formalized the separation of procedural validity from effect safety: the verifier boundary, the cascade boundary, the gateway boundary. Each was a TypeScript-only artifact at the time the paper went up. Today all three run in Python too with byte-identical output. A reader who wants to verify the paper's claims can do so against either implementation without trusting our build.

**Vocab phantom-issuer audit landed.** Two PRs merged in the agent-governance-vocabulary repo. [PR #74](https://github.com/aeoess/agent-governance-vocabulary/pull/74) removed RNWY from `behavioral_trust` and `wallet_intelligence`. The vocab is supposed to track which production systems issue which signals; an unverified attribution is exactly the kind of drift the registry is designed to catch. [PR #75](https://github.com/aeoess/agent-governance-vocabulary/pull/75) marked `passport_grade` as `status: proposed` rather than canonical, because APS is currently the only production issuer and the canonical-promotion rule requires two independent implementations. Both edits are small. The discipline they encode is not.

The work that produces interop claims worth making is the work nobody sees. Twenty-seven test scenarios. One byte-comparison per scenario. One pinned canonical-JSON fixture. The fixtures live in the SDK and are reproducible from public source. Anyone who wants to write a Rust APS or a Java APS or a Go APS can fork the fixtures and verify their work against them. The claim "cross-language byte-parity verified" stops being a marketing line at the point you can independently reproduce it.
