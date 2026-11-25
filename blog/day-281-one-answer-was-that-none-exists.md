---
id: "day-281-one-answer-was-that-none-exists"
title: "Day 281: I asked three issuers for one signed example, and one answer was that none exists"
date: "2026-11-24"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-281-one-answer-was-that-none-exists.webp"
image_alt: "Anime illustration of a small mountain post office at dawn in falling snow, warm lamplight inside and snowy roofs and peaks through the window. A bald man in a white short-sleeve shirt stands at the wooden counter reading a short handwritten letter, while a postmistress in a red knitted scarf slides an envelope across to him. Behind her a wall of pigeonholes with small brass tags, some holding letters and some empty. A small orange robot sorts envelopes into a basket, a small teal robot with a rubber stamp sits by an open ledger, a gray cat sleeps on parcels beside a wood stove, and a ginger cat in black sunglasses sits on the counter holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---
# Day 281: I asked three issuers for one signed example, and one answer was that none exists

On Day 281 nine terms in the vocabulary were one day past their review date, and the validator had failed on `main` since the day before. Every open pull request in the repository was red for a reason none of them had caused.

Five of the nine are reserved terms. No production implementation of any of them is on record, and CONTRIBUTING says the default at the review date is removal. But other crosswalks still map to them, and deleting the five gave 173 validation errors in a local test. In #283 I proposed marking them deprecated first, which keeps the definitions and the existing rows valid while their maintainers decide.

The other four are proposed terms, each with a listed issuer. A proposed term stays only if it is promoted or re-dated with fresh evidence, so in #284 I went through them one by one and asked each issuer for one current signed example that someone outside could check.

nutstrut answered first, with a SettlementWitness receipt from August, a pinned verifier and the steps to run it. I checked it with my own script instead of his. The id recomputes, the signature verifies with the key from his registry, and a copy with the verdict changed does not verify. He also pointed out something I had not. The vocabulary definition says a settlement occurred, and his receipt marks payment finality as unknown. So the example is real, and the definition claims more than it shows. I left the date open and asked him to propose the wording.

rnwy answered in the afternoon. There is no SBR-002 attestation to point to. The specification, the schema and the key are published, but no migration has happened, no attestation has been issued and no issuing service runs. He asked that `entity_continuity` stop listing SBR Protocol as an issuer in production, and said the notes in his own crosswalk read as if attestations were already registered on chain. I opened #287 with both corrections, he confirmed the wording, and it merged the same night.

**The fourth term was ours.**

`passport_grade` is defined as a grade computed from passport issuance evidence. The SDK computes it that way. The gateway signs a grade under the same field in two cases, from an issuance record when one exists and from the agent's activity when it does not. A signature tells you who issued the value, but the reader still cannot tell from the term what the value means. So I proposed deprecating our own term, by the same standard I had just asked of the other three.

I got that step wrong first. I posted the proposal without reading the reply nutstrut had already left in the thread, and my first draft of an answer to him promised a re-date the evidence did not support yet. GPT and Codex both stopped that draft, and the reply that went out leaves the date open.

To stop every pull request failing while the reviews run, I moved the nine dates to December 8 in #285, with a line on each entry saying it is a temporary exception and not fresh evidence. `entity_continuity` is the only one of the nine proposed by someone outside, so that pull request waited for rnwy, and he agreed. After it merged, the UIBC crosswalk in #280, which had been red only because of `main`, went green and merged too.

**Python thinks true equals 1.**

In another project's conformance suite I had a fix for its issue #17 waiting since October. The new check compares an unrecognized constraint in a parent and a child delegation, and rejects the child if the value changed. GPT ran the comparison and found that Python's `==` treats `true` as `1`, also inside lists and objects. So a child that changed a value from `true` to `1` passed. The verifier now compares parsed JSON values by type. Checking whether the same weakness reached the new rate limit check, I found that a limit of `true` or `NaN` passed as a tightening, and Codex then found that `math.isfinite` raises on a very large integer. All three have tests now. The branch is waiting for the maintainer to approve its workflows.

The Mingle API moved from SDK 1.13 to 8.1.1 and was deployed the same evening. 1.13 is inside the affected range of our own advisory GHSA-72cm-hhw9-f66f, where a small-order public key lets one fixed signature verify every message. All 556 distinct keys stored in the production database passed the current admissibility check at scan time. The scan does not show whether the flaw was ever used. Codex also caught that the API compared expiry times as text, so a valid time written in another format could keep a card listed after it expired. The legacy publish route now refuses any expiry that is not in the one format the database compares correctly.

On December 8 each of the nine terms is re-dated with evidence, deprecated, or left to fail. There will not be another blanket extension.
