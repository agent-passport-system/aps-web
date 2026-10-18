---
id: "day-58"
title: "Day 58: One chain added, one bug caught at the boundary"
date: "2026-04-15"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 58: One chain added, one bug caught at the boundary

Quick one today. SDK v1.43.0 ships with Solana in the `wallet_ref` chain enum, base58 validation included. That closes [openclaw #49971](https://github.com/openclaw/openclaw/issues/49971). End-to-end wallet binding now spans Ethereum, Bitcoin, and Solana.

The more interesting thing was the bug the integration surfaced.

### The case-sensitivity trap

APS treats chain names as case-insensitive at the boundary. `ETHEREUM`, `ethereum`, `Ethereum` all normalize to `ethereum`. That was fine for a while. For Ethereum addresses it doesn't matter, they're hex. For Bitcoin it doesn't matter either, the checksums handle it.

Solana addresses are base58. Base58 is case-sensitive. `7xKXt...` and `7xkXt...` are different addresses.

The gateway was lowercasing the entire normalized wallet payload on the way in. A perfectly valid Solana address got mangled to a syntactically valid but semantically wrong address. No error, no warning. Just a wrong address in the receipt.

The fix: chain-aware normalization. Lowercase the chain identifier, leave the `wallet_ref` alone if the chain is case-sensitive. Two-line change in the SDK validator plus a matching guard in the gateway. Test coverage added for all three chains with mixed-case inputs. 2,884 tests, all green.

This is the kind of thing that looks small and is actually big. The failure mode was silent data corruption that the protocol signed over cryptographically. Every receipt that passed through would have been a signed statement about the wrong address. You can't fix that after the fact. The only reason it surfaced is because someone was actively integrating and caught the round-trip mismatch.

Moral: when a primitive was correct for every input class you had, and you add a new input class, the primitive is not correct anymore. It's a new primitive, and it needs new tests.

### Vocab registry: four more PRs

The [agent-governance-vocabulary](https://github.com/aeoess/agent-governance-vocabulary) repo had another busy day. Four merges on Apr 15: asqav crosswalk from jagmarques (ML-DSA-65 server-side signatures, first lattice-based contributor), JEP from schchit (minimal verb-based decision record, IETF I-D pending), insumerapi license-endpoint fix from douglasborthwick-crypto, and validator cleanup and format normalization.

Plus a quieter promotion that matters more than any single PR: `peer_review` got promoted to canonical status. Two independent implementations now, Logpose (rkaushik29) and RNWY (rnwy), both shipping code, both mapping their internal `peer_review` equivalents to the canonical term. That's the two-implementation threshold the CONTRIBUTING.md set, hit for the first time post-launch by contributors who don't know each other.

That's the vocab registry working as designed. No single group driving it. The canonical vocabulary is the thing that at least two groups independently agreed to call the same thing.

### Contributor count

Four days after opening, 14+ contributors have shown up. Eleven PRs merged in six days. One PR closed (SAR first attempt, replaced by PR#17 after revisions). The five-check merge protocol I wrote about on [Day 57](#day-57) got its first real stress test this week. Two PRs needed revisions before merge. Identity unverified in one case, format wrong in another. Both came back clean after a round of specific feedback. The rules hold up when you actually apply them equally.

### What's on tomorrow

Build D2 is queued. Public JWS signing on the gateway's trust profile endpoint. One-function-call fix on existing infrastructure, unlocks cross-verify demos with MolTrust and AgentNexus that are already standing by. After that, Build A (attribution primitive) is the next real protocol ship.

Short day, short post. Back to the queue.
