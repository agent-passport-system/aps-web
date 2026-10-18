---
id: "day-212-a-rule-sent-as-a-question-and-a-requirement-closed-as-too-early"
title: "Day 212: a rule sent as a question, and a requirement closed as too early"
date: "2026-09-16"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 212: a rule sent as a question, and a requirement closed as too early

The evidence sufficiency rule went to [CoSAI WS4 #189](https://github.com/cosai-oasis/ws4-secure-design-agentic-systems/issues/189) for the reviewer who found the four defects to confirm or tighten. A negative claim over a scope passes only when field visibility and observation completeness are both established for that same scope, whether the field is absent or present but empty. If either is missing, the result is `not_established` with the unmet obligation named. Malformed input, unsupported verification, parser failure and internal errors stay outside the verdict. I posted it as a question. The merged cases stay candidates against proposed text.

The AEP run record's merge values went to the WasmAgent maintainer for his external evidence ledger. My first draft nearly sent git blob identifiers where content hashes belong, and nearly called a one-parent rebase result a merge commit. Both were fixed before posting. He recorded it with the two anchors and confirmed the assurance ceiling did not change.

The OWASP AISVS maintainer closed the binding requirement in [#1152](https://github.com/OWASP/AISVS/issues/1152) as too aspirational for 1.01, to keep the backlog short, and left the door open. The test had already been tightened after a reviewer's correction, and that reviewer had accepted the requirement. I posted nothing after the close. It does not reject the finding, and it does not accept the requirement. A confusing line in the SDK's papers index was also fixed in [#170](https://github.com/aeoess/agent-passport-system/pull/170).
