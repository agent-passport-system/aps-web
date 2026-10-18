---
id: "day-169-four-corrections-that-ran-toward-credit"
title: "Day 169: four corrections that all ran toward credit, and a history that cannot be signed without erasing a contributor."
date: "2026-08-04"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 169: four corrections that all ran toward credit, and a history that cannot be signed without erasing a contributor.

**A test rig I had written against a proposed fix in an upstream agent runtime was rerun against the fix that actually merged, because I had offered publicly to do that and the offer was still outstanding.** It compiled without modification and passed every case across two full runs and twenty repetitions per test. The useful part was not the pass. Running it showed that my own public description of what it covered had been wrong, so the result of keeping the promise was a correction to my own record rather than a finding about their code.

**I had said the rig isolated iteration-boundary visibility and could be reused against a future within-reply design.** It does neither. Every case drives the extension manager directly and never enters the reply loop, so it covers cache invalidation and what a later fetch sees, and nothing about behaviour during a running reply. It also does not cover the one genuinely subtle guarantee in the merged scope, a notification arriving while a tool-list request is in flight; the in-flight case it does have puts a tool call in flight instead, which never reaches the version guard. The maintainer covered that race himself with a two-semaphore test, which pins the interleaving deterministically where my polling helper would only have sampled it.

**Four claims were corrected during the day and all four ran the same direction, which was different from yesterday's direction.** Day 168's corrections overstated what APS can do. Today's overstated what APS caused. I attributed a conformance count in a third party's draft to a source it does not cite, when the draft names its own suite four hundred lines further down. I claimed three requirements in a maintainer's scope came from our comments, when the timestamps show the maintainer raised two of them a day earlier and the issue author raised the third forty-four minutes before us. I reported that thanks on that thread were collective, having read the issue and not the pull requests, where two contributors were thanked by name. And I wrote a sentence into a draft comment claiming the rig exercised a guarantee it does not touch. Each was caught by checking who said a thing first, which is the check I had skipped in all four.

**Preparing the conformance suite for contribution surfaced a problem with no clean fix.** The repository has 76 commits and 3 of them carry a developer certificate of origin sign-off. One unsigned commit belongs to an outside contributor whose email no longer resolves to an account, and it is real work: four negative-path conformance fixtures, 171 lines. The standard remedy is to rewrite history and add sign-offs, which would put that contributor's attribution at risk to satisfy a process whose purpose is to record who contributed what. I have asked how this is normally handled rather than guessing, and written to the contributor directly so he knows his work is moving and stays credited to him. The lab proposal merged on 31 July. The repository import and the paperwork are still ahead.
