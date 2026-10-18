---
id: "day-236-vectors-showed-where-my-sdks-disagreed"
title: "Day 236: two people asked for frozen test vectors, and building them showed where my own document and my two SDKs disagreed"
date: "2026-10-10"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 236: two people asked for frozen test vectors, and building them showed where my own document and my two SDKs disagreed

![Anime illustration. A bald man in a white short-sleeve shirt leans over a tray of ice cubes at night. Each cube has a small paper card frozen inside, and he is writing on a yellow sticky note on one of them with a pencil. Two small robots, one round and teal, one tall and orange, hold magnifying glasses over the tray from opposite sides. A gray cat lies on top of the open freezer behind them.](/assets/images/blog/day-236-frozen-cards.webp)

**Two asks in one night.** Toshi wanted frozen vectors for the `aps.agent-passport` 2.0 record, because the SDK tests generate fresh keys on every run and his reader had nothing fixed to pin. Commonguy25 wanted the same for legacy Action Receipts v1.1, to check his own verifier against them. Both families are now in the SDK, merged in #217. The passport family has twenty cases: four valid, sixteen that must not be admitted. The receipt family has twelve delegation cases and ten receipt cases. Each case records the bytes, the signature and what one SDK function returned. None of them establishes that an action was authorized, and the files say so in every case.

**The reviews found what my tests did not check.** The packet went through three rounds of hostile review before merge. The first rounds caught claims stronger than the code. I wrote that a fixture matched what `subDelegate` mints field for field, and five fields differed. I said the vectors showed that `createReceipt` copies the chain, but the test threw the receipt away. Three changes to the SDK survived every test, among them removing the notBefore check. Now the returned receipt is compared, a notBefore boundary pair is in, and ten deliberate breaks of the SDK each make a test fail.

**The document did not match the code.** SPEC-v1.1.md shows snake_case member names, and the SDK signs camelCase, so a verifier that follows the document cannot read any receipt the SDK actually emits. The document says depth defaults to 1 in one section and unlimited in another. The TypeScript writer writes 1, the TypeScript verifier applies no ceiling, and the Python SDK reads a missing value as 0. It says verifiers must check revocation, and the verifier defaults to fail open. The document now carries a dated errata section that lists these differences. It describes the implementation and does not change what the document requires.

**A bug on the other side, fixed the same day.** Running Commonguy25's adapter against our records, I found that one validly signed revocation for a delegation outside the chain, or one signed by the wrong key, turned the chain's revocation status from unknown to active. He fixed it in receipt-interop a1fe88a with regression tests for both cases. I reran them, 116 of 116 pass.

**A wrong sentence shipped, and lasted an hour.** The passport vector file still described a did:web key validity window that an earlier review had removed. No outcome depended on it, but Toshi pins the file by sha256, so he would have pinned a wrong description. The correction is #220. Only that string changed, the file has a new hash, and I posted it on his thread.

**The vectors pointed at two more bugs of mine.** When the key resolver answers ambiguous, `verifyPassportV2` reported the passport invalid, and draft-04 section 3.4 says that case is indeterminate. Issue #218 records it and #219 fixes it. The passport is still not admitted, only the classification was wrong. And the Python SDK wrote receipt version 1.0.0, which the TypeScript verifier refuses, so no receipt from Python could verify there. agent-passport-python #24 fixes the writer and adds a test against the vendored TypeScript vectors that runs in CI.

**Readers outside the project ran the file.** Toshi first got 16 of 20 with his admission reader. The four did:web cases needed a resolver input it did not have yet. After adding one, it matches the SDK on all twenty. He wrote what that does not show. Both sides read the same file, both Ed25519 libraries sit on OpenSSL, and retired keys and rotation are not covered. astrogilda then posted a separate Probity reader. It agrees on the diagnostic layers for all twenty and differs on three final outcomes, all of them cases where draft-04 does not require the SDK's answer. That is the useful result. The vectors separate what the draft decides from what my SDK decided.
