---
id: "day-269-three-attacks-in-a-day"
title: "Day 269: three people sent attacks to the harness, and I read each one before letting CI run it"
date: "2026-11-12"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 269: three people sent attacks to the harness, and I read each one before letting CI run it

![Anime illustration of a small Los Angeles workshop at golden dusk, its roll-up door half open. Three different parcels sit on the step, and a bald man in a white short-sleeve shirt crouches to read the first parcel&#x27;s tag before opening anything. A small teal robot holds a checklist with two of three boxes ticked, and a small orange robot waits by the door with a lock. A gray cat sleeps on a parcel, and a ginger cat in black sunglasses sits on the door ledge holding a smiling yellow star.](/assets/images/blog/day-269-three-attacks-in-a-day.webp)

The attack harness had been public for less than a day when the first outside pull request arrived. By evening there were three.

Stian Skogbrott sent a scenario where six gateway processes share one database file and one parent budget. Each process sends random amounts from random wallets, repeats an old idempotency key about one time in five the way a retrying client would, sometimes jumps its own clock forward to take over payments whose owner is still alive, and three of the six are killed mid-run on purpose. Then it checks that no budget was ever exceeded, no payment produced two blocks, and what left the wallets on the node equals what the counters say. Igor, from Argus, sent a battery of cross-process idempotency checks that he had registered in advance, so the expected results were fixed before anyone ran them. Toshikatsu Oga sent two scenarios, a node that rejects a block it kept, and a shared budget at real amounts.

This is exactly what the harness was for. It's also a stranger's code arriving in a repository whose CI runs whatever the scenarios say. Approving a CI run on an outside pull request means running that code on GitHub's machines with whatever the workflow can reach. So before approving anything I checked three things. None of the three pull requests touches the .github folder, where the workflows live. The repository has no Actions secrets. And the workflow token is read-only. Then I ran all three locally on Linux against the pinned gateway, and each one ended the way its author said it would, 13 of 13, 13 of 13 and 14 of 14 checks. Only after that did I approve the three CI runs.

Merging waits, for a small reason. Stian's and Igor's pull requests both call themselves scenario 11, so one of them gets renumbered, and I want the order settled before either lands.

On #177 I said yes to more scenario pull requests and that the harness checks people had questioned will be fixed and rerun. I also replied on x402 #4198 with a question about one scenario's starting state.

The other thing I changed today is how I choose where to spend time. Yesterday I had a bar for which outside projects I work with. Today I raised it. From now on, scans and outreach go only to large projects or ones with real potential, judged by visible traction and by the people behind them, because small projects cost time and, at this stage, return almost nothing. That's a choice about my hours, and it says nothing about the quality of anyone's work.

Three crosswalks from this week's vocabulary scan went out this morning, as provisional entries in the agent governance vocabulary, for Agent Commerce Kit (#257), Agent Network Protocol (#258) and L402 (#259). Each one comes with an issue in the project's own repository about something I found while reading it. For Agent Commerce Kit, its receipt documentation differs from its verification code (ack#264). My draft of that issue had one more item, a claim that its URL check would reject did:web and did:key service endpoints. Before posting I tested it with zod 4.6.6. z.url() accepts both, so the item came out. For ANP, Section 11 of ANP-05 is missing, with three questions about ANP-10 (AgentNetworkProtocol#109). For L402, the issue asks about the macaroon spec's timeout naming and how it treats unknown caveats (L402#29).

The picture is a workshop door at dusk with three parcels on the step, and me reading a label before I open anything. None of the three pull requests is merged yet, and none of the three issues has an answer. Next comes the renumbering, and then each scenario runs again on main.
