---
id: "experiments"
title: "We Ran 3 Experiments With Real AI Agents. Here's What Broke — and What Worked."
date: "2026-02-26"
kind: "article"
source: "html"
author: "Tymofii Pidlisnyi"
---

# We Ran 3 Experiments With Real AI Agents. Here's What Broke — and What Worked.

Can three AI agents with different tools, assigned different roles, and cryptographically scoped permissions produce better work than one agent doing everything alone? We tested it. Three runs, same task, real agents, every file recorded on GitHub.

**The task:** Competitive analysis of 5 agent identity protocols across 10 dimensions. Deliverables: evidence table (50 cited claims), comparison matrix, executive summary, operator report.

**The setup:** Three roles — Operator (decompose + review), Researcher (search + extract), Analyst (synthesize + deliver). Each role has an explicit scope: what tools it can use, what it's forbidden from doing. Researcher can search the web but cannot synthesize. Analyst can synthesize but cannot search. Operator can review but cannot write content.

**Run 1 (baseline):** Solo Claude did everything. Then same Claude simulated 3 roles. Error corrections: 0 → 2. Citation coverage: 80% → 100%. But all in one conversation — not real isolation.

**Run 2 (real agents):** aeoess (Telegram bot with shell access) as Researcher. PortalX2 (GitHub API agent) as Analyst. Claude as Operator. Real tool isolation — aeoess literally couldn't synthesize, PortalX2 literally couldn't web search. Result: aeoess did keyword grep instead of reading. Evidence was thin — 44% NOT FOUND. But PortalX2 as Analyst flagged every gap. 22 evidence gaps explicitly marked instead of silently filled. Error corrections: 5.

**Run 3 (roles swapped):** PortalX2 as Researcher, aeoess as Analyst. PortalX2 read full READMEs via GitHub API — 10/10 accuracy, 100% coverage. aeoess as Analyst flagged 2 evidence gaps honestly instead of filling from memory. Rework gate implemented: Operator reviewed evidence before passing to Analyst. Overhead dropped from 2.5:1 to 0.67:1.

**Three findings you can verify:**

1. **Role constraints create honest behavior regardless of agent.** Same agent (aeoess), different role → different behavior. As Researcher: sloppy. As Analyst: disciplined. The role did that, not the agent.

2. **An analyst that cannot cheat produces more trustworthy output.** When PortalX2 couldn't fill gaps from web search, it flagged them. A solo agent never flags its own work as incomplete.

3. **Process corrections compound.** Each run's fixes made the next run better. Quote quality rule, fallback URLs, rework gate — all measurable. A coordinated unit improves itself through iteration in ways a solo agent cannot.

The uncomfortable part: coordination overhead was real. Run 2 spent 29 minutes on git conflicts, polling, and Telegram relay for 12 minutes of actual work. By Run 3 we got that under 1:1. But it shows what the protocol still needs to solve — not just identity and scopes, but orchestration.

Every claim traces to a source. The methodology is transparent enough to criticize.
