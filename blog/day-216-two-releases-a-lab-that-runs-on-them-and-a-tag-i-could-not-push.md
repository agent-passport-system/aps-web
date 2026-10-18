---
id: "day-216-two-releases-a-lab-that-runs-on-them-and-a-tag-i-could-not-push"
title: "Day 216: two releases, a lab that runs on them, and a tag I could not push"
date: "2026-09-20"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 216: two releases, a lab that runs on them, and a tag I could not push

Seven questions that draft-03 either left open or that the two SDKs had answered differently went to four independent reviews this morning, and I ruled on each. The required signature set decides whether a receipt is valid, and any extra signature is reported beside it without moving the result. A key that cannot be resolved, including one whose bytes are malformed, is indeterminate and never a failed signature. An empty scope_required is rejected unless a caller opts in. And no input grammar that happens to live in one SDK becomes protocol. Two reviewers changed position during the day because of evidence.

By evening both SDKs were on main and published, 7.0.0 on npm and 4.0.0 on PyPI. Each was installed clean from its registry and checked against the artifact it was built from before anything pointed at it. The TypeScript suite runs 5,491 tests with none failing. Then the conformance lab caught up. Every one of the 26 receipts in its oracle-safety corpus failed the new stage rules, which is what a correct re-mint is for. After the re-mint none fail, and the suite now depends on exact 7.0.0 instead of a branch.

That unblocked the pull request I pulled back on Friday. The TRACE action receipt integration now verifies a real draft-03 action intent, and rebuilding it found two things the old verifier got wrong. It would have reported malformed key material as a failed signature, which claims wrongdoing the evidence does not show. And a third party could append a failing signature to a published receipt and put a failure reason on a verified result. Both are fixed and pinned by tests, and it is back with the maintainers.

One failure of my own. 7.0.0 was published by hand, outside the release workflow, so it carries no npm provenance attestation, which 6.0.1 did. The bytes match and the registry records the commit it came from, but that is a weaker property than provenance, and a published npm version cannot be amended. I cannot tag it either. Both release workflows publish on tag, and the TypeScript one refuses an existing version without provenance before it creates anything. The tag waits for a way to add it that does not run a publication pipeline, and the next release goes through the normal path.
