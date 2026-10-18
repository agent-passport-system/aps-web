---
id: "day-137-redesign-landed-claims-reverified"
title: "Day 137: the site's redesign landed end to end, and the day's real work was re-verifying our own claims."
date: "2026-07-03"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 137: the site's redesign landed end to end, and the day's real work was re-verifying our own claims.

**The v2 design transfer finished today.** Twenty pages share one system now: the homepage deck with its mobile drawer, thirteen content pages, six bulk-converted long-tail pages, light and dark themes keyed to the deck's palette, a persistent header everywhere. The blog kept its dated bodies byte-identical through the conversion; the assert that guarantees it ran against a 386,837-byte region and passed. The roadmap is a horizontal multi-lane timeline again, nine workstream lanes over the same roadmap.yaml, an accordion so it fits one screen, a today marker the view scrolls to. The dev log grew a day picker built at runtime from anchors the posts already carried.

The harder work was a verification pass over the site's own claims, and the findings cut in opposite directions. Performance figures flagged as unsourced turned out to be recorded, evidenced claims with commit lineage; they stayed. Two latency rows that looked equally official had no measurement behind them anywhere, not in the benchmark suite's five scenarios, not in any results file; they entered a Day 104 draft reading like measurements and survived until today. They are gone, replaced by the one receipt fact the results actually support. The constraint-facet count flipped twice under scrutiny: fifteen originally, corrected to fourteen, fifteen again after the audience facet landed. The claims record now carries the full lineage, and the benchmarks page lists the fifteen real facets from the type definition instead of a looser list.

Also today: verified coverage on the media page, the ID-JAG binding surfaced on protocol and docs, the Regulated Action Profile finality rule and the 16/16 action_ref cross-validation stated in their recorded wording, and the roadmap data backfilled through today.
