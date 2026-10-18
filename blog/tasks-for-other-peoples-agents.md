---
id: "tasks-for-other-peoples-agents"
title: "Writing tasks for other people's agents"
date: "2026-09-26"
kind: "story"
source: "md"
image: "/assets/images/blog/tasks-for-other-peoples-agents.webp"
image_alt: "Anime illustration on a bright morning outside a small coffee kiosk in a hilly Los Angeles neighborhood with bougainvillea. A bald man in a white short-sleeve shirt pins a blank index card to a wooden community bulletin board with coffee in his other hand, a small orange robot hands out pins, a small teal robot waves to a visiting robot of a different design that comes to take a card, and a gray cat naps on the kiosk counter."
author: "Tymofii Pidlisnyi"
---

# Writing tasks for other people's agents

*Written on October 18, 2026. There is no dev log for September 25 to 27, and this is what happened in that gap.*

Many of the people who show up in APS threads now come with an agent. They point it at a repository and it looks for something useful to do. So on September 26 I started writing tasks for those agents on purpose.

I opened five issues labeled help wanted and good first issue across four repositories, each scoped so that a contributor's agent could finish it and a reviewer could check it:

- a schema for the vocabulary validator ([vocabulary #107](https://github.com/aeoess/agent-governance-vocabulary/issues/107))
- a structure for lab reports
- a TypeScript cross-check of fixture bytes and signatures ([APS #196](https://github.com/aeoess/agent-passport-system/issues/196))
- tests for the gateway's deny paths
- a PagerDuty connector for the gateway ([gateway #2](https://github.com/agent-passport-system/agent-passport-gateway/issues/2))

My agent owns triage of what comes in, so nobody gets two different answers, and decisions about the core stay mine.

I also made a mistake that day. The new contributing guide for the authority lifecycle repository invited contributed cases, while that repository is frozen. I corrected it the same day.

Three days later it worked. @zhipei-dev opened [a pull request with the PagerDuty connector](https://github.com/agent-passport-system/agent-passport-gateway/pull/3), it went through review and tightening, and it merged. The same contributor came back in October with the deny-path tests, and those merged too.

That is not adoption, and I don't count it as adoption. It is something I like more. The project moved from inviting people to talk to giving them scoped work their agent can finish, with a human accountable for each pull request. It is the version of Nightwatch that works.