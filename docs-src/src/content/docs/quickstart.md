---
title: Quickstart
description: Create two agents, verify a passport against a trusted issuer, delegate, record work and audit it with the social contract API of agent-passport-system 8.0.1.
---

This page uses the social contract API. It produces the compatibility `Delegation` and camelCase `ActionReceipt` formats, which predate the current `AuthorityDelegationV1` record. Both programs below were typechecked against the 8.0.1 declarations and run with Node.js. Their output is printed under each one.

## Install

```bash
npm install agent-passport-system@8.0.1
```

The package is ES modules only. Set `"type": "module"` in your `package.json`.

## Identity, trust, delegation, work and audit

The program creates a principal and an agent, verifies the agent's passport twice, delegates one scope to it, records one unit of work and audits that work against the Values Floor file shipped in the package.

```typescript
import { readFileSync } from 'node:fs'
import {
  joinSocialContract, verifySocialContract, delegate, recordWork, auditCompliance,
  countersignPassport, generateKeyPair, loadFloor,
} from 'agent-passport-system'

// Two actors: the principal who delegates, and the agent who works.
const principal = joinSocialContract({
  name: 'alice', mission: 'Principal for the research agent', owner: 'alice',
  capabilities: ['delegation'], platform: 'node', models: [],
})
const agent = joinSocialContract({
  name: 'my-agent', mission: 'Research assistant', owner: 'alice',
  capabilities: ['code_execution', 'web_search'], platform: 'node', models: ['claude-sonnet'],
  beneficiary: { id: 'alice', relationship: 'creator' },
})

// Verify without a trust anchor: only the bytes are checked.
const unanchored = verifySocialContract(agent.passport, agent.attestation)
console.log('unanchored', {
  structurallyValid: unanchored.structurallyValid,
  issuerChecked: unanchored.issuerChecked,
  issuerTrusted: unanchored.issuerTrusted,
})

// Verify against an issuer the verifier trusts. The issuer countersigns the passport.
const issuer = generateKeyPair()
const countersigned = countersignPassport(agent.passport, issuer.privateKey, 'example-issuer')
const anchored = verifySocialContract(countersigned, agent.attestation, { trustedIssuers: [issuer.publicKey] })
console.log('anchored', {
  structurallyValid: anchored.structurallyValid,
  issuerChecked: anchored.issuerChecked,
  issuerTrusted: anchored.issuerTrusted,
})

// Delegate (legacy Delegation format) and record one unit of work under it.
const del = delegate({ from: principal, toPublicKey: agent.publicKey, scope: ['code_execution'], spendLimit: 500 })
const receipt = recordWork(agent, del, [principal.publicKey, agent.publicKey], {
  type: 'implementation', target: 'feature-x', scope: 'code_execution',
  spend: 20, result: 'success', summary: 'Built the feature',
})
console.log('receipt', { receiptId: typeof receipt.receiptId, scopeUsed: receipt.action.scopeUsed, status: receipt.result.status })

// Audit against the Values Floor shipped in the package.
const floorPath = new URL('./node_modules/agent-passport-system/values/floor.yaml', import.meta.url)
const floor = loadFloor(readFileSync(floorPath, 'utf8'))
const delegations = new Map([[del.delegationId, { scope: del.scope, revoked: false }]])
const auditor = generateKeyPair()
const report = auditCompliance(agent.agentId, [receipt], floor, delegations, auditor)
console.log('audit', Object.keys(report).sort().join(','))
```

```text
unanchored { structurallyValid: true, issuerChecked: false, issuerTrusted: false }
anchored { structurallyValid: true, issuerChecked: true, issuerTrusted: true }
receipt { receiptId: 'string', scopeUsed: 'code_execution', status: 'success' }
audit agentId,checks,floorVersion,generatedAt,overallCompliance,period,receiptsAnalyzed,reportId,signature
```

What each trust field establishes:

- `structurallyValid`: the passport's own signature, validity window and values attestation check out. A self-signed passport passes this.
- `issuerChecked`: the caller supplied `trustedIssuers`, so an issuer check ran.
- `issuerTrusted`: an issuer the caller named countersigned the passport.

Neither field authorizes an action. Authority comes from a delegation that a boundary checks before it dispatches the call. The deprecated `overall` field equals `structurallyValid` when no `trustedIssuers` are passed, and reading it prints a `DeprecationWarning`.

The `del` delegation and the receipt are signed by the principal and agent keys. Whether an action is actually refused depends on where the check runs: only calls routed through an enforcement boundary that holds the resource credentials and refuses an unauthorized request are gated. Signing an intent, a decision and a receipt in order does not stop an agent that can reach the resource another way.

## Roles, tradeoffs, intent documents and deliberation

`assignRole` verifies the passport before it signs a role. Pass the issuer keys the assigner trusts in `trustedIssuers`, or set `allowSelfSigned: true` to accept a passport nobody countersigned, which means the role rests on the agent's own claim.

```typescript
import {
  joinSocialContract, countersignPassport, generateKeyPair,
  assignRole, createTradeoffRule, evaluateTradeoff, createIntentDocument,
  createDeliberation, submitConsensusRound, evaluateConsensus,
} from 'agent-passport-system'

const human = joinSocialContract({
  name: 'alice', mission: 'Principal', owner: 'alice', capabilities: [], platform: 'node', models: [],
})
const agent = joinSocialContract({
  name: 'my-agent', mission: 'Research assistant', owner: 'alice',
  capabilities: ['code_execution', 'web_search'], platform: 'node', models: [],
})

// assignRole verifies the passport first. Give it an issuer the assigner trusts.
const issuer = generateKeyPair()
const passport = countersignPassport(agent.passport, issuer.privateKey, 'example-issuer')
const role = assignRole({
  signedPassport: passport,
  role: 'collaborator',
  autonomyLevel: 3,
  scope: ['code_execution', 'web_search'],
  assignerPrivateKey: human.keyPair.privateKey,
  assignerPublicKey: human.publicKey,
  trustedIssuers: [issuer.publicKey],
})
console.log('role', role.role, role.autonomyLevel)

const rule = createTradeoffRule({ when: 'quality vs speed', prefer: 'quality', until: '2x time cost', thenPrefer: 'speed' })
const tradeoff = evaluateTradeoff(rule, false)
console.log('tradeoff', tradeoff.winner)

const intent = createIntentDocument({
  title: 'Engineering Sprint Q1',
  authorPublicKey: human.publicKey,
  authorPrivateKey: human.keyPair.privateKey,
  goals: [{ goalId: 'g1', description: 'Ship intent architecture', priority: 1, metrics: ['npm publish'] }],
  tradeoffHierarchy: [rule],
})
console.log('intent goals', JSON.stringify(intent.goals))

let delib = createDeliberation({
  subject: 'Implementation priorities', description: 'What to build first',
  initiatedBy: agent.agentId, reversibilityScore: 0.9,
})
console.log('convergenceThreshold', delib.convergenceThreshold)
delib = submitConsensusRound(delib, {
  agentId: agent.agentId, publicKey: agent.publicKey, privateKey: agent.keyPair.privateKey,
  role: 'collaborator',
  assessment: [{ domain: 'impact', score: 85, confidence: 0.9, weight: 1 }],
  reasoning: 'High user value, moderate effort',
}).deliberation
console.log('consensus', JSON.stringify(evaluateConsensus(delib)))
```

```text
role collaborator 3
tradeoff quality
intent goals [{"goalId":"g1","description":"Ship intent architecture","priority":1,"metrics":["npm publish"]}]
convergenceThreshold 8
consensus {"converged":false,"standardDeviation":0,"roundNumber":1,"agentCount":1,"recommendation":"continue"}
```

One assessment from one agent does not converge. `evaluateConsensus` returns `continue` until the latest round holds assessments from at least two agents.

## Not covered here

`proveContributions` and `commercePreflight` throw a migration error in 8.0.1 (`Moved to @aeoess/gateway`). The package that message names is not published on the npm registry, where `npm view @aeoess/gateway` returned E404 on 28 October 2026. The CLI `prove` command calls the same function and exits 1. The [API reference](/docs/api/) lists the exports that throw.

The command line path is in the [CLI reference](/docs/cli/).
