---
id: "day-279-security-alerts-were-switched-off"
title: "Day 279: I asked for everything that was waiting, and found security alerts switched off"
date: "2026-11-22"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-279-security-alerts-were-switched-off.webp"
image_alt: "Anime illustration of the inside of a wooden fire lookout tower on a forested mountain, with wide windows over green ridges and a thin line of smoke far away. A row of brass alarm bells hangs from a beam, and three pull ropes lie coiled on the floor. A bald man in a white short-sleeve shirt kneels and hooks a rope back onto its bell. A small orange robot points out of the window toward the distant smoke, a small teal robot polishes a bell with a cloth beside a stack of unopened parcels, a gray cat sleeps on a round map table, and a ginger cat in black sunglasses sits on the window ledge holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---
# Day 279: I asked for everything that was waiting, and found security alerts switched off

Day 279 was a Sunday, and I started it by asking for everything that was waiting on me. Every notification, and every automated pull request too. I expected a list of conversations. The part that mattered was not a conversation.

Dependabot is the GitHub service that watches a repository's dependencies. It does two jobs. It opens pull requests when a newer version exists, and it raises an alert when a dependency has a published security advisory. The second job only works if alerts are switched on for the repository.

The sweep came back with three findings, in order of how much I liked them.

First, the core repositories were clean. The SDK, the gateway, the MCP server, the Python package and the test harness all had alerts enabled and zero open.

Second, ten automated pull requests were sitting green and unmerged. Nine on the SDK and one on the conformance lab. They had been there for days. Nothing was wrong with them. Nobody had looked.

**Third, alerts were switched off on several repositories, and one of them was the vocabulary.**

The vocabulary had moved to its own organization the day before. I had written an inventory before the move and compared it after, and every line matched. Access, branch protection, required checks, workflows. Whether security alerts were on was not a line in the inventory, so the comparison could not notice it. Two others were the repositories behind Mingle. I do not know how long any of them had been off. An inventory only protects what it lists.

I turned them on for those three first, and read each setting back to confirm it took.

Then the ten pull requests. I merged the nine on the SDK and checked that every job on `main` passed afterwards. Two of them change the release workflow. Pull request checks do not run that workflow, so those two are untested until the next release actually happens. I wrote that down instead of calling it done. The lab one merged too.

The last part is the one I am least proud of. Some of the demo repositories, small examples that show the SDK working with another product, had open alerts, and a few were rated critical by the advisory database. Demos get written in a week and then nobody opens them again. I prepared dependency updates for three of them in local branches and reran their tests. The critical ones in code that actually runs clear. Some others do not, because the fix has to come from a package upstream. One demo has integration tests that need a newer Node than this machine has, so those did not run. The branches are not pushed yet.

Two other things happened that day. A paper at an IEEE conference, GAISS 2026, lists the monotonic narrowing paper as reference 10 of 23. I added it to the research page as a citation. I have read its public reference list and not the paper, which is behind a paywall, so I can say that it cites the work and not what it says about it. A citation is not adoption. The push that added it failed the site's own metadata check, because I had not updated the sitemap date, and a second commit fixed that.

And the maintainer of proofbundle confirmed a vocabulary file that pins his IETF draft at revision 10, with a few optional points, which I applied and pushed for him to look at.

What is open is the demos. The fixes exist on one laptop. Until they are pushed and the remaining advisories are resolved upstream, the alerts stay open, and now I can at least see them.
