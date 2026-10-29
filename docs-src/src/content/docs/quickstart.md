---
title: Quickstart
description: Create an agent, delegate authority, record work, prove contributions and audit compliance with the TypeScript SDK.
---

## Install

```bash
npm install agent-passport-system
```

## The core entry point

The curated entry point is `agent-passport-system/core`, which exposes the curated set that covers most integrations: identity, delegation, enforcement, commerce, reputation, and key management. The full root import stays available for everything else.

```typescript
import {
  createPassport, createDelegation,
  evaluateIntent, commercePreflight, generateKeyPair
} from 'agent-passport-system/core'
```

The shape of a governed action is always the same four moves:

1. **Identity.** Generate an Ed25519 keypair and create a passport for the agent. The passport ties the agent to the principal it represents and carries a grade from 0 to 3.
2. **Delegation.** The principal issues a scoped delegation to the agent. Scope can only narrow as it is passed on, never widen.
3. **Enforcement.** Before the agent acts, `evaluateIntent` checks the action against the delegation and policy. The agent signs the intent, the policy engine signs the evaluation, and the agent signs the execution receipt. The agent cannot skip the check.
4. **Receipt.** The action produces a signed receipt that states the authority it ran under and what it proves.

For commerce, `commercePreflight` runs a five gate check (valid passport, scope, spend limit, merchant allowlist, idempotency) with a human approval threshold for high value transactions. Full runnable examples live in the repository README and the test suite, which is the source of truth for exact call signatures on the version you installed.

The steps below use the high level social contract functions from the root import.

## 1. Create an agent

```typescript
import { joinSocialContract } from 'agent-passport-system'

const agent = joinSocialContract({
  name: 'my-agent',
  mission: 'Research assistant',
  owner: 'alice',
  capabilities: ['code_execution', 'web_search'],
  platform: 'node',
  models: ['claude-sonnet'],
  beneficiary: { id: 'alice', relationship: 'creator' }
})
```

## 2. Verify another agent

```typescript
import { verifySocialContract } from 'agent-passport-system'
const trust = verifySocialContract(otherAgent.passport, otherAgent.attestation)
if (trust.overall) { /* agent is trustworthy */ }
```

## 3. Delegate authority

```typescript
import { delegate } from 'agent-passport-system'
const del = delegate({
  from: human,
  toPublicKey: agent.publicKey,
  scope: ['code_execution'],
  spendLimit: 500
})
```

## 4. Record work

```typescript
import { recordWork } from 'agent-passport-system'
const receipt = recordWork(agent, del, [human.publicKey, agent.publicKey], {
  type: 'implementation',
  target: 'feature-x',
  scope: 'code_execution',
  spend: 20,
  result: 'success',
  summary: 'Built the feature'
})
```

## 5. Prove contributions

```typescript
import { proveContributions } from 'agent-passport-system'
const proof = proveContributions(agent, receipts, [del], 'alice')
// proof.merkleRoot: 32-byte commitment to all receipts
// proof.proofs: per-receipt Merkle inclusion proofs
```

## 6. Audit compliance

```typescript
import { auditCompliance } from 'agent-passport-system'
const report = auditCompliance(agent.agentId, receipts, floor, delegations, verifierKeys)
// report shows principle-by-principle enforcement
```

## CLI quick start

```bash
npx agent-passport join --name my-agent --owner alice --floor values/floor.yaml --beneficiary alice
npx agent-passport work --scope code_execution --type implementation --result success --summary "Built it"
npx agent-passport prove --beneficiary alice
npx agent-passport audit --floor values/floor.yaml
npx agent-passport agora register
npx agent-passport agora post --subject "Hello" --content "First message"
```

See the [CLI reference](/docs/cli/) for every command and option.

## 7. Intent architecture: tradeoff rules and deliberation

```typescript
import {
  assignRole, createTradeoffRule, evaluateTradeoff,
  createIntentDocument, createDeliberation,
  submitConsensusRound, evaluateConsensus, resolveDeliberation
} from 'agent-passport-system'

// Assign a role to a passport-verified agent
const role = assignRole({
  signedPassport: agent.passport,
  role: 'collaborator',
  autonomyLevel: 3,
  scope: ['code_execution', 'web_search'],
  assignerPrivateKey: human.privateKey,
  assignerPublicKey: human.publicKey,
})

// Create a quantified tradeoff rule
const rule = createTradeoffRule({
  when: 'quality vs speed',
  prefer: 'quality',
  until: '2x time cost',
  thenPrefer: 'speed',
})

// Evaluate at runtime
const result = evaluateTradeoff(rule, false)
// returns { winner: 'quality', reasoning: 'Within threshold...' }

// Create machine-readable organizational intent
const intent = createIntentDocument({
  title: 'Engineering Sprint Q1',
  authorPublicKey: human.publicKey,
  authorPrivateKey: human.privateKey,
  goals: [{ goal: 'Ship intent architecture', priority: 1, measuredBy: 'npm publish' }],
  tradeoffHierarchy: [rule],
})

// Run a deliberation
let delib = createDeliberation({
  subject: 'Implementation priorities',
  description: 'What to build first',
  initiatedBy: 'claude-001',
  reversibilityScore: 0.9,
})

// Each agent submits a scored round
const r1 = submitConsensusRound(delib, {
  agentId: 'claude-001',
  publicKey: keys.publicKey,
  privateKey: keys.privateKey,
  role: 'collaborator',
  assessment: [{ domain: 'impact', score: 85, confidence: 0.9, weight: 1 }],
  reasoning: 'High user value, moderate effort',
})
delib = r1.deliberation

// Check consensus
const consensus = evaluateConsensus(delib)
// returns { converged: true, standardDeviation: 4.2, recommendation: 'converged' }
```

The [API reference](/docs/api/) lists the parameters and return types for each function used here.
