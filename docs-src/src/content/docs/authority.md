---
title: Authority and revocation
description: The AuthorityDelegationV1 wire record, its seven facets and how a child narrows them, chain verification and its four results, cumulative spend, and AuthorityRevocationV1.
---

This page describes `AuthorityDelegationV1` as specified in `draft-pidlisnyi-aps-04` section 4 and as implemented by `agent-passport-system` 8.0.1 and the Python SDK 4.3.0. Every function named here is a root export of the npm package. None is in `agent-passport-system/core`.

## The wire record

| Member | Rule |
| --- | --- |
| `record_type` | `"aps:authority-delegation:v1"` |
| `version` | `"1.0"`. A record that names the v1 type with another version is `unsupported` and is not judged by the v1 schema |
| `delegation_id` | `"sha256:"` and 64 lowercase hex characters, the content address of the record without `delegation_id` and `signature`. See [Signed bytes](/docs/signed-bytes/) |
| `parent_delegation_id` | `null` only for a root that the verifier's trust policy accepts. Otherwise the parent's `delegation_id` |
| `issuer` | Identifier of the party that signs. For a child, the parent's `subject` |
| `subject` | Identifier of the party that receives the authority |
| `verification_method` | Which of the issuer's keys signed. The verifier resolves it for `issuer` at `issued_at` |
| `issued_at` | Exact UTC milliseconds, `YYYY-MM-DDTHH:MM:SS.sssZ`, seconds 00 to 59. The value 60 is rejected |
| `nonce` | 16 random bytes as 32 lowercase hex characters |
| `authority` | Exactly the seven facets below. A missing facet is invalid |
| `signature` | Raw Ed25519 signature as 128 lowercase hex characters |

The schema is closed: a member not in this table makes the record invalid. The [Quickstart](/docs/quickstart/) prints a complete signed record.

## The seven facets

A child is no wider than its parent only when every comparison below holds. A facet whose profile differs between parent and child is `unsupported`, never narrower.

| Facet | Shape | A child must |
| --- | --- | --- |
| `scope` | `{ "profile": "aps-hierarchical-v1", "grants": [...] }` | Have every grant covered by a parent grant. Grants are ASCII colon separated segments. `*` covers everything, and a wildcard is otherwise allowed only as a terminal `:*`. An exact grant covers itself. `p:*` covers `p` and every grant starting `p:`. Arrays are sorted by UTF-8 bytes, unique and irredundant |
| `spend` | `{ "mode": "unbounded" }` or `{ "mode": "bounded", "unit", "per_action", "cumulative" }` | Under a bounded parent, use the same unit and no greater limits. Amounts are unsigned decimal strings, and `per_action` is never above `cumulative`. A bounded child under an unbounded parent is narrower. An unbounded child under a bounded parent is invalid. There is no unit conversion |
| `depth` | `{ "remaining": 0..255 }` | Have `remaining` at most the parent's minus one. A parent with 0 cannot issue a child |
| `time` | `{ "not_before", "not_after" }`, a half open interval | Lie inside the parent interval, start no earlier than its own `issued_at`, and be issued while the parent is valid |
| `reputation` | `{ "profile": "aps-score-0-100-v1", "ceiling": 0..100 }` | Have a ceiling no higher than the parent's |
| `values` | `{ "profile": "aps-values-identifiers-v1", "required": [...] }` | Contain every identifier the parent requires, and may add more. This preserves requirements. It does not show the subject complies with them |
| `reversibility` | `{ "profile": "aps-tci-v1", "ceiling": "tentative" \| "compensable" \| "irreversible" }` | Keep a ceiling no wider, in the order tentative, compensable, irreversible |

The bare legacy scope rule is different: in the compatibility `Delegation` format, a grant `p` covers `p:x`. In this profile `scopeGrantCovers('p', 'p:x')` is `false` and `scopeGrantCovers('p:*', 'p:x')` is `true`.

## Issuing

- `issueAuthorityDelegation(body, privateKey)` signs a root. It refuses a body whose `parent_delegation_id` is not `null`, or that already carries `delegation_id` or `signature`.
- `issueSubAuthorityDelegation(parent, body, privateKey, { now, resolveVerificationKey, resolveRevocation })` signs a child. Before signing it checks the parent's shape and content address, resolves the parent issuer's key and verifies its signature, checks the parent is valid at `now` and that its revocation status is exactly `active`, then checks parent link, issuer continuity, issuance time and all seven facet comparisons. It throws on the first failure, with the failure code in the message.

Python 4.3.0 has the same two functions in `agent_passport.v2.authority_delegation` as `issue_authority_delegation` and `issue_sub_authority_delegation`. Its issuer fills in a missing `nonce` with 16 random bytes, where the TypeScript issuer requires one.

## Verifying a chain

`verifyAuthorityDelegationChain(chain, { now, resolveVerificationKey, trustRoot, resolveRevocation })` takes a root to leaf array and never throws. `verifyAuthorityDelegation(record, options)` is the same check on a chain of one.

- `now` is the verification time, in the same exact millisecond form. The verifier reads no clock of its own.
- `resolveVerificationKey(issuer, verificationMethod, issuedAt)` returns the 64 hex character Ed25519 key, or `{ outcome }` with one of `not_found`, `ambiguous`, `malformed`, `unreachable` or `unsupported_scheme`. It is called with the record's own `issued_at`, so it can select the key that was valid when the record was signed.
- `trustRoot(root)` returns `true` to accept the root. A valid self-issued root is not trusted automatically.
- `resolveRevocation(delegation)` returns `active`, `revoked` or `unknown`.

The checks run phase by phase over the whole chain, in this order: closed schema and canonical values, `delegation_id`, key resolution and signature, duplicate identifiers, root trust, parent links, issuer to subject continuity, child issuance time, the seven facet comparisons, current validity, and revocation of every member. The first phase in which any member fails decides the result, at the lowest failing index.

| Result | When | Example codes in 8.0.1 |
| --- | --- | --- |
| `valid` | Every check passed | none |
| `invalid` | A cryptographic, structural, attenuation, time or revocation failure, or a root the trust policy rejects | `SIGNATURE_INVALID`, `ID_MISMATCH`, `ROOT_UNTRUSTED`, `SCOPE_WIDENING`, `EXPIRED`, `NOT_YET_VALID`, `REVOKED` |
| `indeterminate` | A fact could not be established: unknown revocation status, a key that could not be resolved, or a trust policy that could not decide | `REVOCATION_UNKNOWN`, `KEY_NOT_FOUND`, `KEY_UNREACHABLE`, `KEY_AMBIGUOUS`, `ROOT_UNTRUSTED` |
| `unsupported` | A version, record type or facet profile this verifier does not implement, or a key scheme it cannot use | `UNSUPPORTED_VERSION`, `UNSUPPORTED_PROFILE`, `KEY_SCHEME_UNSUPPORTED` |

A caller must not treat `indeterminate` or `unsupported` as `valid`. The draft defines the four results and no failure code vocabulary. The codes in the table are this SDK's own. `ROOT_UNTRUSTED` appears twice because a policy that returns `false` gives `invalid`, while a policy that is missing, throws or returns a non-boolean gives `indeterminate`.

A `valid` chain is admissible authority at `now`. The verifier does not check that the chain covers a particular action, and it reserves no spend. The [Quickstart](/docs/quickstart/) shows the boundary steps that do.

### Example

This program issues a root with depth 1, narrows it for a sub-agent, has the issuer refuse a wider child, verifies the chain, then revokes the root. It is `chain.mjs` in `docs-src/examples/governed-action/`, run with Node.js against 8.0.1:

```js
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
```

```text
widening child refused: authority delegation does not narrow (SCOPE_WIDENING)
chain at 10:00: {"state":"valid","failures":[]}
chain at 10:10, root revoked: {"state":"invalid","failures":[{"code":"REVOKED","index":0}]}
```

The child carries no revocation record of its own. Its chain fails because the verifier's revocation source holds the root's revocation and checks every member.

## One chain per action

Each action is checked against one selected root to leaf chain. A verifier must not combine scopes or budgets from separate chains to assemble authority that no single chain grants. Composition across principals needs a separate profile. The SDK's `selectChainForAction` evaluates the chains an agent holds in order and selects the first one that verifies `valid` and covers every scope the action needs. Spend is then reserved against that chain only. The draft does not state a selection rule, so this order is the SDK's own.

## Cumulative spend

The signed `cumulative` value is a ceiling for the whole subtree under that delegation, not an amount reserved for each child. Before dispatching an action of amount q, the boundary checks, in one atomic step over every bounded delegation in the chain, that the unit matches, that q is within each `per_action`, and that committed plus reserved plus q is within each `cumulative`. It reserves q against all of them or none.

`InMemoryAuthorityBudgetLedger` does this in one JavaScript process. Its `reserve(chain, actionRef, unit, amount)` is keyed by `action_ref`: an identical retry returns `IDEMPOTENT`, and the same `action_ref` with a different unit, amount or chain returns `CONFLICT`. `markDispatched`, `commit` and `cancel` move a reservation on, and `cancel` works only before dispatch. A deployment with several processes needs one linearizable ledger. Without one, the current spend total is not established.

## Revocation

Only the issuer of a delegation may revoke it, and revocation is irreversible. The SDK's revocation record is `AuthorityRevocationV1`, the format of draft section 4.5.2. In draft -04 that format is a Candidate feature: the draft requires revocation behavior of every verifier, and this particular record format only of an implementation that claims it.

| Member | Rule |
| --- | --- |
| `record_type`, `version` | `"aps:authority-revocation:v1"`, `"1.0"` |
| `delegation_id` | The revoked delegation |
| `revoker` | Equal to that delegation's `issuer` |
| `verification_method` | Resolved for the delegation's issuer at `revoked_at` |
| `revoked_at` | Exact UTC milliseconds, supplied by the caller |
| `reason_code` | Non-empty string. The draft fixes no vocabulary |
| `detail` | Optional. Absent rather than `null` when not given |
| `cascade_transaction_id` | Content-bound identity shared by every record one cascade produces |
| `nonce` | 32 lowercase hex characters |
| `revocation_id`, `signature` | Content address and Ed25519 signature, as for the delegation |

- `issueAuthorityRevocation(delegation, { now, revoker, verification_method, reason_code, detail?, nonce }, privateKey)` signs one.
- `recordAuthorityRevocation(store, delegation, candidate, { resolveVerificationKey })` verifies the candidate against the delegation and only then stores it. The first verified revocation for a delegation wins, and a later one leaves the stored record unchanged.
- `createAuthorityRevocationResolver(store, { resolveVerificationKey })` returns the `resolveRevocation` function the chain verifier needs. It answers `revoked` only for a stored record that verifies against the delegation, `active` only when the store tracks the delegation and holds no revocation for it, and `unknown` for everything else, including a store that has never seen the delegation.
- `InMemoryAuthorityRevocationStore` keeps both the tracked set and the records in process memory. Its `track(delegationId)` brings a delegation into its view. A durable store must make the first write one atomic conditional insert keyed by `delegation_id`.

A revocation takes effect for a verifier once that verifier's revocation source has it. Nothing makes it take effect for every verifier at the same moment. Until then, a verifier whose source cannot answer reports `indeterminate`. The draft also requires the enforcement boundary to recheck revocation when it consumes an approval to dispatch, not only when the decision was issued.

A revoked grant, an expired grant and a rotated key are different states. Key rotation does not revoke a delegation, and expiry does not create a revocation record.

## What this does not cover

Activation conditions, suspension, purpose bounds, authority epochs and succession are in draft sections 8 and 9. Several of them are Candidate features that an implementation only has to support when it claims them. See [Status and conformance](/docs/status/).
