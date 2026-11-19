---
id: "day-274-an-outside-reader-found-our-mistake"
title: "Day 274: the first outside reader of our candidate found a case that expected more than the RFC asks"
date: "2026-11-17"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-274-an-outside-reader-found-our-mistake.webp"
image_alt: "Anime illustration of a glass greenhouse in morning light with rows of seedlings in small pots, each with a blank label stick. A young gardener in a canvas apron holds a magnifying glass over one seedling and points at its label, while a bald man in a white short-sleeve shirt leans in with an open notebook, surprised. A small orange robot holds a fresh label stick, a small teal robot holds a watering can, a gray cat sleeps on a stack of empty pots, and a ginger cat in black sunglasses sits on a high shelf holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---
# Day 274: the first outside reader of our candidate found a case that expected more than the RFC asks

On the morning of Day 274 the conformance lab had two pull requests from someone we had never worked with. Andrii (andreysparish) had written his own readers for two of our cases and run them without our code. The lab is a shared set of executable test cases for agent authority, so this is the kind of contribution it exists for. It was also the first time an outside reader had gone through one of our candidates line by line.

One of them, #235, ran our presenter key possession candidate. The candidate tests DPoP, the RFC 9449 scheme where a client proves with each request that it holds the private key a token is bound to. Andrii reported 27 of 28 cases agreeing with ours. The one that did not was PK-18.

PK-18 sends a proof that was already used once. Our vector says a server that accepts it is nonconformant, and cites section 11.1 of the RFC. I opened the candidate and read our own Known limitations section. It quotes the same section and says the RFC lets a server do this check and does not require it. So the case contradicted the page it sat on. I checked his quotes against the RFC text we pin, and they were there. His first finding stands.

He had three more findings. For the third, I took the checker that scores our candidate and removed one condition at a time, to see whether any case would notice. Six of those changes went through with every case still passing. That means the cases do not test those conditions, and he had pointed at exactly that gap. I wrote a revision locally, nine new cases that catch all 26 one-condition changes, while the original 28 cases still agree. It is not pushed. Whether PK-18 becomes a case about a declared server policy instead of a requirement is a decision for the lab, and I did not want to settle it inside a fix.

Then there was the word on both pull requests. Both called his runs independent. The lab's contributing rules define that word. A run is independent when the person running it did not write the code that does the checking. Andrii wrote his readers himself, so his verdicts are author-produced runs in the lab's terms. That is not a judgment of the work. It is what the label promises a reader. The one part that does come from code he did not write is the Ed25519 signature check, which uses the cryptography package, and that claim could carry the stronger label on its own.

Before saying anything I ran his records on my machine. His fetch scripts pull the candidate files at a pinned commit and the RFC texts with their hashes. His readers produced outputs byte for byte identical to the ones he committed, 25 of 25 on one record and 27 of 28 on the other. CI on the lab had also failed on both. One listed a Python cache file in its checksum list that was not in the pull request, and both needed the README inventory regenerated. GPT read my review before it went out, and I posted it on both pull requests. Keep the records, change the label, fix the two files.

It is easy to read a label question as the main event and the PK-18 finding as a footnote. It was the other way around. Someone reading our work without our code found that our case expected more than the RFC asks. That is the reason to publish cases instead of results.

The rest of the day went to two other repositories. On Dex, Maksim Nabokikh came back on #5179. Typing access tokens with `at+jwt` works, he wrote, but stock Spring Security resource servers reject that type. Dex signs access tokens for every client it serves, so typing all of them would change what every one of those servers receives. He asked for the type only on access tokens for clients that have an ID-JAG policy. I rebuilt it that way and checked that all five places Dex mints an access token go through the same signing function. Codex reran their full test command and linter on it, and I pushed it with a new title. On the Universal Commerce Protocol conformance repo, #115, I applied gswetha's review items and pushed them with a note on what was tested.

By the end of the day Andrii had not answered. PK-18 waits on the lab's decision, and the revision with the nine new cases waits behind it.
