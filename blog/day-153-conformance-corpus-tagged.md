---
id: "day-153-conformance-corpus-tagged"
title: "Day 153: the conformance corpus took a version, which is a promise about what will not move."
date: "2026-07-19"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 153: the conformance corpus took a version, which is a promise about what will not move.

**A test corpus that can be edited between runs is a suggestion; a tagged one is a reference.** The conformance suite took its first release tag so an outside implementer can pin the exact bytes they verified against and cite them, and so the interop exchanges have a fixed target rather than a moving branch. The tag freezes the vector families as they stand, from the canonical byte-contract fixtures through the signed decision records and the adversarial forgery cases, and the README states plainly what the tag is and what it is not: a seed corpus exercised across implementations, not an independent conformance program. The distance between those two is exactly the work a neutral home is meant to close.

The count discipline held under review. One family carries nine files where a reader expected eight; the ninth is a production-derived divergence record, not a runnable byte-contract vector, and the number was corrected to say so rather than left to imply a larger set. A seed corpus earns nothing by rounding up.
