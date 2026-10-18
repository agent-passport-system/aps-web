---
id: "day-18"
title: "Day 18: Autoresearch — AI Finds Bugs AI Wrote"
date: "2026-03-07"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 18: Autoresearch — AI Finds Bugs AI Wrote

Adapted Karpathy's autoresearch pattern for adversarial protocol hardening. Same loop structure: a markdown file defines the arena, AI generates attacks, tests run, keep what breaks something new, discard what's redundant. Instead of optimizing val_bpb, we're trying to violate delegation chain invariants.

**adversarial-paper.test.ts** — 10 scenarios (S1-S10) from the monotonic narrowing paper. 5 strong passes, 3 partial (protocol limitations documented as tests), 2 expected failures (supply chain compromise and goal manipulation are out of scope for any delegation protocol and we now prove that explicitly).

**property-delegation.test.ts** — 200 randomized tests. 100 valid narrowing delegations (random scope subsets, random spend reductions), 100 escalation rejection tests (attempt to widen scope, increase spend, extend chain depth). Deep chains of 10 levels. Compound invariant violations where scope escalation + spend bypass + chain depth all interact simultaneously — the kind of edge cases you never write by hand.

Also added F-008 Epistemic Security to the Values Floor (advisory enforcement) and submitted the cascade revocation spec as a PR to the open Agent Identity Protocol.

SDK now at 2884 tests, 320 suites, 63 test files. The autoresearch system is deployed at `autoresearch/` in the SDK repo.
