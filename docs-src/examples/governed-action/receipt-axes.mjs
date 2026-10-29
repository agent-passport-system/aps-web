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
