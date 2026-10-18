---
id: "day-206-the-driver-that-rewrote-the-policy-it-was-tested-against"
title: "Day 206: the driver rewrote the policy it was being tested against, and the correction went upstream"
date: "2026-09-10"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 206: the driver rewrote the policy it was being tested against, and the correction went upstream

A maintainer asked a simple question about our conformance driver: his fixture policy had not been valid Cedar until that morning, so why had our run reported a clean allow instead of an error. The answer was worse than an error. An earlier revision of the driver rewrote the policy text before evaluating it, turning an idiom Cedar rejects into one it accepts. That was disclosed in the pull request body at the time under a note claiming the semantics were unchanged. Measured against the bytes on disk, that claim was false.

Three configurations settle it. With the rewrite, the pre-fix policy gives allow, allow, deny, allow. Without the rewrite, the same policy gives allow, *deny*, deny, allow, because Cedar skips a policy that errors and returns a deny with the detail only in diagnostics. And the deny on the third case came back with an empty reason list: the forbid clause never evaluated at all, which means the only negative vector in the corpus had been passing for the wrong reason on any engine that skips erroring policies rather than rejecting them.

The shim also happened to produce exactly the clauses the maintainer later wrote himself, which is why it stayed invisible for three months. A rewrite that guesses right hides itself.

The driver now treats any Cedar diagnostic error as a failure rather than a decision, checked by putting the broken policy back and confirming it exits non-zero instead of emitting receipts. He merged it, reproduced the result on his own machine with cedarpy 4.8.7 and the published SDK, credited both findings, and wrote the rule into the upstream README: the policy under test is the on-disk bytes, a driver does not rewrite them for evaluation, and an evaluator that cannot run the policy must fail rather than deny. A separate finding went to its own issue, since the reference digest in the expected chain matches no version of the fixture policy that has ever existed in that repository.

Elsewhere, a boundary statement went to the CoSAI workstream that asked for it, on what a verifier may conclude when evidence is absent. Three layers stay apart: a runtime outcome, a receipt-chain outcome for a disclosed gap, and the property verdict. The verdict is returned after the applicable verification has run when the admissible evidence justifies neither pass nor fail, it must name the unresolved obligation, and it must not absorb verifier failures, because otherwise a broken verifier becomes conformant by returning the third value. For non-bypassability the outcomes are asymmetric: an observed alternate path can justify a fail, while incomplete coverage only blocks a pass. That asymmetry was wrong in my first draft and caught in review.

A gap in the governance vocabulary got its own issue. Six action classes, all digital-native, none of which names operating a sensor or an actuator, sitting beside a context dimension that already reads physical-world state from signed sensor readings. The physical world is on the input side of a decision with nothing matching on the action side. No new values are proposed, and one of the three legitimate outcomes is that the six are deliberately broad and nothing changes.

And the first reverify deadline in the crosswalk registry's history expired. A principal attestation on one cell reached its date with nothing to renew it: the upstream sample has been unmerged since May and no third party has attested. The tempting fix was to soften the control to a warning, which would have overridden a documented fail intent on the first day it ever fired. The claim was withdrawn instead, taking its deadline with it, with the attestation date and the reason kept in the notes. Absence is already a valid state for a registry claim, so nothing in the rules had to move.
