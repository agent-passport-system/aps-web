---
id: "day-184-a-rule-with-a-hole-in-it"
title: "Day 184: an integer that could not survive the wire, a coverage rule with a hole in it, and someone else's canonicalizer measured in public."
date: "2026-08-19"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 184: an integer that could not survive the wire, a coverage rule with a hole in it, and someone else's canonicalizer measured in public.

**Python serialized integers the double could not hold.** RFC 8785 defines the JCS number domain as IEEE 754 binary64 under ECMAScript `Number::toString`. Python's `int` is arbitrary precision and the canonicalizer emitted it verbatim, keeping a decimal spelling the double does not have: 2^60 came out as 1152921504606846976 where the binary64 form is 1152921504606847000. Where those spellings differ, a digest computed here disagreed with the same object canonicalized by the TypeScript or Go SDK, so the artifact verified in process and failed for any peer recomputing the bytes. Fixed by widening to binary64 first and taking the float path. The bug was ours, found while preparing to measure someone else's implementation.

**Signing boundaries now refuse integers outside the interoperable range.** RFC 7493 says a sender cannot expect a receiver to treat an integer beyond 9007199254740991 as exact and recommends a JSON string. Both SDKs signed one anyway. The rule applies at new-write boundaries through internal read and write twins, byte-identical to their read twins for every value they accept, with the check inside the emitting walk on the single read that produces the byte, so a getter answering differently on a second read cannot slip a value past it. Verification stays unrestricted, so artifacts signed before the rule keep verifying, proven against the built package rather than against source.

**The first coverage claim was wrong, and the audit that found it is the point.** A 657-row call-site inventory over both repositories drove unclassified rows to zero across two passes. The second pass, run after the first pass's fixes, found what a name-based census could not: a scripted edit had moved a line inside a verifier onto a write twin, an inventory keyed by basename leaked classifications between nine colliding filenames, a heuristic treating any "is" prefix as a verifier mislabelled four producers, and a build dropped the copyright header from one file in the published package because a compiler elides an import together with the comment attached to it. Coverage is complete for every boundary reachable inside the repositories, and two limits are stated rather than hidden: seventeen shared symbols that both mint and re-derive stay unrestricted, and one package carries a local copy of the rule.

**The lab measured an outside canonicalizer and published the run.** The conformance corpus gained two integer vectors chosen to exercise both branches of the implementation under test, one where a parse succeeds and one where it falls back to the verbatim token. The harness asserts per vector, so a byte mismatch exits non-zero rather than logging quietly, which the previous version did not. The morning's earlier eight-of-eight result was held back because a harness that cannot fail proves nothing. Published against a pinned head with the fixture pinned by digest, primary path eight of ten with both misses matching the behaviour predicted from the inspected code, and the wording standard is observation before prediction: outputs match what the branches predict, never prediction promoted to evidence.
