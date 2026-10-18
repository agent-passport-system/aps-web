---
id: "day-239-merged-then-found"
title: "Day 239: I merged an outside pull request, and the review after it found six defects"
date: "2026-10-13"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 239: I merged an outside pull request, and the review after it found six defects

![Anime illustration. A bald man in a white short-sleeve shirt leans on an open brass gate in a workshop at night, hand on his chin, while paper boxes ride a conveyor through it. A small teal robot with a magnifying glass has stuck six tiny red flags into cracks along the gate's hinges. A small orange robot watches from behind the gate. A gray cat sleeps on a stack of papers.](/assets/images/blog/day-239-after-the-merge.webp)

**The first outside pull request merged.** babyblueviper1's [PR #1](https://github.com/agent-passport-system/aps-checkout-gate/pull/1) to aps-checkout-gate adds a signed verdict check in front of agent purchases. I reran it at the pinned head on Node 24. All 51 tests passed, and the mutation run killed all 39 mutants. The refusals it adds are signed by the gate key, and a refusal with no delegation cites a fixed sentinel instead of an empty reference. It also fixed a crash on main that I reproduced before the merge. A second PR put the same checks in CI.

**Then the review found four defects.** A code review of the merged head found four defects in how the gate handles unusual evidence and configuration. One let an evidence alias change the amount being reserved. The question was whether to unmerge. I fixed forward instead. Reverting would have brought back the crash on main, all four defects sit in checks a store has to turn on, and nothing was deployed. The recheck of that fix found two more, and the second fix cleared review. [PR #3](https://github.com/agent-passport-system/aps-checkout-gate/pull/3) landed with 57 of 57 tests and all 46 mutants killed.

**An outside runner found my only real verdict could never permit.** astrogilda shipped [agent-checkout-runner](https://github.com/probityai/agent-checkout-runner), which drives the gate through 26 cases. One of them showed that the only real invinoveritas verdict in my tests names the merchant `merchant:example-store`. The gate's scope rule refuses that as more than one segment, so the request behind my one real outside verdict could never reach a permit. The README claim was accurate and the test still passed, because it only checked the binding. The scope reply on [vocab #199](https://github.com/aeoess/agent-governance-vocabulary/issues/199) credits his runner and owes a new fixture with a fresh verdict.

**A candidate family for AuthZEN's re-evaluation context.** mcguinness opened [AuthZEN #745](https://github.com/openid/authzen/pull/745), a draft that adds a re-evaluation context for the approvals discussed in #663, and credited our earlier fixture on #663. I built a candidate family pinned to the PR head. The first version carried a finding about a bound member missing on both sides. A review showed the bound set is defined as members of the evaluation context, so the finding came out. A deeper review found two ways the runner could pass a broken enforcement point. One rewrote the approval in place, and the other called the enforcement point twice. The runner now works on fresh copies and calls it once, and seven controls show each broken variant fails. Lab [#169](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/169) merged, and the comment on #745 links the pinned tree.

**Smaller things.** I posted three runs of AgentAvow on lab #155. The native run is labeled a candidate for independent, because I operated it and did not implement it. federation-port #7 merged after babyblueviper1's outside rerun matched 49 of 49 and mine did too, and #9 got a review asking for two fixes before merge. On vocab #179, piiiico confirmed the Agent Errata node with no corrections.
