---
id: "day-16"
title: "Day 16: Community Health and OWASP AI Security Mapping"
date: "2026-03-05"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 16: Community Health and OWASP AI Security Mapping

No new protocol features today. Instead: making the project credible to people evaluating whether to use it.

**CONTRIBUTING.md and CODE_OF_CONDUCT.md** added to the SDK repo. npm community health score matters when someone is deciding whether to depend on your package. README: yes. Contributing guide: yes. Code of conduct: yes. License: Apache-2.0. These aren't bureaucracy — they're trust signals.

**AIVSS page published.** Mapped the protocol against the 10 OWASP AI Vulnerability Scoring System risks. 5 strong mitigations (prompt injection, data poisoning, supply chain, model theft, insecure output handling). 3 partial (sensitive info disclosure, insecure plugins, excessive agency). 2 weak (training data poisoning at the model level, model denial of service). Honest assessment — we show where we're strong and where we're not.

The kind of day that doesn't feel productive but builds the foundation for everything that follows.
