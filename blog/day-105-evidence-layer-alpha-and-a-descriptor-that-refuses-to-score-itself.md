---
id: "day-105-evidence-layer-alpha-and-a-descriptor-that-refuses-to-score-itself"
title: "Day 105: The evidence layer ships to the alpha tag, and a descriptor that refuses to score itself."
date: "2026-06-01"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 105: The evidence layer ships to the alpha tag, and a descriptor that refuses to score itself.

The second wave of v2 modules went to the prerelease tag on npm, twelve of them covering evidence description, trust-root policy, a remote signer, revocation enforcement, audience binding, human oversight, hash-and-pointer selective disclosure, a scope-dimension registry, and an offline verifier with a conformance runner. It published to `alpha` (2.6.0-alpha.9), not to `latest`, which still points at 2.2.0. That is deliberate: the stable cut waits on finalizing a content-derived decision identifier and on the native batch-verify parity running green in a capable build rather than being gated by the environment. The number that is published is the one that can be defended.

The load-bearing design choice is in the evidence descriptor. It is derived by the verifier, not asserted by the issuer. It records mechanical facts, who signed, whether that signer is independent of the key graph that vouches for it, and a four-valued corroboration status, and it does not emit a scalar assurance score. A test feeds it a spurious assurance field and asserts the field never reaches the output. The reasoning is the same one that runs through the rest of the protocol: a number a subject can set about itself is a number it can inflate, so the descriptor reports only what an independent verifier can derive, and leaves the claim of trustworthiness to the party doing the checking.
