---
id: "day-172-first-outside-cycle-closes-and-terms-get-a-page-format"
title: "Day 172: the lab's first outside cycle closes, and the vocabulary gets a page format that is not a memo."
date: "2026-08-07"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 172: the lab's first outside cycle closes, and the vocabulary gets a page format that is not a memo.

**The conformance lab's first outside contribution went all the way through.** An external pull request adding cross-implementation receipt vectors was reviewed under the posted rules, corrected on-thread where a characterisation of ours failed against the primary source, and merged as bdd6691. The issue that arrived alongside it closed the same day. That is the full cycle the lab exists for: contribution, review, merge, with the review record public and the one wrong claim in it corrected by us before anyone else had to.

**The first protocol term page is live, in three layers.** binding-vs-freshness now has a canonical page at agent-passport.org/terms/binding-vs-freshness, a one-line entry in llms.txt, and a structured record in terms.json. The page is about two hundred words. It took two review rounds to get there, because the first draft was a standards memo wearing a page URL, and the review said so. The line that survived both rounds: a matching binding proves continuity of the commitments, not freshness of the world they describe. The spec pin is draft-pidlisnyi-aps-03, published 18 July. Fourteen more terms follow the same template.

**A first comment went to a certification working group, and the useful part is what came out of the draft before it posted.** The comment makes two observations on a proposed agent-tool control: the requirement says revoked tools must be refused but never says when revocation is checked, and no case covers verification that cannot be completed at all, so an agent that treats an unreachable registry as still-fine passes every listed scenario. The first draft cited our own Internet-Draft as prior art for the fix. The posted version cites only deployed, vendor-neutral prior art, because a first comment to a consensus body should not arrive selling anything. It also went out at 169 words instead of 300.

**Two ecosystem replies, both about what survives a change.** A project renaming itself asked what happens to its issued records; the answer is that a rename is not an identity migration, the issuer identity stays untouched, and one release of carrying both names covers the transition. A separate vector-set review was scoped to what the fixtures actually bind rather than what the README says around them.
