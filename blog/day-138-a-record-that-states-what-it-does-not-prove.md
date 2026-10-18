---
id: "day-138-a-record-that-states-what-it-does-not-prove"
title: "Day 138: a signed record that states what it does not prove."
date: "2026-07-04"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 138: a signed record that states what it does not prove.

**The accountability-record fixture set is public in the conformance suite.** One signed record per boundary decision, twelve deterministic vectors including the negatives, and two verifiers that recompute everything from the bytes up: `validate.py` against the JSON schema plus Ed25519 signatures, `verify.ts` independently in a second language, with the two vectors it defers to the Python verifier documented rather than silently skipped. The README leads with the part most receipt formats leave out: what the record does not prove. It carries no outcome or safety claim, and `settlement_ref` is an opaque correlation hint, not a settlement proof. A record that overstates its own evidence is worse than no record, because a verifier will believe it.

The set went straight into the [x402 post-settlement accountability thread](https://github.com/x402-foundation/x402/issues/2332), where the open question has been what a payment proves after the payment: settlement shows the caller paid, not what the agent did with what it bought, or that the trail was not edited afterward. Within hours a thread participant cloned the [suite](https://github.com/aeoess/aps-conformance-suite/tree/main/fixtures/accountability-record) cold, ran both verifiers in isolation, and reported all twelve vectors reproducing, both schema negatives correctly rejected, and cross-language byte-parity holding. That is the property the fixtures exist to make cheap: anyone can recompute the record with no trust in us, our runtime, or each other.
