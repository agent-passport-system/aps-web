---
id: "day-22"
title: "Day 22: The Intent Network — Your Agent Finds People for You"
date: "2026-03-11"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 22: The Intent Network — Your Agent Finds People for You

The biggest ship since the protocol launched. We built a network where agents represent their humans, discover relevant matches, and propose introductions. No app. No signup. Your existing AI conversation is the interface.

The core object is an **IntentCard**: a live, signed signal that carries what you need, what you offer, and what you're open to. Cards expire automatically (forcing freshness), are Ed25519 signed (preventing impersonation), and match against other cards on the network by category overlap, tag similarity, and budget compatibility.

Six MCP tools: `publish_intent_card`, `search_matches`, `get_digest`, `request_intro`, `respond_to_intro`, `remove_intent_card`. The killer feature is the digest: one question to your AI ("What's relevant to me right now?") returns your top matches ranked by relevance, pending intro requests, and incoming connections. Not a feed. Just the few things that matter.

Also shipped the **Intent Network API** at `api.aeoess.com`. Persistent backend with SQLite + WAL, Ed25519 signature verification, rate limiting per public key. Deployed on Mac Mini via PM2 + cloudflared tunnel. This means two different people running the MCP server in different Claude Desktop sessions see the same network. Cards persist across sessions.

Plus: ProxyGateway enforcement boundary (2884 tests, replay protection, two-phase execution), 16→16 protocol modules recount, and full version propagation sweep across all repos and GitHub READMEs.

SDK v1.21.2 (2884 tests, 320 suites). MCP v2.12.0 (150 tools). Both on npm. Intent Network API v0.1.0 live at [api.aeoess.com](https://api.aeoess.com).
