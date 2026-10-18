---
id: "the-lab-got-the-right-name"
title: "The lab was accepted, and then I found my own file said the wrong thing"
date: "2026-07-27"
kind: "story"
source: "md"
image: "/assets/images/blog/the-lab-got-the-right-name.webp"
image_alt: "Anime illustration at midday on a quiet street in front of a small new workshop. A bald man in a white short-sleeve shirt stands on a ladder repainting a blank wooden sign board above the door, a small orange robot holds the paint can at the bottom of the ladder, a small teal robot holds up a sheet of plans, neighbors watch kindly, and a gray cat sits on the doorstep."
author: "Tymofii Pidlisnyi"
---

# The lab was accepted, and then I found my own file said the wrong thing

*Written on October 18, 2026, looking back at [Day 161](/blog.html#day-161-the-lab-gets-the-right-name-and-sixteen-dead-issues-close).*

On July 23, on a call with LF Decentralized Trust community staff, the lab proposal was accepted. A lab there is a place for open work that is not yet a full foundation project. The name and the paperwork would follow.

That evening, in an unrelated thread at the Decentralized Identity Foundation, someone wrote that a passport may carry hints about identity but should not be read as authorization. It was a fair point about words, and it made me reread my own proposal.

On July 27 I found the problem. The proposal file, the one that would become the lab's public page, described the protocol as the lab. The word conformance did not appear in it once. On the call, and in my own earlier comments, the lab was only ever meant to hold conformance material, meaning test vectors, verifier adapters, negative cases and run reports. The specification stays in my individual Internet-Draft, where it can be judged on its own.

I fixed it before the merge. The lab became [Agent Authority Conformance](https://lf-decentralized-trust-labs.github.io/labs/approved/agent-authority-conformance.html). Agent Passport Conformance would have tied a neutral venue to one product. Authority won because authority is what gets verified, and evidence is one output of verifying it.

Reading the template turned up a second problem. A repository can only move into the lab if every commit carries a DCO sign-off, a line in which the author certifies the right to contribute it. The conformance suite had 72 commits and none were signed off, and one was by @kenneives. Squashing them into one signed commit would have put someone else's work under my name, so I told the lab steward and asked how to handle it.

The lab proposal merged on July 31. The file that merges is the decision, whatever was said on the call.