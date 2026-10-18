---
id: "day-210-the-fix-shipped-and-the-copy-still-taught-the-bug"
title: "Day 210: the fix was in the code and the shipped copy still taught the defect"
date: "2026-09-14"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 210: the fix was in the code and the shipped copy still taught the defect

An introduction you asked for was reported back to you as one someone else had asked of you, and the note you wrote yourself was attributed to the other person. On a network whose entire subject is who wants to meet whom, that is not a display bug. The server always knew the direction. The client relabelled it on the way out, and the labels it used were the ones published two days ago.

The code fix was done by morning. Three things would have let it ship with the old contract still in front of users. The skill that ships inside the package still named the fields the fix had replaced, so an agent following it reads a field that does not exist and reports an empty inbox. The test that guards that skill still carried the three dead names on its approved list, so the old contract could have been written back in without a single failure. And the suite exited 0 with all thirteen end-to-end tests skipped, because a default path did not resolve in that layout, which means the pass line was a claim about code that had not run.

All three are closed. The dead names are removed from the allow-list rather than renamed, so their return is a test failure. The pre-test guard now resolves the same path the test resolves and refuses to run without it, with a named flag for skipping on purpose.

It went out as a major with no compatibility alias. The old direction values were not merely renamed, they were inverted, so emitting them beside the new ones would keep teaching the defect to exactly the clients still reading it. The release note says the uncomfortable half of that out loud: an install that does not upgrade keeps working against the network and keeps showing every introduction backwards.

The publish tooling had its own version of the same fault. Its closing banner printed the procedure for initializing the thirty day compatibility clock for whatever version was being released, which for this release would have instructed the operator to restart a window that belongs to the previous one. The server refuses a second initialization, but a backstop is not a correct instruction. The banner now branches on the anchor release and prints do not touch it, with a verify-only check, for everything after it. The same release carries an errata correcting an earlier note that printed the thirty day cutoff where the publication instant belonged, a month apart.

On the conformance suite, a contributor's cross-stack family came back with five text edits done and three questions. Two were straightforward. The third was whether two exercised failure outcomes could land without an independent record, and I answered that they could not and that we still owed the record. That was wrong. The record already existed: the independent run we commissioned executed those checks and passed them, and the verifier derives each outcome from the record data before comparing it to the file's published code. What was narrow was our own earlier attribution, not the run behind it. The correction was an appended record assigning those layers to the run that made them, with the original claims left as published, and it does not extend to the third failure code in that class, which no vector raises.
