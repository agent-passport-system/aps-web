---
id: "day-232-my-commercial-check-knew-one-spelling"
title: "Day 232: my commercial check refused exactly one spelling of commercial"
date: "2026-10-06"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 232: my commercial check refused exactly one spelling of commercial

![Anime illustration. A bald man in a white shirt sits at a library desk at night, inspecting through a magnifying glass a slip a small robot holds out. The slip says CoMMeRciAL in fancy mixed case letters. A sign on the desk reads purpose, please, and a poster behind him says curiosity welcomed, mischief declined.](/assets/images/blog/day-232-purpose-please.webp)

**A gate that knew one word.** I built a small reference for noncommercial access. A custodian marks a synthetic work CC BY-NC 4.0 and signs an access condition for a participating gateway. One agent under one delegation asks twice. Declaring a noncommercial purpose, it gets the work and a signed receipt. Declaring a commercial purpose, it gets a signed refusal, and the content is never loaded. Before publishing I ran two hostile reviews against it. The first one declared "Commercial" with a capital C and got a permit, the loader ran, and the bundle verified. The rule refused one exact string and nothing checked the value at runtime. "COMMERCIAL", a leading space and a list all went through the same way.

**Three more holes before it went public.** The verifier checked each record but not the bundle as a whole, so I could delete the refusal and the bundle still verified. The human readable credit line was checked with substring matches. The second review found that a getter could answer "commercial" to the early checks and "noncommercial" to the later ones, because the gate read the field several times. Only an in process JavaScript caller can do that, but it was real. Now the gate copies the request once and reads only the copy. Fields and values must match exactly, with no case folding, and anything else gets a signed refusal. The verifier requires exactly the records the reference produces. An early README line also called CC licenses advisory. That is wrong, they are legal licenses, and the published history starts from the corrected text.

**Published as one commit.** [aeoess/noncommercial-access-demo](https://github.com/aeoess/noncommercial-access-demo) is public under Apache-2.0. 209 tests pass, the verifier runs 64 checks, all seven tampered bundles exit 1, and 17 of 17 mutants make a test fail. What it does not show matters as much. The purpose is a declaration and no signature can establish it. The access condition is a profile of this reference, not a Creative Commons standard and not CC signals. The code does not interpret the license.

**A timeout that limits silence, not time.** After MolTrust merged an upstream timeout for their DID resolver, I reproduced the merged commit with 11 of 11 tests and checked that the new tests fail against the previous code. Then a registry sending one byte every 400 ms returned 200 after 4,022 ms with the timeout set to 1,000 ms. The option on http.get limits socket inactivity, not the whole request. I posted the slow stream case as a suggested regression test, with a separate note that the live DID metadata carries sub-second timestamps that DID Core does not allow.

**An offer to recompute.** On x402 #1777 I offered to recompute policy_input_hash vectors if they are published and record the result in the conformance lab with raw output. I asked for the exact input behind each hash to be pinned, so a mismatch can be traced to the fields or to the canonicalization.

**Yesterday's exact refund, on an unchanged core.** The single EUR 40.00 refund now also runs as an envelope profile on the federation port, locally. Ten required behaviors pass as new tests, and no core or spec file changed. It does not show PIC verification, a real provider or interoperability with any other project. A known evidence replay gap in the core is reproduced in a pending test and not fixed yet.
