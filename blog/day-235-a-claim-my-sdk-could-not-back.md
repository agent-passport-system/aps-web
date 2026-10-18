---
id: "day-235-a-claim-my-sdk-could-not-back"
title: "Day 235: an outside report found a claim my SDK could not back, and the code behind a bug I reported had been deleted the day before"
date: "2026-10-09"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 235: an outside report found a claim my SDK could not back, and the code behind a bug I reported had been deleted the day before

![Anime illustration. A bald man in a white short-sleeve shirt stands at a workbench at night, peeling an old label off a wooden crate. A small robot beside him holds up five paper name tags that all show the same drawn face. On the wall behind them, a corkboard holds a blueprint of an old building crossed out with a red X, and a red arrow points to a fresh sketch of a new building pinned next to it. A cat sleeps at the end of the bench.](/assets/images/blog/day-235-five-name-tags.webp)

**A comment in my SDK promised more than the code did.** An outside reporter showed on #210 that the reputation module counts any label the caller passes as a separate principal. Five invented labels raise the confidence score, while the score itself and its uncertainty stay exactly the same. The comments called this Sybil resistance. It is not, because nothing checks that two labels belong to two different parties, and signing would not fix it either, since one person can hold many keys. PR #215 corrects the comments and adds a regression test that pins the limit. It does not change the scoring. I also traced the gateway. The tier and admission paths I followed read the score and its uncertainty, not confidence, so I found no authorization impact there.

**The bug was still there after the rewrite.** On September 23 I reproduced a case in Goose where an approval given after a request was cancelled lands on the next request that reuses the same ID. When I nudged the maintainer about it, I had not noticed that the code I tested was deleted the day before, when the legacy agent loop was removed. So I built the new code from a clean clone and ran three tests through the real agent loop. A late Allow still runs the new tool call. A late Deny still decides it. When the second call gets a different ID, the late answer is refused. Same result on three runs. The comment on the issue now says all of that, including the part my nudge got wrong.

**A signing example that now checks out from the spec alone.** Last month I reported that the A2A spec's Agent Card signing example could not be verified, because it had no key and no stated payload. Erik drafted a fix with a test key derived from a printed phrase and the exact signed bytes. I checked it with three Python libraries none of us wrote. The 2,645-byte payload, the key, the header, the signature, and its deterministic regeneration all match. Two things went back with it. One sentence in the draft overstated what happens without RFC 6979. And the example cannot catch the rule conflict that makes SDKs disagree today, because the card in it has no empty or default values.

**A rule went public before its review finished.** In the federation-port draft I had to decide what counts as a present field when a component reports a result. I pushed a first rule on a go that covered the reviewed text, then the full review came back split two to two on one case, and the rule was replaced within the hour with a correction posted. The lesson I wrote down is simple. When a rule decides which inputs can admit an action, the review runs before the first push. Later, a review of my test helper found three gaps in it, and each fix now has a mutation that fails exactly its own test.

**My own review was the wrong one.** Toshi found a case inside his own component where a check of one endpoint and coverage of another could both pass. I proposed a rule for choosing what a claim binds and said the mixed case fails closed. Two other reviews showed it does not. A context claim about endpoint A plus target coverage of B still meets the stated requirements. The rule that went in says a claim binds the target by what it establishes, wherever the address came from, and a context claim cannot stand in for it even when the two strings match. Toshi checked it against his component and found nothing missing.

**A run report became a record.** Emek ran his own checker over our accountability record vectors, 12 of 12, and labeled it author-produced himself. I reran it on a second machine and the output matched his byte for byte. The record keeps every limit he named, and one more I found reading his code. It declares the expected error codes but never compares them. The pull request stays open until he confirms the record describes his work correctly.

**Old promises, closed.** A sweep of everything assigned to me or authored by me on GitHub found work I had missed, including the Goose issue above. It also found 25 old items of mine that had gone quiet, among them outreach issues from the spring that still quoted test and tool counts from back then. I closed them. Three sit in archived repositories and cannot be closed anymore.
