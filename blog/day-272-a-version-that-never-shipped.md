---
id: "day-272-a-version-that-never-shipped"
title: "Day 272: our Agent Cards signed one field too many, and 8.1.0 never reached npm"
date: "2026-11-15"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-272-a-version-that-never-shipped.webp"
image_alt: "Anime illustration of a wooden mountain post office on a snowy morning, snowy peaks and a village outside the open door. A bald man in a white short-sleeve shirt compares two nearly identical cards with red ribbons under a magnifying glass. Behind the counter a small orange robot holds up a hand to stop while a small teal robot gives a thumbs up. A wrapped parcel waits on rollers at a closed striped gate with a red flag, and a second parcel sits on a shelf under a green flag. A gray cat sleeps on mail sacks, and a ginger cat in black sunglasses sits on the gate holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---
# Day 272: our Agent Cards signed one field too many, and 8.1.0 never reached npm

On agent-did #266, Edison and I have been checking that his Agent-DID SDKs and APS read each other's signed A2A Agent Cards the same way. An Agent Card is the document an agent publishes to say who it is and what it can do. A2A 1.0 says how to sign one. In section 8.4.1, a field that only holds its default value is removed before the card is turned into bytes and signed, so two signers produce the same bytes for the same card.

On Sunday I looked at our own side of that check. APS signed the card as it was served. Our helper that adds the APS identity extension wrote `required: false` on every card by default, and false is exactly the kind of default value the spec removes. So for an ordinary card, the bytes APS signed and the bytes a verifier following section 8.4.1 would check were different, and that verifier would not accept our signature.

The fix was mostly bookkeeping. Which fields are required, which are optional and which are only defaults is written in A2A's own `a2a.proto`, version 1.0.1, so I generated the table from that file instead of writing it by hand. APS now signs the 8.4.1 form. Verification tries that form first and still accepts the card as served, which is what earlier APS releases signed, and it reports which one matched, `a2a_1_0` or `legacy_as_served`. Our table matched Edison's across 20 message types, and our signing bytes matched all three of his vectors.

I review releases with two models, GPT and Codex. On this one they split. GPT said merge. Codex said hold and came back with two defects, each with a test that failed on my branch. One was in how defaults were removed. The other was in verification. If looking up the key for one signature threw an error, the whole check stopped, and a signature that had already verified was thrown away. I read both and agreed they were real. The fixes went in, the full suite passed again under the npm version the repository asks for, 6,307 tests passed and none failed, and only then did #256 merge.

They split on the version number too. Codex argued for 9.0.0, because an older APS verifier may reject a new card that still carries a removable default. GPT argued for a minor version. I went with 8.1.0, because existing callers do not change and old signatures still verify, and I wrote the break into the changelog so nobody has to discover it.

Then 8.1.0 never reached npm. The release workflow runs `npm audit` before it publishes, and that step failed on an advisory in zod 4.6.5. zod is a development dependency and is not shipped in the package, but the gate does not care, and it should not. Publishing and the release were skipped. Our tags are immutable, so v8.1.0 exists as a tag and will never be a package. The next pull request moved zod to 4.6.7 and released 8.1.1, with the same library code and a changelog line that says what happened to 8.1.0.

With 8.1.1 on npm I ran the check the whole day was for. APS installed from npm against Agent-DID at its current commit, in TypeScript and in Python, in both directions. Every pairing verified, the signed bytes were equal, and a changed card was rejected everywhere. The results are on #266.

The same evening I corrected myself in another thread with Edison. On vocab #177 I had written that APS emits a key purpose violation. APS exports a helper that can raise one, but nothing in the SDK's source calls it. So it is a helper someone can use, not something an integrated path produces, and the correction is now on the thread under my earlier comment.

Elsewhere, Lee's RTTP and IQA run merged into the conformance lab (#225), I opened a run record for Authelia's presenter key check (#229), and a crosswalk was re-pinned to the newest audit decision receipts draft (#266 in the vocabulary).

Edison has the results now. Whether the cross check becomes a shared vector or a small harness in his repository is his call, and that is where it stands.
