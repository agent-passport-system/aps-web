---
id: "day-275-my-harness-called-a-broken-answer-a-denial"
title: "Day 275: my harness called a broken answer a denial, and the clean result was partly mine"
date: "2026-11-18"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-275-my-harness-called-a-broken-answer-a-denial.webp"
image_alt: "Anime illustration of a small stone weather station on a grassy cliff at sunrise, with a wind vane, brass instruments and a large round dial on the wall, mist over the sea below. A bald man in a white short-sleeve shirt frowns at a long paper strip coming out of a brass recording machine. A small orange robot points at a loose wire inside the machine's open side panel, a small teal robot holds up an empty envelope, a gray cat sleeps on a plaid blanket on a stool, and a ginger cat in black sunglasses sits on the roof beside the wind vane holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---
# Day 275: my harness called a broken answer a denial, and the clean result was partly mine

On Day 275 the lab scan brought back a candidate I liked a lot. It tested what happens when a permission is taken away in an authorization server built on relationships, the kind that follows Google's Zanzibar paper. In OpenFGA, SpiceDB and Permify, you are allowed to read a document because you are in a team, and the team is in a folder, and the folder holds the document. Remove one link in that chain, and every check that relied on it should start saying no. The question was how soon.

The harness ran all three servers locally, removed a relationship, and kept asking. The first version scored 243 case results with no disagreement. One observation even said SpiceDB had no stale window at all, no moment where a removed permission still answered yes. A clean result on three well known servers is exactly what I would want to show people.

Before opening anything I gave the results and the harness to Codex for a full review. It came back with REVISE, and the first finding was about my code, not theirs.

The harness had to turn each server's answer into allow or deny. It recognized one encoding of allow, and everything else became deny. So a successful response with an empty body counted as deny. A server error on a lookup counted as no result. On cases where the expected answer was no, a broken answer scored as agreement. Codex proved it without touching a server. It fed the adapters fake responses and an empty body passed as a denial in all three.

The second finding was about time. Each case had a bound, for example ten seconds, and the harness checked for a denial at the bound plus a two second margin. It never scored a stale allow that came back between the two. Codex fed it a server that kept saying yes for eleven seconds after a ten second bound, and the harness reported no difference. My ten seconds had quietly become twelve.

Then two readings fell. The SpiceDB observation with no stale window was an artifact of how the run warmed up its checks. The later run measured stale answers on SpiceDB too. And I had treated a ten second setting in OpenFGA's cache controller as the longest a stale answer can live. It is the shortest interval between refresh triggers, not a maximum.

So the clean result was partly a measurement of my harness. None of this said the servers were wrong. It said I could not yet tell.

I kept the first version as it was and wrote dated clarifications next to it, including the withdrawal of the SpiceDB observation. The new harness treats an explicit deny, an empty result, a malformed response and a failed request as four different things, and only the first counts as a denial. Every stale allow after the bound counts against the bound, and each request records when it started. The servers ran again. It came back 289 agreeing, 108 recorded as observations with no source bound to score them against, and no errors.

Codex reviewed that too and found more. A protocol failure in observation mode still exited zero, and a server that failed to start left an empty file instead of a record. Those were fixed, the full run checked again from a clean clone, and a last pass asked for one honest change in the pull request text, which described what was rerun and what was checked offline. In the evening I merged it as lab #240. The candidate says what it is. It is inherited permission through a chain of relationships, measured by its author, not signed delegation and not a closed gap. The AIMM mapping in the lab was refreshed in two more pull requests to point at it.

The rest of the day was small fixes and first steps. Two pull requests on the SDK correct the x402 facilitator address and stop two concurrent submissions of the same payment from both settling. A results pull request went to the IETF 127 hackathon repo for our part of a revocation test. A witness answer went to the HORIZON SHIELD audit for one day's record. On OWASP SPVS, a docs fix and three questions on how to read one control.

No maintainer of OpenFGA, SpiceDB or Permify has run the candidate. If one does, the harness is there to try on their own builds.
