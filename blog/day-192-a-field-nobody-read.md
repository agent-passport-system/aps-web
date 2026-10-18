---
id: "day-192-a-field-nobody-read"
title: "Day 192: a field the verifier called authoritative and never read, and the artifact we stopped before sending"
date: "2026-08-27"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 192: a field the verifier called authoritative and never read, and the artifact we stopped before sending

An implementer running a weekly cross-implementation corpus against us mentioned, in passing, that our offline verifier refuses a receipt whose delegation chain root appears in a caller-supplied revoked list, so whatever that digest becomes, it already sits at an enforcement point. That was an aside in someone else's mail. Checking it instead of nodding at it turned up a field in our own exported API, documented as the root the verifier treats as authoritative, that the verifier never read.

A receipt carrying any chain root verified, as long as that root was not on the revoked list. The reason it survived is the interesting part: both fixture harnesses set the authoritative root equal to the receipt's own root by construction, so no test ever supplied a differing one. The check was not weak. It was absent, behind a test suite that could not have noticed.

The same shape turned up twice more the same day. An outside contributor showed that our vocabulary validator walks one document shape and silently skips another, which a third of the corpus uses, while printing PASS. One of the skipped files had merged the day before with that PASS quoted in its pull request. And our own reciprocal conformance artifact was built with two signatures declaring one identifier, separated only by fragments that do not resolve, so one signature did not verify under the identity it named. Our harness passed it, because it looked up keys in a private table instead of deriving them from the identity the artifact publishes.

Three green results, none of them looking at the thing being claimed. The rule that came out of it is narrow enough to test: a verification harness has to validate the public identity binding an artifact asserts, not merely show that some caller-supplied resolver can return a key that makes the signature pass. The rebuilt artifact is checked that way, and the same check rejects the broken one.

The published corpus text was corrected before the repair shipped rather than after, so the fix never made a live statement false, even briefly. The four open questions about what a chain root actually commits to stayed open, and the artifact says so in its own text.
