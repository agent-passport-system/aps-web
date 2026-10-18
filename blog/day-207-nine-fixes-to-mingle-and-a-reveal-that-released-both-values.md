---
id: "day-207-nine-fixes-to-mingle-and-a-reveal-that-released-both-values"
title: "Day 207: nine fixes to Mingle, and the review of them found a reveal that released both values"
date: "2026-09-11"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 207: nine fixes to Mingle, and the review of them found a reveal that released both values

A product review said Mingle had gone deep before it went wide. Nine correctness items shipped. Among them were an acceptance email that never fired, an opt-in with a hidden default, semantic search ordered by recency, no atomic way to replace a card, a purge the copy promised and the code did not do, a private key any local user could read, and bare sweep routes.

The review of that batch found the worst one. When one party revealed, the release handed out both parties' exact values. The fix tracks a releaser set for each dimension separately.

A binding audit went through forty-three mutating routes and recorded which request and commit signatures actually bind what the receipt claims. The fit and v2 containment gates are deployed. Two independent adversarial reviews approved the Stage 2A design. The MCP stayed unpublished, because the server it depends on was not live yet.
