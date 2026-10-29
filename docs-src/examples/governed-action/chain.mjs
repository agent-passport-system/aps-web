// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
// A two-link AuthorityDelegationV1 chain: issue, narrow, refuse widening, revoke the root.

import { createHash } from 'node:crypto'
import {
  publicKeyFromPrivate, issueAuthorityDelegation, issueSubAuthorityDelegation,
  verifyAuthorityDelegationChain, InMemoryAuthorityRevocationStore,
  createAuthorityRevocationResolver, issueAuthorityRevocation, recordAuthorityRevocation,
} from 'agent-passport-system'

const key = (/** @type {string} */ label) => {
  const privateKey = createHash('sha256').update(`aps-docs-chain-seed:${label}`).digest('hex')
  return { privateKey, publicKey: publicKeyFromPrivate(privateKey) }
}
const keys = { 'did:example:principal': key('principal'), 'did:example:agent': key('agent') }
/** @param {string} issuer @param {string} vm */
const resolveKey = (issuer, vm) =>
  vm === `${issuer}#key-1` && issuer in keys ? keys[/** @type {keyof typeof keys} */ (issuer)].publicKey : { outcome: /** @type {const} */ ('not_found') }

/** @param {string} issuer @param {string} subject @param {string | null} parent @param {string[]} grants @param {number} depth @param {string} nonce */
const body = (issuer, subject, parent, grants, depth, nonce) => ({
  record_type: /** @type {const} */ ('aps:authority-delegation:v1'), version: /** @type {const} */ ('1.0'),
  parent_delegation_id: parent, issuer, subject, verification_method: `${issuer}#key-1`,
  issued_at: '2026-10-28T09:00:00.000Z', nonce,
  authority: {
    scope: { profile: /** @type {const} */ ('aps-hierarchical-v1'), grants },
    spend: { mode: /** @type {const} */ ('unbounded') },
    depth: { remaining: depth },
    time: { not_before: '2026-10-28T09:00:00.000Z', not_after: '2026-10-28T17:00:00.000Z' },
    reputation: { profile: /** @type {const} */ ('aps-score-0-100-v1'), ceiling: 100 },
    values: { profile: /** @type {const} */ ('aps-values-identifiers-v1'), required: [] },
    reversibility: { profile: /** @type {const} */ ('aps-tci-v1'), ceiling: /** @type {const} */ ('compensable') },
  },
})

const root = issueAuthorityDelegation(
  body('did:example:principal', 'did:example:agent', null, ['notes:*'], 1, '00000000000000000000000000000010'),
  keys['did:example:principal'].privateKey)

const store = new InMemoryAuthorityRevocationStore()
store.track(root.delegation_id)
const resolveRevocation = createAuthorityRevocationResolver(store, { resolveVerificationKey: resolveKey })
const now = '2026-10-28T10:00:00.000Z'
const issueOptions = { now, resolveVerificationKey: resolveKey, resolveRevocation }

// The agent narrows notes:* to notes:read:* for a sub-agent.
const child = issueSubAuthorityDelegation(root,
  body('did:example:agent', 'did:example:subagent', root.delegation_id, ['notes:read:*'], 0, '00000000000000000000000000000011'),
  keys['did:example:agent'].privateKey, issueOptions)
store.track(child.delegation_id)

// A child that adds files:read is wider than its parent. The issuer refuses to sign it.
try {
  issueSubAuthorityDelegation(root,
    body('did:example:agent', 'did:example:subagent', root.delegation_id, ['files:read', 'notes:read:*'], 0, '00000000000000000000000000000012'),
    keys['did:example:agent'].privateKey, issueOptions)
} catch (e) { console.log('widening child refused:', /** @type {Error} */ (e).message) }

const check = (/** @type {string} */ at) => {
  const r = verifyAuthorityDelegationChain([root, child], { now: at, resolveVerificationKey: resolveKey, trustRoot: d => d.issuer === 'did:example:principal', resolveRevocation })
  return JSON.stringify({ state: r.state, failures: r.failures.map(f => ({ code: f.code, index: f.index })) })
}
console.log('chain at 10:00:', check(now))

// The principal revokes the root. The child has no record of its own and still fails.
const revocation = issueAuthorityRevocation(root, {
  now: '2026-10-28T10:05:00.000Z', revoker: 'did:example:principal',
  verification_method: 'did:example:principal#key-1', reason_code: 'task_complete',
  nonce: '000000000000000000000000000000bb',
}, keys['did:example:principal'].privateKey)
recordAuthorityRevocation(store, root, revocation, { resolveVerificationKey: resolveKey })
console.log('chain at 10:10, root revoked:', check('2026-10-28T10:10:00.000Z'))
