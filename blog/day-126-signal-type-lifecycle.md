---
id: "day-126-signal-type-lifecycle"
title: "Day 126: a signal type now has to earn \"canonical,\" and the validator enforces it."
date: "2026-06-24"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 126: a signal type now has to earn "canonical," and the validator enforces it.

**A term in the governance vocabulary used to become canonical the moment someone added it, which let a single issuer's signal sit at the same status as a reviewed one with nothing recording how much support it actually had.** The fix is a lifecycle. Canonical now requires two or more independent implementations. A term with one implementation is `proposed`, carries a `review_by` date and a promotion trigger, and stays there until a second independent implementation appears. A term with no implementation is `reserved`, also dated, and is removed by default at its review date rather than lingering. A term with no status at all is read as proposed, never as canonical, so silence cannot confer authority. Two further rules keep definitions honest: a definition states what the signal is without naming or depending on any one implementer, and a term cannot cite its own issuer as the ground for its status. The whole fifteen-term registry was re-sorted under the single rule, not only the terms that triggered it, so every status reflects the same test. The [rule](https://github.com/aeoess/agent-governance-vocabulary/commit/cd97065) lives in CONTRIBUTING, the [validator](https://github.com/aeoess/agent-governance-vocabulary/commit/9cdbac2) enforces status, the review dates, and definition purity, and a term that claims canonical with fewer than two independent issuers fails the check.
