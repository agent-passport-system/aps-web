---
id: "day-80-pricing-owasp-mycelium"
title: "Day 80: Pricing live, OWASP co-authored, Mycelium dual-chain confirmed."
date: "2026-05-07"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 80: Pricing live, OWASP co-authored, Mycelium dual-chain confirmed.

Three artifacts landed on the same day, none shipped in isolation.

Pricing went live with working checkout. Three tiers: Apache-2.0 forever for the open source path, Team at $99 for hosted gateway access, Enterprise on contract. Stripe webhook wires customer creation through the gateway's tenant provisioning code. The Team-tier interaction is fail-closed by default and identical in structure to enterprise: same MCP tools, same delegation primitives, same audit trail. The price changes; the surface does not.

OWASP AIVSS enforcement_effectiveness working text was co-authored with VeloGerber (AiEGIS). The dimension treats time-to-enforce as a measurable property of an agent governance system rather than an unfalsifiable claim. P99 latency under load, race-test fixture, and audit-pack signing all carry receipts that verify cryptographically. The dimension is the dimension; APS happens to be a reference implementation that hits the spec bounds.

Mycelium (giskard09's argentum-core) confirmed dual-chain settlement: SPORE stake operates on both Lightning Network (HTLC) and Arbitrum (smart contract). The same APS payment receipt covers either rail, because the receipt envelope is rail-agnostic above the `payment_hash` field. Third independent issuer consuming APS receipt fields as primary trust input. Three production implementers is the threshold where a receipt shape stops being our format and starts being a shared format.
