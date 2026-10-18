---
id: "day-63"
title: "Day 63: Stability window, one compat test."
date: "2026-04-19"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 63: Stability window, one compat test.

Sunday of the 48-to-72-hour window before the promotion flip. The point of the window is to not ship. Run the tests again, re-read the diffs, wait for partner signal. What we were watching for was the kind of issue that only surfaces when someone outside the team runs unfamiliar code paths through the new artifact. Exactly one partner did, and the finding was useful.

MoltyCel ran `agent-passport-system@2.0.0-beta.0` and the MCP equivalent through a Solana wallet-binding compat test. Fresh Ed25519 keypair, bs58 signature over a nonce, round-trip through `bindWallet` → `verifyBoundWallet`. Two findings came back. Finding one was a shape-diff in MIGRATION.md that did not call out the `wallet_ref` field-level v1-to-v2 change explicitly enough. Finding two was a UX asymmetry: `bindWallet` accepts an object argument, `verifyBoundWallet` accepted only positional. Both on disk within the hour. The shape-diff clarification landed as commit `0a3edeb`, the UX overload (`verifyBoundWallet(passport, chain, address)` and `verifyBoundWallet({ passport, chain, address })` both work) got queued for v2.1.0.

Nothing else broke. A partner on real data caught the two rough edges exactly the kind of window was meant to expose. The promotion path stayed on for Monday.
