// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
//
// One governed action, end to end, with agent-passport-system 8.0.1.
//
// A principal issues an AuthorityDelegationV1 grant to an agent. The agent asks an
// enforcement boundary to read a note. The boundary is the only code that holds the
// resource handler, so a call the boundary refuses never reaches the resource. The
// boundary verifies the chain with an explicit clock, a key resolver, a root trust
// policy and a revocation resolver, checks scope, claims the action against replay,
// reserves spend, and signs ReceiptV1 records for the decision and the result.
//
// Everything is local and deterministic: fixed key seeds, fixed nonces, a fixed clock.
// Fixed seeds are for this example only. Never derive real keys this way.

import { createHash } from 'node:crypto'
import {
  publicKeyFromPrivate,
  issueAuthorityDelegation,
  verifyAuthorityDelegationChain,
  scopeGrantCovers,
  InMemoryAuthorityRevocationStore,
  createAuthorityRevocationResolver,
  issueAuthorityRevocation,
  recordAuthorityRevocation,
  InMemoryAuthorityBudgetLedger,
  createActionReferenceInputV2,
  computeActionRefV2,
  computePayloadRefV1,
  createReceiptV1,
  verifyReceiptV1,
  buildDecisionRefV1,
  verifyReceiptWithDecisionV1,
} from 'agent-passport-system'

const sha256 = (/** @type {string} */ text) => createHash('sha256').update(text, 'utf8').digest('hex')

/** @param {string} id @param {string} label */
function party(id, label) {
  const privateKey = sha256(`aps-docs-example-seed:${label}`)
  return { id, vm: `${id}#key-1`, privateKey, publicKey: publicKeyFromPrivate(privateKey) }
}

export const principal = party('did:example:principal', 'principal')
export const agent = party('did:example:agent', 'agent')
export const boundaryKey = party('did:example:boundary', 'boundary')

// Trust directory: which key each identifier used, and from when. The resolver picks the
// key by the artifact's own issued_at, so a later rotation does not change old results.
/** @type {Map<string, {vm: string, publicKey: string, validFrom: string}[]>} */
const directory = new Map([
  [principal.id, [{ vm: principal.vm, publicKey: principal.publicKey, validFrom: '2026-01-01T00:00:00.000Z' }]],
  [agent.id, [{ vm: agent.vm, publicKey: agent.publicKey, validFrom: '2026-01-01T00:00:00.000Z' }]],
  [boundaryKey.id, [{ vm: boundaryKey.vm, publicKey: boundaryKey.publicKey, validFrom: '2026-01-01T00:00:00.000Z' }]],
])

/**
 * @param {string} issuer @param {string} vm @param {string} issuedAt
 * @returns {string | { outcome: 'not_found' }}
 */
export function resolveKey(issuer, vm, issuedAt) {
  const entry = (directory.get(issuer) ?? []).find(k => k.vm === vm && k.validFrom <= issuedAt)
  return entry ? entry.publicKey : { outcome: 'not_found' }
}

/** Receipt verifiers take a key string or undefined. */
export const resolveReceiptKey = (/** @type {string} */ s, /** @type {string} */ k, /** @type {string} */ t) => {
  const key = resolveKey(s, k, t)
  return typeof key === 'string' ? key : undefined
}

// Root trust policy: this deployment accepts roots signed by the principal's key only.
const trustRoot = (/** @type {{issuer: string, verification_method: string}} */ root) =>
  root.issuer === principal.id && root.verification_method === principal.vm

// The explicit clock. Every check reads this value, never Date.now().
export const clock = { now: '2026-10-28T10:00:00.000Z' }

/** @param {string} nonce @param {string[]} grants */
function grantBody(nonce, grants) {
  return {
    record_type: /** @type {const} */ ('aps:authority-delegation:v1'),
    version: /** @type {const} */ ('1.0'),
    parent_delegation_id: null,
    issuer: principal.id,
    subject: agent.id,
    verification_method: principal.vm,
    issued_at: '2026-10-28T09:00:00.000Z',
    nonce,
    authority: {
      scope: { profile: /** @type {const} */ ('aps-hierarchical-v1'), grants },
      spend: { mode: /** @type {const} */ ('bounded'), unit: 'example:credit', per_action: '5', cumulative: '10' },
      depth: { remaining: 0 },
      time: { not_before: '2026-10-28T09:00:00.000Z', not_after: '2026-10-28T17:00:00.000Z' },
      reputation: { profile: /** @type {const} */ ('aps-score-0-100-v1'), ceiling: 100 },
      values: { profile: /** @type {const} */ ('aps-values-identifiers-v1'), required: [] },
      reversibility: { profile: /** @type {const} */ ('aps-tci-v1'), ceiling: /** @type {const} */ ('compensable') },
    },
  }
}

// The grant the principal signs: read access to every note under notes:read.
export const grant = issueAuthorityDelegation(grantBody('00000000000000000000000000000001', ['notes:read:*']), principal.privateKey)

// A second grant with the same authority. The revocation status source below never
// learns about it, which is how the unknown-status case arises.
export const untrackedGrant = issueAuthorityDelegation(grantBody('00000000000000000000000000000002', ['notes:read:*']), principal.privateKey)

// Revocation status source. It answers only for delegations it tracks. A delegation it
// does not track resolves to unknown, never to active.
const revocationStore = new InMemoryAuthorityRevocationStore()
revocationStore.track(grant.delegation_id)
const resolveRevocation = createAuthorityRevocationResolver(revocationStore, { resolveVerificationKey: resolveKey })

// The resource. Only the boundary holds a reference to it.
const notes = new Map([['notes:read:project-x', 'Project X ships on Friday.']])
export const resource = {
  calls: 0,
  /** @param {string} target */
  read(target) {
    resource.calls += 1
    return notes.get(target) ?? ''
  },
}

// Replay claims and spend reservations belong to the boundary, not to any verifier.
// Both stores here live in process memory. A deployment needs durable, atomic stores.
const consumedActions = new Set()
const ledger = new InMemoryAuthorityBudgetLedger()

/**
 * The agent's side: build the action reference and sign an action-intent receipt.
 * @param {{ target: string, scope: string, cost: string, nonce: string, delegation: import('agent-passport-system').AuthorityDelegationV1 }} req
 */
export function agentRequest(req) {
  const action = createActionReferenceInputV2({
    agent_id: agent.id,
    action_type: 'notes.read',
    target: req.target,
    payload_ref: computePayloadRefV1({ cost: req.cost }),
    scope_required: [req.scope],
    issued_at: clock.now,
    nonce: req.nonce,
  })
  const intent = createReceiptV1({
    profile: 'aps-receipt-v1',
    receipt_type: 'aps:action-intent:v1',
    issuer: agent.id,
    subject_agent: agent.id,
    action_ref: computeActionRefV2(action),
    delegation_ref: req.delegation.delegation_id,
    issued_at: clock.now,
    evidence_refs: [],
    result: { profile: 'aps-action-intent-result-v1', status: 'declared' },
  }, [{ signer: agent.id, key_id: agent.vm, private_key: agent.privateKey }])
  return { action, cost: req.cost, chain: [req.delegation], intent }
}

/** @param {string} timestamp @param {number} seconds */
const plusSeconds = (timestamp, seconds) => new Date(Date.parse(timestamp) + seconds * 1000).toISOString()

/**
 * The enforcement boundary. Returns the decision, the receipts it signed, and whether the
 * resource was called.
 * @param {ReturnType<typeof agentRequest>} request
 */
export function boundary(request) {
  const { action, chain, intent, cost } = request
  const actionRef = computeActionRefV2(action)

  // 1. The intent must be signed by the acting agent and bind this exact action.
  const intentCheck = verifyReceiptV1(intent, resolveReceiptKey)
  if (intentCheck.status !== 'valid' || intent.action_ref !== actionRef || intent.subject_agent !== action.agent_id) {
    return { outcome: 'refused', reason: 'INTENT_NOT_BOUND', dispatched: false, receipts: [] }
  }

  // 2. Replay: an action reference is honored once. Checked before any other work.
  if (consumedActions.has(actionRef)) {
    return { outcome: 'refused', reason: 'REPLAYED', dispatched: false, receipts: [] }
  }

  // 3. Authority: the full chain, at the boundary's own clock.
  const chainResult = verifyAuthorityDelegationChain(chain, {
    now: clock.now,
    resolveVerificationKey: resolveKey,
    trustRoot,
    resolveRevocation,
  })
  const leaf = chain[chain.length - 1]

  // 4. Scope: every scope the action requires must be covered by a leaf grant.
  const scopeCovered = action.scope_required.every(s => leaf.authority.scope.grants.some(g => scopeGrantCovers(g, s)))

  // 5. Spend: the ledger reserves the cost against every bounded grant in the chain and
  //    refuses a wrong unit, a cost above per_action, or a total above cumulative.
  const spend = leaf.authority.spend
  /** @type {string | null} */
  let reason = null
  if (chainResult.state !== 'valid') reason = chainResult.failures[0].code
  else if (!scopeCovered) reason = 'SCOPE_NOT_GRANTED'
  else if (spend.mode === 'bounded') {
    const reservation = ledger.reserve(chain, actionRef, spend.unit, cost)
    if (!reservation.ok) reason = reservation.code
  }
  const permit = reason === null

  // 6. The decision, and the policy-decision receipt that carries it.
  /** @type {import('agent-passport-system').CoreDecisionOutputV1} */
  const decisionOutput = {
    profile: 'aps-core-decision-output-v1',
    verdict: permit ? 'permit' : 'deny',
    effective_authority_ref: permit ? leaf.delegation_id.slice('sha256:'.length) : null,
    constraints: [],
    valid_until: permit ? plusSeconds(clock.now, 60) : null,
  }
  const evidence = {
    authority_state: { chain_state: chainResult.state, failures: chainResult.failures.map(f => f.code), delegation_ids: chain.map(d => d.delegation_id) },
    policy_input: { policy: 'docs-example-policy-v1', scope_required: action.scope_required, cost },
    decision_context: { now: clock.now, boundary: boundaryKey.id, reason },
    decision_output: decisionOutput,
  }
  const { decision_ref } = buildDecisionRefV1({ action_ref: actionRef, ...evidence })
  const boundarySigner = [{ signer: boundaryKey.id, key_id: boundaryKey.vm, private_key: boundaryKey.privateKey }]
  const decision = createReceiptV1({
    profile: 'aps-receipt-v1',
    receipt_type: 'aps:policy-decision:v1',
    issuer: boundaryKey.id,
    subject_agent: action.agent_id,
    action_ref: actionRef,
    delegation_ref: leaf.delegation_id,
    decision_ref,
    issued_at: clock.now,
    evidence_refs: [],
    result: { ...decisionOutput },
    prev: intent.receipt_id,
  }, boundarySigner)

  if (!permit) {
    return { outcome: 'refused', reason, dispatched: false, chainState: chainResult.state, receipts: [decision], evidence }
  }

  // 7. Claim the action before dispatch, so a second copy cannot also be dispatched.
  consumedActions.add(actionRef)
  ledger.markDispatched(actionRef)
  const output = resource.read(action.target)
  ledger.commit(actionRef)

  const result = createReceiptV1({
    profile: 'aps-receipt-v1',
    receipt_type: 'aps:action-result:v1',
    issuer: boundaryKey.id,
    subject_agent: action.agent_id,
    action_ref: actionRef,
    delegation_ref: leaf.delegation_id,
    decision_ref,
    issued_at: plusSeconds(clock.now, 1),
    evidence_refs: [],
    result: { profile: 'aps-action-result-v1', status: 'succeeded', effect_ref: sha256(output), error_code: null },
    prev: decision.receipt_id,
  }, boundarySigner)

  return { outcome: 'dispatched', reason: null, dispatched: true, chainState: chainResult.state, output, receipts: [decision, result], evidence }
}

/**
 * What a relying party checks later, offline: both receipts, the decision binding, the
 * boundary identity it expects, and the result's link to its decision.
 * @param {ReturnType<typeof boundary>} handled
 */
export function audit(handled) {
  const [decision, result] = handled.receipts
  if (!decision || !handled.evidence) return null
  const opts = { boundaryIdentity: boundaryKey.id }
  const d = verifyReceiptWithDecisionV1(decision, handled.evidence, resolveReceiptKey, opts)
  const out = { decision: d.status, decision_ref_bound: d.decision_ref_bound, boundary: d.stage.boundary_identity }
  if (!result) return out
  const r = verifyReceiptWithDecisionV1(result, handled.evidence, resolveReceiptKey, { ...opts, predecessor: decision })
  return { ...out, result: r.status, predecessor_bound: r.predecessor_bound }
}

/** The principal revokes the grant. The boundary's status source records it. */
export function revokeGrant() {
  const revocation = issueAuthorityRevocation(grant, {
    now: '2026-10-28T10:05:00.000Z',
    revoker: principal.id,
    verification_method: principal.vm,
    reason_code: 'task_complete',
    nonce: '000000000000000000000000000000aa',
  }, principal.privateKey)
  const recorded = recordAuthorityRevocation(revocationStore, grant, revocation, { resolveVerificationKey: resolveKey })
  return { revocation, recorded: recorded.recorded, inserted: recorded.inserted, state: recorded.verification.state }
}

/** Run the six cases in order and return one row per case. */
export function runAll() {
  /** @type {{ case: string, outcome: string, reason: string | null, chain_state: string, resource_called: boolean, receipts: string[], audit: ReturnType<typeof audit> }[]} */
  const rows = []
  /** @param {string} name @param {ReturnType<typeof agentRequest>} request */
  const run = (name, request) => {
    const before = resource.calls
    const handled = boundary(request)
    rows.push({
      case: name,
      outcome: handled.outcome,
      reason: handled.reason,
      chain_state: handled.chainState ?? 'not_evaluated',
      resource_called: resource.calls > before,
      receipts: handled.receipts.map(r => r.receipt_type),
      audit: audit(handled),
    })
    return handled
  }

  const allowedRequest = agentRequest({ target: 'notes:read:project-x', scope: 'notes:read:project-x', cost: '3', nonce: '10000000000000000000000000000001', delegation: grant })
  const allowed = run('allowed', allowedRequest)
  run('out_of_scope', agentRequest({ target: 'notes:write:project-x', scope: 'notes:write:project-x', cost: '1', nonce: '10000000000000000000000000000002', delegation: grant }))
  run('over_budget', agentRequest({ target: 'notes:read:project-x', scope: 'notes:read:project-x', cost: '8', nonce: '10000000000000000000000000000003', delegation: grant }))
  run('replay', allowedRequest)
  run('unknown_status', agentRequest({ target: 'notes:read:project-x', scope: 'notes:read:project-x', cost: '1', nonce: '10000000000000000000000000000004', delegation: untrackedGrant }))
  clock.now = '2026-10-28T10:10:00.000Z'
  const revocation = revokeGrant()
  run('revoked', agentRequest({ target: 'notes:read:project-x', scope: 'notes:read:project-x', cost: '1', nonce: '10000000000000000000000000000005', delegation: grant }))

  return { rows, allowed, revocation, ledger: ledger.counter(grant.delegation_id), resourceCalls: resource.calls }
}
