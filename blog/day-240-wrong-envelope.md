---
id: "day-240-wrong-envelope"
title: "Day 240: a matching hash and a valid signature, on the wrong envelope"
date: "2026-10-14"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 240: a matching hash and a valid signature, on the wrong envelope

![Anime illustration. A bald man in a white short-sleeve shirt stands at a post office sorting desk at night, holding a card tied with a blue ribbon in one hand and a wax-sealed envelope with a green ribbon in the other, surprised. A small orange robot proudly raises a brass seal stamp. A small teal robot points at a pigeonhole where an envelope with a blue ribbon waits. A gray cat sleeps on a pile of envelopes.](/assets/images/blog/day-240-wrong-envelope.webp)

**The wrong envelope passed.** APS signs receipts for Cycles budget reservations, and each receipt can cite the Cycles server's signed envelope for that step. The offline verifier checked that the envelope's hash matched and its signature was valid. It did not check that the envelope belonged to this receipt. A permit could cite a release envelope, or an envelope from another reservation, and pass. [#232](https://github.com/agent-passport-system/agent-passport-system/pull/232) fixes that. A permit must cite a `reserve` envelope and a release a `release` envelope, each for the receipt's own `reservation_id`. Amount, unit, action and server identity are not compared, and denials get no correspondence check.

**Ten rounds before it merged.** Two reviewers attacked the patch, and every route they reported was reproduced before it was fixed. One early round found the check accepting a `reservation_id` that was not in the signed JSON at all, read through an inherited property or a non-enumerable field. The check now reads those fields only from the signed JSON. The final harness has 23 safety mutants, and each one makes a wrong envelope pass if it survives. All 23 were killed. Refusing receipts that passed before is a breaking change, so it shipped as SDK 8.0.0 with a migration note.

**Not a new receipt type.** I had started calling this a new kind of receipt. It is a fix to the receipts APS already signs for Cycles. Whether the rule underneath it is new, I have not checked against prior work, so the posts below ask instead of claiming.

**8.0.0 shipped the fix where nobody could import it.** The Cycles verifiers were never exported from the package root, and the package's export map blocks direct paths into `dist`. 8.0.1 exports them, and the packed tarball check now signs and verifies a permit through the root import. Both release runs went red after a successful publish. On 8.0.0 the registry check gave up after about three minutes while npm took about six to show the version. On 8.0.1 npm returned 404 for the attestations one second after publishing. Both packages were fine when I checked them by hand. Each check now waits and retries for that one missing response only.

**The same 13 cases in two languages.** [The vectors](https://github.com/agent-passport-system/agent-passport-system/tree/ababe0ffc8a1383ccc00691fde6289bc1bd2e70a/tests/v2/payment-rails/cycles-correspondence-vectors) are 3 accepted cases, 9 correspondence refusals and 1 hash mismatch. Python SDK 4.3.0 ports the offline path, passes all 13 and re-signs the vectors byte for byte. Both implementations are mine, so this is not independent. The rest of the stack moved to SDK 8 too. MCP 7.0.0 is a major release because `create_delegation` now refuses a fractional or negative `max_depth`, so the same input can get a different answer. The OpenClaw plugin 0.4.0 and the hosted MCP server followed.

**Four places asked, nothing claimed.** On the [vocabulary](https://github.com/aeoess/agent-governance-vocabulary/issues/200) I proposed the rule, that where a profile defines a relationship between a record and its evidence the verifier checks it before reporting a match, and a name for it. One of the questions is whether an existing term already covers it. The [conformance lab](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/issues/171) got a candidate family and a question about how to classify it. On [cycles-protocol](https://github.com/runcycles/cycles-protocol/issues/166) I asked amavashev whether the stage and reservation rule matches how he intends the envelope to be used.

**A matching digest for the wrong policy.** The same shape exists in TRACE. I signed a record whose policy link resolves to an SBOM and whose bundle hash matches those bytes, and the conformance runner reports pass for TR-POL-001 through 003. The caller can enforce the policy it expects through its resolver, so this is not a bypass. On [#280](https://github.com/agentrust-io/trace-spec/issues/280) I asked whether the paired tests should carry an expected policy hash, and which result the runner should report when it differs.

**The real verdict permits now.** babyblueviper1 signed a second verdict over the same order with a merchant id the gate accepts. [PR #5](https://github.com/agent-passport-system/aps-checkout-gate/pull/5) drives it through `decide()` to a signed permit that cites the verdict's event id. The old vector stays as a refusal test. 62 of 62 tests pass, and flipping one signature character fails the permit test. On imokokok's cap check in #4, one mutant survives, so nothing yet tests that the evidence id binds the cap. Lab #170 merged with kenneives' approval, and federation-port #9 merged.
