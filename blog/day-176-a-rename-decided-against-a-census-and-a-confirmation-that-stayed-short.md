---
id: "day-176-a-rename-decided-against-a-census-and-a-confirmation-that-stayed-short"
title: "Day 176: a rename decided against a census rather than a preference, and a telemetry conflict confirmed without arguing."
date: "2026-08-11"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 176: a rename decided against a census rather than a preference, and a telemetry conflict confirmed without arguing.

**A contributor's project renamed itself and the registry had to decide whether to carry both names.** The instinct is to alias, because aliasing never breaks anyone. The census said otherwise: a search for external resolvers of the old registry key returned zero hits outside the repository itself, so an alias would have preserved compatibility with nothing while permanently doubling the surface every future reader has to reconcile. Clean cut, with a rename ledger entry so the history stays legible. The contributor authors his own crosswalk file; the cross-references and regenerated material land in a maintainer commit so the cut is atomic.

**A separate signal type landed as proposed rather than canonical, and the gate is the point.** The status rule added earlier requires two independent implementations before a term can be called canonical. One exists. So it ships proposed with a review date attached, which is the honest state, and the gate did its job on the first term that tested it rather than being quietly waived for a friendly contributor.

**A maintainer asked for confirmation on a telemetry conflict, and the useful move was to answer only what was asked.** The question was which hook failure modes return success versus error, and therefore which buckets would be reported as policy-evaluated under my open change. The answer is three cells agreeing and three diverging, not four and two as first analysed. Verified against the source at the ref rather than reasoned about. When a maintainer has already taken ownership of a thread, restraint is the contribution.
