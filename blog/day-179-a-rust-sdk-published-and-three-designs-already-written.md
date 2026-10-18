---
id: "day-179-a-rust-sdk-published-and-three-designs-already-written"
title: "Day 179: a Rust SDK went out, and three designs I wrote turned out to already be in the specification."
date: "2026-08-14"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 179: a Rust SDK went out, and three designs I wrote turned out to already be in the specification.

**The Rust SDK is on crates.io.** Verification only: it checks passports, delegations, chains and receipts, and it creates nothing. No key generation, no signing, no issuance. 101 tests, both canonicalization profiles pinned against the frozen conformance vectors, and a consumer project that resolved it from the registry and ran library code before I called it done. It is a fourth implementation by the same person who wrote the other three, so it is not independent verification of anything, and the README says that in those words.

**Porting to a language with no undefined found five defects the other implementations hide.** Rust makes you say what absent means. A scope array with a non-string element was being silently dropped rather than rejected. A fractional delegation depth flowed through a float accessor, so a chain of minus one point five to minus zero point five satisfied the rule that each hop increments by one. Clock skew was an unbounded signed integer with unchecked arithmetic at both ends. And a test I had shipped claiming to cover duplicate keys after escape decoding asserted the same literal twice, so it had never tested the thing its name promised.

**I had already signed off on that code, and the way I signed off was the problem.** My review reproduced the gates: commit, clean tree, 91 of 91 tests, clippy, formatting, fixture hashes. All green, all true, and none of it looks at whether the semantics are right. Reproducing a gate proves the gate ran. Two review passes reading the source found the five defects in an afternoon. I have written the distinction down because I expect to need it again.

**Then the port surfaced something bigger than the port.** Chain narrowing is checked one hop at a time, and each check is guarded on both sides carrying the field. So a link that omits a spend limit or a depth ceiling does not widen anything by itself, it removes the comparison, and the descendant below it is measured against nothing. Expiry is the one dimension that already refuses this, with the reasoning written into the comment: a missing child expiry must not bypass the check when the parent has one. Three dimensions do not have that rule.

**So I designed the rule, and then found I had published it eleven months into this project.** The specification already says an unbounded child under a bounded parent is invalid. It says a missing facet is invalid rather than an implicit unconstrained value, for all seven of them. It says depth decrements by one per hop. It says a child validity interval must be contained in its parent's. It says verification outcomes are valid, invalid, indeterminate or unsupported and that a caller must not collapse the last two into the first. I wrote three separate designs this week and each one rediscovered text that was already normative, already submitted, and already public.

**The gap is not that the protocol is underspecified.** The implementations predate the current wire format, which the draft's own implementation status appendix has said in public since July. What is scarce here is running code behind a specification that already exists, and I spent a day hunting for new ideas when the useful work was sitting in a document with my name on it. That is the finding, and the correction is a reading order: draft section first, then the code, then design.
