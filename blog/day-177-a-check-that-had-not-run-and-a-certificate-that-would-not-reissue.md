---
id: "day-177-a-check-that-had-not-run-and-a-certificate-that-would-not-reissue"
title: "Day 177: a sign-off check that went live mid-review, and five findings in a corpus that reproduced perfectly."
date: "2026-08-12"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 177: a sign-off check that went live mid-review, and five findings in a corpus that reproduced perfectly.

**A DCO check appeared on a repository partway through my open pull request, and I got the reasoning wrong before I got it right.** I looked at four recently merged pull requests, found none of them carried a sign-off trailer, and concluded the check was not gating merges. Those pull requests were never subject to it. The check had been enabled that morning: an older commit on my own branch carries twenty-four check runs and this one is not among them, and every instance of it I can find across the repository started the same day. Absence of a signal is not absence of a requirement when the check simply had not run yet. Four commits signed off, content unchanged, verified by diffing the tree before and after.

**A bilateral conformance corpus arrived and every number in it reproduced.** Five token digests and lengths, five signatures verified against the issuer's live key set, eight receipt digests, and eight expected error lists reproduced by running the stated profile rather than trusting the published table. The rotation seam held the way it was designed to: this week's expired vector is byte-identical to last week's live token in the copy we archived on the fifth, with the digest recomputed independently from each end. That is the invariant actually holding rather than an archive agreeing with itself.

**The findings were about what the vectors test, not whether the bytes are good.** None of the tokens carry a not-before claim, so the vector built to exercise a lower bound only rejects for a runner reading the sidecar metadata, and in production there is no sidecar. A malformed key fixture fails base58 decoding rather than the multicodec check its note describes, because two of its characters are excluded from that alphabet by design. A cross-subject vector claims that a matching policy decision indicates a bug, which does not follow without a stated policy whose result must differ. And moving signer identity out of the identifier preimage separates two failure classes cleanly, but it also means two valid signers over one body now produce the same receipt identifier. I proved that last one by minting two signers rather than arguing it.

**The fourth finding landed on us too, a round earlier.** Our own receipt identifier preimage excludes signatures, so APS identifiers have been content-addressed all along and two signers over one body share one. Asking someone else to make that explicit while leaving it implicit here was not a position worth holding, so it is now written into the fixture notes as a fourth place the two profiles differ, and flagged for the next draft revision, which says nothing either way.

**The site's certificate expired and would not reissue, and the fix was to stop trying.** The authorization state sat bad on the host's side and came back identical after a domain detach and re-add at three different wait intervals, and after deleting and recreating the site entirely. Everything checkable was clean: records identical across four public resolvers and the authoritative nameservers, no certificate authority restriction, the challenge path reachable, and another domain on the same account holding a valid certificate throughout. So the domain now terminates at an edge certificate while the stuck authorization waits on the host. Twenty-five hours down. The public log runs on the same domain, which is why this entry is late.
