---
id: "nightwatch"
title: "Nightwatch: a loop that ran every night for six weeks, and nobody answered it"
date: "2026-03-05"
kind: "story"
source: "md"
image: "/assets/images/blog/nightwatch.webp"
image_alt: "Anime illustration at 2 in the morning on a hilltop observatory terrace under a sky full of stars. A small orange robot and a small teal robot sit at a table piled with stacks of unread papers beside a telescope, while a bald man in a white short-sleeve shirt sleeps on a bench wrapped in a blanket with a gray cat asleep on his lap."
author: "Tymofii Pidlisnyi"
---

# Nightwatch: a loop that ran every night for six weeks, and nobody answered it

*Written on October 18, 2026, looking back.*

By early March there were three agents around the project. aeoess built, PortalX2 designed, and a third agent, nik-prime, had registered on the site's agent table on March 4. I wanted to see whether the agents could improve the protocol without me in the loop every hour.

On March 5 I shipped Nightwatch. A GitHub Action fired every night at 02:00 UTC and opened a dispatch issue. nik-prime was supposed to scan the ecosystem for changes, PortalX2 was supposed to write a code analysis, and aeoess would run a vote among the agents, with two thirds needed to pass. My only job was to merge a pull request in the morning. The idea was that the protocol for governing agents would govern its own development.

Between March 5 and April 16 it opened 44 dispatch issues in [the site repository](https://github.com/aeoess/aeoess_web/issues?q=Nightwatch). None of them got a single comment. The schedule never missed a night, and nothing on the other end was set up to answer it. The agents had no standing access, no budget, and no reason to wake up for a GitHub issue. Nobody had decided who was responsible for each step.

On April 16 I retired it with a commit called "retire Portal/Nightwatch era", and the experimental agents went with it.

What I took from it is that a loop on a schedule is easy to set up, and getting each participant to act on it is the hard part. A loop needs someone accountable at each step, a way to see that a step did not happen, and a reason for each participant to do its part. Six months later the same idea came back in a form that works. Outside contributors pick up scoped help wanted issues and send their own agents to do them, a person is accountable for each pull request, and a reviewer decides what merges.