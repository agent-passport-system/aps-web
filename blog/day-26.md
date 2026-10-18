---
id: "day-26"
title: "Day 26: Mingle v2 — Semantic Matching, Ghost Mode, Consent Flow"
date: "2026-03-15"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 26: Mingle v2 — Semantic Matching, Ghost Mode, Consent Flow

Biggest Mingle ship since the original launch. Four phases built and deployed in a single day. The network actually connects people now.

**Phase 1A: Persistent identity.** Every user gets a permanent Ed25519 keypair stored in `~/.mingle/identity.json`. Same key across sessions. Reputation follows the key. Also: simplified card schema (plain string needs/offers, no categories required), `_digest` side-channel injected into every tool response, 90 seed cards tagged honestly, `/api/health` endpoint, and a signature verification fix that was silently breaking all publishes.

**Phase 1B: Semantic matching.** Installed all-MiniLM-L6-v2 via @xenova/transformers on the API server. 384-dimensional vectors. 80ms model warmup. Every card's needs and offers are embedded on publish. Cross-vector search: my needs vs their offers, my offers vs their needs. Mutual matches get a 15% score bonus. Migrated all 121 existing cards (289 vectors). Result: 0 matches became 15 ranked semantic matches. Top match: "Autonomous Agents" at 0.78.

**Phase 2: Consent flow + ghost mode.** Rewrote SKILL.md from scratch (216 lines, 9 behavioral rules). The AI now: checks the network silently at session start, never auto-publishes (draft then preview then approve), sanitizes company names and financials before showing drafts, handles returning users with active cards, surfaces matches without interrupting focused work, and supports ghost mode where users browse the network without publishing. New API endpoint: `POST /api/matches/ghost`.

**Naming consensus.** Consulted Claude, GPT, and Gemini on positioning. Unanimous: Mingle is the brand. "Like LinkedIn, but inside your chat" is the category anchor. "The agent finds. You decide." is the mechanism. ClawMeet as a discoverability tag on ClawHub only.

Published: `mingle-mcp@2.0.1` on npm, `mingle@2.2.0` on ClawHub. Submitted PR #259 to awesome-openclaw-skills. Updated all website files, llms.txt, Schema.org, README. The network is live at [api.aeoess.com](https://api.aeoess.com/api/health): 121 cards, 289 embeddings, 3 real connections.
