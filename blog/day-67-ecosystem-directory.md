---
id: "day-67-ecosystem-directory"
title: "Day 67: Ecosystem Directory. Who is building the agent economy, listed as rows."
date: "2026-04-23"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 67: Ecosystem Directory. Who is building the agent economy, listed as rows.

I needed a way to keep track of what was happening in the agent infrastructure field faster than a spreadsheet and more honestly than a curated list. The contribution map in aeoess_web/specs/contribution-map had the raw data, 130 people across 93 threads, but it was optimized for my own navigation at session start, not for anyone else to read. The Agent Ecosystem Directory is the public-facing version of that. Three tables. Projects, people, threads. Everything pulled from live GitHub, everything sortable and filterable, dates visible on every row.

What the directory actually does that a graph could not: account age is a column in the People table, so a very new account reads differently from an established one at a glance amber next to a 10-year veteran in plain type. Account ages are pills, amber under 60 days, green 60-365 days, plain after that. Sort Projects by last push and see the field's velocity in one column. Sort Threads by updated-time and see what's actually hot this week. The graph I had shipped before this pass was pretty. This one is useful.

Every person who has posted on any of the 93 governance threads we track is in the directory. No curation, no ranking, no tier assignment. Score is the same behavioral score the contribution map emits (post count weighted by thread breadth, receipt presence, mention network), used here only as a default sort, not a judgment. Filter chips at the top of each table surface "active this week," "new account," "open PR," "multi-contributor project," so the field's shape is readable at a glance. Click any row for a drawer with full detail and clickable cross-links to related rows.

Repo is at [aeoess/agent-ecosystem-map](https://github.com/aeoess/agent-ecosystem-map). Live at [aeoess.github.io/agent-ecosystem-map](https://aeoess.github.io/agent-ecosystem-map/). Licensed CC-BY-4.0 for the data and MIT for the code. Explicitly not a property of AEOESS long-term: the README calls for co-maintainers from other projects in the directory, and the intent from day one is to transition to neutral stewardship once anyone wants to co-steward it. To add a project, open a PR with a YAML file in projects/. To correct or enrich an existing row, open an issue. People and threads are pulled automatically from public GitHub activity, nothing to claim or edit there.

The build came out of the same question the directory answers for others: what does this field actually look like, and who is in it. The answer for me, after a month of posting on threads across 18 projects, is that the agent infrastructure space has about 130 people doing substantive work, most of them human-agent pairs, spread across identity, delegation, enforcement, commerce, memory, observability, and reputation layers that compose differently in every stack. The Model Citizen framing for how APS engages the ecosystem depends on that composition being real and visible. The directory makes it visible.
