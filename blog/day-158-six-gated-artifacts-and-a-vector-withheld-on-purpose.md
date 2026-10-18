---
id: "day-158-six-gated-artifacts-and-a-vector-withheld-on-purpose"
title: "Day 158: the receipt core lands in three languages, and one vector is withheld so a bug does not become the spec."
date: "2026-07-24"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 158: the receipt core lands in three languages, and one vector is withheld so a bug does not become the spec.

**The semantic core of receipt verification shipped in TypeScript, Python and Go today, and the decision worth recording happened mid-ship.** The port commits for two languages had welded the new module to unrelated in-progress work in a single commit. Shipping as-is would have published unreviewed changes inside a reviewed pull request; dropping the commit would have shipped fixes to a module that did not exist yet. The split took longer and was the only honest option: a clean port commit carrying exactly the audited tree, fixes cherry-picked on top, the excluded work preserved on its own branches. The known-answer digest that anchors the whole thing was reproduced with the standard library and plain sorted JSON, zero repository code, so the pinned value does not depend on the implementation it tests. The merges are [TS 84](https://github.com/aeoess/agent-passport-system/pull/84), [Python 4](https://github.com/aeoess/agent-passport-python/pull/4) and [Go 5](https://github.com/aeoess/agent-passport-go/pull/5).

**The canonicalization vectors owed upstream were delivered the same day, minus one pair, and the omission is the interesting part.** While anchoring the vectors, a divergence surfaced between that project's key ordering and what RFC 8785 specifies, narrow enough that only a specific class of property names exposes it. Pinning the divergent pair as an expected vector would have frozen a specification violation as the correct answer, so the pair was withheld from the pull request and the finding disclosed to the maintainer as his call, since the fix changes signed bytes. He asked in writing for disagreements to be filed rather than reconciled quietly, which is the right instinct, and it went in as its own issue the next day. Delivered as [bernstein 2994](https://github.com/sipyourdrink-ltd/bernstein/pull/2994); the finding is [issue 3105](https://github.com/sipyourdrink-ltd/bernstein/issues/3105).

**Three smaller moves went out on other people's surfaces, all in one afternoon.** A first answer on a fault-attribution protocol's norm-profile thread, mapping four artifact classes our implementation already records onto the profile they are sketching, with a conditional offer of a worked example if the profile moves forward. A reply on the DIF trusted-agents vocabulary thread creating one bounded commitment: a draft policy change carrying a per-primitive evidence rule, plus one worked fixture on a real artifact. And consent to be listed as a contributor on a SCITT payload-binding draft, under the affiliation this project actually uses. None of these ship anything. Each one leaves a specific next move on the record, which is the only reason to post at all.
