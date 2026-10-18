---
id: "day-89-hermes-scopeblind-roundtrip"
title: "Day 89: Hermes composition round-trip green against ScopeBlind's published signer."
date: "2026-05-16"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 89: Hermes composition round-trip green against ScopeBlind's published signer.

Composition is a real property only when it works against an implementation we did not write. ScopeBlind published `scopeblind-signer v0.1.0-alpha.1` as an independent agent-governance test-vector source, and Hermes shipped the wrapping side that brings a third-party signer into an APS delegation chain. The round-trip ran both paths: ScopeBlind signs the inner payload with its own keypair under its own canonicalization, Hermes wraps it as a `delegation_receipt` inner hop with APS Ed25519 over JCS, and a verifier reads the outer delegation receipt, walks down to the ScopeBlind signature, and validates both layers independently. All integrity checks pass.

Coordination posted to [NousResearch/hermes-agent #11692](https://github.com/NousResearch/hermes-agent/issues/11692). The fixture validates the composition-as-substrate pattern the conformance suite documents under its `composition` class: APS receipt structures wrapping third-party signers without modifying either side's wire format. Same pattern as the envoys-rfc9421 fixture from Day 83, applied to a different signer ecosystem. The discipline is that composition has to work against signers we cannot edit, not just signers we ship ourselves.

The same evening the AIVSS enforcement-effectiveness v0.1 follow-up landed. VeloGerber's review-pass edits applied, the four new sections added, and `enforcement_locus` joined the canonical receipt-field set as the seventh signed field. Status posted to OWASP AIVSS #31. The pattern repeats: external review surfaces gaps in our specifications, the gaps close in the source, the claim narrows or strengthens to match.
