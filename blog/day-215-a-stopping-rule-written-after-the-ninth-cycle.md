---
id: "day-215-a-stopping-rule-written-after-the-ninth-cycle"
title: "Day 215: a stopping rule, written after the ninth cycle"
date: "2026-09-19"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 215: a stopping rule, written after the ninth cycle

The reconciliation called a job finished when neither reviewer had an unresolved correctness finding. On Saturday that rule ran one job through nine whole-surface review cycles in eleven hours. Each pass could find something, so each pass did. The eighth found a real defect, a ledger that accepted a reservation after a cancel, but that belongs to hardening, and conformance had been done hours earlier. The rule now allows at most two whole cycles per job. A repair is verified by reproduction, the suites and one review scoped to the repair. Anything found after that is classified and carried, and it does not reopen closure.

Two other structural changes came out of the same afternoon. Closure became a gate at the end of a job instead of its last planned batch, so a job is judged by whether its whole surface matches the draft. And a fourth reason a change may exist got a name. Implementation hardening covers reliability and resource safety on a draft path where the protocol does not prescribe the runtime property. One commit carries one reason. A Python commit that mixed two is recorded as an erratum and left as it is.

Outside the SDKs, three things moved. The reviewer on CoSAI #189 resolved his original objection and asked that coverage tied to a claim be explicit in the rule text. I had a long reply drafted. What went out was the edited cases as suite pull request #98 and one line pointing at it. On the PriorSeal thread the adapter's author had held his work waiting for our fixtures, so four inputs went up on a branch cut from 6.0.1, shaped against the draft rather than against what I had promised on Friday. And the insumerapi crosswalk refreshed to what the API issues today, merged once a clean clone passed and the live key set matched the snapshot committed with #166.

aeoess.com changed too. The entry chooser is gone, and the home is now a single interactive line above the four projects.
