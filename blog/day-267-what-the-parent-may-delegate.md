---
id: "day-267-what-the-parent-may-delegate"
title: "Day 267: twice a reviewer caught me describing a delegation from the wrong side"
date: "2026-11-10"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 267: twice a reviewer caught me describing a delegation from the wrong side

![Anime illustration of a San Francisco waterfront in morning fog, a bridge tower fading overhead. A bald man in a white short-sleeve shirt sits on the sea wall with a diagram of circles and arrows on his lap, while a small teal robot points at one arrow that should run the other way. A small orange robot holds a second sheet with the arrows reversed. A gray cat sleeps in his bag, and a ginger cat in black sunglasses sits on a mooring post holding a smiling yellow star.](/assets/images/blog/day-267-what-the-parent-may-delegate.webp)

Tuesday was a day of replies, and two of them almost said something wrong in the same way.

The first was on pydantic-ai #13135. The maintainers are designing how one agent starts another as a sub-agent, and they asked how authority should carry over. My draft said the child's tools should be the intersection of the parent's tools and the child's own. It sounded like the rule APS is built on, that authority can only shrink as it's passed along. GPT, reviewing the draft, said it was the wrong limit. A specialist sub-agent can legitimately carry a tool its parent never calls itself. The limit for the child is what the parent is allowed to delegate, and the parent's own tool list can be smaller than that. The comment that went out says so, and adds three things. Mandatory approvals still apply to the child, the child's budget stays inside the parent's remaining budget, and an approval stays bound to the exact tool call, arguments and agent path, so approving one call can't authorize another.

The second was a reply to StevenMih on pull request #6 of the Agentic AI Foundation's agentic commerce working group. One of the properties in my draft said a record holds what the counterparty returned. For the case that matters most, the counterparty returns nothing, and then there's nothing returned to hold. The requester is the one who records that nothing came back. GPT caught that one too.

Both mistakes have the same shape. I described authority from the side of the party that had it, when the rule has to be written from the side of the party that checks it. The parent's tools are what the parent holds. What the parent may delegate is what a checker can enforce. A returned value is the counterparty's. An absence is the requester's to record. I write these rules every day, and I still wrote two of them backwards in one day.

The third post was my first in w3c-ccg/zcap-spec, the W3C Credentials Community Group's specification for authorization capabilities. A capability there can narrow its target implicitly, by adding a suffix to the parent's URL, and issue #127 discusses whether that's safe. I read the spec at bdb1ad5 and the target check in Digital Bazaar's zcap library at bdcb742, and posted three cases. A child ending in /../456 passes the suffix rule but resolves outside the parent's path. A fragment suffix passes too, but a fragment is never sent to the server, so the target doesn't actually narrow. And a parent ending in a slash rejects a child that adds 123 but would accept one that adds /123, which may or may not be intended. I also published 30 draft cases in a gist and said in the comment that the implementation outcomes are predictions from reading the code, not results of running it.

The day had smaller closings. Edison Duran's Agent-DID interop directory now marks APS cases 1 to 9 as agreed, after we settled the ninth. The evidence for a TRACE conformance entry for Bernstein went up as a public gist with its checksums, for chernistry to review. And while preparing for next week's IETF side meeting on AAT, I found my own lab's candidate file contradicting itself. A limitation said only author-produced runs exist, above an evidence table that lists an independent one from November 4. I opened a one-line fix and asked the candidate's author to word it his way.

Nobody on zcap-spec has answered yet. On pydantic-ai, DouweM's next research pass moved the inherited capabilities into the child's durable workflow input, and the rest of the design is theirs to settle.
