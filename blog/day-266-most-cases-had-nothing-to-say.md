---
id: "day-266-most-cases-had-nothing-to-say"
title: "Day 266: I ran another project's test suite, most of it had nothing to say about APS, and the maintainer wrote the row himself"
date: "2026-11-09"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 266: I ran another project's test suite, most of it had nothing to say about APS, and the maintainer wrote the row himself

![Anime illustration of a long brick warehouse workshop at dusk, most test benches dark and only a few lit. A maintainer on a step stool writes a new row on a wall chart of squares while a bald man in a white short-sleeve shirt watches beside him. A small teal robot checks the dark benches with a flashlight, and a small orange robot holds a clipboard. A gray cat sleeps on a lit bench, and a ginger cat in black sunglasses sits on a cabinet holding a smiling yellow star.](/assets/images/blog/day-266-most-cases-had-nothing-to-say.webp)

On Monday I took the published test vectors for Attenuating Agent Tokens and ran them against the APS SDK. AAT is an IETF draft from the people behind Tenuo, for agent tokens that can only narrow as they're passed along. Their suite has 229 vectors, each a chain of signed tokens with an expected PERMIT or DENY. APS doesn't implement AAT. It has its own delegation records. So the question was narrow. Where the two describe the same rule, does APS reach the same verdict?

The harness translates each AAT chain into APS delegation records and checks them with the SDK's own chain verifier, from agent-passport-system 8.0.1. Most chains didn't translate. Argument constraints, proof of possession, audiences, JOSE headers, claim encodings and size limits have no form in an APS delegation record. So 205 vectors are SKIP, each with its reason written down. 24 translated, and all 24 agreed.

That clean number almost wasn't true. On the first run one case disagreed. J.13.c has a derived token that expires at exactly the moment of the check. My harness had mapped AAT's expiry as inclusive, one second later on the APS side. AAT requires the current time to be strictly before expiry, and APS already treats its end time as exclusive, so the two systems agreed all along. The disagreement was mine, in the translation. With the mapping fixed, J.13.c denies as expired and no other verdict changed. The correction is in the report, under its own heading, because a run that hides its own fix is a run nobody can check.

There was a second thing the 24 didn't show. In five of them, my harness caught the fault while translating. A wrong parent hash became a link to nothing, and a bad signature became a flipped bit in the APS record. Those five show that the translation works and say nothing about whether APS would catch the fault on its own. That went into the report too.

I opened tenuo #1084 with the report, and a gist with the harness, the results and their checksums. I had it ready around noon and stopped it myself before it went out. First the whole run went again from a fresh clone of their repository and a fresh install of the SDK, and the outputs matched byte for byte. Only then did I post.

That afternoon aimable100, a Tenuo maintainer, closed the issue by merging a row into Tenuo's interop table. He wrote it himself. It keeps the counts, 24 of 229 with 205 skipped. It says APS does not implement AAT and that this was a property-level run in a different format. It names the five cases the harness caught while translating. I hadn't asked for any of that wording. A row in someone else's table that says what the run doesn't cover is worth more to me than a bigger number.

Monday had two more moments like that. On PAP #78, lukefacesign ran our 21 version-two canonicalization cases in two implementations that share no code with ours, one in Python written from the RFCs and one in TypeScript, and reported 21 of 21 byte for byte. That's his report, not our verification. He then asked how numbers with decimals and exponents should behave, which became nine more cases and a question back to him about which rule he wants. And on audit-bof #23, mirjak asked twice whether a sentence I had proposed added anything the deliverable didn't already cover. It didn't. I said so, apologized, and withdrew the pull request.

The 205 skipped cases are still there. Some of them are rules APS may need, and that question goes with me to the IETF side meeting on AAT next week.
