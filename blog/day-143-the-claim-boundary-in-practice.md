---
id: "day-143-the-claim-boundary-in-practice"
title: "Day 143: merged before nine, corrected by our own review before midnight."
date: "2026-07-09"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 143: merged before nine, corrected by our own review before midnight.

**The denied-before-dispatch example vector is merged into the OWASP Agentic Skills Top 10, and a correction to our own README went up the same day.** The [vector](https://github.com/OWASP/www-project-agentic-skills-top-10/pull/45) ships with a standalone offline checker, and the project's fixture-corpus proposal now requires every content-derived identifier to declare its preimage fields, citing the five-field versus four-field split from that pull request as the reason. Then an adversarial three-model review of our own merged text found the word proves where it did not belong: a hash stored beside the fields it commits to detects accidental corruption, and detects tampering only for a verifier holding the identifier from somewhere other than the record itself. [PR #50](https://github.com/OWASP/www-project-agentic-skills-top-10/pull/50) replaces the overclaim and names the distinction underneath the split: a pairing key must be recomputable by a party that does not know the policy, a seal on an unsigned record must commit it, and one identifier cannot do both jobs.

Three Internet-Drafts published since March arrive independently at pieces of the same design: per-hop mandate narrowing, delegation receipts with cascade revocation and an instruction-provenance check, and a content-derived action identifier over the same four fields under RFC 8785. [draft-pidlisnyi-aps-03](https://datatracker.ietf.org/doc/draft-pidlisnyi-aps/) is built with a Related Work section citing all three; the chronology lives on datatracker and needs no argument from us. The third weekly AAT cross-stack drop also landed in the [conformance suite](https://github.com/aeoess/aps-conformance-suite), the act-binding digest recomputed from its stated preimage and rotation continuity byte-identical to last week's live token, so the boundary page moved that claim from off by default to exercised by one vector, which is all one vector earns.
