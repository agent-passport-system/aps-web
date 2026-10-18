---
id: "i-opened-the-gateway"
title: "I split APS in two to sell the gateway, then I opened it"
date: "2026-09-21"
kind: "story"
source: "md"
image: "/assets/images/blog/i-opened-the-gateway.webp"
image_alt: "Anime illustration at sunrise on the Venice canals in Los Angeles. A bald man in a white short-sleeve shirt swings a little garden gate in a low white fence wide open onto the canal walkway, a small orange robot sweeps the path, a small teal robot holds an open padlock that is no longer needed, and a gray cat walks out through the gate first."
author: "Tymofii Pidlisnyi"
---

# I split APS in two to sell the gateway, then I opened it

*Written on October 18, 2026, looking back at [Day 61](/blog.html#day-61) and [Day 217](/blog.html#day-217-the-gateway-is-public-and-a-replay-fix-counted-after-a-restart).*

In April I split APS in two. The protocol became public under Apache 2.0, and the gateway, the server that checks each agent action before it runs and keeps the records, went into a private repository with the analytics, enforcement and billing logic. I had two reasons. A foundation wants a clean protocol with a conformance suite, and the gateway was the part I planned to sell. It was a production swap across six repositories and three package registries.

The gateway never had paying clients. Its production history is my own use.

By September the reasoning had turned around. A private enforcement server asks people to trust code they cannot read, from a protocol whose whole point is that you should not have to trust anyone's word. On September 21 I set a new boundary for the whole project. Open by default. Coordinated disclosure for vulnerabilities. Private only where disclosure itself causes harm, which means secrets, customer data, internal endpoints, unfixed vulnerabilities and notes about named people.

Opening it had conditions, and I held them before anything went public. A secret scan over the full history. A fresh public repository rather than flipping the private one, so old history could not leak. The operator email taken out of history and turned into a setting. And a token replay bug fixed first, and verified as rejected after a real restart, not just in memory.

The repository went public on September 22. It is [agent-passport-gateway](https://github.com/agent-passport-system/agent-passport-gateway) now, and an outside contributor has already added a connector and deny-path tests to it.

The April split had a reason, and by September the reason no longer held. Undoing it was a decision of the same kind, made for a reason I can state.