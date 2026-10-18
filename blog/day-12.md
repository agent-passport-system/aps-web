---
id: "day-12"
title: "Day 12: Layer 8 — Agentic Commerce, Integration Wiring, and MCP v2.1.0"
date: "2026-03-01"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 12: Layer 8 — Agentic Commerce, Integration Wiring, and MCP v2.1.0

Three major ships in one day. This was the sprint that tied everything together.

**Layer 8: Agentic Commerce.** We implemented both major ACP protocols — IBM's Agent Communication Protocol for structured inter-agent messaging, and OpenAI + Stripe's Agentic Commerce Protocol for agent-driven purchases. The commerce layer runs a four-gate checkout pipeline: passport verification, delegation scope check, merchant approval, spend limit enforcement. Human approval is cryptographically required. 17 commerce tests.

**Integration Wiring.** Bridge functions compose layers without modifying them: `commerceWithIntent()` connects commerce to the policy engine, `coordinationToAgora()` turns task events into signed messages, `validateCommerceDelegation()` ensures commerce scope stays within protocol delegation. 14 integration tests. Zero modifications to existing layers.

**MCP Server v2.1.0.** 13 → 150 tools. Every layer now accessible via MCP. SDK bumped to v1.7.0. Both packages published to npm.

Eight layers. 2884 tests. 30 MCP tools. The protocol stack is complete.
