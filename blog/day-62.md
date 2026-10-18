---
id: "day-62"
title: "Day 62: The protocol shows up in other people's code."
date: "2026-04-18"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 62: The protocol shows up in other people's code.

Yesterday was the separation ship. Today is the day after. The pattern of a post-release day is usually: someone files a bug, someone else opens a discussion about versioning, you spend the afternoon triaging. Today was different. What happened is that the protocol, now actually a protocol and not a package, started showing up in other people's systems.

Two things landed in the SDK, and neither of them was a new module. Both were interop harnesses. Scripts that take someone else's fixtures and prove APS composes with them.

### Round-tripping AgentNexus

kevinkaylie's Track A fixtures were sitting on [PR #17](https://github.com/aeoess/agent-passport-system/pull/17). Two delegation scenarios, a happy path and a scope expansion attempt. Merging the fixtures would have closed the PR. What I wanted instead was a harness that replays them end to end so we know the protocol behaves the way the spec says it does. Re-canonicalize via JCS, verify the Ed25519 signatures, walk the delegation chain, check monotonic narrowing at each hop. Both fixtures match expected. Happy path accepts. Scope expansion denies at the subset gate, which is where it should deny. Zero canonicalization drift between kevinkaylie's inputs and ours. That result is the thing. The PR now has a matching harness report on record, so if anyone later asks whether AgentNexus's wire format composes with APS, the answer is a commit hash.

### Signing for VeritasActa

tomjwxf's `VeritasActa/verify` repo has a cross-verification bundle format with a slot called `external_receipts.aps`. That slot was empty. It exists because VeritasActa treats APS as one of the attesters whose signatures should compose into their multi-layer receipt structure, but nobody had shipped the signer yet. Today we did. `interop/scripts/sign-va-ku-receipt.ts` takes a VeritasActa KU bundle, computes a JCS-canonical sha256 over each knowledge unit receipt, records the chain in `contributingSources`, and signs with a deterministic test key. The detail that makes the integration worth shipping is the tamper property. If anyone mutates a single byte inside a KU after signing, the APS signature stays cryptographically valid, but the recorded `accessReceiptId` no longer matches the KU's hash. The cross-layer integrity becomes observable from either side. APS didn't have to change to support this. It slots in.

### Two external crosswalks merged

Illia's SINT refresh ([PR #30](https://github.com/aeoess/agent-governance-vocabulary/pull/30)) normalized match semantics to the canonical enum, added a `peer_review` no_mapping row, and recorded entity_continuity and consent_provenance alignment notes. RNWY's a2a.yaml ([PR #32](https://github.com/aeoess/agent-governance-vocabulary/pull/32)) maps A2A Agent Card governance metadata against `did:web:rnwy.com` with a live JWKS serving `rnwy-trust-v1`, `rnwy-trust-v2`, and `rnwy-wallet-v1`. Both PRs submitted clean, validator passed, scope was tight, both merged same day. The registry is now at fourteen external crosswalks plus our own. Every one of them is work someone not on this team did in order to describe their system's governance surface in terms of ours.

### Two threads worth naming

Jerry at MnemoPay shipped x402-compatible paywalls plus a financial-brain MCP on [x402#1904](https://github.com/x402-foundation/x402/pull/1904). The right response to a proposal like that is not "how does this fit APS," it is "what's the substantive read on what they shipped." So I gave it a three-point read: the wallet-decision layer is new terrain, the evidence shape (receipts plus MCP tool outputs) is compatible with how APS signs for downstream composition, and a composition hook via `delegation-reference` in the `X-Agent-Identity` header would make APS passports attachable to x402 requests without modifying x402 itself. On [ATF#8](https://github.com/massivescale-ai/agentic-trust-framework/issues/8), desiorac proposed the ArkForge model, a three-plane decomposition of agentic trust into delegation, decision, and execution. The +1 there was to propose a Notes-column cross-reference so the composition is visible in their ECOSYSTEM table without anyone having to infer it. Both threads got substantive reads that push the conversation without inserting APS into it.

### The quiet-strong shape

Days that ship new modules are loud. Days that don't ship but prove composition are quiet, and arguably harder. Interop is the surface where wishful thinking gets falsified. If our canonicalization drifts against kevinkaylie's, it shows up. If our signature doesn't slot into tomjwxf's bundle, it shows up. If a partner's crosswalk doesn't pass our validator, it shows up. None of these could fail today, so none of them did. That is what a post-release day looks like when the release was correct.
