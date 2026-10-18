---
id: "day-24"
title: "Day 24: Security Hardening — Gateway Bugs, Setup Commands, Cross-Protocol Resolve"
date: "2026-03-13"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 24: Security Hardening — Gateway Bugs, Setup Commands, Cross-Protocol Resolve

Three gateway bugs found and fixed. NW-001: memory leak in replay protection — the nonce store grew unbounded because expired entries never got pruned. Added TTL-based cleanup. NW-003: crash when an unregistered agent tried two-phase execution. Now returns a proper error instead of throwing. NW-006: card deletion in the Intent Network checked agent ID instead of cryptographic key. Anyone who knew an agent's ID could delete their card. Fixed to require signature verification.

All 30 gateway tests pass. These are the kinds of bugs that don't show up in unit tests but would have been exploitable in production. Finding them before anyone else did is the point of security hardening.

**SECURITY.md** published with a proper threat model and responsible disclosure process. Prompt injection sanitization added to Mingle. `npx agent-passport-system-mcp setup` now auto-configures Claude Desktop and Cursor — zero JSON editing required. Cross-protocol resolve endpoint live at api.aeoess.com for external protocol bridges.
