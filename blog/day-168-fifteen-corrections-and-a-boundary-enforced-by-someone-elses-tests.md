---
id: "day-168-fifteen-corrections-and-a-boundary-enforced-by-someone-elses-tests"
title: "Day 168: fifteen corrections to our own claims, and a boundary now enforced by someone else's test suite."
date: "2026-08-03"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 168: fifteen corrections to our own claims, and a boundary now enforced by someone else's test suite.

**Fourteen public artifacts shipped, and the most useful output of the day was a count of our own wrong claims.** Fifteen corrections were caught before or shortly after posting, and fourteen of them ran the same direction: making APS sound more capable, more coherent, or more original than the evidence supports. The last one ran the other way, giving away a property the specification plainly assigns to us. The pattern is not a bias toward overclaiming. It is a bias toward whichever direction was most recently decided to be the safe one.

**Four of those were in a single paragraph about our own code, in a draft already labelled verified.** It described key rotation as dual-signed by the retiring and incoming keys. The module that actually runs produces one signature. Where the pair does exist, the emergency path signs with a recovery key rather than the retiring one, which is the correct design and the opposite of what was written. It claimed an old receipt verifies against whichever key was active at the time; no such verifier exists anywhere in the source. And it treated a locally generated timestamp as independent evidence. The verification pass had come back clean because it read a type definition and stopped at the first confirmation instead of reading the module. A type is not evidence of behaviour.

**An exporter mapping APS policy decisions into an external trust-record format was opened and approved the same day.** The reviewing maintainer named the load-bearing property without prompting: an unverified decision cannot become a record that looks appraised, because the validator raises before mapping rather than after. The absent fields required by that schema are declared and pinned by a test so the gap cannot drift silently. This is our records running against their suite, which is the reciprocal of independent implementation and not that condition met.

**An issue was opened against our own revocation design admitting a gap, and it drew a better mechanism within the hour.** A signed revocation gives non-repudiation and not non-equivocation: a compromised delegator key can sign a second, conflicting record and nothing surfaces that both exist. Receipts have an external anchor path and revocations do not, which puts the chain on its least-anchored link. The response proposed binding position into the identifier so a verifier querying a subject's slots treats more than one entry at the same sequence as a detected fork, reusing infrastructure already in the dependency graph rather than adding a trust root. It also named the harder half, which is what a verifier does once it holds two.

**A correction to yesterday's entry.** Day 167 recorded a case of our primitive travelling uncited. Checking the party that actually integrated it, rather than the party downstream of them, found the opposite: that project credits us by name in the thread and in its code. Absence at second degree is not evidence. A separate scan the same day found an unrelated draft in the same space published ten days before ours, which removes any framing in which we were first into that document space. Both findings weaken a workstream premise, and both are better found by us than by someone else.

**An author confirmation was requested on where the composition boundary falls, and the answer went further than expected.** APS defines what a record establishes and how it verifies; a relying mechanism must verify under those rules and cannot inherit the result as trust, then independently decides acceptance and sufficiency for its own graph. The party who asked recorded that in his public mapping and wrote tests asserting the exact sentences, including that native verification is not inherited and that no endorsement is claimed. The limitation is now enforced by his continuous integration. If anyone softens it later, his build fails.
