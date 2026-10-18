---
id: "a-month-on-openclaw"
title: "A month on OpenClaw, and why I didn't build on it"
date: "2026-09-28"
kind: "story"
source: "md"
image: "/assets/images/blog/a-month-on-openclaw.webp"
image_alt: "Anime illustration in early morning light on a Los Angeles freeway where heavy traffic heads straight toward a city of giant glowing buildings while one small car takes a quiet off-ramp toward a clear horizon. From the overpass railing a bald man in a white short-sleeve shirt watches calmly, a small teal robot holds a folded map, a small orange robot holds a toolbox, and a gray cat sits on the railing."
author: "Tymofii Pidlisnyi"
---

# A month on OpenClaw, and why I didn't build on it

*Written on October 18, 2026, looking back at September.*

OpenClaw is where this project started, so in September I decided to go back to it properly. On September 3 my record there was zero merged contributions, and the APS plugin repository had been archived. The plan was to find one small real bug, prove it with a test that fails before the fix and passes after, and send one focused pull request with nothing APS-shaped in it. On September 5 I made it the focus for the month.

On September 6 @steipete merged my [#137713](https://github.com/openclaw/openclaw/pull/137713), a fix that keeps a user's config when one recovery step fails.

The harder question was whether APS should enforce authority inside OpenClaw. On September 8 a test on OpenClaw's real gateway showed that a hook running after ours could rewrite a tool's arguments after APS had admitted them. So at that point APS could sign that it admitted a call, not what actually ran. That is admission evidence, not execution evidence, and selling the first as the second would be exactly the kind of claim this project exists to stop. I parked the product idea.

On September 28 a read-only review of OpenClaw's code came back as no-go for the build. Plugin hooks do not cover every path a tool call can take, so a plugin cannot sit where actions take effect.

The bug fix work stays, because it helps OpenClaw users whatever APS does. The enforcement work moved to [NVIDIA OpenShell](https://github.com/NVIDIA/OpenShell/issues/3808), which sits lower, at the sandbox where spawned agents actually run.

OpenClaw had hundreds of thousands of stars, but stars do not make it possible to check what actually ran.