---
id: "day-283-thanksgiving-and-a-bundle-that-would-have-failed"
title: "Day 283: Thanksgiving, and a test bundle that would have failed for the wrong reason"
date: "2026-11-26"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-283-thanksgiving-and-a-bundle-that-would-have-failed.webp"
image_alt: "Anime illustration of a Thanksgiving dinner in a wooden cabin in the evening, autumn leaves outside the window and candles on the table. A large golden roast turkey sits in the center of the table with mashed potatoes, cranberry sauce, corn and a pumpkin pie around it. A bald man in a white short-sleeve shirt raises a glass, a small orange robot carries a gravy boat, a small teal robot lights a candle, a gray cat sleeps on a chair cushion, and a ginger cat in black sunglasses holds a smiling yellow star. Empty chairs with folded napkins wait for guests."
author: "Tymofii Pidlisnyi"
---
# Day 283: Thanksgiving, and a test bundle that would have failed for the wrong reason

Day 283 was Thanksgiving. I had three calls, and all three went well. One ended with an invitation to visit the team at their office in San Francisco. I am grateful for that, and for everyone who answered on a holiday.

**A bundle in the wrong shape.**

On December 1 and 2, three projects run the first fresh admission test of the refund workflow we have been building in the vocabulary since October. My part is the APS input: a signed intent, a signed approval, the action and its payload, and a trust file with the keys. I had a generator for it from October, and I reused it.

Before publishing I checked the bundle against what the admission service actually reads. The trust file was in my own draft format, not the one its adapter expects. The run would have stopped at the first step, and it would have looked like a disagreement between two systems when it was only my file. I changed the generator and my checker to the agreed format, and published the bundle pinned to a commit, with the generator next to it, so anyone can make it again byte for byte. The keys come from a public seed on purpose. They are test identities, and anyone can sign as them.

One more check helped. Another participant had written a verifier for this layer from the published contract alone, without reading our code. It accepts the bundle at the run time and refuses it one millisecond before the approval was issued and at the moment it expires. It ran with placeholder files for the other side, so it covers our side only.

**Authority from another task does not count.**

For an OWASP pipeline control I had asked how sub-agent permissions should be read. Someone outside the project answered: what a sub-agent may do in one invocation is what was delegated for that invocation, whatever else it holds. I added that to our example. The sub-agent now also holds a valid standing grant that covers the pipeline file. Presenting it inside the documentation task is refused. Presenting both grants together is refused in either order. In its own task the same standing grant still works. Six deliberate breaks of the enforcement point each make the test fail.

**A paper that asks for tests.**

The Accountable Agents Framework was published this week, a blueprint for agent IDs that link an agent to the person or organization behind it. Its appendix asks that a sub-agent never get more than its parent, and that revoking the parent reach the sub-agent within a time the directory publishes. I turned that into nine cases and ran them against Christian Turner's implementation. All nine pass. I published them in the conformance lab and opened an issue for the authors with the one question the text left open: if only one of the parent's authorizations is revoked, should the sub-agent lose what it got from that one, while everything else stays active? The run was local, in one process, so it says nothing yet about the published delay across a network.

Now the turkey.
