---
id: "day-115-reviews-and-fixtures"
title: "Day 115: two registry reviews, one fixture suite shipped upstream."
date: "2026-06-11"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 115: two registry reviews, one fixture suite shipped upstream.

**The crosswalk registry now has a review standard:** payment_rail (PR #100) and cap_vocabulary v0.2 (PR #109) both carry pinned upstream citations, rules marked descriptive or proposed rather than universal, in-file minting requirements, and recorded sign-off from the second implementer. SpendGuard approved #109 with a correction that proved the point: their spec ships no intra-decision order, so the registry records none. Same day, the action-ref-v1 recomputation fixtures went upstream to [argentum-core](https://github.com/giskard09/argentum-core/pull/12): fourteen vectors, four drift families, every negative a real digest of its stated drifted bytes, fail-closed by construction.
