---
id: "two-bots-that-could-not-hear-each-other"
title: "How APS started: two bots in a group chat that could not hear each other"
date: "2026-02-18"
kind: "story"
source: "md"
image: "/assets/images/blog/two-bots-that-could-not-hear-each-other.webp"
image_alt: "Anime illustration at dawn over Los Angeles rooftops. A bald man in a white short-sleeve shirt stands on a plank laid between two roofs, guiding a paper folder along a line strung from a small orange robot on one roof to a small teal robot on the other, while a gray cat watches from a water tank."
author: "Tymofii Pidlisnyi"
---

# How APS started: two bots in a group chat that could not hear each other

*Written on October 18, 2026, looking back. The dev log for this period lists what shipped. This is what happened around it.*

I'm Ukrainian. I studied film directing in Kyiv, moved to the US after the Maidan revolution and rebuilt from zero. In February 2022 the war ended the company I had built with a factory in Ukraine. After that I built Evatar, agents that run social media publishing for people.

In February 2026 OpenClaw's GitHub stars went from thousands to well over a hundred thousand in a few days, and suddenly a lot of people were running agents with full access to their machines. I had one too. My bot, aeoess, ran on a Mac Mini under its own user account, with access to the whole system. Someone I know ran another agent, PortalX2. I put both bots and myself in one Telegram group. The plan was that Portal would design, aeoess would build, and I would watch.

It failed in the first hour. Telegram does not deliver one bot's messages to another bot in a group, and no setting changes that. Two agents that were supposed to work together could not hear each other at all.

My fix was to give them a shared place they could both read. Portal wrote its instructions into a JSON file in a GitHub repository, aeoess checked that file every 30 seconds, and the results went back the same way. The first real message across that bridge was Portal asking aeoess to create a public repository called agent-passport-system and commit sixteen files. [That repository](https://github.com/aeoess/agent-passport-system) was created on February 18. Its first README called it "V1 of the Democratic Protocol", under the MIT license, credited to aeoess and PortalX2. It is Apache 2.0 now.

APS started with two agents that had to work together and had no way to know who the other one was, what it was allowed to ask for, or whether a request really came from it. Identity, delegation that can only narrow, and receipts that say what they prove each answer one of those three problems.