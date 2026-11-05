---
id: "day-260-a-seed-from-math-random"
title: "Day 260: a payment seed that could have come from Math.random, fixed and disclosed"
date: "2026-11-03"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-260-a-seed-from-math-random.webp"
image_alt: "Anime illustration of a small old locksmith shop on a rainy autumn evening, rain streaking the front window with blurred streetlights and wet palm trees outside, shelves of brass keys and padlocks in warm amber light. A bald man in a white short-sleeve shirt lifts a cheap plastic toy dice cup away from a brass key-cutting machine, replacing it with a heavy sealed brass drum full of dice. On the counter lies a row of freshly cut keys that all look the same, and a small teal robot examines them through a magnifying glass. A small orange robot on a stool tapes a blank notice to the inside of the door glass. A gray cat sleeps in an open drawer of key blanks, and a ginger cat in black sunglasses sits on the top shelf holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---

**The most important change on Tuesday was a security fix in our own gateway.** A dependency review found that the gateway's Nano payment rail could create its master seed from a random generator built on `Math.random`. The fix is released as gateway 0.4.2, with a public advisory.

**A seed that may be predictable.** When the gateway needed a Nano master seed and none existed, it called `wallet.generate()` from nanocurrency-web 1.4.3 without passing any entropy. That library then used crypto-js 3.1.9-1, whose random generator is not suitable for key material. A seed made that way may be predictable, and every agent and gateway wallet address the gateway derives comes from that one seed.

Gateway [0.4.2](https://github.com/agent-passport-system/agent-passport-gateway/releases/tag/v0.4.2) takes the seed from the operating system's secure generator and refuses to create one implicitly. Wallet operations can be paused while an operator replaces the seed. The same change moves agent wallets to start at index 1. Before, the first agent wallet got index 0, the account the gateway uses for settlements.

Updating the code does not repair a seed that already exists. The advisory, [GHSA-x746-727g-7gxp](https://github.com/agent-passport-system/agent-passport-gateway/security/advisories/GHSA-x746-727g-7gxp), lists the steps for an installation whose gateway created its own seed. Generate a new seed and back it up, update each wallet to the address the new seed derives while operations are paused, then move any funds off the old addresses and keep watching them. Installations that never used the Nano wallets, or that supplied a seed generated elsewhere with a secure generator, are not affected by the seed weakness.

The same review cleared the open dependency advisories in the MCP server, released as [8.1.1](https://github.com/agent-passport-system/agent-passport-mcp/releases/tag/v8.1.1) after its tests passed 191 of 191 before and after the update. The remote MCP bridge moved to 8.1.1 and dropped a temporary override, and the SDK overrode a development-only dependency, vite, to 8.1.6 in [#250](https://github.com/agent-passport-system/agent-passport-system/pull/250).

**A correction to Monday's verifier.** My AEP verifier canonicalizes JSON with the `rfc8785` Python package, which sorts keys by UTF-16 code units, not by code point. The two orders differ only when a key compares a character above U+FFFF with one between U+E000 and U+FFFF, and no key in the corpus or in my nine candidate cases does that. So [lab #211](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/211) does not show which order the signed fixtures follow. I said so on [WasmAgent #265](https://github.com/WasmAgent/wasmagent-protocol/issues/265), and the run record now states that limit.

**A test for who holds the key.** The lab had no case asking whether the party presenting a token holds the key the token is bound to. [Lab #214](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/214) adds 28 cases against RFC 9449, with real Ed25519 DPoP proofs. A valid signature shows that someone holds a key. It does not show that the key is the one the token is bound to. The central cases are proofs validly signed with an attacker's own key. A verifier that accepts one fails section 4.3 of the RFC. The candidate also reads proof signature, key binding, request binding and authority as four separate answers, which the RFC does not define, so a refusal for the wrong reason counts as nonconformant only under the candidate's own reporting rule.

**Four publication reviews.** Aicent brought three candidates to the lab and a second contributor brought one, and each review found something to fix before publication.

- [#210](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/210) repeated a draft's claim about runs by other implementers. The lab's revision 3 results are its own reference model and one separately written runner, both author-produced. The replacement text says that, and the candidate merged.
- [#212](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/212) now records that five of its cases take the lease boundary as a given input. They test how an implementation handles the boundary, not whether it computes the boundary correctly from the clock and the lease expiry.
- [#215](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/215) records a run of the AAE vectors. I reran it on a second machine and the output matched line for line, apart from paths and timings. It is an independent run of the author's own checker, not a second implementation, and the record says so.
- [#216](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/216) cites the specification for two behaviors it does not define. The expected results come from two Rust regression tests in another repository, and the review asks for the source to be corrected before publication.

**Smaller items.** For the refund workflow on [vocabulary #193](https://github.com/aeoess/agent-governance-vocabulary/issues/193), I listed the five pieces a payment executor would need before I could test it, and the first property I would test, that a denied or unresolved refund can't become an executed one through it, including on retry. The two ASA requirement issues I opened are resolved from my side. And I'll present at a TODO Group working group show-and-tell on December 8, on what the tests establish and what still needs human judgment.

**What this does not establish.** The advisory describes the weakness and the repair. It is not evidence that any seed was predicted. The new lab cases are author-produced proposals under the lab's rules, not an OAuth working group position, and the reviews state what each candidate shows, not that any implementation conforms.
