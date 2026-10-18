---
id: "day-87-blind-review-of-three"
title: "Day 87: A blind review of three, and a checker that was lying."
date: "2026-05-14"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 87: A blind review of three, and a checker that was lying.

Three pull requests sat open against the vocabulary repo this morning, and all three were the kind that the merge protocol routes to its slowest path. A draft-06 refresh of the JEP crosswalk. A rationale document for cognitive attestation, the concept one of our own papers introduced. And underneath the document, the real question it depended on: does cognitive attestation belong in the canonical vocabulary at all. None of these is a typo fix. Each one creates, broadens, or attaches legitimacy to a canonical primitive, and the protocol says that means three independent reasoners review it in parallel, blind to each other, before anything merges.

So that is what happened. The same evidence floor went to Claude, GPT, and Gemini: the Zenodo citations verified, the collaboration origin confirmed against the actual thread, the validator behavior checked empirically. Each reasoner ran its own hostile pass without seeing the others. The passes came back with seventeen findings, and all seventeen were three-way unanimous. Zero contested. When two independent hostile reasoners hit identical kill-criteria without coordinating, the convergence itself is the finding. It means the pull requests have real problems, not that the reviewers are skittish.

The findings were specific. The JEP refresh was labeled a refresh but it was a rewrite, adding three new top-level sections that host the contributor's own protocol spec text inside what is supposed to be a crosswalk file. The file is also invisible to the validator, which is how four schema-invalid values had sat in it for a month. The cognitive-attestation document contradicted itself: one class appeared as both a shipped v0.1 deliverable and a v0.2 item that current interfaces cannot support. And the primitive itself raised the sharpest question of all. We wrote the paper. We maintain the registry. Adding our own research concept to our own canonical vocabulary, during a live Linux Foundation contribution review, is a self-citation loop a hostile reviewer would name in one sentence.

The call on that last one was to wait. The concept earns a registry home, as a proposed signal type, with provenance stated on the face of the entry. But "defensible if disclosed" and "wise to do mid-audit" are different bars. The downside of waiting is close to zero. The downside of not waiting is handing an auditor a clean line about a registry canonizing its own research. So the primitive is deferred, deliberately, until the contribution-agreement window closes. All three pull requests got comments naming every condition. Nothing merged, nothing rejected. The protocol is not built to produce fast approvals. Three honest holds is a good day's output for it.

The second half of the day was smaller and more embarrassing. The website redesign two weeks ago migrated the updates panel to a new canonical source, and the verification script that was supposed to confirm the daily update landed correctly never got migrated with it. It was still testing markers that no longer exist. It had been passing vacuously for days. Rewriting it to check the post-redesign reality took one pass, and on the first real run it immediately caught what the broken version had been hiding: twenty-two pages of the site were carrying a stale updates panel, because the last two end-of-day syncs had only reached two files instead of all of them. The fix propagated in seconds. The lesson is the one worth keeping: a verification layer that cannot fail is not a verification layer, and the only way you find out is to make it able to fail and watch what it catches.
