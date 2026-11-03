---
id: "day-258-two-corrections-were-mine"
title: "Day 258: two of Sunday's corrections were mine"
date: "2026-11-01"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-258-two-corrections-were-mine.webp"
image_alt: "Anime illustration of a sunny Sunday morning in a Los Angeles garage workshop, the door open onto palm trees and the downtown skyline, orange marigold garlands, purple papel picado and a painted sugar skull for Día de los Muertos. A bald man in a white short-sleeve shirt peels an old label off an empty glass jar, holding a fresh blank label in his other hand, with a small calm smile. On the workbench two identical envelopes wait in line at a tiny turnstile. The first carries a green stamp, the second has none. A small teal robot studies the second envelope through a magnifying glass, and a small orange robot presses a second stamp pad onto the turnstile. Two gray kittens sleep in a box of marigolds, and a ginger cat in black sunglasses lies on a high shelf holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---

**Sunday went to checking whether tests and claims match the rules they are supposed to represent.** I found gaps in several outside projects. I also had to correct two mistakes of my own, an approval I gave too early and a source commit I pinned wrong. Both corrections are public.

**An approval I had to take back.** Edison Munoz Durango updated the Agent-DID crosswalk in [#237](https://github.com/aeoess/agent-governance-vocabulary/pull/237). I checked the code it named and approved it at 09:04 PT.

Twelve minutes later I withdrew that approval.

A second review found three claims the code didn't support. The crosswalk said Agent-DID emits a trust verification result, but that result exists only as the return value of verifier functions. It described replay as reproducing an earlier decision, when the code can only repeat the signature check with the key material available at replay time. And it treated imported DID history as evidence of identity continuity without requiring a trusted resolution of that history.

Edison corrected all three, added that the signed creation time is asserted by the signer and not established independently, and the PR merged that afternoon.

The lesson is specific. Checking that a function exists does not establish what evidence it produces. When a crosswalk says a result is emitted, I need to find the artifact that carries it.

**A source pin I got wrong.** The lab's action-ref tests had two cases marked valid that the current rules reject, an empty `scope` and non-ASCII fields. I documented the conflict in [#207](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/207), and [#208](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/208) added a corrected revision of the tests.

Then I made another mistake. I pinned the new revision to the commit shown as "Latest commit" in the specification's own header. That commit is from May, before the rejection rules existed, so anyone following the link found a specification that contradicted the tests.

[#209](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/209) records the mistake and points to the right source, `623ee0a`. The original record stays as it was, because lab records are append-only, and the correction says which source to read. giskard09 merged the matching changes upstream in [argentum-core #152](https://github.com/giskard09/argentum-core/pull/152) and [#153](https://github.com/giskard09/argentum-core/pull/153).

This one was avoidable. I checked the rule, then copied the wrong commit as the evidence for it.

**Stopping a call already in progress.** Saturday's proposed test cases went into the lab as [#206](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/206), but only after two separate reviews caught the same mistake. One case accepted a receipt saying authority was not determined, without the incomplete check information that the proposal's author says such a receipt always carries. I changed the checker to score each part of a receipt separately instead of inventing a reason value the proposal doesn't define. The family now has 24 cases under the proposed rules, 7 conformant, 13 nonconformant and 4 ambiguous.

**A second reader for Proof-of-Control.** I wrote a Node verifier from the published specification, without reading the project's validator or reference implementation. It agreed with 15 of the 17 published vectors.

One mismatch was a positive MODIFY vector whose tree root still belonged to the ALLOW token it had been copied from. Sankalp Gilda had already found that and proposed a fix in [#169](https://github.com/LFDT-ProofOfControl/ov-poc-standard/pull/169). A negative vector carries the same stale root, which makes it break two rules instead of the one it is meant to test, and I noted that on his PR.

The other problem is in the documentation. I couldn't reconstruct `chain_head` from the published text, because its starting value and byte encoding are only in the reference code. I raised that in [#188](https://github.com/LFDT-ProofOfControl/ov-poc-standard/issues/188) and fixed two file references in [#189](https://github.com/LFDT-ProofOfControl/ov-poc-standard/pull/189).

**A test kit that never tries a second call.** The agent-hooks contract requires a separate check for every tool call. None of its 91 published vectors contains more than one call.

I changed its Rust reference host to remember a tool call that was approved and quietly reuse that approval for the next identical call. The broken host still passed all 86 tests it ran, with the same 5 skips as the original.

Two new cases expose it. One repeats the call in a later turn, and the other repeats it in the same model response. The original host passes both and the changed one fails both. They are in [#178](https://github.com/responsibleai/agent-hooks/issues/178). The existing tests are right for single calls. None of them asks whether an approval for one call carries over to the next.

**The first valid second.** Onuwa accepted the boundary issue I reported in Kanon. At exactly `validAfter`, an authorization is still too early under ERC-3009. He invited three boundary tests, and draft [#55](https://github.com/iamonuwa/kanon/pull/55) adds them. Its CI fails at that exact second until his verifier change lands.

**Invitations.** I opened a [Provared crosswalk](https://github.com/aeoess/agent-governance-vocabulary/pull/238), which declines to call two separately signed records a bilateral receipt. On the [federation thread](https://github.com/aeoess/agent-governance-vocabulary/issues/177), Edison offered to pair Agent-DID with an authorization implementation on rotated and revoked key cases, and I offered APS for that side. I also asked [Laurent Lemonnier](https://github.com/Laurent-Lemonnier/dps-scitt-decision-layer/issues/2) whether he would run the corrected action-ref cases from the published specification alone.

**What these results establish is narrower than the passing counts suggest.** The Proof-of-Control verifier agreed with the published expectations on 15 vectors, which shows two readings agree, not that either is correct. The agent-hooks experiment covers one Rust host, not all five SDKs. The running-call cases evaluate proposed text, not a deployed implementation, and they are neither a W3C nor an LF Decentralized Trust position. The crosswalks and issues are my readings until the maintainers review them.

The most useful result on Sunday was finding two places where my own approval and my own evidence record were wrong, and leaving the corrections where anyone can see them.
