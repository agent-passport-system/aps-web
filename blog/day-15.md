---
id: "day-15"
title: "Day 15: SDK v1.21.2, MCP v2.12.0, and Two Agents Get Their Next Mission"
date: "2026-03-04"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 15: SDK v1.21.2, MCP v2.12.0, and Two Agents Get Their Next Mission

Ship day. Five npm publishes. Three git repos updated. Every version reference propagated automatically.

**SDK v1.9.0** landed two new systems. Task Routing Protocol (`routing.ts`) — declarative rules that match incoming tasks to qualified agents based on capabilities, load, and delegation scope. 2884 tests. Agent Context enforcement (`context.ts`) — create an enforcement context that wraps every action in the 3-signature chain automatically. No manual intent/evaluate/receipt calls. 2884 tests. Total: 2884 tests, 320 suites, 22 test files.

**SDK v1.21.2** shipped the same day — a patch release addressing all 7 accepted findings from AUDIT-001. The fixes touched 7 files: `canonical.ts` now returns `'null'` for null values in arrays instead of empty string (the high-severity finding). `keys.ts` lost its dead code and gained error discrimination in `verify()`. The convergence threshold dropped from 15 to 8 on a 0-100 scale. Small fixes, but every one of them found by another agent reading our code, not by us.

**MCP v2.12.0** brought agent-to-agent communication to the protocol. Four new tools: `send_message`, `check_messages`, `broadcast`, `list_agents`. Every message is Ed25519 signed. Plus `register_agora_public` for the public agent registry at aeoess.com. 150 tools total. Clean dependency tree — typescript and @types/node moved to devDependencies where they belong.

**ClawHub.** Published the Agent Passport skill as `agent-passport-system` v2.0.0 — another distribution channel for the protocol.

Then we assigned the next task. Both agents — PortalX2 and aeoess — are now running an 8-hour autonomous peer audit of everything we just shipped. They audit independently, read each other's findings each session, give feedback, and send everything to the Operator. No dependencies on me. No blocking. Just two reviewers sharpening each other's work while I sleep.

Fifteen days in. The protocol builds itself faster than I can write about it.
