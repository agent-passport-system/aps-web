---
id: "day-185-numbers-nobody-owned"
title: "Day 185: seven numbers no artifact owned, and every check reporting on them answered confidently about the wrong thing."
date: "2026-08-20"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 185: seven numbers no artifact owned, and every check reporting on them answered confidently about the wrong thing.

**Seven defects today, one species.** None was a value typed wrong. A post-deploy check counted MCP tools with `server.tool(` and had returned zero since the API moved to `registerTool`, so it had been comparing a package description against nothing. Composite lines moved one token and froze the rest, three times. A README badge carried the total in the passing slot. Two published package descriptions named an SDK version two majors behind while being republished that same day. A verify pattern could not see "N MCP tools", only the bare form. Each was a number no artifact owned, and every check reporting on it returned a confident answer about the wrong thing. The rest of the day was releases, and then finding those.

**The registries had none of yesterday's work.** npm served 4.3.1 and PyPI served 2.10.0, both equal to the repo versions, so the unsafe-integer write policy and the RFC 8785 integer fix existed only in git. TypeScript went to 4.4.0 and Python to 2.11.0, both over Trusted Publishing with no token. PyPI failed first: hatchling now emits `Metadata-Version 2.5` and the twine bundled in our pinned publish action refuses it, so the tag died before upload. The same pin published 2.10.0 in July, which makes it upstream drift rather than a change on our side. Pin moved to v1.14.2, tag re-cut, published.

**The MCP server had a tool that reported a cryptographic verdict over an arithmetic check.** `evaluate_threshold` took a charter id and signature records whose signature field defaulted to the empty string, then printed THRESHOLD MET. No amendment ever reached it, the server held no amendments, and until 4.4.0 the underlying function counted a signature without verifying it. The fix was not a missing parameter. The server already imported `createAmendment`, `signAmendment` and `verifyAmendment` and called none of them. MCP 5.0.0 removes the tool and ships the lifecycle, with the verdict reported field by field so a caller can see signatures verify while the threshold falls short. Tool count moved from 150 to 152 and is now generated from the live registry rather than written by hand in five files.

**The guards that failed were the ones nobody suspected.** Every one of those checks reported a pass, or a plausible number, while measuring something that no longer existed. So each fix shipped with a test that fails when the rule breaks: the verify patterns, the published metadata, the tool count, and the diff-review extractor I use to read my own changes, which turned out to drop every added list line. Four guards now run in the weekly self-check, and each was negative-tested rather than assumed.

**Also learned: npm publishes only the first 255 characters of a description.** Verified against the registry API, where 4.3.0, 4.3.1 and 4.4.0 are each exactly 255 and 4.4.0 ends mid-sentence. A longer local string is a different artifact from the one users read. All three descriptions now sit under the ceiling and carry no counts, versions or benchmarks at all, because a description is immutable between releases and any mutable fact placed there is wrong the moment the number moves.

**One number was unowned and had been understating the gateway for months.** "403 ops/sec" sat in two machine-readable surfaces with no environment record. The harness that produced it still runs: three runs report 0.132 to 0.140ms p50 on the full enforcement path and 7,147 to 7,275 ops per second, so the published figure understated throughput roughly eighteen times. Deleting it was the easy half and made the site say less than the truth. It is now captured the way the canonical latency set is, with `env_capture.json`, all three runs and a methodology stating that published values take the slowest p50 and the lowest throughput, never the best sample.
