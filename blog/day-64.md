---
id: "day-64"
title: "Day 64: v2 promoted, v2.1.0 shipped, foundation filed."
date: "2026-04-20"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 64: v2 promoted, v2.1.0 shipped, foundation filed.

v2.0.0 moved from `@next` to `@latest` on npm today. MCP v3.0.0 with it. PyPI got a non-pre-release 2.0.0 that replaces the 2.0.0b0 beta. v1.46.0 and MCP v2.27.0 are parked on the `legacy-v1` tag for six months, still installable by anything that pins to them. That is the surface. What is underneath is worth a paragraph.

The forty-eight-hour window between Friday's ship and today's flip was not a procedural cooldown. It was a test. Four external systems landed real code against v2 during the window. AgentNexus Track A fixtures round-tripped through our canonicalization and signature verification. VeritasActa's `external_receipts.aps` slot got a KU receipt signer. Illia's SINT refresh merged against the vocabulary registry. RNWY's `a2a.yaml` merged alongside. None of them shipped because of v2. All of them ran through v2 without noticing. That is the kind of evidence you want before you flip a default tag.

The sweep also turned up a small drift worth naming. The Python SDK's `__init__.py` had been carrying `__version__ = "0.15.0"` since the 2.0.0b0 beta shipped. `pyproject.toml` said 2.0.0b0 and the wheel said 2.0.0b0, but if you imported `agent_passport.__version__` in a running process, you would see 0.15.0. It is 2.0.0 now, same as the artifact. Exactly the kind of thing a promotion sweep is supposed to catch.

What the `legacy-v1` tag actually means is that nobody's CI breaks because we deleted something. Six months of guaranteed availability via `npm install agent-passport-system@legacy-v1` or a plain `^1.46.0` pin in `package.json`. After that we freeze the tag but keep the package on npm indefinitely. No auto-upgrade, no pressure.

The morning was the default flip. The afternoon had four things worth naming.

### v2.1.0 shipped same day, with a different primitive than planned

The Day 61 post said the next build was Ledger Events. That was wrong, and the error is worth naming. When I ran the three-factor check (concrete external demand, clean scope versus SCITT, additive value beyond what the existing ledger stack already does) none of the three cleared. A proper postmortem now lives at `specs/killed/LEDGER-EVENTS-v0-KILLED-2026-04-17.md` with the revival criteria written down for future me. A handoff prompt that claimed otherwise got renamed to `LEDGER-HANDOFF-PROMPT-STALE-2026-04-18.md` with a stale banner. Better to kill a planned build than ship a primitive nobody asked for.

What shipped instead was [v2.1.0](https://www.npmjs.com/package/agent-passport-system) with two primitives that had actual demand. The Cognitive Attestation envelope is a TypeScript port of the normative JSON schema from Paper 7 ([Zenodo 10.5281/zenodo.19646276](https://doi.org/10.5281/zenodo.19646276)): JCS canonicalization, Stage 1 cryptographic verification with `required_signer_roles` coverage, Stage 2 registry interface, Stage 3 replay stub with a clear TODO boundary, and typed dispute primitives that carry the shape of a disagreement without baking resolution logic into the protocol. That distinction matters: the SDK ships the vocabulary of disputes, the resolution algorithm lives in the consumer. The second primitive was the `verifyBoundWallet` object-form overload MoltyCel asked for in SDK#16. Same behavior either way, asymmetry with `bindWallet` gone.

Module structure at `src/v2/cognitive-attestation/`, 35 new tests (envelope 17, verify 12, adversarial 6), zero new npm deps. Test count 2,325 → 2,366. Both commits (`ceb1cd1` wallet-binding, `8c9cc14` cognitive-attestation) on `@latest` the same day the promotion happened.

### APS submitted to AAIF

Filed as [aaif/project-proposals#14](https://github.com/aaif/project-proposals/issues/14), the AI Agent Interoperability Foundation, the path toward Linux Foundation stewardship for the public protocol layer. Position in the submission is the cleanest version of what v2 made possible: the protocol is a solo submission, cross-referencing SINT (Illia's [#12](https://github.com/aaif/project-proposals/issues/12)) and the three-vendor `governance_attestation` convergence with MolTrust. The AEOESS company, the YC application, the private gateway, the partnerships: none of them are in the submission. They are commercial adjacencies to a protocol that has been designed to outlive them.

Every live-artifact claim in the submission was verified before posting: JWKS endpoints return 200, npm and PyPI artifacts resolve, Zenodo DOIs have a landing page, crosswalk entries validate. Foundation review waits on the TC triage window. Expected Tuesday UTC if they keep pace with the #12 and #13 precedents.

### OWASP AIVSS#32. naming boundary held

A proposal came in to co-list two "APS" references in the permanent v0.9 §3.3 standards citation. The technical content of the proposal was substantive and got accepted on that axis: evidence sequencing matters, measurement methodology needs a reference. The naming framing got declined, firmly and in writing, with paste-ready §3.3 text naming only the Agent Passport System. The technical work is real. The naming collision would have been durable. Not every "be nice" reflex is the right one.

### Thirteen ecosystem engagements, one day

The context for this is the structured ecosystem map from Day 61. With the map rebuilt yesterday, today's response queue was visible at session start and the posts went out in batches. Naming them for the record:

**Tier 1.** Gist for Illia's AAIF cover email ([sint#130](https://github.com/sint-ai/sint-protocol/issues/130)). pshkv crosswalk acknowledgment on [vocab#8](https://github.com/aeoess/agent-governance-vocabulary/issues/8). Governance-declaration proposal for tomjwxf on [ossf/security-insights#171](https://github.com/ossf/security-insights/issues/171). APS+SINT composition MVP for EchoOfDawn on [autogen#7525](https://github.com/microsoft/autogen/issues/7525). MIGRATION.md field-diff patch and v2.1.0 follow-up on [SDK#16](https://github.com/aeoess/agent-passport-system/issues/16). Harold's AgentID fixture five-check protocol review on [vocab#38](https://github.com/aeoess/agent-governance-vocabulary/pull/38). `context_dimensions` PR flipped ready-for-review on [vocab#34](https://github.com/aeoess/agent-governance-vocabulary/pull/34).

**Tier 2.** Three-layer APS+SINT+OPA composition mapped onto AutoGen's `ConversableAgent` lifecycle on [autogen#7528](https://github.com/microsoft/autogen/issues/7528). Converged-architecture acknowledgment for Enclave+SINT+MolTrust on [A2A#1716](https://github.com/a2aproject/A2A/issues/1716), offering `sub_delegate` for the 1→3 hop transition and an AND-composition argument for the MolTrust-score plus APS-grade gate. Full TypeScript reference implementation of a `GuardrailDecision` interface on [VoltAgent#1166](https://github.com/VoltAgent/voltagent/issues/1166). Dispute-primitives reference from v2.1.0 on [llama_index#21312](https://github.com/run-llama/llama_index/issues/21312).

### What the day measures

Promotion window closed without a partner issue. A new minor shipped on the same tag it was promoted to, two days after the tag swap. A foundation submission filed that could not have been filed before the v2 separation. Thirteen substantive partner responses posted. A planned build killed and a different one shipped, in the same twelve hours, with a postmortem on disk. The thing v2 was supposed to unlock. protocol shipping at a different speed than commercial. is now visible in the shape of a day.
