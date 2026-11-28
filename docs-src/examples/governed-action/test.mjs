// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
// Asserts the outcome of every case. Run with: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createAuthorityChainVerifier, verifyAuthorityChainForBudget, InMemoryAuthorityBudgetLedger } from 'agent-passport-system'
import { runAll, grant, resolveKey } from './governed-action.mjs'

const pkg = JSON.parse(readFileSync(new URL('./node_modules/agent-passport-system/package.json', import.meta.url), 'utf8'))
const { rows, allowed, revocation, ledger, resourceCalls } = runAll()
const byCase = Object.fromEntries(rows.map(r => [r.case, r]))

test('runs against agent-passport-system 9.0.2', () => {
  assert.equal(pkg.version, '9.0.2')
})

test('allowed: permit, resource called once, both receipts verify', () => {
  const r = byCase.allowed
  assert.equal(r.outcome, 'dispatched')
  assert.equal(r.chain_state, 'valid')
  assert.equal(r.resource_called, true)
  assert.deepEqual(r.receipts, ['aps:policy-decision:v1', 'aps:action-result:v1'])
  assert.deepEqual(r.audit, { decision: 'valid', decision_ref_bound: true, boundary: 'verified', result: 'valid', predecessor_bound: true })
  assert.equal(allowed.output, 'Project X ships on Friday.')
})

test('out of scope: refused before the resource, deny receipt verifies', () => {
  const r = byCase.out_of_scope
  assert.equal(r.outcome, 'refused')
  assert.equal(r.reason, 'SCOPE_NOT_GRANTED')
  assert.equal(r.chain_state, 'valid')
  assert.equal(r.resource_called, false)
  assert.deepEqual(r.receipts, ['aps:policy-decision:v1'])
  assert.equal(r.audit.decision, 'valid')
})

test('over budget: the ledger refuses a cost above per_action', () => {
  const r = byCase.over_budget
  assert.equal(r.outcome, 'refused')
  assert.equal(r.reason, 'PER_ACTION_EXCEEDED')
  assert.equal(r.resource_called, false)
})

test('replay: the same signed request is refused without evaluation', () => {
  const r = byCase.replay
  assert.equal(r.outcome, 'refused')
  assert.equal(r.reason, 'REPLAYED')
  assert.equal(r.chain_state, 'not_evaluated')
  assert.equal(r.resource_called, false)
  assert.deepEqual(r.receipts, [])
})

test('unknown revocation status: indeterminate, refused', () => {
  const r = byCase.unknown_status
  assert.equal(r.outcome, 'refused')
  assert.equal(r.reason, 'REVOCATION_UNKNOWN')
  assert.equal(r.chain_state, 'indeterminate')
  assert.equal(r.resource_called, false)
})

test('revoked: the recorded revocation verifies and the chain is invalid', () => {
  assert.equal(revocation.recorded, true)
  assert.equal(revocation.state, 'valid')
  const r = byCase.revoked
  assert.equal(r.outcome, 'refused')
  assert.equal(r.reason, 'REVOKED')
  assert.equal(r.chain_state, 'invalid')
  assert.equal(r.resource_called, false)
})

test('the resource ran once and the ledger committed only the allowed cost', () => {
  assert.equal(resourceCalls, 1)
  assert.deepEqual(ledger, { reserved: '0', committed: '3' })
})

test('budget handles bind frozen records, verifier identity and verification time', () => {
  let now = '2026-10-28T10:00:00.000Z'
  const config = {
    policyId: 'budget-test-v1', revocationSourceId: 'budget-test-revocations',
    now: () => now, resolveVerificationKey: resolveKey,
    trustRoot: () => true, resolveRevocation: () => 'active',
  }
  const verifier = createAuthorityChainVerifier(config)
  const budget = new InMemoryAuthorityBudgetLedger(verifier, { now: () => now, maxVerificationAgeMs: 1000 })
  const raw = structuredClone(grant)
  const checked = verifyAuthorityChainForBudget([raw], verifier)
  assert.equal(checked.ok, true)
  const handle = checked.chain
  raw.authority.scope.grants[0] = 'notes:write:*'
  raw.authority.spend.per_action = '100'
  assert.deepEqual(handle.records[0].authority.scope.grants, ['notes:read:*'])
  assert.equal(Object.isFrozen(handle.records[0].authority.scope.grants), true)
  const ref = 'd'.repeat(64)
  assert.deepEqual(budget.reserve([raw], ref, 'example:credit', '3'), { ok: false, code: 'AUTHORITY_UNVERIFIED' })
  assert.deepEqual(budget.reserve(structuredClone(handle), ref, 'example:credit', '3'), { ok: false, code: 'AUTHORITY_UNVERIFIED' })
  const other = verifyAuthorityChainForBudget([grant], createAuthorityChainVerifier(config))
  assert.equal(other.ok, true)
  assert.deepEqual(budget.reserve(other.chain, ref, 'example:credit', '3'), { ok: false, code: 'AUTHORITY_CONTEXT_MISMATCH' })
  assert.deepEqual(budget.counter(grant.delegation_id), { reserved: '0', committed: '0' })
  assert.equal(budget.reserve(handle, ref, 'example:credit', '3').code, 'RESERVED')
  now = '2026-10-28T10:00:02.000Z'
  assert.deepEqual(budget.reserve(handle, ref, 'example:credit', '3'), { ok: false, code: 'AUTHORITY_STALE' })
  assert.deepEqual(budget.counter(grant.delegation_id), { reserved: '3', committed: '0' })
})

for (const change of ['revocation', 'expiry']) {
  test(`dispatch admission refuses ${change} after reservation and releases spend`, async () => {
    const example = await import(`./governed-action.mjs?admission=${change}`)
    const reserve = InMemoryAuthorityBudgetLedger.prototype.reserve
    let budget
    // Change authority after reserve succeeds, before the boundary checks dispatch.
    InMemoryAuthorityBudgetLedger.prototype.reserve = function (...args) {
      budget = this
      const result = reserve.apply(this, args)
      if (change === 'revocation') {
        example.revokeGrant()
        example.clock.now = '2026-10-28T10:10:00.000Z'
      } else example.clock.now = '2026-10-28T17:00:00.000Z'
      return result
    }
    try {
      const handled = example.boundary(example.agentRequest({
        target: 'notes:read:project-x', scope: 'notes:read:project-x', cost: '3',
        nonce: '30000000000000000000000000000001', delegation: example.grant,
      }))
      assert.equal(handled.dispatched, false)
      assert.equal(handled.reason, change === 'revocation' ? 'REVOKED' : 'EXPIRED')
      assert.equal(example.resource.calls, 0)
      assert.deepEqual(budget.counter(example.grant.delegation_id), { reserved: '0', committed: '0' })
      assert.equal(handled.receipts.length, 1)
    } finally {
      InMemoryAuthorityBudgetLedger.prototype.reserve = reserve
    }
  })
}
