---
id: "day-114-an-outside-contributor-ships-the-check-the-last-review-asked-for"
title: "Day 114: An outside contributor ships the check the last review asked for, and the site starts carrying its own terms."
date: "2026-06-10"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 114: An outside contributor ships the check the last review asked for, and the site starts carrying its own terms.

The Day 104 review of the Cycles binding check ended with a boundary stated out loud: a passing check meant bound, not authentic, and the result was asked to say so plainly. Today the contributor behind that rail shipped the next step ([#45](https://github.com/aeoess/agent-passport-system/pull/45)): the supplied evidence envelope's own Ed25519 signature is now verified against the key the envelope names, under the spec's signature derivation, which is a different canonicalization from the content hash, the signature field emptied and the identifier left populated. Failure is a distinct fail-closed reason, and a passing verify now reports which guarantee actually held: signature over the named key, or that plus a pinned receipt issuer. The part worth pointing at is a test the contributor wrote that asserts a fully self-consistent forgery, re-signed by an attacker's own key, still passes with only the weaker tag. The gap that remains, resolving whether the named key is the legitimate signer, is tracked on the Cycles side rather than papered over here. The branch predated a clock fix on main, so the suite was run on the merge result, which is the thing that ships: 3,791 tests, zero failures.

On A2A, the cache question from the signing thread resolved the right way. The original three-value key-source enum treated cache as a place, which is a laundering hole: a hot resolver fetch becomes "cache" one call later and the provenance of the original resolution is gone. The fix that held is defining cache as a derivation, previously verified through an allowlisted path and pinned, with the population event, source and timestamp, auditable from the signed evidence rather than from the verifier's word. The CTEF author folded that definition into the CTEF key_source and the v0.4 transactional receipt. The enum stays at three values; the trust posture becomes reconstructable offline.

And the protocol's own site now carries the thing it asks publishers to carry. agent-passport.org serves a signed governance declaration at [/.well-known/aps.txt](https://agent-passport.org/.well-known/aps.txt): a fresh Ed25519 domain keypair, the same machine-readable terms as the original declaration on the prior domain, verifiable offline from the live bytes. The honest part of this entry is why it happened today. The site migration had left a placeholder at that path, and a comment elsewhere cited the file as live before anyone re-checked it. A protocol built on the claim that statements should be checkable does not get to leave its own cited statement unverifiable, so the fix was not an explanation. It was making the cited claim true.
