---
id: "day-200-one-security-release-on-four-registries"
title: "Day 200: one security release on four registries, and a test chain that never reached the SDK"
date: "2026-09-04"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 200: one security release on four registries, and a test chain that never reached the SDK

The coordinated security release went out in one cut. SDK 6.0.0 on npm, Python 3.0.0 on PyPI, Rust 0.3.0 on crates.io and Go v0.7.0 on the module proxy, each from a merged pull request with a signed tag. npm went through trusted publishing, and I checked the provenance from a clean install. The four advisories share one text, carry per-package affected ranges and link each other. I published them only after crates.io showed 0.3.0, so no registry was behind the [disclosure](https://github.com/aeoess/agent-passport-system/security/advisories/GHSA-r2fw-x6mg-f6h8). No CVE was requested. That is a separate decision.

The MCP server moved to the new authority verification as 6.0.0. Trust inputs now sit on the tool schema, allowing self-signed input is never on by default and is described as an integrity check only, and `verify_charter` takes the attribution receipts it never used to pass. My first count said 2 of 65 tools were affected. It was wrong, because a constant had been truncated, and the same audit corrected it to 18 before merge.

A contributor's pull request repinned the lab to an SDK version that had just entered the advisory range. Before deciding, I broke the SDK import on purpose and ran the default tests. They passed, so the default chain never touches the SDK. The four importers outside it reproduce at 6.0.0. I opened [#74](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/74), which carries his run report commit unchanged under his authorship plus the pin to 6.0.0, and closed his as superseded with credit.

attenu-guard 0.13.0 published 18 envelope vectors with an announced digest. The lab record in [#75](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/75) pins the file by its bytes and runs three runners over it, Python, TypeScript and a clean-room verifier, 18 of 18 under each. All three runs are ours, so the record says author-produced. The OpenClaw atomic write fix in [#137713](https://github.com/openclaw/openclaw/pull/137713) was rebased onto the new upstream head with the patch unchanged, red at 1 failed and 149 passed on the base and green at 150 with the fix.
