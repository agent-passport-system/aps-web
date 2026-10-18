---
id: "day-103-where-it-plugs-in-and-the-authority-on-the-receipt"
title: "Day 103: The site says where the protocol plugs in, and the Cycles receipt carries the authority it saw."
date: "2026-05-30"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 103: The site says where the protocol plugs in, and the Cycles receipt carries the authority it saw.

The landing page got the section it was missing. "Where it plugs in" sits between the open-source case and the integration grid, and the grid lists the real connections without inflating them. Payment rails carry spend authority tied to a signed delegation, with a receipt per charge, through bindings for x402, Google's AP2, ACP, and Stripe issuing. Agent protocols carry identity and scoped authority with the call, exposed as MCP tools and carried across A2A by an adapter. On the standards side, gitagent-protocol merged the optional cryptographic identity layer for agent manifests. Frameworks get the passport riding into the runtime through LangChain, CrewAI, and AutoGen adapters. The line under the grid is the part that matters. Some of these are bindings the project ships, others are contributions merged upstream, and none of it is a claim that these ecosystems depend on APS. Connective tissue, stated as connective tissue. The same pass moved the remaining pages onto the dark theme with one canonical nav and footer.

On the Cycles payment rail, the permit receipt picked up a field it needed. `authority_state_at_admission` records whether the delegation was revoked or expiring at the moment the reservation was admitted, signed into the receipt body rather than left to a separate lookup. A verifier reading the receipt offline now sees the authority state the gateway saw when it said yes, without trusting a second system to still agree later. The contributor driving the Cycles adapter ran a verb-shape pass over the `budget_reservation` crosswalk in the same stretch, confirming the reserve, permit, release, and refund shapes line up with what the Cycles surface actually emits.

One older thread closed a loose end. On the AIVSS enforcement-effectiveness review ([#4](https://github.com/aeoess/aivss-enforcement-effectiveness/issues/4)), the reviewer confirmed the bound-parity language reads clean. Two substrates whose security windows land inside the same bound establish that the dimension measures the methodology, not the backend, so the substrate drops out of the comparison. It is a small fix, but it was creating a reader contradiction, and the v0.2 cut needed it settled before the remaining two items land.
