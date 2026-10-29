---
title: API reference
description: Parameters and return types for the social contract functions and the intent architecture functions of the TypeScript SDK.
---

This page covers the social contract and intent functions of `agent-passport-system` 8.0.1. They produce the compatibility `Delegation` and camelCase `ActionReceipt` formats. `proveContributions` is listed for completeness and throws in 8.0.1.

## Exports

```typescript
import {
  joinSocialContract,
  verifySocialContract,
  delegate,
  recordWork,
  proveContributions,
  auditCompliance
} from 'agent-passport-system'
```

## joinSocialContract

`joinSocialContract(options)` returns `SocialContractAgent`.

Creates a new agent identity with Ed25519 keypair, optional values attestation, and optional beneficiary registration.

Parameters:

- `name: string`: agent display name
- `mission: string`: what this agent does
- `owner: string`: human owner alias
- `capabilities: string[]`: what the agent can do (for example `'code_execution'`, `'web_search'`, `'email'`, `'file_access'`)
- `platform: string`: runtime platform (for example `'node'`, `'python'`, `'browser'`)
- `models: string[]`: LLM models used (for example `'claude-sonnet'`, `'gpt-4o'`)
- `floor?: ValuesFloor | string`: optional values floor to attest to (YAML string or parsed object)
- `floorExtensions?: string[]`: optional additional principles beyond the floor
- `beneficiary?: { id: string, relationship: 'creator' | 'employer' | 'delegator' | 'owner' }`

Returns `SocialContractAgent`:

- `passport: SignedPassport`: Ed25519 signed identity document
- `keyPair: KeyPair`: `{ publicKey: string, privateKey: string }`
- `attestation: FloorAttestation | null`: values attestation if floor was provided
- `agentId: string`: unique agent identifier
- `publicKey: string`: Ed25519 public key (hex encoded)

## verifySocialContract

`verifySocialContract(passport, attestation?, opts?)` returns `TrustVerification`.

Checks a passport's signature and validity window, an optional values attestation, and optionally an issuer countersignature.

Parameters:

- `passport: SignedPassport`: the agent's signed passport
- `attestation?: FloorAttestation | null`: optional values attestation
- `opts?: { trustedIssuers?: string[] }`: issuer public keys the caller trusts. Without it no issuer check runs

Returns `TrustVerification`:

- `structurallyValid: boolean`: the passport signature, its validity window and the attestation (when supplied) check out. A self-signed passport passes
- `issuerChecked: boolean`: a usable `trustedIssuers` list was supplied, so an issuer check ran
- `issuerTrusted: boolean`: one of the supplied issuers countersigned the passport. Always false when no issuer check ran
- `issuerErrors: string[]`: why the issuer check failed, when one ran
- `identity: { valid: boolean, errors: string[], warnings: string[] }`
- `values: { attested: boolean, valid: boolean, errors: string[] } | null`
- `overall: boolean`: deprecated, and reading it prints a `DeprecationWarning`. It equals `structurallyValid && (!issuerChecked || issuerTrusted)`, so without `trustedIssuers` it only means the bytes check out

None of these fields authorizes an action. An issuer countersignature is added with `countersignPassport(signedPassport, issuerPrivateKey, issuerId?)`.

## delegate

`delegate(options)` returns `Delegation`.

Creates a scoped delegation granting authority to another agent.

Parameters:

- `from: SocialContractAgent`: the delegator, an object returned by `joinSocialContract`
- `toPublicKey: string`: public key of the delegate
- `scope: string[]`: what capabilities to delegate
- `spendLimit?: number`: maximum spend allowed
- `maxDepth?: number`: how deep sub-delegation can go (default: 1)
- `expiresInHours?: number`: delegation lifetime (default: 24)

Returns `Delegation`:

- `delegationId: string`
- `delegatedTo`, `delegatedBy: string` (public keys)
- `scope: string[]`
- `spendLimit: number | undefined`
- `maxDepth: number`
- `expiresAt: string` (ISO timestamp)
- `signature: string` (Ed25519)

## recordWork

`recordWork(agent, delegation, chain, work)` returns `ActionReceipt`.

Records a unit of work under a delegation.

Parameters:

- `agent: SocialContractAgent`: the agent doing the work
- `delegation: Delegation`: the delegation authorizing this work
- `delegationChain: string[]`: array of public keys in the delegation chain
- `work: { type: string, target: string, scope: string, spend?: number, currency?: string, result: 'success' | 'failure' | 'partial', summary: string }`

Returns `ActionReceipt`:

- `receiptId: string`
- `agentId`, `delegationId: string`
- `action: { type, target, scopeUsed, spend? }`
- `result: { status, summary }`
- `delegationChain: string[]`
- `timestamp`, `signature: string`

## proveContributions

`proveContributions(agent, receipts, delegations, beneficiary, beneficiaryMap?)` is declared to return `ContributionProof`.

Throws in 8.0.1 with `Moved to @aeoess/gateway. See MIGRATION.md#attribution-reports`. The signature is kept, so a typecheck passes and the call fails at run time. The declared return type is:

- `attribution: AttributionReport`: weighted attribution across scopes
- `merkleRoot: string`: 32-byte SHA-256 commitment to all receipts
- `proofs: Map<string, MerkleProof>`: per-receipt inclusion proofs
- `traces: BeneficiaryTrace[]`: delegation chain back to human for each receipt

## auditCompliance

`auditCompliance(agentId, receipts, floor, delegations, verifierKeyPair)` returns `ComplianceReport`.

Audits an agent's compliance against the Values Floor. The auditor signs the report.

Parameters:

- `agentId: string`
- `receipts: ActionReceipt[]`
- `floor: ValuesFloor`: for example `loadFloor(yamlText)`
- `delegations: Map<string, { scope: string[], revoked: boolean }>`: keyed by delegation ID
- `verifierKeyPair: KeyPair`: the auditor's keys, used to sign the report

Returns `ComplianceReport` with principle-by-principle enforcement status and overall compliance percentage.

## Layer 5: intent architecture

### assignRole

`assignRole(options)` returns `RoleAssignment`.

Assigns a role to a passport-verified agent. Throws if passport verification fails, and it fails for a self-signed passport unless one of the two trust options below is set.

Parameters:

- `signedPassport: SignedPassport`: agent's verified passport (required)
- `role: 'operator' | 'collaborator' | 'consultant' | 'observer'`
- `autonomyLevel`: 1 to 5 (1 is fully supervised, 5 is fully autonomous)
- `department?: string`: organizational department
- `scope: string[]`: what the agent can do in this role
- `assignerPrivateKey: string`: key of the human or agent assigning the role. For a `SocialContractAgent` this is `keyPair.privateKey`
- `assignerPublicKey: string`
- `trustedIssuers?: string[]`: issuer keys whose countersignature authorizes the assignment
- `allowSelfSigned?: boolean`: accept a passport nobody countersigned. Off by default. The role then rests on the agent's own claim

Returns `RoleAssignment` with `agentId`, `role`, `autonomyLevel`, `scope`, and Ed25519 signature.

### createTradeoffRule

`createTradeoffRule(options)` returns `TradeoffRule`.

Creates a quantified tradeoff rule for machine-readable organizational intent.

Parameters:

- `when: string`: the conflict (for example `"quality vs speed"`)
- `prefer: string`: default preference (for example `"quality"`)
- `until: string`: threshold (for example `"2x time cost"`)
- `thenPrefer: string`: preference after threshold (for example `"speed"`)
- `context?: string`: optional context

Returns `TradeoffRule` with `ruleId`, `when`, `prefer`, `until`, `thenPrefer`.

### evaluateTradeoff

`evaluateTradeoff(rule, thresholdExceeded)` returns `TradeoffEvaluation`.

Evaluates a tradeoff rule at runtime given whether the threshold was exceeded.

Parameters:

- `rule: TradeoffRule`
- `thresholdExceeded: boolean`

Returns `TradeoffEvaluation`: `{ ruleId, winner, thresholdExceeded, reasoning }`

### createIntentDocument

`createIntentDocument(options)` returns `IntentDocument`.

Creates a signed machine-readable intent document. Throws if `tradeoffHierarchy` is empty.

Parameters:

- `title: string`
- `authorPublicKey: string`
- `authorPrivateKey: string`
- `department?: string`
- `goals: IntentGoal[]`: array of `{ goalId: string, description: string, priority: number, metrics?: string[], constraints?: string[] }`. Priority 1 is highest
- `tradeoffHierarchy: TradeoffRule[]`: must be non-empty
- `expiresAt?: string`

Returns signed `IntentDocument` with `intentId`, `goals`, `tradeoffHierarchy`.

### createDeliberation

`createDeliberation(options)` returns `Deliberation`.

Starts a new deliberation for multi-agent consensus.

Parameters:

- `subject: string`
- `description: string`
- `initiatedBy: string`: agentId of initiator
- `convergenceThreshold?: number`: standard deviation threshold (default: 8)
- `maxRounds?: number`: max rounds before escalation (default: 5)
- `reversibilityScore: number`: 0 to 1, how reversible is this decision

Returns `Deliberation` with `deliberationId`, status `'active'`, empty rounds array.

### submitConsensusRound

`submitConsensusRound(deliberation, options)` returns `{ deliberation, round }`.

Submits a scored assessment from one agent. Calculates weighted overall score and position delta from previous rounds.

Parameters:

- `deliberation: Deliberation`
- `agentId: string`
- `publicKey`, `privateKey: string`
- `role: AgentRole`
- `department?: string`
- `assessment: DomainAssessment[]`: array of `{ domain, score, confidence, weight }`
- `reasoning: string`

Returns updated deliberation and the signed `ConsensusRound`.

### evaluateConsensus

`evaluateConsensus(deliberation)` returns `ConsensusEvaluation`.

Checks if agents have converged on a decision. With fewer than two assessments in the latest round it returns `converged: false` and `recommendation: 'continue'`.

Returns: `{ converged: boolean, standardDeviation: number, roundNumber: number, agentCount: number, recommendation: 'continue' | 'converged' | 'escalate' }`

### resolveDeliberation

`resolveDeliberation(deliberation, options)` returns `{ deliberation, outcome, precedent }`.

Resolves a deliberation, producing a signed outcome and a citable precedent.

Parameters:

- `deliberation: Deliberation`
- `decision: string`
- `votesFor`, `votesAgainst`, `abstained: string[]`: agent IDs
- `escalatedTo?: string`
- `resolverPrivateKey: string`
- `resolverAgentId: string`

Returns updated deliberation (status changed), signed `DeliberationOutcome`, and `Precedent`.

### getPrecedentsByTopic

`getPrecedentsByTopic(precedents, topic)` returns `Precedent[]`.

Filters precedents by topic string match (subject, context, or decision). Sorted by `citedCount` descending.

### citePrecedent

`citePrecedent(precedent)` returns `Precedent`.

Increments a precedent's `citedCount` by 1.

### createIntentPassportExtension

`createIntentPassportExtension(options)` returns `IntentPassportExtension`.

Creates the bridge between Layer 1 identity and Layer 5 governance.

Parameters:

- `role: AgentRole`
- `autonomyLevel: AutonomyLevel`
- `department?: string`
- `activeIntents: string[]`: intent document IDs
- `tradeoffHierarchyHash: string`

Returns `IntentPassportExtension` with role, autonomy, deliberation and precedent counters.

## Full reference

[llms-full.txt](https://agent-passport.org/llms-full.txt) describes the wider module surface in prose. It is not a typed reference, and the package's own declarations under `dist/src/index.d.ts` are the source of truth for signatures.
