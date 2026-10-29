---
title: Receipt families and verification
description: Which verifier each APS receipt family goes to, what each ReceiptV1 stage requires, the verification axes and their states, and what a valid result does not authorize.
---

## Routing table

Send each artifact to the verifier for its own family. A verifier for one family does not judge another, and the families are not translated into each other.

| Family | How to recognize it | Produced by | Canonical form | Verified by | What the caller supplies |
| --- | --- | --- | --- | --- | --- |
| Draft-native `ReceiptV1` | `"profile": "aps-receipt-v1"` and a `receipt_type` | `createReceiptV1` | RFC 8785 JCS with domain tags | `verifyReceiptV1`, `verifyReceiptV1Serialized`, `verifyReceiptWithDecisionV1` | A key resolver, the expected boundary identity, the decision evidence and optionally the predecessor receipt |
| Accountability receipts | A `claim_type` such as `aps:action:v1`, with `scope_of_claim` | `createActionReceipt` and its siblings | RFC 8785 JCS | `verifyActionReceipt` for integrity, `verifyReceiptContext` for the context layer | Every context fact, see [Receipts](/docs/receipts/#what-a-verifier-must-reject) |
| Compatibility `ActionReceipt` | camelCase members such as `receiptId` and `delegationId` | `recordWork`, `createReceipt` | Legacy `canonicalize`, nulls dropped | `verifyReceipt(receipt, agentPublicKey)` | The agent's public key |
| Evidence bundle | `"profile": "aps:evidence-bundle:v1"` in its manifest | `createEvidenceBundle` | Per member | `verifyEvidenceBundle`, CLI `verify-bundle` | The bundle file |

`verifyActionReceipt(receipt)` takes only the receipt. It checks content, hash and signature against the key the receipt names in `signer_did`. That shows the holder of that key signed. Whether that key belongs to a gateway the relying party trusts is the relying party's own check.

## ReceiptV1 stages

`ReceiptV1` has a closed set of members: `profile`, `receipt_id`, `receipt_type`, `issuer`, `subject_agent`, `action_ref`, `delegation_ref`, `decision_ref` when the stage needs it, `issued_at`, `evidence_refs`, `result`, `prev` when the stage needs it, and `signatures`. The issuer's signature is required.

| `receipt_type` | Signed by | `prev` | `decision_ref` | `result` |
| --- | --- | --- | --- | --- |
| `aps:action-intent:v1` | The acting agent. `issuer` equals `subject_agent` | Absent | Absent | Exactly `{ "profile": "aps-action-intent-result-v1", "status": "declared" }` |
| `aps:policy-decision:v1` | The enforcement boundary | Required | Required | A `CoreDecisionOutputV1`: `verdict` `permit`, `deny` or `narrow`, `effective_authority_ref`, sorted `constraints`, and `valid_until`. A deny has `null` for both `effective_authority_ref` and `valid_until`. A permit or narrow needs `valid_until` later than `issued_at` |
| `aps:action-result:v1` | The enforcement boundary | Required, the policy-decision `receipt_id` | Required | `{ "profile": "aps-action-result-v1", "status", "effect_ref", "error_code" }`. `succeeded` needs an `effect_ref` and a null `error_code`. `failed` needs a non-empty `error_code`. `unknown` has both null |

`delegation_ref` is the leaf `delegation_id`, with its `sha256:` prefix. The stage check verifies its form only. It does not look up the delegation.

`decision_ref` is computed by `buildDecisionRefV1` from the `action_ref` and four inputs: the authority state, the policy input, the decision context and the decision output. Each is digested under its own tag and the five are combined. See [Signed bytes](/docs/signed-bytes/#per-artifact).

## Verification axes

`verifyReceiptWithDecisionV1(receipt, decision, resolveKey, options)` reports each check on its own axis. These are the axes for the [Quickstart](/docs/quickstart/) allowed action, under five sets of options. The program is `receipt-axes.mjs` in `docs-src/examples/governed-action/`:

```js
// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
// The verification axes of verifyReceiptWithDecisionV1, on the Quickstart's allowed action,
// under five sets of options. Each axis keeps its own state.

import { verifyReceiptWithDecisionV1 } from 'agent-passport-system'
import { runAll, resolveReceiptKey, boundaryKey } from './governed-action.mjs'

const { allowed } = runAll()
const [decision, result] = allowed.receipts
const evidence = /** @type {NonNullable<typeof allowed.evidence>} */ (allowed.evidence)

const show = (/** @type {string} */ label, /** @type {any} */ v) => console.log(label.padEnd(34), JSON.stringify({
  status: v.status,
  boundary_identity: v.stage.boundary_identity,
  signer_authority: v.receipt.signer_authority,
  decision_ref_bound: v.decision_ref_bound,
  decision_output_bound: v.decision_output_bound,
  temporal_relation_valid: v.temporal_relation_valid,
  predecessor_bound: v.predecessor_bound,
  errors: v.errors,
}))

show('decision, boundary supplied', verifyReceiptWithDecisionV1(decision, evidence, resolveReceiptKey, { boundaryIdentity: boundaryKey.id }))
show('decision, no boundary identity', verifyReceiptWithDecisionV1(decision, evidence, resolveReceiptKey))
show('result, predecessor supplied', verifyReceiptWithDecisionV1(result, evidence, resolveReceiptKey, { boundaryIdentity: boundaryKey.id, predecessor: decision }))
show('result, predecessor option absent', verifyReceiptWithDecisionV1(result, evidence, resolveReceiptKey, { boundaryIdentity: boundaryKey.id }))
show('result, predecessor: null', verifyReceiptWithDecisionV1(result, evidence, resolveReceiptKey, { boundaryIdentity: boundaryKey.id, predecessor: null }))
```

```text
decision, boundary supplied        {"status":"valid","boundary_identity":"verified","signer_authority":"verified","decision_ref_bound":true,"decision_output_bound":true,"temporal_relation_valid":true,"predecessor_bound":"not_checked","errors":[]}
decision, no boundary identity     {"status":"indeterminate","boundary_identity":"not_established","signer_authority":"verified","decision_ref_bound":false,"decision_output_bound":"not_applicable","temporal_relation_valid":false,"predecessor_bound":"not_checked","errors":["receipt_indeterminate","stage_indeterminate"]}
result, predecessor supplied       {"status":"valid","boundary_identity":"verified","signer_authority":"verified","decision_ref_bound":true,"decision_output_bound":"not_applicable","temporal_relation_valid":"not_applicable","predecessor_bound":true,"errors":[]}
result, predecessor option absent  {"status":"valid","boundary_identity":"verified","signer_authority":"verified","decision_ref_bound":true,"decision_output_bound":"not_applicable","temporal_relation_valid":"not_applicable","predecessor_bound":"not_checked","errors":[]}
result, predecessor: null          {"status":"indeterminate","boundary_identity":"verified","signer_authority":"verified","decision_ref_bound":true,"decision_output_bound":"not_applicable","temporal_relation_valid":"not_applicable","predecessor_bound":"not_established","errors":["predecessor_not_supplied"]}
```

What the states mean:

- `not_checked`: nobody asked for this check. `predecessor_bound` is `not_checked` unless `options` has a `predecessor` property.
- `not_applicable`: the check does not apply to this stage, for example the decision output comparison on an action result.
- `not_established`: the check was asked for and could not be made. Passing `predecessor: null`, which is what a lookup miss produces, gives `not_established` and an `indeterminate` result, never `valid`. Without `boundaryIdentity`, `boundary_identity` is `not_established` and the result is `indeterminate`.
- `false` on a later flag can mean that check never ran. The composite stops at the first stage that does not pass, so in the second line `decision_ref_bound` and `temporal_relation_valid` are `false` because the run stopped at the boundary identity, with `errors` naming why. Read `status` and `errors` first.

Collapsing these into one boolean loses the difference between a check that failed, one that was not made, and one that did not apply.

## What a valid result does not do

A `valid` composite result says the receipt is intact, its signer key resolved, its stage rules hold, and it is bound to the decision evidence and, when asked, to its predecessor. The verifier does not:

- authorize dispatch,
- consume the `receipt_id` or enforce single use,
- recheck revocation or time at dispatch,
- reserve spend.

Those belong to the enforcement boundary. A signed `aps:action-result:v1` with `status` `succeeded` is the boundary's statement about the effect, under the boundary's key. A stronger claim, that the resource itself recorded the effect, needs a record signed by the resource or other independent evidence.

## Where the rules come from

The stage rules and verification results are from `draft-pidlisnyi-aps-04` section 7 and the SDK's `src/v2/receipt-core/` at commit `f95c916`: `stage.ts` for the stage table, `composite.ts` for the axes, and `receipt.ts` for the envelope and signatures.
