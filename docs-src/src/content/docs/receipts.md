---
title: "Receipts: what they prove, and what they do not"
description: What a signed APS receipt proves, what it does not prove, and the cases a verifier must reject.
---

Every action produces a signed receipt, and receipts are graph-composable: each claim links to the authority, policy, action, observation, or evidence it depends on, so a verifier can walk from any receipt back to its supporting facts and stop at the boundary it cares about.

What a standard enforcement receipt proves: the gateway observed the agent issue this action under the cited delegation chain, and the signed body has not changed since signing. That is a real, checkable claim.

Verified on a receipt means a verifier ran: fields such as `traceBeneficiary().verified` perform the Ed25519 check rather than restating intent.

:::caution[Read this before you build on receipts]
A receipt states its own evidentiary weight, and you must honor it. A `self_attested` receipt, where the agent signed without independent attestation, carries less weight than a `gateway_observed` or `runtime_attested` one. The `capture_mode` and `self_attested` fields are part of the claim, not metadata. A verifier must reject self-attested evidence presented as observed evidence. A receipt proves authority and integrity of the recorded action. It does not prove the action was wise, that logging coverage was complete, or that the world matched the claim.
:::

One boundary the broader ecosystem is still working through: the MCP Enterprise-Managed Authorization extension's open issue #13 records that a resource server cannot currently distinguish the human user from an agent acting on their behalf, confirmed by the draft's maintainer as of id-jag-04. APS specifies and tests a model for carrying that principal versus agent distinction as a verifiable receipt.

## Verify a receipt in the browser

[Verify a bundle in the browser](https://agent-passport.org/verify.html): drop a receipt or evidence bundle, get the per-axis claim-state report. Verification runs in the page, nothing is uploaded.

## What each receipt type proves

Every APS receipt is a signed declaration about what the system observed. It is not a causal proof of agent cognition, and it is not a proof that an off-protocol side effect actually happened. Each receipt type carries an explicit `scope_of_claim` with `asserts` and `does_not_assert` fields, so the boundary travels with the receipt.

**ActionReceipt** (`aps:action:v1`)
- Proves: the gateway observed the agent issue this action under the cited delegation chain, and the signed body has not changed since signing.
- Does not prove: that the side effect completed, that the agent understood the consequences, or that the business outcome was correct.

**AuthorityBoundaryReceipt** (`aps:authority_boundary:v1`)
- Proves: an authority check ran and returned this verdict against this scope at this time.
- Does not prove: that the scope itself was correctly configured, or that no other path around the boundary exists.

**CustodyReceipt** (`aps:custody:v1`)
- Proves: custody of the named artifact passed from one holder to another, signed by the releasing party.
- Does not prove: that the artifact contents are correct, or that the receiving party will handle it well.

**ContestabilityReceipt** (`aps:contestability:v1`)
- Proves: a contest was opened or resolved against a prior receipt, with the cited grounds.
- Does not prove: that the contest is meritorious, only that it was raised and recorded.

**APSBundle** (`aps:bundle:v1`)
- Proves: the bundled receipts were collected together and each member verifies on its own.
- Does not prove: anything the member receipts do not already prove. A bundle is an envelope, not a new claim.

**PaymentReceipt** (`aps:payment_receipt:v1`)
- Proves: a payment instruction was authorized on the named rail for this amount, currency, and recipient, under the cited delegation.
- Does not prove: that the goods or services were delivered, or that the recipient address was the intended one beyond what the matched intent declared.

## What a verifier must reject

A valid signature is not a valid claim. The cases below are receipts that are cryptographically sound yet must still be refused, because they are being used outside the envelope they were issued for.

- **Valid receipt, wrong claim.** A sound `aps:action:v1` receipt presented as proof of payment. The signature checks out. The receipt simply does not make that claim. Reject (`WRONG_CLAIM`).
- **Expired delegation.** A receipt issued after its delegation chain expired. The body verifies. The authority behind it had already lapsed. Reject (`DELEGATION_EXPIRED`).
- **Stale revocation.** A receipt whose delegation root was revoked. A verifier that does not consult current revocation state would wrongly accept it. Reject (`DELEGATION_REVOKED`).
- **Unverified external evidence.** A self-attested oracle read presented as gateway-observed evidence. `self_attested` evidence must not be promoted to observed evidence. Reject (`WRONG_CLAIM`).
- **Replayed receipt.** A previously accepted receipt submitted again. The verifier must reject a `receipt_id` it has already honored in the window. Reject (`REPLAYED`).
- **Policy evaluated but execution never happened.** A policy decision exists with no execution attestation. A permit is not a proof that the action ran. Reject (`POLICY_NOT_EXECUTED`).

A conformant verifier runs the crypto layer first (claim type, `receipt_id` match, signature) and then the context layer (delegation state, budget, principal, policy version, replay window). A receipt that fails either layer is not authoritative.
