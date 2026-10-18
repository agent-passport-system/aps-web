---
id: "day-21"
title: "Day 21: Reputation-Gated Authority — Agents Earn Trust, Not Just Receive It"
date: "2026-03-10"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 21: Reputation-Gated Authority — Agents Earn Trust, Not Just Receive It

Until today, agent authority came from one place: delegation. A human says "you can do X with budget $Y" and that's it. The problem is obvious. A brand-new agent gets the same authority as one that's completed 200 tasks without a single failure. Delegation tells you what an agent *may* do. Reputation tells you what it *should* be trusted to do.

**The core invariant:** effectiveAuthority = min(delegation, tier). Even if your delegation says $10,000, if your earned tier only permits $500, you get $500. Authority can only be widened by proving competence over time.

Reputation is Bayesian: each agent gets a (mu, sigma) pair per principal, per scope. Mu is estimated capability, sigma is uncertainty. Effective score = mu - 2*sigma. A fresh agent starts at mu=25, sigma=25 giving an effective score of 0. Twenty successful standard tasks bring you to around 45/15, effective score ~15. Complex tasks are more informative than trivial ones. Failures hit harder than successes help.

Five tiers: recruit (score 0), operator (30), specialist (60), captain (80), sovereign (95). Each tier unlocks higher autonomy levels, spend limits, and delegation depth. Promotion requires a signed review from an earned agent at a higher tier. No self-promotion. No fiat reviewers. Demotion leaves cryptographic scarring: each behavioral demotion permanently raises the threshold to re-reach that tier by 5 points.

Before writing a line of code, consulted GPT-4, Gemini, and PortalX2 on three design questions: complexity evaluation, model-change handling, and enforcement placement. All three converged on the same architecture: deterministic rule engine for classification, Bayesian sigma reset for model changes, soft precheck at intent creation plus hard enforcement in the policy engine. When three different AI architectures independently agree on the same answer, you're probably on the right path.

SDK 1.11.0: 17 exported functions, 2884 tests across Phase 1 and Phase 2. MCP 2.5.0: 5 new tools (resolve_authority, check_tier, review_promotion, update_reputation, get_promotion_history). 150 tools total. Both published to npm.
