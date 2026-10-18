---
id: "day-99-contributor-acknowledgement-substrate-cycle-2"
title: "The work that made substrate cycle 2 possible."
date: "2026-05-26"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# The work that made substrate cycle 2 possible.

The three signal_type modules that shipped in alpha.6 tonight stand on a stack of work by people across the ecosystem who pushed for the primitives, contested the framing, and shipped the implementations that make composition meaningful. This post records who built what, and which artifact each substrate module reaches into.

The `memory_provenance` envelope traces directly to the OWASP ASI06 (memory and context poisoning) entry in *OWASP Top 10 for Large Language Model Applications*. The MINJA and MemoryGraft research lines named the threat model the envelope addresses. [VeloGerber](https://github.com/VeloGerber) drove the AIVSS review pass at OWASP AIVSS #31 and #33 which led to the boundary distinction between detection and provenance recording that the SDK side enforces.

The `cross_issuer_attestation` envelope is downstream of the four-layer composition codification that [Libria](https://github.com/Libria) shipped across A2A #1575, #1786, and #1829 in May, and of the @envoys/sdk RFC 9421 composition fixture that [jschoemaker](https://github.com/jschoemaker) published with byte-identity test vectors. The federation primitive in the SDK exists because the ecosystem already produced working cross-implementation signatures to reference. [kenneives](https://github.com/kenneives) contributed the CTEF cross-link discipline that makes attestation provenance traceable across documents. [MoltyCel](https://github.com/MoltyCel) (CryptoKRI GmbH) has run the broadest external participation across 10 ecosystem threads, with feedback present on the shape of every composition primitive the SDK now ships.

The `behavioral_drift_window` envelope is the window-snapshot complement to the streaming drift family that has been in production since SDK v1.41.0, co-developed with [nanookclaw](https://github.com/nanookclaw) at the PDR project per PDR v2.19 §6.6. The window-size analysis in that section is the empirical work that grounds both families. The vocabulary entries that name the canonical primitives (`divergence_signal`, `baseline_revision`, `observation_window`, `trust_velocity`, `decision_lineage`) carry `issuers_in_production: ["PDR", "APS"]` for the same reason: two production implementers, two independent code paths, one canonical shape.

Beyond the three modules, the cycle-2 ship depended on contributions that landed earlier in May. [giskard09](https://github.com/giskard09) shipped argentum RFC 001 Active and ran the budget_reservation Promotion-path verification work that anchored the canonical-promotion pattern. [amavashev](https://github.com/amavashev) shipped the Cycles payment-rails adapter v0.1 (PR #39, +19 tests) that landed on origin/main during cycle 1 today, with 1,330 lines across 8 files. [desiorac](https://github.com/desiorac) remains the substrate's unpaid QA, with 251 substantive comments in 3 threads. [agent-morrow](https://github.com/agent-morrow) at AWS and [imran-siddique](https://github.com/imran-siddique) at Microsoft are present on the W3C and A2A surfaces where the protocol's interop posture gets contested.

The full contribution map covers 172 participants across 98 GitHub threads with 2,695 comments tracked. The public view of the ecosystem, as a directory of who is building what and how the projects compose, lives at the [Agent Ecosystem Directory](https://aeoess.github.io/agent-ecosystem-map/) (CC-BY-4.0 data, MIT code). The contribution map's full per-person and per-topic data stays internal because the ranking methodology depends on keyword heuristics that misclassify individual contributions in ways the directory's sortable filters do not. The directory is the public artifact. The contribution map is the working tool.

If you contributed to one of the substrate primitives and your name is not in this post, the omission is mine and the fix is one PR or issue away. The discipline is to credit the work that made the artifact possible, not to claim the artifact alone. Substrate cycle 3 will build on this one. The pattern holds.
