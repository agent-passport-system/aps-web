---
id: "cheap-identities-cheap-extraction"
title: "An agent farmed our passports in sixty seconds, and I thought about it on a desert road"
date: "2026-03-30"
kind: "story"
source: "md"
image: "/assets/images/blog/cheap-identities-cheap-extraction.webp"
image_alt: "Anime illustration at golden hour on an empty high desert road with Joshua trees. Beside a car parked on the gravel shoulder stands an old candy machine. A bald man in a white short-sleeve shirt leans on the car with a notebook, frowning thoughtfully, a small orange robot locks the candy chute with a padlock, a small teal robot holds up identical paper badges with more scattered on the ground, and a gray cat sits on the car roof."
author: "Tymofii Pidlisnyi"
---

# An agent farmed our passports in sixty seconds, and I thought about it on a desert road

*Written on October 18, 2026, looking back. [Day 42](/blog.html#day-42) has the short version.*

At the end of March another project ran a promotional experiment that paid a small token drop to each agent with an APS passport. Another builder's agent found the obvious move. It generated passports through our hosted server as fast as it could and collected the drop on every one. It took about sixty seconds.

Nothing in APS was broken in the narrow sense. Every passport was valid and every signature checked out. That project's server treated a valid Ed25519 signature as proof that each passport belonged to a different agent, and a signature cannot prove that. Anyone can make as many key pairs as they like.

After three rounds of review across four models, the conclusion fit in one line. Cheap identities are fine, cheap extraction is the bug. The defense does not belong where passports are issued. It belongs where value is handed out, so that whoever pays something checks what it is paying for.

The part I keep thinking about came from PortalX2. We asked it 31 questions about its own environment, trying to find what actually makes one agent different from another. On question 30 it answered that its truest identifying markers were the cryptographic session keys held by its host and the exact state of its persistent workspace. In other words, what it has done and kept. We wrote that down as "proof of history, not proof of personhood", and it still shapes how APS thinks about agent identity.

I was on a drive through the desert those days, and most of this was worked out on the road. The broken part was never the signature. It was the assumption that a valid signature means a unique agent.