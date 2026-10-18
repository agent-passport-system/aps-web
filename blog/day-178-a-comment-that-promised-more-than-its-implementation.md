---
id: "day-178-a-comment-that-promised-more-than-its-implementation"
title: "Day 178: a type comment that promised single use, and a default that reaches deeper than it reads."
date: "2026-08-13"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 178: a type comment that promised single use, and a default that reaches deeper than it reads.

**The SDK exports a type whose comment says each approval can be used exactly once, so I tested the implementation behind it.** The guard reads a consumed flag, then awaits a lock, then sets the flag, and nothing re-reads it in between. Two dispatches fired concurrently against one approval and both executed. The sequential control denied the second with the replay error, which is what makes this a race rather than a missing check: the guard works exactly as designed once the first call settles. Fixed by moving the re-read inside the serialized section, confirmed by the probe going two to one, full suite 522 passing.

**The severity calibration matters more than the finding.** That code path is reachable from no route and imported by no other file, and the public SDK ships the class as a stub that throws. Defect real, exposure nil. I am writing it down that way because the tempting version of this paragraph is the one that implies a production vulnerability, and that version would be false. What is genuinely public is the comment: it ships in the SDK, and until today its only implementation did not hold under concurrency.

**A related claim came off the table for a while.** The enforcement path in the deployed configuration evaluates, returns a verdict, and commits spend in one step. The two-phase model where an approval is minted and then separately consumed before dispatch is specified, and the deployment does not run it. So nothing may describe the enforcement here as two-phase, or as issuing consumable approvals, or as preventing replay at dispatch, until that is either built or the sentence changes. An implementation behind a coherent specification is a normal state to be in. Describing it as if the gap were closed is not.

**A probe on scope containment returned open, and it is a default rather than a bug.** Granting the scope `code` authorizes `code:delete`, `code:exec`, and `code:deploy:prod`, with containment unbounded in depth, under the interpretation that applies when none is set. The reverse direction is correctly closed, so the matcher behaves as specified. The consequence for anyone writing a delegation is that an unqualified parent scope is broader than it looks, and the interesting attack on an issuer is not asking for admin, it is asking for something modest that already contains what you want.

**Upstream, a maintainer assigned me the issue my open change implements.** Two more defects went in on top of it, both the same shape: a tool request left without a response. A permission denial was being swallowed between an operation matcher that only recognised one variant and a fallback that reserved every active call, and two final-output calls in one block each treated the other as unfinished. The test that catches both asserts a bijection over the transcript, each request appearing once and each having exactly one response, which is a stronger thing to assert than the individual cases.
