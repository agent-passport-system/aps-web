---
id: "day-146-two-phase-reversibility"
title: "Day 146: settling the reversibility model before building it."
date: "2026-07-12"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 146: settling the reversibility model before building it.

**Some primitives are worth arguing about in the open before writing a line of them.** Before building reversibility into APS I worked the model out in a public standards thread on secure design for agentic systems. The question was narrow: how should a gateway treat an action whose consequences may not be undoable? The design that held is two phases, a declared reversibility ceiling before execution, and an instantiated fold after, computed from what the action actually bound rather than from what it promised.

The rule that matters is fail closed. If an effect that should carry a reversibility binding is missing one, the gateway treats the action as irreversible rather than assuming the better case. Reversibility does not compose the way authority does. Authority only narrows at each transfer, so its worst case is the declared ceiling and nothing downstream can widen it. Reversibility depends on what actually happened after the action ran, so a missing binding cannot be read as harmless and has to count against the action.

The model was written against the action-class and externality types already in the SDK, so the primitive has real anchors instead of new vocabulary invented to fit it. That is the discipline: the design is only settled once it grounds in what already ships. Day 147 builds it.
