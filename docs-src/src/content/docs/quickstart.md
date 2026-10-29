---
title: Quickstart
description: One governed action with agent-passport-system 8.0.1. A signed AuthorityDelegationV1 grant, an enforcement boundary that holds the resource, ReceiptV1 records, and refusals for out of scope, over budget, replayed, unknown status and revoked requests.
---

This page builds one governed action with the current wire format: an `AuthorityDelegationV1` grant, an `AuthorityRevocationV1` revocation and `ReceiptV1` records. Everything runs locally and deterministically, with fixed key seeds, fixed nonces and an explicit clock. Fixed seeds are for the example only.

The complete source is in `docs-src/examples/governed-action/` in the [aps-web repository](https://github.com/agent-passport-system/aps-web). Its `package.json` pins `agent-passport-system` 8.0.1, and `npm test` asserts every outcome below. Every output on this page is pasted from `npm start`.

## Run it

```bash
cd docs-src/examples/governed-action
npm install
npm start
npm test
```

`npm test` runs the assertions and then typechecks the JavaScript against the package's declarations. With `NODE_ENV=production` set in the shell, npm skips the dev dependencies and the typecheck step fails. Run the install with `NODE_ENV` unset.

## The parts

- A **principal**, `did:example:principal`, who grants authority.
- An **agent**, `did:example:agent`, who asks to read a note.
- An **enforcement boundary**, `did:example:boundary`. It is the only code holding the resource handler, so a call it refuses never reaches the resource.
- A **trust directory**, a **key resolver** that picks the key by the artifact's own `issued_at`, and a **root trust policy** that accepts roots signed by the principal's key.
- A **revocation status source** that answers only for delegations it tracks.
- An **explicit clock** that every check reads.

Excerpt from `governed-action.mjs`, not runnable on its own:

```js
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
```

## The grant

The principal signs one `AuthorityDelegationV1` that covers every note under `notes:read`, with a bounded spend of 5 per action and 10 in total, no further delegation, and an eight hour window. The signed record printed by `npm start`:

```json
{
  "record_type": "aps:authority-delegation:v1",
  "version": "1.0",
  "parent_delegation_id": null,
  "issuer": "did:example:principal",
  "subject": "did:example:agent",
  "verification_method": "did:example:principal#key-1",
  "issued_at": "2026-10-28T09:00:00.000Z",
  "nonce": "00000000000000000000000000000001",
  "authority": {
    "scope": {
      "profile": "aps-hierarchical-v1",
      "grants": [
        "notes:read:*"
      ]
    },
    "spend": {
      "mode": "bounded",
      "unit": "example:credit",
      "per_action": "5",
      "cumulative": "10"
    },
    "depth": {
      "remaining": 0
    },
    "time": {
      "not_before": "2026-10-28T09:00:00.000Z",
      "not_after": "2026-10-28T17:00:00.000Z"
    },
    "reputation": {
      "profile": "aps-score-0-100-v1",
      "ceiling": 100
    },
    "values": {
      "profile": "aps-values-identifiers-v1",
      "required": []
    },
    "reversibility": {
      "profile": "aps-tci-v1",
      "ceiling": "compensable"
    }
  },
  "delegation_id": "sha256:7123e7d656ef4ed367c27f49e089d7c64df307c6780bd9577014f7426ae1529f",
  "signature": "4deea9077d843259694a1e19d64c38688f51fc2f9d717b87710b278047a1e1e43f828c4ecf7f5dc0039ecf9a0022a7037207bec52cb6e15d3d7583ac157b910a"
}
```

`delegation_id` is a content address over the body. The signature is Ed25519 over the record without its signature. All seven facets are present in every record: scope, spend, depth, time, reputation, values and reversibility.

## The boundary

The boundary runs these checks for every request, in this order. It refuses at the first one that fails:

1. The action-intent receipt is signed by the acting agent and its `action_ref` matches the action the agent presented.
2. The `action_ref` has not been dispatched before.
3. The whole chain verifies at the boundary's clock: shape, content address, signature through the key resolver, root trust, time window and revocation status of every member.
4. Every scope the action requires is covered by a grant in the leaf delegation.
5. The ledger reserves the cost against every bounded grant in the chain.

Excerpt from `governed-action.mjs`, not runnable on its own:

```js
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
```

Only after a permit does the boundary claim the action, call the resource and commit the spend:

```js
  // 7. Claim the action before dispatch, so a second copy cannot also be dispatched.
  consumedActions.add(actionRef)
  ledger.markDispatched(actionRef)
  const output = resource.read(action.target)
  ledger.commit(actionRef)
```

That excerpt is not runnable on its own either.

## The cases

`npm start` prints one line per case:

```text
{"case":"allowed","outcome":"dispatched","reason":null,"chain_state":"valid","resource_called":true,"receipts":["aps:policy-decision:v1","aps:action-result:v1"],"audit":{"decision":"valid","decision_ref_bound":true,"boundary":"verified","result":"valid","predecessor_bound":true}}
{"case":"out_of_scope","outcome":"refused","reason":"SCOPE_NOT_GRANTED","chain_state":"valid","resource_called":false,"receipts":["aps:policy-decision:v1"],"audit":{"decision":"valid","decision_ref_bound":true,"boundary":"verified"}}
{"case":"over_budget","outcome":"refused","reason":"PER_ACTION_EXCEEDED","chain_state":"valid","resource_called":false,"receipts":["aps:policy-decision:v1"],"audit":{"decision":"valid","decision_ref_bound":true,"boundary":"verified"}}
{"case":"replay","outcome":"refused","reason":"REPLAYED","chain_state":"not_evaluated","resource_called":false,"receipts":[],"audit":null}
{"case":"unknown_status","outcome":"refused","reason":"REVOCATION_UNKNOWN","chain_state":"indeterminate","resource_called":false,"receipts":["aps:policy-decision:v1"],"audit":{"decision":"valid","decision_ref_bound":true,"boundary":"verified"}}
{"case":"revoked","outcome":"refused","reason":"REVOKED","chain_state":"invalid","resource_called":false,"receipts":["aps:policy-decision:v1"],"audit":{"decision":"valid","decision_ref_bound":true,"boundary":"verified"}}
```

| Case | What the agent asked | Result |
| --- | --- | --- |
| `allowed` | Read `notes:read:project-x` at cost 3 | Permit. The resource ran once. The decision and result receipts verify |
| `out_of_scope` | `notes:write:project-x` | Refused with `SCOPE_NOT_GRANTED`. The chain itself is `valid` |
| `over_budget` | Cost 8, above `per_action` 5 | Refused by the ledger with `PER_ACTION_EXCEEDED` |
| `replay` | The same signed request as `allowed`, sent again | Refused with `REPLAYED` before any evaluation, so no receipt is signed |
| `unknown_status` | A grant the status source never tracked | Chain `indeterminate`, `REVOCATION_UNKNOWN`. Refused |
| `revoked` | A new request after the principal revoked the grant | Chain `invalid`, `REVOKED`. Refused |

Every refused case has `"resource_called":false`. The program ends with:

```text
ledger counter for the grant: {"reserved":"0","committed":"3"}
resource calls: 1
```

The ledger committed only the allowed cost, and the resource ran once.

## The revocation

The principal signs an `AuthorityRevocationV1` naming the grant. `recordAuthorityRevocation` verifies it against the grant before the status source stores it. The record printed by `npm start`, with the store's answer:

```json
{
  "revocation": {
    "record_type": "aps:authority-revocation:v1",
    "version": "1.0",
    "delegation_id": "sha256:7123e7d656ef4ed367c27f49e089d7c64df307c6780bd9577014f7426ae1529f",
    "revoker": "did:example:principal",
    "verification_method": "did:example:principal#key-1",
    "revoked_at": "2026-10-28T10:05:00.000Z",
    "reason_code": "task_complete",
    "nonce": "000000000000000000000000000000aa",
    "cascade_transaction_id": "sha256:0259b1d6c580eb5a456dc519ce9d49dd464278bb92640ea764913060351cf519",
    "revocation_id": "sha256:f38896bfce5f378fd2711ee77a73d023960b8f1139b2e2289e733505613c3581",
    "signature": "eb486a329334ee511e97eb35711374cda534f63fbc70791fe54c63862352fbf0f695db83d18031c657dca343f1684b2628a45c0333fe4bd18d0681320ee0cf0f"
  },
  "recorded": true,
  "inserted": true,
  "state": "valid"
}
```

After that, every chain that contains the grant verifies `invalid` with `REVOKED`, at any boundary whose status source holds this record. A boundary whose source has not seen it gets `REVOCATION_UNKNOWN` and must refuse, as in the `unknown_status` case.

## Who owns what

- **Replay claims** belong to the boundary. Here they are a `Set` of dispatched `action_ref` values in process memory, written before the resource is called. A deployment needs a durable store where the check and the write are one atomic operation, or two copies of a request can both be dispatched.
- **Spend reservations** belong to the boundary. `InMemoryAuthorityBudgetLedger` reserves against every bounded grant in the chain in one synchronous step, which holds for one JavaScript process only. Several processes need a shared store with the same atomicity.
- **Revocation status** comes from the status source the boundary consults. `InMemoryAuthorityRevocationStore` is lost on restart, and an unknown status is never treated as active.
- **Keys and root trust** come from the deployment's trust directory and trust policy, not from the records.

## What the verifiers establish

`verifyAuthorityDelegationChain` returns `valid` when every check it runs passes. It does not decide whether this particular action may run, and it reserves nothing. Scope coverage, the replay claim and the spend reservation are the boundary's steps 2, 4 and 5 above.

`verifyReceiptWithDecisionV1`, used in the `audit` fields above, checks a receipt's signature through the key resolver, its stage rules, that its `decision_ref` recomputes from the decision evidence, and, when asked, that the result names its decision receipt as `prev`. With `boundaryIdentity` it also checks the issuer is the boundary the relying party expects. It does not authorize dispatch, consume a receipt, enforce single use, recheck revocation or time, or reserve spend. A valid result says the records are intact and bound to each other. It is not permission to act.

In this example a refused request still gets a signed policy-decision receipt with `"verdict":"deny"`, except a replay, which the boundary refuses before evaluating anything. Signing denials is a choice of this boundary.

## Next

- The [API reference](/docs/api/) for the functions used here.
- [Compatibility: social contract API](/docs/compatibility/) for the older `Delegation` and `ActionReceipt` formats.
- The [MCP server](/docs/mcp-server/) page for the same issue, check and revoke steps as MCP tools.
