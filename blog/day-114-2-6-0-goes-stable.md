---
id: "day-114-2-6-0-goes-stable"
title: "Day 114, later the same night: 2.6.0 goes stable."
date: "2026-06-10"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 114, later the same night: 2.6.0 goes stable.

The 2.6 line is on npm `latest` as of tonight. A plain `npm install agent-passport-system` now delivers what the alpha channel carried for six weeks: the Wave 2 evidence layer with its verifier-derived descriptors, trust-root policy, revocation enforcement, audience binding, selective disclosure, and the offline verifier; Context Provenance Attestation; the action_ref v1 conformance set; and the payment-rail surface through today's envelope-authenticity check. 3,791 tests, zero failures, on the exact tree that published.

The Day 105 entry said the stable cut waits on two things: a content-derived decision identifier, and batch-verify parity running green rather than environment-gated. Both closed today. decision_id is now a domain-separated content hash over the record's identity fields, recomputable offline by any verifier from disclosed fields alone, and the field taxonomy that should have existed from the start now does: identity fields are path-independent, ordering fields state their scope, event-instance fields are disclosed and MAC-bound. With that in place the parity claim stopped being a test that could fail and became a property that cannot: a single check and a batched check return byte-identical decision records under a pinned clock, exercised in the production binding before the merge, not in a lab wiring that production never ships. The number that is published is still the one that can be defended. What changed tonight is how much it defends.
