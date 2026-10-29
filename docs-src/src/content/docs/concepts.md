---
title: Core concepts
description: Identity, delegation, enforcement, commerce and reputation in APS, what each one establishes, and the status label of each.
---

A login authorizes a session. APS records a grant of authority for specific actions, under explicit limits, from a named principal to a named agent, and records what a boundary decided about each action. Authority can only narrow when it is passed on.

## Identity

Status: [Canonical](/docs/evidence/#status-labels).

An agent identity is an Ed25519 key pair. A passport is a document the agent signs with that key. A self-signed passport shows that its holder has the key, and nothing more. A verifier that needs more checks for a countersignature from an issuer it already trusts.

A passport names an owner, but that name is the agent's own statement. Tying an agent to a person or company takes separate evidence from the principal, checked against the principal's key.

The SDK also carries identifiers in other schemes, including `did:key`, `did:web`, SPIFFE SVIDs and OAuth identity assertions, through adapters. Parsing or carrying such an identifier is a separate step from resolving its key and deciding to trust it for a given authorization. See [Identity and principal binding](/docs/identity/).

## Delegation

Status: [Canonical](/docs/evidence/#status-labels).

The current delegation record is `AuthorityDelegationV1` (`record_type` `aps:authority-delegation:v1`). It carries seven facets: scope, spend, depth, time, reputation, values and reversibility. A child grant must be equal to or narrower than its parent on every facet, its issuer must be the parent's subject, and it names its parent by content address. A verifier checks the full chain with an explicit clock, a key resolver, a root trust policy and a revocation resolver, and returns `valid`, `invalid`, `indeterminate` or `unsupported`. A revocation status it cannot establish gives `indeterminate`, never `valid`.

Revoking a grant makes every chain that contains it fail verification, including the chains of its descendants. A verifier sees that only if its revocation source holds the revocation record. See [Authority and revocation](/docs/authority/).

The older `Delegation` format, produced by `createDelegation` and the social contract `delegate` function, is a pre-draft compatibility format. Its scope matching differs from the current record: a bare legacy grant `p` covers `p:x`, while the current profile requires `p:*` for that.

## Enforcement

Status: [Canonical](/docs/evidence/#status-labels).

`evaluateIntent` returns a signed policy decision for a signed action intent. The agent signs the intent, the policy engine signs the decision, and the result is signed as a receipt. That sequence records what was checked. It does not stop a call that never goes through it.

An action is gated only when it is routed through an enforcement boundary that holds the credentials the resource needs, checks the authority before dispatch, and refuses to call the resource when the check fails. An agent that holds its own credentials for the resource can call it directly, and no signature ordering prevents that. Placing the boundary, and keeping resource credentials away from the agent, is a deployment decision.

## Commerce

Status: [Production-Extension](/docs/evidence/#status-labels).

The SDK exports gate predicates for payments: `checkPassportGate`, `checkScopeGate`, `checkSpendGate`, `checkMerchantGate` and `checkWalletGate`, with `signCommerceReceipt`. The combined `commercePreflight` orchestrator throws a migration error in 8.0.1.

## Reputation

Status: [Production-Extension](/docs/evidence/#status-labels).

Bayesian trust scoring across five tiers. Reputation is tracked per scope, and a reputation ceiling is one of the seven delegation facets.
