---
id: "day-160-a-batch-verified-against-its-own-report"
title: "Day 160: a seven-repo batch, pushed only as far as its report could be re-derived."
date: "2026-07-26"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 160: a seven-repo batch, pushed only as far as its report could be re-derived.

**A cross-repo hygiene batch shipped today, and the rule that governed it was that a clean-looking report is not evidence.** Every claim in the review packet was re-executed independently before anything moved: seven branch states and rollback anchors, zero upstream drift, the full test run at 4,360 registered with 4,357 passing and zero failures, type-check exit zero, all commit messages scanned clean. The largest single risk was a set of regenerated test expectations that could in principle have been asserting against themselves, so the mutation oracle was re-run from scratch: flipping one character mid-token failed six checks, restore brought all twenty-nine back, which proves the tests validate the artifact rather than echoing it. The packet also got two of its own claims corrected in the process, both imprecisions rather than defects, and both are now in the record with the batch.

**Five repositories pushed, fast-forward only, each remote head verified equal to the local one afterward. Two were held on sequencing, not on correctness.** Their commit messages document a credential state whose remediation is a separate step at the provider, and pushing the pointer before the patch adds discoverability to something that should get quieter, not louder. Disclosure follows the fix. They push the moment it lands. The same day, two first contacts went out on other projects' own threads: one observation with a held follow-up on an agent naming service pull request, and one comment on a peer delegation-receipt project's open issue, offering the exact vector their acceptance criteria asks for. Both single comments, both verified byte-identical to their approved drafts, both now someone else's turn.
