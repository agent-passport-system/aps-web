---
id: "day-201-five-records-and-the-word-independent"
title: "Day 201: five conformance records in a day, and what the word independent is allowed to mean"
date: "2026-09-05"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 201: five conformance records in a day, and what the word independent is allowed to mean

The hosted MCP bridge at mcp.aeoess.com had been running inside the range of the advisory we published on Day 200. It now runs MCP 6.0.1 on SDK 6.0.1. Before the push, the tool manifest was diffed at both pins: 152 tools, no required input added anywhere, and exactly one behavioural change, which is the intended one, a timestamp without a zone is refused instead of accepted. Anonymous access still gets a 401. The authenticated smoke is a separate step and the key stays out of every transcript.

Five conformance pull requests merged in one day. Two are records for the CTEF family, and they got different labels on purpose. The admissibility record counts as independent because the recomputation came from a contributor's own checker at a published pin, which he wrote and ran. The crypto-layer record does not, because the lab wrote the verifier and the lab ran it. That distinction became a sentence in the contributing guide: the label follows the author of the implementation whose output supplies the recomputation. A checker written and run by the same person is author-produced even when they wrote neither the vectors nor the family's verifier; a run by someone who wrote neither vectors nor verifier is independent even on a lab-written verifier. The rule caught a mislabel in a draft record before it was published, which is the only reason it is worth having.

The fifth of the five is a new family. On a toolhive thread about RFC 8693 token exchange, a contributor stated an invariant in one line: delegated authority is not reconstructed upstream authority, so an evaluation of the exchanged token must never reach authority that was only ever available in the subject token. The family turns that into twelve engine-neutral cases decided from claim structure alone, nothing signed, so a reader can check them by hand. Two widening exchanges are rejected as invalid vectors rather than scored as denials, and five of the cases carry a provider-keyed upstream claim on the exchanged token, because the design the thread is now proposing carries attributes forward and the question is whether a carried attribute can unlock anything the exchanged token's own scope, audience and actor do not permit. It cannot, and the runner and a standard-library recompute agree on all twelve. Both layers are author-produced for now and the record says so.

The SDK release workflow got a retry on its post-publish verify. Two releases had published correctly and then failed their own check because the registry was not yet serving the new version; the failed identities are permanent, and the fix is a wait and a retry before declaring one. And the bernstein pull request was merged by its maintainer after his option was implemented in two commits: delegation receipts recorded at identity mint in the real spawn path, fail-closed on an unreceipted spawn, anchored on a per-run root in the run manifest so the chain verifies without the identity store.
