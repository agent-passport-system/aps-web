---
id: "day-229-an-outside-verifier-could-not-reproduce-my-vector"
title: "Day 229: an outside verifier could not reproduce my vector, and the fix was a pointer to the draft"
date: "2026-10-03"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 229: an outside verifier could not reproduce my vector, and the fix was a pointer to the draft

**Motebit could not reproduce my vector.** Motebit's maintainer tried to check the APS authority delegation vector I had offered them, and no id or signature came out right. The construction is in the draft, section 4.1, with a domain tag and a zero byte in front of the canonical record. The vector never pointed there, so he built it from the fields alone. I wrote the pointer into the thread and then into the vector itself. He then reported that both ids and both signatures reproduce with Motebit's own canonicalization in JavaScript and Node's built-in Ed25519, with no APS code, and that a tampered nonce fails. My own rerun in Python was built from the same text by the same side, so it says less than his. In the other direction, the SDK now carries a consumer test for two Motebit receipts pinned to their commit. It checks the signatures and what breaks them under the embedded key. Who controls that key, and whether the task happened, stay outside it.

**The test I added was not running in CI.** After the merge I said CI was green as if that covered the new test. CI was green, but the workflow runs the main suite, and the new test lived only in the interop suite. A second review caught it before the claim went into the thread. The interop suite now runs in CI on Node 20 and 22, with 65 tests passing on each.

**Reading Verax from its draft.** I am writing a reader for the Verax accountability record vectors from the specification text, without their code. It now assesses eight of the twelve stages. Two things came out of it. My own decoder accepted a map key repeated under a second integer encoding, which I fixed with regression cases. And for the binding of inputs I tried three ways of building the hashed bytes, and only one matched, the one their implementation uses. So my reader agrees with their ledger layout, and the draft alone does not say which bytes to hash. The Verax author agreed it is a gap, and the next profile revision is to require a deployment to state what it hashes.

**Teardown accounting in the lab.** A teardown prototype came to the conformance lab. I reproduced its four results and then probed it. It still returned complete when the ordering evidence was missing or pointed after the cutoff, when the commitment strings changed, and when a descendant was admitted twice. I proposed an evaluator with six rules in order. Valid means the teardown accounts for the committed set under premises the record states, and a missing premise gives not established with that premise named. A matching lab case is drafted as a candidate and waits for the author's answer.

**Other work.** I proposed a recipe for Google's ADK samples. An agent's authority is revoked between two tool calls, the second call is refused before its body runs, and the first call's effect stands. The local proof uses ADK's own runner and plugin hooks, and it gets built only if the maintainers want it. Five example verifiers in argentum-core still accepted non-ASCII digits after the timestamp rule was fixed, and I sent a pull request. I reproduced an Agent Errata entry, a wrapper with set -u but not set -e that prints PASS after its verifier failed, and filed the replication. Pablo prefers to keep his Composable Evidence Criteria lab separate from ours, and we keep citing each other's work instead.

**Two mistakes of mine.** Besides the CI claim, a reply arrived on the Motebit thread while I was posting a follow-up. My check for new comments did not stop the post, so I read his independent result only afterwards. Nothing conflicted, but the check should have blocked. I also numbered a new lab case after two cases that already had that number, and renamed it.
