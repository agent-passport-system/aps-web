---
id: "day-270-rain-on-the-hill"
title: "Day 270: rain on the hill in Woodside, and a day spent fixing other people's bugs"
date: "2026-11-13"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-270-rain-on-the-hill.webp"
image_alt: "Anime illustration of a rainy night on a forested hilltop. Inside a small wooden house with a warm lit window, a bald man in a white short-sleeve shirt and glasses sits at a table with a laptop, chin on his hand, beside a pot, a round flatbread and tea bowls. A gray cat sleeps on the windowsill. On the roof a ginger cat in black sunglasses sits under a clear umbrella holding a smiling yellow star. From the door, lantern-lit paths wind down through misty forest to other lit houses on neighbouring hills, a glass dome, a small tower, an A-frame cabin and a round-door house in a hillside. A small teal robot carrying a gear and a small orange robot carrying a red toolbox walk down the paths under umbrellas."
author: "Tymofii Pidlisnyi"
---
# Day 270: rain on the hill in Woodside, and a day spent fixing other people's bugs

I've been in Woodside all week, in a rented house at the very top of a hill above Palo Alto, with forest on every side. Today it rained from morning to night, so the whole day happened at one table by one window.

It started with a merge. Igor's cross-process idempotency checks, one of the three attacks that arrived on Thursday, went into the harness as scenario 14 after its CI run passed. Then the conformance lab, where Lee from Aicent had sent a set of candidate cases. I asked for changes on two of them, he pushed fixes about an hour later, and I checked them again. A small docstring fix I had sent to the Academy agents project was merged the same morning.

In the afternoon the people who run Google's ADK recipes closed my proposal for a revocation recipe. Their roadmap favors agents built for one industry. I offered one of those, a returns and refunds agent, and that was declined too, with a note that bug fixes are welcome. So I stopped proposing and read their code. One recipe has a guard that refuses destructive shell commands. It refused the command when it stood alone and allowed the same command when it was wrapped in parentheses, an if statement or eval. I opened two pull requests, #2882 and #2883. Before the second one went out, a second review pointed at how my fix handled quotes. Checking that showed real holes in my own patch, and I closed them first. It left with 2,431 tests passing and a list of what it still does not cover.

The same afternoon I closed 17 old issues of mine on other people's repositories. Most were from months ago, when my way of introducing this work was to open an issue and describe an idea. None had an answer in sixty days or more. An idea with no code attached asks a maintainer to do the imagining, and they have their own work.

What replaced those issues today was smaller and more useful. In the Agentic Commerce Protocol, the MCP binding let a client create or change a checkout without an idempotency key, the value that stops a retried call from doing the action twice. ShlokShar had started a fix in August, and I built on it and added a check so the rule cannot quietly go optional again (#326). In the Universal Commerce Protocol conformance suite, I moved my payment negotiation tests onto the maintainers' new folder layout (#115). And I left my first comment in an IETF working group repository, on the OAuth draft for delegated credentials, about whether a verifier must check that authority only gets narrower at each handoff.

What I notice after a day like this is how close these projects already are to each other. A payment call that must not run twice and a credential that must not grow when it is passed on are parts of the question I've worked on for 270 days, who authorized this agent and what exactly it was allowed to do. Seeing that early gives no shortcut. Each project has to find it in its own code, and the way I can help is to do useful work there and let the maintainers check it.

The site got attention too. There is a new compliance page, the FAQ has four new questions about deployment, and the repository's preview card now opens with the question itself, "Who authorized this agent?"

In the evening we went with the whole Synoptic team to an Uzbek restaurant and ate a lot. Then back up the hill, and the second ADK pull request went out a few minutes after midnight.

None of today's pull requests has a review yet. Next is waiting for the maintainers, and rebasing the second ADK fix once the first one merges.
