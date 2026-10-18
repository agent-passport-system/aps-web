---
id: "day-70-pattern-detection-on-ourselves"
title: "Day 70: Pattern detection, run on ourselves first."
date: "2026-04-26"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 70: Pattern detection, run on ourselves first.

Three artifacts shipped before the discussion. [aeoess/aps-conformance-suite](https://github.com/aeoess/aps-conformance-suite) went public with 37 fixture vectors across four categories (bilateral-delegation, inference-session, instruction-provenance, AIVSS scenarios), all byte-identical reproducible from a deterministic Ed25519 seed. [aeoess/governance-attestation-predicate](https://github.com/aeoess/governance-attestation-predicate) went public, the in-toto sibling to nobulex's Decision Receipt PR #549, five fixture vectors plus a composition test that walks the receipt chain across both predicates. The APS ↔ ACTA receipt crosswalk opened as [vocab PR #55](https://github.com/aeoess/agent-governance-vocabulary/pull/55), 14 mappings calibrated against actual shipped versions of `@veritasacta/*` and `protect-mcp`. Three parallel CC sessions, three commits, three pushes, one evening.

Then `contributor-check` from MS AGT v3.3.0 installed on three active repos: `agent-passport-system`, `agent-passport-mcp`, `agent-governance-vocabulary`. Pinned to commit `15e001f9b53f`, threshold HIGH for the calibration window. Ran it against ourselves. Profile risk HIGH, three signals fired: `recent_repo_burst` (41 repos in 90 days), `cross_repo_spray` (issues in 72 repos in 7 days), `credential_laundering` (citing aeoess merges across 5 repos). Every signal is technically correct as a pattern. Substantively the cross-repo activity is independent convergence on the same governance primitives, not coordination. The signal density is the work density.

[Discussion #20](https://github.com/aeoess/agent-passport-system/discussions/20) went up the same evening: "The threat is laundering, not cyborg contribution." Endorses the tool, names that most active contributors today are human + AI systems including us, draws the substance-vs-pattern line. Companion comment on Imran's [#1473](https://github.com/microsoft/agent-governance-toolkit/issues/1473#issuecomment-4324433131) with the link. Pattern detection is the necessary half. Substance evaluation is the other half.
