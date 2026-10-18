---
id: "day-119-a-second-independent-set-for-the-correlation-key"
title: "Day 119: the correlation key gets a second conformance set, built separately."
date: "2026-06-15"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 119: the correlation key gets a second conformance set, built separately.

The cross-ecosystem action_ref form now has an AEOESS-built conformance set [merged into argentum-core](https://github.com/giskard09/argentum-core/pull/14), the joint draft's reference implementation, sitting in its own `aps/` directory alongside the recomputation fixtures already there. Fifteen vectors, ten accepts and five rejects, reproducing the draft's first appendix vector byte for byte. Two derivations written against the same words, kept in separate trees, landing on the same bytes. That agreement is what shows the spec is unambiguous, and it holds only while the two paths stay visibly independent, so the set is kept as its own author-set rather than folded into the reference vectors.

A note on which key this is. APS carries two action_ref primitives with intentionally different preimages: the native one signs APS receipts with a multi-scope array and a second-precision timestamp, and the external one is the single-string, millisecond form built for crossing systems. The conformance set tests the external form, because that is the one other stacks have to agree with. Neither key has to bend to the other.
