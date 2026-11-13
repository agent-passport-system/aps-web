---
id: "day-264-another-drafts-list-of-reasons"
title: "Day 264: I answered a lab question with another draft's list of reasons, and the reviewer's copy went out instead"
date: "2026-11-07"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 264: I answered a lab question with another draft's list of reasons, and the reviewer's copy went out instead

![Anime illustration of a foggy San Francisco hillside street at dusk. At a crossroads stand two nearly identical wooden signposts carved with the same five round symbols, pointing different ways. A bald man in a white short-sleeve shirt reads the left one while a small teal robot points him to the right one and a small orange robot compares a map. A gray cat sleeps on a stone wall, and a ginger cat in black sunglasses sits on the right signpost holding a smiling yellow star.](/assets/images/blog/day-264-another-drafts-list-of-reasons.webp)

On Saturday evening Larry Lewis asked the lab a question I thought I could answer in a few minutes. Larry chairs the W3C Agent Trust Protocol Community Group. On lab issue #192 he reported that his ATP adapter now matched 44 of 44 cases in the lease and revocation family, by his own run. Then he asked two things about a call made before a grant's notBefore time, the moment the grant starts to be valid. Does the verifier still have to read the grant's current state first? And which refusal reason should it give?

The family has five refusal reasons. A separate Internet-Draft, draft-li-rttp-iqa-addressing, defines the same five as a closed, ordered list and says implementations must not emit anything outside it. Its last reason, operation_not_permitted, covers "reasons other than the four above". A call before notBefore is none of the other four. So my merged draft told Larry the read rule stays as written and the case maps to operation_not_permitted.

It read cleanly, and it was wrong for the lab.

I had three copies in front of me, mine and one each from GPT and Codex, the models I review with. Mine failed on the lab's own text. The lab README, revision 3, merged on October 25, defines operation_not_permitted as the case where the evidence, the lease and the current authority all hold, and only the requested operation falls outside the grant. A grant that hasn't started yet is not that case. And the lab's reasons are the lab's own list. The draft's list uses the same five words, but it doesn't govern the lab. I had read our rules through someone else's rulebook because the names matched.

GPT's copy had a different problem. It treated gaps in the family as cases Larry had already offered, which he hadn't. So the copy that went out was Codex's, unchanged. It proposes, for a later revision and through the lab's own proposal route, that a call before notBefore needs no read and gets a distinct reason, evidence_not_yet_valid. The binding is checked first, and a call at exactly notBefore follows the normal read rule. How any of this maps onto draft-li is kept as a separate question. It asks Larry for his overlap cases at a pinned revision, with license and authorship, as their own candidate. And if he wants his run recorded, it asks for the adapter, the vector digest, the command, its output and the per-call results. Which mode that record would carry is still open.

That was the second thing of mine on Saturday that looked right and wasn't. In the morning I found that a runner I had written for another project's vectors printed every mismatch and still exited 0. Any script that trusted the exit code would have read a pass. Revision 2 exits 1 on a mismatch, and I checked it the only way that counts, by feeding it a wrong expectation and watching it fail.

The rest of the day was quieter. Two crosswalks merged in the agent governance vocabulary, Open Decision Receipt (#231) and Provared (#238). Each maintainer had confirmed our reading first, and the models argued over each pull request before I merged. Provared needed six edits before that. REMORA's crosswalk (#232) got a four-point request instead of a merge. On the lab side I asked for four changes on #218, a temporal state derivation family from danyka-icam. The decisive one was labels for four equality cases that say which time convention each one assumes.

Larry hasn't answered yet. The picture is a crossroads with two signposts carved with the same five marks, and me reading the wrong one. The lab's list still has five reasons. A sixth is waiting for someone besides me to agree it should exist.
