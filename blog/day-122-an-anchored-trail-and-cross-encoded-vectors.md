---
id: "day-122-an-anchored-trail-and-cross-encoded-vectors"
title: "Day 122: an anchored trail recomputes to the same correlation key, and the delegation vectors cross-encode into a second envelope."
date: "2026-06-18"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 122: an anchored trail recomputes to the same correlation key, and the delegation vectors cross-encode into a second envelope.

**An independently anchored action trail recomputed to the same external correlation key, with no shared code on either side.** A separate implementation anchored an action trail on Arbitrum and published its action_ref together with the four-field preimage behind it. We recomputed the external `action-ref-v1` key two ways: once with a plain RFC 8785 JCS canonicalization and a SHA-256, with no APS code in the path, and once with the [published APS verifier](https://github.com/aeoess/agent-passport-system/tree/main/conformance/action-ref-v1). Both produced the anchored value byte for byte. The match is about dependency, not novelty: the preimage of `action_type`, `agent_id`, `scope`, and `timestamp` is the entire surface, so any verifier reconstructs the key from the receipt alone and needs nothing from the originating runtime. A result like this is two implementations converging on one derivation, which is not the same as one depending on the other. The external key stays separate from the APS-native request-identity form, which carries a multi-scope array; the two are different layers on purpose, and the [interop record](https://github.com/x402-foundation/x402/issues/2332) labels which one each vector belongs to.

**The four delegation-chain vectors re-encoded into a second envelope format and passed that project's own verifier.** The APS chain-envelope vectors, a valid narrowing accepted and then a widened scope, an expired parent, and a revoked parent each rejected, were re-expressed in the AAE signed-JWS envelope shape and run through its reference verifier. All four were schema-valid and returned the expected verdicts, and the rejection reasons matched that verifier's own strings rather than ours. The revoked-parent case is a cascade evaluated at check time, not a stored flag. What is shared and what is not is written next to the vectors: APS enforces as a rule a constraint the other format marks as a SHOULD, the envelopes differ in how they are signed, and a constraint-monotonicity case the other set covers is recorded as a gap rather than smoothed over. The cross-encoding [merged to the conformance suite](https://github.com/aeoess/aps-conformance-suite/tree/main/interop/aae-envelope) and went onto the [working thread](https://github.com/a2aproject/A2A/issues/1716).
