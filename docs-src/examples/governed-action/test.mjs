// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
// Asserts the outcome of every case. Run with: npm test

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runAll } from './governed-action.mjs'

const pkg = JSON.parse(readFileSync(new URL('./node_modules/agent-passport-system/package.json', import.meta.url), 'utf8'))
const { rows, allowed, revocation, ledger, resourceCalls } = runAll()
const byCase = Object.fromEntries(rows.map(r => [r.case, r]))

test('runs against agent-passport-system 8.0.1', () => {
  assert.equal(pkg.version, '8.0.1')
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
