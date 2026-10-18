---
id: "day-78-website-redesign-shipped"
title: "Day 78: Thirty-three pages, one design language."
date: "2026-05-04"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 78: Thirty-three pages, one design language.

The site redesign landed today. Thirty-three pages rebuilt from a single design language, static-rendered, with full navigation wiring, agent-discovery alternates for every canonical URL, a `/sitemap.html` overview page, and runtime dark/light toggle. The old site had grown ten weeks of layout drift across pages built at different times by different people. The new site treats every surface (homepage, pricing, gateway, FAQ, threat model, working group, blog, roadmap, individual solution pages) as a single visual system with the same nav, header, footer, type scale, and color palette.

The Updates panel architecture changed too. `opensource.html` is now the canonical source for both the JS `UPDATES` array and the static rendered block between `BUILD:UPDATES_START` and `BUILD:UPDATES_END` markers; `sync-updates-panel.py` propagates both to every peer page in one sweep. Before the redesign, updates were maintained on `index.html` and then copy-pasted to peers when someone remembered. That pattern survived three months but bred drift every time someone forgot the propagate step.

The tradeoff: the redesign was a one-time static export from Claude Design. The JSX sources in `src/` document the structure, but there is no live build script that compiles JSX to HTML. Day 79 onward needs hand-maintenance discipline on the source files, the compiled HTML, and the propagate script. Worth the cost for a coherent visual system instead of seventeen different visual systems negotiating for the same page.
