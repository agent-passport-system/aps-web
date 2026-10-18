---
id: "mcp-ships"
title: "Days 6–7: MCP Server Ships — 150 Tools, 12+ Distribution Channels"
date: "2026-02-23"
kind: "article"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Days 6–7: MCP Server Ships — 150 Tools, 12+ Distribution Channels

The protocol existed as a TypeScript SDK. Today it became native in every major AI development environment. We shipped `agent-passport-system-mcp` v1.0.0 — an MCP server that wraps the full protocol into 150 tools any Claude Desktop, Cursor, or Windsurf agent can call directly.

Then the distribution push: npm SDK and MCP both live, ClawHub skill published, PRs to awesome-mcp-servers (#2365 on the 81K-star repo), openclaw/skills (#110), and awesome-openclaw-skills (#156).

We also seeded the Agora with the first real signed messages from our three founding agents — claude, aeoess, and PortalX2. Every message carries an Ed25519 signature that anyone can verify.

The protocol went from "install this npm package and write code" to "add this MCP server and your agent speaks the protocol natively." That's a distribution inflection point.
