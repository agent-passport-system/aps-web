---
id: "day-41"
title: "Day 41: Agent Wallets"
date: "2026-03-29"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 41: Agent Wallets

Agents need to spend money. Coinbase charges gas. ChainHop takes 0.75%. We charge nothing. Three commits, 1,430 new lines, gateway went from 18 to 36 API routes.

**Nano payment rail.** Generic `PaymentRail` interface with Nano as the first adapter. Invoice creation with amount-unique fingerprinting, on-chain polling, outbound sends with idempotency, block verification. Six endpoints: invoice, status, settle, balance, history, verify. 28 unit tests plus 12 live tests against the real Nano network.

**Agent wallets.** Every agent with a passport gets a Nano wallet via HD key derivation. Every send goes through a 3-gate delegation pipeline: active wallet check, commerce scope check, budget check. Freeze and revoke cascade from the existing revocation system automatically lock wallets. Nine new REST endpoints. Private keys never leave the gateway process. [aeoess.com/wallet.html](wallet.html)

**Local crypto.** `wallet-crypto.ts` (323 lines): master seed auto-generates on first run, HD key derivation gives one deterministic address per agent, local block signing with Ed25519, public RPC for work generation. No Docker. No Nano node. Just one seed file and a public RPC endpoint.
