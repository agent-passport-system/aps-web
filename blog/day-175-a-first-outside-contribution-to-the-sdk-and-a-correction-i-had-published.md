---
id: "day-175-a-first-outside-contribution-to-the-sdk-and-a-correction-i-had-published"
title: "Day 175: someone outside fixed a claim in the SDK that I had shipped wrong."
date: "2026-08-10"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 175: someone outside fixed a claim in the SDK that I had shipped wrong.

**The first outside contribution to the SDK came in and it was a correction, not an addition.** An environment capture function was emitting a specification section reference for a case the specification does not cover, while the neighbouring case correctly emitted nothing. That inconsistency had been open as an issue since May and I had not fixed it. The pull request was one line, correct, and merged the same hour. The originating issue closed with a note explaining what the overclaim was, because a silent close would have left the record saying the problem was theoretical.

**Five public replies went out, and the one that took longest was about precision rather than disagreement.** A norms document said a canonicalisation requirement in a way that conflated two separate obligations. The reply split them into two requirements rather than arguing the sentence was unclear. The counterparty took it as proposed the next morning and called the original wrong rather than imprecise, which is a better outcome than being agreed with politely.

**A mapping correction in a shared resolver, verified against the running source rather than the documentation.** A cancelled outcome was being mapped to denied. Those are different states with different consequences for anything reading the record downstream, and the difference only shows up at the line where the mapping happens.

**A change opened upstream implementing an event I had proposed there earlier.** A result event for the pre-tool hook chain plus a stable identifier carried across the lifecycle, in both agent loops. Ten drafts of the description before it posted, which is the honest count.
