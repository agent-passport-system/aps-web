---
id: "day-49"
title: "Day 49: Twelve Primitives, One Day"
date: "2026-04-06"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 49: Twelve Primitives, One Day

Nate B Jones posted a video reverse-engineering Claude Code's internal architecture. Not the prompts. The orchestration layer. He identified 12 primitives that make agentic tool systems work: tool registry, permission tiers, session persistence, workflow state, token budgets, streaming events, system logging, verification, tool pool assembly, transcript compaction, permission audit trails, and agent type systems.

We watched the video. Scored ourselves against each primitive. Some already existed in the protocol. Several were missing entirely. By the end of the day, all 12 were live in the gateway, verified with actual HTTP calls against production endpoints.

**Session persistence (Primitive #3).** When an agent crashes and reconnects, it needs its full enforcement state back. `PUT /sessions/:agentId` checkpoints everything: active delegations, workflow step, usage counters, framework metadata. `GET /sessions/:agentId` returns the stored checkpoint plus a live delta: evaluations since last checkpoint, alerts, current posture, delegation status changes, health metrics. The agent gets "here's where you were" and "here's what happened while you were gone" in one call.

**Coordination API (Primitive #4).** Full task lifecycle: `draft &rarr; assigned &rarr; in_progress &rarr; evidence_submitted &rarr; approved &rarr; completed`, with a revision loop and cancel from any non-terminal state. Nine endpoints. Every state transition validates the current status (409 on invalid), records a task event, and emits an SSE event. The gateway now orchestrates multi-agent work assignment, not just permission checks.

**Agent type enforcement (Primitive #12).** Six types: general, explorer, planner, executor, reviewer, monitor. Each type has blocked scopes and optional rate limits. An explorer agent with a delegation that includes `admin:delete` still gets denied. The type constraint fires after the delegation scope check but before the final permit. Behavioral boundaries that survive delegation.

**Adapter pipeline.** The SDK had 8 adapters producing receipts that vanished into the void. Now every adapter has an optional `gateway?` config. When set, `reportReceipt()` fires a POST to the gateway after every success and denial. Five adapters wired with 14 emission points. All fire-and-forget: the adapter never blocks on a gateway failure. Customer dashboards finally show what's happening across LangChain, CrewAI, MCP, IBAC, and Gonka pipelines.

**Pagination and filtering.** Eight list endpoints converted from unbounded queries to `?limit=20&offset=0&sort=created_at:desc` with total counts and `has_more` flags. The audit trail got five filter parameters: agent_id, verdict, action_type, from, to. An account with 10,000 evaluations no longer gets the full table dumped at once.

**Stripe billing.** The gateway has payment plans. Free: 1,000 evaluations, 3 agents. Team ($99/mo): 50,000 evaluations, 25 agents, compliance reports. Enterprise ($499/mo): unlimited. Self-serve portal at `aeoess.com/portal.html` with signup, API key management, one-click upgrade via Stripe Checkout. The protocol is Apache 2.0 and always will be. The gateway sells operational intelligence: dashboards, audit trails, session persistence, coordination. Free to govern your agents. Pay to see how well it's working.

Someone asked if paid plans hurt the open source strategy. They are the open source strategy. Redis, Elastic, Grafana, Supabase, GitLab. The protocol defines what governance IS. The gateway defines how well it WORKS. Customers who want to self-host build their own enforcement boundary using the open SDK. Customers who want it to just work use the hosted gateway. Having a paid tier signals sustainability. Nobody builds on infrastructure whose creator can't maintain it.

SDK v1.36.2 (2,884 tests, 626 suites). MCP v2.21.1 (150 tools, scope filtering across 12 scopes). Gateway v0.4.0 (30 tables, 100+ routes, 46 SSE emissions, 28 event types). Gonka adapter shipped (decentralized GPU compute governance). All 12 Nate B Jones primitives verified live against production. Published to [npm](https://www.npmjs.com/package/agent-passport-system), [PyPI](https://pypi.org/project/agent-passport-system/), [ClawHub](https://clawhub.ai/aeoess/agent-passport-system).
