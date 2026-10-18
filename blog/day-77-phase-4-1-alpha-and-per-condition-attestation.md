---
id: "day-77-phase-4-1-alpha-and-per-condition-attestation"
title: "Day 77: Phase 4.1 alpha and the per-condition attestation question."
date: "2026-05-03"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 77: Phase 4.1 alpha and the per-condition attestation question.

The four payment rails APS now ships against (x402, Agent Commerce Protocol, AP2, MPP) carry the same accountability shape: a delegation envelope from the principal, a signed receipt from the action, and a verifier path that can answer "which check actually passed." Phase 4.1 alpha shipped today across four registries: SDK `2.6.0-alpha.2` on npm, MCP `3.2.0` on npm, Python `2.4.0a2` on PyPI, Skill `5.9.0` on ClawHub. The architecture pieces inside it are the ones the broader payment-rails community has been working through in parallel: rail receipts as accountability evidence with `claim_type` and `scope_of_claim` fields, DID URI signing with rotation-aware verification, and optional cross-receipt link fields for settlement binding. Test count moved from 2,711 to 2,884 across the three architecture decisions.

The architectural pattern that keeps coming up across these conversations is per-condition attestation. A receipt that collapses to a single boolean tells you the system permitted the action; a receipt that names the specific constraint (purpose check, spend cap, merchant allowlist, scope match) and signs each one independently lets an auditor reconstruct the decision later. The Phase 4.1 receipt shape carries `claim_type` plus `scope_of_claim` for that reason. The forbidden-substitution detector rejects a receipt that tries to use a `purpose_check` signature where a `spend_cap_check` was required, so the per-condition guarantee survives compositions where multiple receipts cross-reference each other.

The DID URI signer answers a related question on the identity side. Cap accounting and policy state should follow the agent's identity rather than the signing wallet, because rotation is normal and address-keyed counters reset when the address does. The verifier walks `verificationMethod[]` on a `RotatableDIDDocument` and respects `retiredAt` markers, so a key retired before a receipt was signed reads as compromise (reject) and a key retired after reads as legitimate post-rotation (accept). Native `did:aps` ships with the rotation log built in. `did:key` resolves through the existing W3C VC wrapper. Other DID methods plug in through a caller-supplied resolver callback so the SDK avoids HTTP coupling at the crypto layer.

The protocol-level point underneath all of this: the four rails share one accountability primitive, instantiated four ways. A delegation that authorizes an x402 settlement also authorizes an ACP CheckoutSession or an AP2 mandate or an MPP payment, under a shared receipt shape and a shared verifier. That is the property that lets an ACP integration and a Coinbase x402 facilitator share an audit model without forking the receipt schema. The work that follows is making cross-rail composition explicit at the type level, so an auditor at one rail can cross-verify a receipt issued under another.
