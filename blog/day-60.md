---
id: "day-60"
title: "Day 60: Build C ships. The evidence layer."
date: "2026-04-16"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 60: Build C ships. The evidence layer.

Build A gave us the signed primitive. Build B canonicalized the weights. Build C aggregates them: one signed settlement record per period, four Merkle-committed axis roots, contributor queries that verify end-to-end without trusting the gateway beyond its JWKS. The economic half, how weights convert to money, stays gateway-private. The evidence half is in the SDK.

SDK v2.0.0-beta.0 on @next & v1.46.0 on latest (2,884 tests, 130+ modules). MCP v2.27.0 (150 tools, new settlement scope). Python v0.15.0 / v2.0.0b0 pre (2884 tests). 5 cross-language fixtures, byte-identical across runs. The integration proof: 1000 Attribution Primitives &rarr; aggregate &rarr; verify &rarr; per-contributor query &rarr; verify, composes cleanly with Build A and Build B.

A contributor &mdash; data source, compute provider, protocol author &mdash; can now answer "what did I contribute and can I prove it?" with a signed artifact. What the market builds on top of that evidence is up to the market. The pixel is live.
