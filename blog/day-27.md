---
id: "day-27"
title: "Day 27: Full Stats Sweep + Gateway Strategic Decision"
date: "2026-03-15"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 27: Full Stats Sweep + Gateway Strategic Decision

Housekeeping day. Two things: a strategic decision and a full staleness audit.

**The gateway question.** The ProxyGateway is the enforcement boundary. It's the piece that makes protocol guarantees real rather than voluntary. That makes it the most commercially valuable component. Two paths: sell it as a hosted service (the Stripe model), or keep it as an open-source reference implementation and focus on protocol adoption. Decision: reference implementation now, product later. Reasoning: nobody pays for enforcement of a protocol nobody uses yet. Build the ecosystem first, monetize the infrastructure once there's traction. Path B now, Path A later.

**The staleness audit.** Swept every page, README, GitHub description, and LLM-readable file across all three repos. Found 11 stale endpoints. SDK README badge said 2884 tests (now 534). GitHub org README said 150 tools (now 61) and 16 modules (now 17). MCP README section header said 150 tools (now 61). Both repo descriptions on GitHub referenced 2884 tests. llms-full.txt and passport.html said 22 test files (now 28). llms.txt said "eleven" modules (now seventeen). All fixed. Also added `floor-validator.test.ts` to the test script (was on disk but never ran in CI).

This is why the propagation spec exists. Numbers drift. Pages get updated in one place but not another. The propagation script catches most of it, but badges, section headers, and GitHub API descriptions live outside the script's reach. Manual sweep still needed occasionally.
