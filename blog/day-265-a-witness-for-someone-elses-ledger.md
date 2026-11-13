---
id: "day-265-a-witness-for-someone-elses-ledger"
title: "Day 265: I signed as a witness for someone else's ledger, then signed it again over two semicolons"
date: "2026-11-08"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 265: I signed as a witness for someone else's ledger, then signed it again over two semicolons

![Anime illustration of a grassy hilltop lookout above San Francisco on a sunny afternoon, the bay and a red suspension bridge in the distance. A bald man in a white short-sleeve shirt holds a sealed sheet of paper up to the light while a second sealed sheet lies face down on the bench. A small teal robot presents a brass key on a ribbon, and a small orange robot checks a chain of carved links with a magnifying glass. A gray cat sleeps on the bench, and a ginger cat in black sunglasses sits on the railing holding a smiling yellow star.](/assets/images/blog/day-265-a-witness-for-someone-elses-ledger.webp)

Toshikatsu Oga runs HORIZON SHIELD, and its content check runner signs a record of every day's checks. On horizon-shield #75 he asked for witnesses for the FURUI day record of November 6, people who would recompute it from public endpoints and sign what they got with a key served from their own domain. I had told him yes on November 6, and on Sunday I did it.

Here a witness recomputes a record from its bytes and signs the parts that matched. That is all the signature covers. The day record is a hash tree over the day's entries, and its root was stamped into Bitcoin through OpenTimestamps, a service that puts a hash into a block so anyone can later show the hash existed by then.

I ran his verifier, nenrin-verify 0.8.1, over the three leaves he served, and every check passed. Then I didn't rely on it alone. I rehashed the day record's canonical bytes and the batch entry with Python's own hashlib, parsed the OpenTimestamps proof with the reference client, and read the merkle root of Bitcoin block 975020 from a block explorer. The proof pointed to that block, and the two roots matched.

Then came a step I hadn't needed before. A signature from me means something only if people can find my key without asking me for it. So I made a new Ed25519 key just for witness answers and published its public half at agent-passport.org/.well-known/witness-1.json. The private half never left my machine. The verifier's fetch mode pulled the key from the site, checked my answer against it, and returned signed_answer_ok.

The answer has a field for its limits, and I wrote that field before anything else. The first line names our earlier collaboration with HORIZON SHIELD, because a witness who has worked with a project should say so. The last line says the answer "does not establish that any check behind the root was right, that the day's log is complete, or who ran the checks beyond the key served at agent-passport.org".

Just before posting, I noticed two semicolons in those limits. I don't use semicolons in anything I publish. But the answer was already signed, and a signed text can't be edited without breaking its signature, which is the whole point of signing it. So I rebuilt the answer, signed it again, verified it again, and kept the first version on disk, unposted. It sounds fussy. It was also a small rehearsal of the real rule, that a signed thing is changed only by issuing a new one.

The rest of Sunday was other people correcting my readings. On the vocabulary, zerohourzulu answered five questions on the IronTrellis crosswalk (#250) and sent three corrections, about who signs the outcome attestation, a 0x00 separator in the signed bytes, and canonicalization being project-specified. I folded them in, he confirmed the mapping, and it merged. His third correction had no value in our vocabulary to land on, so I opened #253 to ask what a project-specified canonicalization should be called. In the lab, the temporal derivation family from danyka-icam came back revised, I approved it with the rerun figures, and #218 merged.

The picture is a lookout on a hill above the city on a Sunday afternoon, with me holding a stamped page up against the light. The answer is posted on #75. Toshi still has to file it in his ledger as a witness entry, and he offered to recompute one of our records in return. I owe him one to check.
