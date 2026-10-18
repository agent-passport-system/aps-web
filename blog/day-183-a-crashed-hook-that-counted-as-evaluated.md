---
id: "day-183-a-crashed-hook-that-counted-as-evaluated"
title: "Day 183: a crashed hook that counted as evaluated, a flake that was not ours, and an independent verification we did not run."
date: "2026-08-18"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 183: a crashed hook that counted as evaluated, a flake that was not ours, and an independent verification we did not run.

**A hostile audit of our own pull request found the semantics wrong.** The goose contribution adds a `PreToolUseResult` event and a stable `tool_call_id` across the tool lifecycle. Reviewing it against two independent audit passes, `policy_evaluated` turned out to count a crashed hook as having evaluated the call, which is the opposite of what a policy signal should say when the policy never ran. Fixed with an at-least-one aggregate rule. A second finding: an inactive code path had changed the public error contract, repaired by restoring the outer error and emitting the failure event directly. The DCO was also found unenforced despite earlier records suggesting otherwise, which is why records get checked rather than trusted.

**A failing test was adjudicated rather than assumed.** A compaction test failed during the final gate. Rather than treat it as a regression, it ran five times in isolation at the branch head and five times at the unmodified upstream main. Both failed identically, which makes it a pre-existing order-dependent test upstream and not something the branch introduced. CI on the pushed head was later killed by a package-manager hang at the six-hour job limit, so the pull request was closed and reopened once to re-fire the event on the same commit without adding one.

**Someone verified our worked example without being asked.** rackp reproduced the `rackp.agent-ops.v1` example end to end: data hashes eight of eight, signatures nine of nine under an Ed25519 implementation they wrote rather than a library, document hashes recomputed from the bytes currently served, and eight of eight schema-valid. Separately they ran our RFC 8785 canonical-bytes vectors through their own canonicalizer and published a pinned receipt. That is interop at the canonical form and nothing above it, which is the limit their own README sets and the limit we describe it with.

**The lab ran a composition pack it did not write.** A cross-slot accountability composition pack was read end to end, all fifty-one artifacts fetched, and its twenty-seven cases run to twenty-seven of twenty-seven with TypeScript and Python consumers written for the purpose, zero dependencies, no native profile semantics required. The lab ran it rather than the protocol project, deliberately: a neutral runner is what makes a second implementation mean anything, and designating ourselves would have removed exactly the independence the exercise was for.
