// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
//
// How the current functions of agent-passport-system 8.0.1 report failure: which ones
// throw and which return a coded result. Each line is one call with bad input.
import {
  issueAuthorityDelegation, verifyAuthorityDelegationChain, issueAuthorityRevocation,
  recordAuthorityRevocation, InMemoryAuthorityRevocationStore, InMemoryAuthorityBudgetLedger,
  createReceiptV1, verifyReceiptV1, verifyReceiptV1Serialized, verifyApsMcpAuthorizationV1,
  proveContributions, commercePreflight,
} from 'agent-passport-system'
import { agent, grant, principal, resolveKey } from './governed-action.mjs'

/** @param {string} label @param {() => unknown} fn */
async function probe(label, fn) {
  try {
    const value = await fn()
    console.log(label.padEnd(48), 'returned', JSON.stringify(value))
  } catch (e) {
    const err = /** @type {Error & {code?: string}} */ (e)
    console.log(label.padEnd(48), 'threw', `${err.constructor.name}${err.code ? ` ${err.code}` : ''}:`, err.message.split('\n')[0].slice(0, 110))
  }
}
const opts = { now: '2026-10-28T10:00:00.000Z', resolveVerificationKey: resolveKey, trustRoot: () => true, resolveRevocation: () => /** @type {const} */ ('active') }
/** @param {import('agent-passport-system').AuthorityValidationResult} r */
const brief = r => ({ state: r.state, codes: r.failures.map(f => f.code) })

const { delegation_id: _id, signature: _sig, ...body } = grant
await probe('issueAuthorityDelegation, signed record as body', () => issueAuthorityDelegation(grant, principal.privateKey).delegation_id)
await probe('issueAuthorityDelegation, bad nonce', () => issueAuthorityDelegation({ ...body, nonce: 'x' }, principal.privateKey).delegation_id)
await probe('verifyAuthorityDelegationChain, not a chain', () => brief(verifyAuthorityDelegationChain(/** @type {any} */ ('x'), opts)))
await probe('verifyAuthorityDelegationChain, wrong record', () => brief(verifyAuthorityDelegationChain([{ record_type: 'x' }], opts)))
await probe('verifyAuthorityDelegationChain, key unreachable', () => brief(verifyAuthorityDelegationChain([grant], { ...opts, resolveVerificationKey: () => ({ outcome: 'unreachable' }) })))
await probe('verifyAuthorityDelegationChain, root untrusted', () => brief(verifyAuthorityDelegationChain([grant], { ...opts, trustRoot: () => false })))
await probe('verifyAuthorityDelegationChain, after not_after', () => brief(verifyAuthorityDelegationChain([grant], { ...opts, now: '2026-10-29T00:00:00.000Z' })))
await probe('issueAuthorityRevocation, revoker not issuer', () => issueAuthorityRevocation(grant, { now: '2026-10-28T10:05:00.000Z', revoker: agent.id, verification_method: agent.vm, reason_code: 'x', nonce: '000000000000000000000000000000bb' }, agent.privateKey).revocation_id)
await probe('recordAuthorityRevocation, junk candidate', () => { const r = recordAuthorityRevocation(new InMemoryAuthorityRevocationStore(), grant, { record_type: 'x' }, { resolveVerificationKey: resolveKey }); return { recorded: r.recorded, state: r.verification.state, codes: r.verification.failures.map(f => f.code) } })
const ledger = new InMemoryAuthorityBudgetLedger()
await probe('ledger.reserve, wrong unit', () => ledger.reserve([grant], 'a'.repeat(64), 'other:unit', '1'))
await probe('ledger.reserve, above per_action', () => ledger.reserve([grant], 'b'.repeat(64), 'example:credit', '6'))
await probe('ledger.commit, unknown action', () => ledger.commit('c'.repeat(64)))
await probe('createReceiptV1, bad issued_at', () => createReceiptV1(/** @type {any} */ ({ profile: 'aps-receipt-v1', receipt_type: 'aps:action-intent:v1', issuer: agent.id, subject_agent: agent.id, action_ref: 'a'.repeat(64), delegation_ref: grant.delegation_id, issued_at: 'yesterday', evidence_refs: [], result: {} }), [{ signer: agent.id, key_id: agent.vm, private_key: agent.privateKey }]).receipt_id)
const receipt = createReceiptV1({ profile: 'aps-receipt-v1', receipt_type: 'aps:action-intent:v1', issuer: agent.id, subject_agent: agent.id, action_ref: 'a'.repeat(64), delegation_ref: grant.delegation_id, issued_at: '2026-10-28T10:00:00.000Z', evidence_refs: [], result: { profile: 'aps-action-intent-result-v1', status: 'declared' } }, [{ signer: agent.id, key_id: agent.vm, private_key: agent.privateKey }])
await probe('verifyReceiptV1, key not found', () => { const r = verifyReceiptV1(receipt, () => undefined); return { status: r.status, signer_authority: r.signer_authority, errors: r.errors.length } })
await probe('verifyReceiptV1, resolver unreachable', () => { const r = verifyReceiptV1(receipt, () => ({ outcome: 'unreachable' })); return { status: r.status, signer_authority: r.signer_authority } })
await probe('verifyReceiptV1Serialized, duplicate member', () => { const raw = JSON.stringify(receipt).replace('{"profile"', '{"profile":"x","profile"'); const r = verifyReceiptV1Serialized(raw, () => undefined); return { status: r.status, errors: r.errors.slice(0, 1) } })
await probe('verifyApsMcpAuthorizationV1, junk', () => verifyApsMcpAuthorizationV1({}, { mcp_server: 'https://notes.example', tool_name: 't', arguments: {}, resolve_key: () => ({ state: 'not_found' }) }))
await probe('proveContributions', () => proveContributions(/** @type {any} */ (null), [], [], 'x'))
await probe('commercePreflight', () => commercePreflight(/** @type {any} */ ({})))
