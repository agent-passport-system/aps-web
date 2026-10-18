---
id: "day-61"
title: "Day 61: The separation ships."
date: "2026-04-17"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 61: The separation ships.

The SDK was one package. It shipped crypto, types, scope logic, receipts, vocabulary adapters, conformance suite, and the analytics, drift detection, compliance automation, and runtime state management that the gateway uses to operate. Partners who pinned the npm package pulled the whole thing. That was fine for a while. It stopped being fine once the roadmap started pointing at foundation submission, enterprise procurement conversations, and a pixel attribution economy that lives in the gateway and only the gateway.

Today the SDK shipped v2.0.0-beta.0 on npm `@next`. The architecture is split along one axis: protocol primitives stay public, product intelligence moves private. `ProxyGateway`, `DataEnforcementGate`, `ContributionLedger`, `SettlementGenerator`, 18 behavioral-analytics modules, runtime state stores, compliance automation, orchestration, metering. Gone from the public SDK. Moved to the private gateway package. Roughly 2884 tests moved with them. The public API, the 8 core primitives the spec documents, is byte-identical to v1.46.0.

### How to read that

The protocol is now what standards bodies can actually adopt: a clean Apache-2.0 package with a conformance suite and interop vectors, no operational intelligence bundled into it. The gateway is the commercial moat: drift detection, cross-tenant orchestration, analytics, the pixel. Separation is not a feature flag or a licensing trick. It is a refactor that moved a majority of the codebase out of the public package and into a private one. That line is where I can defend it now.

Partners on any v1 pin are unaffected. v1.46.0 stays on npm `@latest` through a 48 to 72 hour stability window and on `legacy-v1` indefinitely after that. Nothing auto-upgrades. v2 is strictly opt-in via `npm install agent-passport-system@next` while partners test integrations.

### Four artifacts, one day

**SDK**: [v2.0.0-beta.0](https://www.npmjs.com/package/agent-passport-system) on `@next`. 2,884 tests, 130+ modules, tsc clean against the gateway after the split. Public exports went from 115 to 106, nine removed and six added. Every remaining export retains its v1.46 signature.

**MCP**: [v3.0.0](https://www.npmjs.com/package/agent-passport-system-mcp) on `@next`. 150 tools. Dropped 150 tools that never had a v2 analogue and stubbed 10 that moved to the gateway. The 132 preserved are protocol-layer tools that don't depend on gateway runtime. Major bump because the tool reduction is breaking.

**Python SDK**: [v2.0.0b0](https://pypi.org/project/agent-passport-system/) as PEP 440 pre-release. The Python side was already protocol-only by construction, so the bump is version alignment, not refactor. `pip install --pre` to opt in.

**Gateway**: repinned from `file:../agent-passport-system` to `^2.0.0-beta.0`, Railway auto-deployed, health endpoint green through the swap. All 647 migrated tests pass in the gateway's own suite. No downtime.

### The governance vocabulary got one thing fixed today too

The [agent-governance-vocabulary](https://github.com/aeoess/agent-governance-vocabulary) repo has twelve external crosswalks from partners who mapped their terminology to the canonical signal types. InsumerAPI, SINT, AgentNexus, Veritas Acta, Logpose, RNWY, SoulboundRobots, Nobulex, SAR, JEP, asqav, SATP. All twelve built by people who don't work here, mapping their stuff to ours. One entry that was missing: ours.

I hosted the registry for a week without publishing a crosswalk for my own system. That reads as either I can't describe my own terms cleanly, or I don't dogfood the registry I'm asking other people to contribute to. Neither is true, but the file being absent says it anyway. Today I fixed that.

`crosswalk/aeoess-aps.yaml` is the APS mapping to the canonical vocabulary: three exact-match signal types (`passport_grade`, `trust_verification`, `governance_attestation`), two partial, seven honest `no_mapping` declarations for signal types APS doesn't issue. Four decision-trajectory mappings, one constraint mapping, and an `out_of_vocabulary_primitives` section for runtime enforcement mechanics (monotonic narrowing, cascade revocation, wallet binding) that are correctly not signal types. Validator is clean. APS also got added to `governance_attestation.issuers_in_production` alongside AgentNexus, Nobulex, and SINT; Build D2's JWS-signed trust profile endpoint makes us the fourth production issuer of that signal type.

### Rollback is real

Before any of the above happened, the prior state got archived. Anchor tags in every repo (`pre-v2-swap-main`, `pre-v2-swap-refactor`, `pre-v2-pypi-swap`) pin the pre-swap commit as immutable references, and a private archive holds git bundles of every repo, a packaged copy of the v1.46.0 npm tarball, and step-by-step rollback procedures for each failure scenario. If v2 needed to come out within 72 hours of publish, `npm unpublish` works. After that, v2 gets `npm deprecate`d and v1.46.0 stays on `latest` indefinitely. No rollback path depends on a single point of control.

### The ecosystem data layer

Quietly in the background of this week, we built a structured map of the governance ecosystem we operate in. 89 tracked threads across GitHub, 118 participants, 1,994 comments, 88 topics. Each participant carries a working label and each thread is classified by waiting-state (waiting on us, waiting on them, closed, silent). The data is content-addressed, rebuilt on a script that re-fetches GitHub and regenerates the map in about two minutes, and the output is a single session-context markdown file that Claude loads at the start of every working session.

The reason this matters for governance is the second axis of the tag space: canaries. Over the last week we observed a pattern of agents opening structurally similar threads across multiple repositories with aggressive asks that don't survive factual review. Each pattern got logged, each handle got added to a silence list, and the map enforces a non-engagement protocol automatically. The same map surfaces the other direction: partners whose tags upgrade from unknown to substantive after they ship verifiable code, and whose threads get moved to higher-priority response queues. It is not surveillance and it is not adversarial; it is a structured way to keep the ecosystem map accurate enough that we respond to signal and ignore noise. The raw map stays in a private specs directory;.

### What this unlocks

AAIF submission becomes a real option, not an aspiration. Foundations don't want to govern your pricing or your compliance automation; they want a clean protocol spec with a conformance suite. We now have that cleanly packaged. Enterprise procurement stops tripping over "sole-founder maintainer governs the protocol" because that layer becomes foundation-governed when the submission lands. The gateway product competes on quality rather than lock-in, which is a stronger commercial position than lock-in ever was.

The next primitive in the queue is Ledger Events. Ordered content-addressable signed events with a chain-integrity verifier. Will ship as v2.1.0-beta.0 on `@next`. Any ledger store, analytics, subscription, or attestation layer on top of the primitive goes in the private gateway. The separation holds.

Release notes with the full partner-facing picture are at [aeoess/agent-passport-system#16](https://github.com/aeoess/agent-passport-system/issues/16).
