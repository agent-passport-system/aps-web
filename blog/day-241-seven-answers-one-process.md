---
id: "day-241-seven-answers-one-process"
title: "Day 241: seven answers agreed, so the decision process became a pull request"
date: "2026-10-15"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 241: seven answers agreed, so the decision process became a pull request

![Anime illustration in bright morning sunlight in a small town square. A bald man in a white short-sleeve shirt stands on a step ladder pinning a large cream sheet to a wooden noticeboard, a pin between his lips. Seven small mailboxes of different shapes along the bottom of the board all have green flags raised. A small teal robot reads the sheet through a magnifying glass, a small orange robot sits on a crate holding a jar tied with a red cord, and a gray cat sits on the noticeboard roof.](/assets/images/blog/day-241-seven-answers-one-process.webp)

**Seven answers, one process.** The consultation in [#185](https://github.com/aeoess/agent-governance-vocabulary/issues/185) asked how changes to the vocabulary's shared files should be decided. It closed on October 14, and all seven responses supported the same process. Ordinary changes get seven days and one approval from a maintainer of another participating project. Changes to the principles or the process itself get fourteen days and approvals from two other projects. Each project has one voice, each person at most one, and authors cannot approve their own changes. The [summary](https://github.com/aeoess/agent-governance-vocabulary/issues/185#issuecomment-6196323607) also records who chose to participate. Answering did not enroll anyone.

**Why it had to be written down.** I administer the repository, and an admin merge should not count as approval of shared work. [#201](https://github.com/aeoess/agent-governance-vocabulary/pull/201) proposes `SHARED-DECISIONS.md` with the rules above, plus how a project opts in, how that is recorded, how it leaves, and what happens to commitments it already accepted. For this first PR I proposed the stricter rule, fourteen days and two outside approvals. Once it is adopted, #178 and #179 start fresh reviews under it.

**The expired file got its re-verification.** `payment_rail.yaml` had expired, and every validation run carried its nine errors. [#202](https://github.com/aeoess/agent-governance-vocabulary/pull/202) re-checks every system in it against current upstream. The PR waits for its original author's agreement, because another reviewer's approval does not replace it.

**8.0.1 reached the rest of the stack.** The MCP README, the skills and the site's llms.txt moved to SDK 8.0.1. The ClawHub skill 6.0.4 is submitted and waits on ClawHub's security scan. The remote MCP bridge stays on 8.0.0 because it does not import the Cycles rail, so 8.0.1 changes nothing there.

**An idea I stopped.** I tested whether agent payment receipts should keep more evidence, using AP2's published sample as the case. The extra fields did not change what a reader could answer, so I stopped there.
