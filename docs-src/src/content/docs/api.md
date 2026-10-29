---
title: API reference
description: Parameters and return types for the social contract functions and the intent architecture functions of the TypeScript SDK.
---

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

`verifySocialContract(passport, attestation?)` returns `TrustVerification`.

Verifies another agent's identity and values standing.

Parameters:

- `passport: SignedPassport`: the agent's signed passport
- `attestation?: FloorAttestation | null`: optional values attestation

Returns `TrustVerification`:

- `identity: { valid: boolean, errors: string[] }`
- `values: { attested: boolean, valid: boolean, errors: string[] } | null`
- `overall: boolean`: true if identity is valid AND values are valid (if provided)

## delegate

`delegate(options)` returns `Delegation`.

Creates a scoped delegation granting authority to another agent.

Parameters:

- `from: SocialContractAgent`: the delegator
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

`proveContributions(agent, receipts, delegations, beneficiary, beneficiaryMap?)` returns `ContributionProof`.

Generates cryptographic proof of an agent's contributions with Merkle trees.

Returns `ContributionProof`:

- `attribution: AttributionReport`: weighted attribution across scopes
- `merkleRoot: string`: 32-byte SHA-256 commitment to all receipts
- `proofs: Map<string, MerkleProof>`: per-receipt inclusion proofs
- `traces: BeneficiaryTrace[]`: delegation chain back to human for each receipt

## auditCompliance

`auditCompliance(agentId, receipts, floor, delegations, verifierKeys)` returns `ComplianceReport`.

Audits an agent's compliance against the Values Floor. The auditor signs the report.

Returns `ComplianceReport` with principle-by-principle enforcement status and overall compliance percentage.

## Layer 5: intent architecture

### assignRole

`assignRole(options)` returns `RoleAssignment`.

Assigns a role to a passport-verified agent. Throws if passport verification fails.

Parameters:

- `signedPassport: SignedPassport`: agent's verified passport (required)
- `role: 'operator' | 'collaborator' | 'consultant' | 'observer'`
- `autonomyLevel`: 1 to 5 (1 is fully supervised, 5 is fully autonomous)
- `department?: string`: organizational department
- `scope: string[]`: what the agent can do in this role
- `assignerPrivateKey: string`: key of the human or agent assigning the role
- `assignerPublicKey: string`

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
- `goals: IntentGoal[]`: array of `{ goal, priority, measuredBy }`
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
- `convergenceThreshold?: number`: std dev threshold (default: 15)
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

Checks if agents have converged on a decision.

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

The complete protocol surface is in [llms-full.txt](https://agent-passport.org/llms-full.txt).
