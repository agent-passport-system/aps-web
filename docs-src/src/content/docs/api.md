---
title: API reference
description: Signatures, options, results and failure behavior of the current agent-passport-system 8.0.1 surface, with deprecated and throwing exports marked.
---

This page is the reference for npm `agent-passport-system` 8.0.1. The package declares Node.js 18 or later (`engines`). Signature blocks are copied from the package's declaration files under `dist/src/` and are declarations, not runnable code. A check in the docs build compares every signature line on this page with the published declarations. The runnable programs that use these functions are in [`docs-src/examples/governed-action/`](https://github.com/agent-passport-system/aps-web/tree/main/docs-src/examples/governed-action), and the [Quickstart](/docs/quickstart/) walks through one.

## Entry points

| Import | What it carries |
| --- | --- |
| `agent-passport-system` | The full surface, 2733 export names in 8.0.1, values and types together. Everything on this page except the `/core` list below comes from here. |
| `agent-passport-system/core` | A curated set of 34 names for the legacy formats: `createPassport`, `verifyPassport`, `createDelegation`, `verifyDelegation`, `subDelegate`, `scopeAuthorizes`, `evaluateIntent`, `createActionIntent`, `computeActionRef`, `computeExternalActionRefV1`, `parseExternalActionRefV1Preimage`, `computeIdempotencyKey`, `attestFloor`, `loadFloor`, `generateKeyPair`, `rotateKey`, `recordSpend`, `getSpendSummary`, `checkTierForIntent`, `resolveAuthorityTier`, `requestHumanApproval`, `createCommerceDelegation`, `commercePreflight`, `revokeDelegation`, `cascadeRevoke`, plus types. The last three throw in 8.0.1. |

`/core` is a packaging choice. It is not the draft's Core conformance class, and it does not contain `AuthorityDelegationV1`, `ReceiptV1` or the MCP profile. See [Status and conformance](/docs/status/).

The counts come from the TypeScript checker over `dist/src/index.d.ts` and `dist/src/core-exports.d.ts`. Not every export is a supported integration point. Many belong to optional or experimental modules.

## How functions fail

Issuers throw on bad input. Verifiers return a coded result and do not throw. Each line below is one call with bad input, from `api-errors.mjs` in the example directory, run against 8.0.1:

```text
issueAuthorityDelegation, signed record as body  threw Error: authority delegation body must carry neither delegation_id nor signature (SCHEMA_INVALID)
issueAuthorityDelegation, bad nonce              threw Error: authority delegation body invalid: nonce must be 32 lowercase hex characters (NONCANONICAL_VALUE)
verifyAuthorityDelegationChain, not a chain      returned {"state":"invalid","codes":["SCHEMA_INVALID"]}
verifyAuthorityDelegationChain, wrong record     returned {"state":"invalid","codes":["SCHEMA_INVALID"]}
verifyAuthorityDelegationChain, key unreachable  returned {"state":"indeterminate","codes":["KEY_UNREACHABLE"]}
verifyAuthorityDelegationChain, root untrusted   returned {"state":"invalid","codes":["ROOT_UNTRUSTED"]}
verifyAuthorityDelegationChain, after not_after  returned {"state":"invalid","codes":["EXPIRED"]}
issueAuthorityRevocation, revoker not issuer     threw Error: authority revocation revoker is not the target delegation issuer (REVOKER_NOT_ISSUER)
recordAuthorityRevocation, junk candidate        returned {"recorded":false,"state":"unsupported","codes":["UNSUPPORTED_RECORD_TYPE"]}
ledger.reserve, wrong unit                       returned {"ok":false,"code":"UNIT_MISMATCH"}
ledger.reserve, above per_action                 returned {"ok":false,"code":"PER_ACTION_EXCEEDED"}
ledger.commit, unknown action                    returned {"ok":false,"code":"NOT_FOUND"}
createReceiptV1, bad issued_at                   threw TypeError: ReceiptV1: issued_at
verifyReceiptV1, key not found                   returned {"status":"indeterminate","signer_authority":"not_established","errors":1}
verifyReceiptV1, resolver unreachable            returned {"status":"indeterminate","signer_authority":"not_established"}
verifyReceiptV1Serialized, duplicate member      returned {"status":"invalid","errors":["parse_error"]}
verifyApsMcpAuthorizationV1, junk                returned {"state":"invalid","code":"MCP_AUTHORIZATION_MALFORMED"}
proveContributions                               threw Error: Moved to @aeoess/gateway. See MIGRATION.md#attribution-reports
commercePreflight                                threw Error: commerce orchestration moved to @aeoess/gateway src/sdk-migrated/core/commerce-preflight.ts. Use the gate pred
```

A verifier result of `valid` is not permission to dispatch. The caller still owns replay, spend reservation, the time it checks against and the decision to call the resource.

## Keys

```ts
generateKeyPair(): KeyPair
publicKeyFromPrivate(privateKeyHex: string): string
```

Keys are lowercase hex Ed25519. `KeyPair` is `{ publicKey, privateKey }`. The SDK does not store keys. Where a key lives is the caller's choice.

## Authority: AuthorityDelegationV1

The wire record is described on [Authority and revocation](/docs/authority/).

```ts
issueAuthorityDelegation(body: AuthorityDelegationBodyV1, privateKey: string): AuthorityDelegationV1
issueSubAuthorityDelegation(parent: AuthorityDelegationV1, body: AuthorityDelegationBodyV1, privateKey: string, options: SubAuthorityIssueOptions): AuthorityDelegationV1
```

`issueAuthorityDelegation` signs a root record (`parent_delegation_id: null`) from an explicit body and computes `delegation_id`. The body carries no `delegation_id` and no `signature`, and every field must already be canonical, such as a 32 character lowercase hex `nonce`. `issueSubAuthorityDelegation` signs a child of `parent` and first checks the parent and the narrowing with `options`: `now`, `resolveVerificationKey` and `resolveRevocation`. Both throw an `Error` whose message ends with the failure code.

```ts
verifyAuthorityDelegationChain(rawChain: readonly unknown[], options: AuthorityChainVerificationOptions): AuthorityValidationResult
verifyAuthorityDelegation(delegation: unknown, options: AuthorityChainVerificationOptions): AuthorityValidationResult
```

`AuthorityChainVerificationOptions` has four required members:

- `now: string`: the verification time, RFC 3339 UTC. The function never reads the system clock.
- `resolveVerificationKey(issuer, verificationMethod, issuedAt)`: returns the public key hex, `null`, or `{ outcome }` with `not_found`, `ambiguous`, `malformed`, `unreachable` or `unsupported_scheme`. The key is looked up at the record's own `issued_at`.
- `trustRoot(root)`: returns whether this deployment accepts the root record.
- `resolveRevocation(delegation)`: returns `active`, `revoked` or `unknown`.

`AuthorityValidationResult` is `{ state, valid, failures }`. `state` is `valid`, `invalid`, `indeterminate` or `unsupported`, and `valid` is true only for `valid`. Each failure has a `code`, a `message`, and optionally the chain `index` and the `facet`. The codes are `SCHEMA_INVALID`, `UNSUPPORTED_VERSION`, `UNSUPPORTED_RECORD_TYPE`, `UNSUPPORTED_PROFILE`, `RESOURCE_LIMIT`, `NONCANONICAL_VALUE`, `ID_MISMATCH`, `KEY_RESOLUTION_FAILED`, `KEY_SCHEME_UNSUPPORTED`, `KEY_NOT_FOUND`, `KEY_AMBIGUOUS`, `KEY_UNREACHABLE`, `KEY_MATERIAL_MALFORMED`, `SIGNATURE_INVALID`, `ROOT_UNTRUSTED`, `CHAIN_DUPLICATE_ID`, `PARENT_MISMATCH`, `CHAIN_CONTINUITY`, `ISSUED_AT_OUTSIDE_PARENT`, `SCOPE_WIDENING`, `SPEND_WIDENING`, `SPEND_UNIT_CHANGE`, `DEPTH_EXHAUSTED`, `DEPTH_WIDENING`, `TIME_WIDENING`, `REPUTATION_WIDENING`, `VALUES_WEAKENING`, `REVERSIBILITY_WIDENING`, `NOT_YET_VALID`, `EXPIRED`, `REVOKED` and `REVOCATION_UNKNOWN`. An unknown revocation status gives `indeterminate`, never `valid`.

The chain verifier checks one chain. It does not check that the action's scope is covered, and it does not combine chains.

```ts
scopeGrantCovers(parent: string, child: string): boolean
```

Scope coverage under `aps-hierarchical-v1`. An exact grant covers only itself. A grant ending in `:*` covers its prefix and every descendant.

`InMemoryAuthorityBudgetLedger` reserves spend against every bounded grant in a verified chain. Its methods are `reserve(verifiedChain, actionRef, unit, amountString)`, `markDispatched(actionRef)`, `commit(actionRef)`, `cancel(actionRef)` and `counter(delegationId)`, which returns `{ reserved, committed }`. Each mutation returns `{ ok, code, state? }`, with codes `RESERVED`, `DISPATCHED`, `COMMITTED`, `CANCELLED`, `IDEMPOTENT`, `CONFLICT`, `UNIT_MISMATCH`, `PER_ACTION_EXCEEDED`, `CUMULATIVE_EXCEEDED`, `NOT_FOUND` and `INVALID_STATE`. The ledger lives in one process's memory. A deployment with more than one process needs its own atomic store.

## Revocation: AuthorityRevocationV1

```ts
issueAuthorityRevocation(delegation: AuthorityDelegationV1, input: AuthorityRevocationIssueInput, privateKey: string): AuthorityRevocationV1
verifyAuthorityRevocation(candidate: unknown, delegation: unknown, options: AuthorityRevocationVerificationOptions): AuthorityRevocationVerificationResult
recordAuthorityRevocation(store: AuthorityRevocationStore, delegation: AuthorityDelegationV1, candidate: unknown, options: AuthorityRevocationVerificationOptions): AuthorityRevocationRecordResult
createAuthorityRevocationResolver(store: AuthorityRevocationStore, options: AuthorityRevocationVerificationOptions): (delegation: AuthorityDelegationV1) => RevocationResolution
```

`AuthorityRevocationIssueInput` is `{ now, revoker, verification_method, reason_code, detail?, nonce }`. Only the delegation's issuer may revoke it, and `issueAuthorityRevocation` throws `REVOKER_NOT_ISSUER` otherwise. `verifyAuthorityRevocation` returns `{ state, valid, failures }` with the same four states. `recordAuthorityRevocation` verifies the candidate and only then offers it to the store. It returns `recorded: false` with the verification result when the candidate fails.

An `AuthorityRevocationStore` has `tracks(delegationId)`, `get(delegationId)` and `insertVerifiedRevocation(revocation)`. `InMemoryAuthorityRevocationStore` adds `track(delegationId)` and keeps everything in process memory. The resolver from `createAuthorityRevocationResolver` answers `revoked` for a recorded revocation, `active` for a tracked delegation with none, and `unknown` for a delegation the store does not track.

## Action references

```ts
createActionReferenceInputV2(input: { agent_id: string; action_type: string; target: string; payload_ref: string; scope_required: readonly string[]; issued_at: string; nonce: string; }): ActionReferenceInputV2
computeActionRefV2(input: ActionReferenceInputV2, profileContext?: ActionReferenceProfileContextV2 | undefined): string
computePayloadRefV1(payload: unknown): string
```

`computeActionRefV2` returns the 64 character hex `action_ref` that receipts and the boundary's replay store key on. `computePayloadRefV1` hashes the action's arguments for the reference. See [Signed bytes and references](/docs/signed-bytes/).

## Receipts: ReceiptV1

```ts
createReceiptV1(fields: Omit<ReceiptV1, "receipt_id" | "signatures">, signers: ReceiptSignerV1[]): ReceiptV1
verifyReceiptV1(receipt: ReceiptV1, resolveKey: (signer: string, keyId: string, issuedAt: string) => string | KeyResolutionFailure | undefined, stageOptions?: ReceiptStageOptionsV1 | undefined, requirements?: ReceiptSignatureRequirementsV1 | undefined): ReceiptVerificationV1
verifyReceiptV1Serialized(raw: string, resolveKey: (signer: string, keyId: string, issuedAt: string) => string | KeyResolutionFailure | undefined, stageOptions?: ReceiptStageOptionsV1 | undefined, requirements?: ReceiptSignatureRequirementsV1 | undefined): ReceiptVerificationV1
buildDecisionRefV1(input: { action_ref: string; authority_state: JsonValue; policy_input: JsonValue; decision_context: JsonValue; decision_output: CoreDecisionOutputV1; }): { input: DecisionRefInputV1; decision_ref: string; }
verifyReceiptWithDecisionV1(receipt: ReceiptV1, decision: DecisionEvidenceV1, resolveKey: (signer: string, keyId: string, issuedAt: string) => string | undefined, options?: ReceiptWithDecisionOptionsV1 | undefined): ReceiptWithDecisionVerificationV1
```

`createReceiptV1` computes `receipt_id`, adds one Ed25519 signature per signer `{ signer, key_id, private_key }`, and throws a `TypeError` naming the field when a field is invalid.

`verifyReceiptV1` returns `ReceiptVerificationV1`: `valid`, `status` (`valid`, `invalid`, `indeterminate`, `unsupported`), `receipt_id_valid`, `signer_authority` (`verified`, `not_established`, `invalid`, `not_checked`), `stage`, `signature_results`, `other_signatures` and `errors`. A key the resolver cannot find gives `indeterminate` with `signer_authority: not_established`. `stageOptions` takes `expectedReceiptType` and `boundaryIdentity`. `requirements.requiredSigners` names signers whose signatures must be present.

`verifyReceiptV1Serialized` parses the raw JSON text first and refuses duplicate members with `parse_error`. Use it for bytes received from someone else.

`verifyReceiptWithDecisionV1` also checks that the receipt's `decision_ref` binds the supplied decision evidence and, with `options.predecessor`, that the receipt links to it. Its result keeps `not_checked`, `not_applicable` and `not_established` apart from true and false. See [Receipt families and verification](/docs/receipt-verification/).

## MCP authorization: aps-mcp-1

```ts
issueApsMcpAuthorizationV1(input: { agent_id: string; verification_method: string; delegation_ref: string; mcp_server: string; tool_name: string; arguments: Record<string, unknown>; scope_required: readonly string[]; spend?: ApsMcpSpendV1 | undefined; nonce: string; issued_at: string; expires_at: string; private_key_hex: string; }): ApsMcpAuthorizationV1
verifyApsMcpAuthorizationV1(candidate: unknown, expected: { mcp_server: string; tool_name: string; arguments: Record<string, unknown>; now?: string | undefined; resolve_key: HistoricalKeyResolver; }): Promise<{ state: "valid" | "invalid" | "indeterminate"; code: string; authorization?: ApsMcpAuthorizationV1 | undefined; }>
createApsMcpToolCallMiddleware(options: { mcp_server: string; resolve_key: HistoricalKeyResolver; consume_action_ref: (actionRef: string, expiresAt: string) => boolean | Promise<boolean>; evaluate_authority: (authorization: ApsMcpAuthorizationV1, request: McpToolCallRequest) => ApsMcpAuthorityDecision | Promise<ApsMcpAuthorityDecision>; emit_receipt: (authorization: ApsMcpAuthorizationV1, authority: ApsMcpAuthorityDecision, result: McpToolCallResult) => unknown; }): (request: McpToolCallRequest, context: ApsMcpMiddlewareContext, dispatch: (request: McpToolCallRequest) => McpToolCallResult | Promise<McpToolCallResult>) => Promise<McpToolCallResult>
computeMcpArgumentsHashV1(argumentsValue: Record<string, unknown>): string
```

`APS_MCP_AUTHORIZATION_META` is `org.agent-passport/authorization`, the `_meta` key the authorization travels under. `verifyApsMcpAuthorizationV1` takes an optional `now`. The middleware takes none and checks the window against the system clock. The middleware throws `ApsMcpAuthorizationError` with a `code` at the first failed step and calls `dispatch` only when every step passes. The steps and a tested host are on [MCP server](/docs/mcp-server/#host-pre-dispatch-authorization).

## Canonicalization

```ts
canonicalize(obj: unknown, _ancestors?: WeakSet<object> | undefined): string
canonicalizeJCS(value: unknown): string
```

`canonicalize` is the legacy canonicalizer and drops object members whose value is `null`. `canonicalizeJCS` is RFC 8785 and keeps them. Which artifact uses which is on [Signed bytes and references](/docs/signed-bytes/).

## Evidence bundles

```ts
createEvidenceBundle(opts: CreateEvidenceBundleOptions): EvidenceBundle
verifyEvidenceBundle(bundle: EvidenceBundle): EvidenceBundleVerification
computeClaimBoundaryReport(bundle: EvidenceBundle, opts?: ClaimBoundaryReportOptions | undefined): ClaimBoundaryReport
```

A bundle is a signed manifest of member digests and a Merkle root, with the member payloads and the signer's public key beside it. The key is outside the signed manifest, so a valid signature shows integrity under that key, not who signed. `computeClaimBoundaryReport` reports one state per axis, authority, action, revocation and evidence. It does not verify delegation chains. The CLI's `verify-bundle` uses it. See [CLI reference](/docs/cli/#verify-bundle).

## Deprecated and throwing exports

Deprecated in 8.0.1:

- `isIssuerVerified`: tagged `@deprecated` with "Use verifyIssuerSignature() for security-critical checks."
- `TrustVerification.overall`, returned by `verifySocialContract`: reading it prints a `DeprecationWarning`. Read `structurallyValid`, `issuerChecked` and `issuerTrusted`.

These 29 exports throw a migration error when called or constructed. Their declarations are kept, so a typecheck passes and the call fails at run time:

| Export | Entry point | Message starts with |
| --- | --- | --- |
| `cacheDIDResolution` | root | DID resolution cache moved to @aeoess/gateway ... |
| `cancelCheckout` | root | commerce orchestration moved to @aeoess/gateway ... |
| `cascadeRevoke` | root and `/core` | This function has moved to DelegationStore in @aeoess/gateway |
| `clearDIDCache` | root | DID resolution cache moved to @aeoess/gateway ... |
| `commercePreflight` | root and `/core` | commerce orchestration moved to @aeoess/gateway ... |
| `commitBatch` | root | commitBatch moved to @aeoess/gateway ... |
| `completeCheckout` | root | commerce orchestration moved to @aeoess/gateway ... |
| `computeConsistencyScore` | root | computeConsistencyScore: Moved to @aeoess/gateway ... |
| `computeReputationDrift` | root | computeReputationDrift: Moved to @aeoess/gateway ... |
| `createCheckout` | root | commerce orchestration moved to @aeoess/gateway ... |
| `createInitialPosture` | root | governance-posture state machine moved to @aeoess/gateway ... |
| `createPromotionReview` | root | createPromotionReview: Moved to @aeoess/gateway ... |
| `DataEnforcementGate` (class) | root | DataEnforcementGate has moved to @aeoess/gateway |
| `DataGateway` (class) | root | DataGateway has moved to @aeoess/gateway |
| `getCachedDIDResolution` | root | DID resolution cache moved to @aeoess/gateway ... |
| `getChainEntry` | root | This function has moved to DelegationStore in @aeoess/gateway |
| `getDescendants` | root | This function has moved to DelegationStore in @aeoess/gateway |
| `getReceipts` | root | This function has moved to DelegationStore in @aeoess/gateway |
| `getRevocation` | root | This function has moved to DelegationStore in @aeoess/gateway |
| `onRevocation` | root | This function has moved to DelegationStore in @aeoess/gateway |
| `proveContributions` | root | Moved to @aeoess/gateway |
| `recordBehavioralFailure` | root | governance-posture state machine moved to @aeoess/gateway ... |
| `recordBehavioralSuccess` | root | governance-posture state machine moved to @aeoess/gateway ... |
| `revokeByAgent` | root | This function has moved to DelegationStore in @aeoess/gateway |
| `revokeDelegation` | root and `/core` | This function has moved to DelegationStore in @aeoess/gateway |
| `triggerDemotion` | root | triggerDemotion: Moved to @aeoess/gateway ... |
| `updateCheckout` | root | commerce orchestration moved to @aeoess/gateway ... |
| `upgradePosture` | root | governance-posture state machine moved to @aeoess/gateway ... |
| `validateChain` | root | This function has moved to DelegationStore in @aeoess/gateway |

The list comes from calling each export whose body starts with `throw new Error(` once with no arguments and keeping those whose message names a move. The MCP server's `commerce_preflight` tool is the same kind of stub.

## Compatibility: social contract and intent functions

These functions produce the compatibility `Delegation` and camelCase `ActionReceipt` formats. Use them to read or extend an existing integration. New work uses the authority and receipt functions above. A tested tutorial is on [Compatibility](/docs/compatibility/).

```ts
joinSocialContract(opts: JoinOptions): SocialContractAgent
verifySocialContract(passport: SignedPassport, attestation?: FloorAttestation | null | undefined, opts?: VerifySocialContractOptions | undefined): TrustVerification
delegate(opts: DelegateOptions): Delegation
recordWork(agent: SocialContractAgent, delegation: Delegation, delegationChain: string[], work: WorkOptions): ActionReceipt
auditCompliance(agentId: string, receipts: ActionReceipt[], floor: ValuesFloor, delegations: Map<string, { scope: string[]; revoked: boolean; }>, verifierKeyPair: KeyPair): ComplianceReport
countersignPassport(signedPassport: SignedPassport, issuerPrivateKey: string, issuerId?: string | undefined): SignedPassport
proveContributions(_agent: SocialContractAgent, _receipts: ActionReceipt[], _delegations: Delegation[], _beneficiary: string, _beneficiaryMap?: Map<string, BeneficiaryInfo> | undefined): ContributionProof
```

`proveContributions` throws in 8.0.1.

### joinSocialContract

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

### verifySocialContract

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

### delegate

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

### recordWork

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

### proveContributions

`proveContributions(agent, receipts, delegations, beneficiary, beneficiaryMap?)` is declared to return `ContributionProof`.

Throws in 8.0.1 with `Moved to @aeoess/gateway. See MIGRATION.md#attribution-reports`. The signature is kept, so a typecheck passes and the call fails at run time. The declared return type is:

- `attribution: AttributionReport`: weighted attribution across scopes
- `merkleRoot: string`: 32-byte SHA-256 commitment to all receipts
- `proofs: Map<string, MerkleProof>`: per-receipt inclusion proofs
- `traces: BeneficiaryTrace[]`: delegation chain back to human for each receipt

### auditCompliance

`auditCompliance(agentId, receipts, floor, delegations, verifierKeyPair)` returns `ComplianceReport`.

Audits an agent's compliance against the Values Floor. The auditor signs the report.

Parameters:

- `agentId: string`
- `receipts: ActionReceipt[]`
- `floor: ValuesFloor`: for example `loadFloor(yamlText)`
- `delegations: Map<string, { scope: string[], revoked: boolean }>`: keyed by delegation ID
- `verifierKeyPair: KeyPair`: the auditor's keys, used to sign the report

Returns `ComplianceReport` with principle-by-principle enforcement status and overall compliance percentage.

### Layer 5: intent architecture

#### assignRole

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

#### createTradeoffRule

`createTradeoffRule(options)` returns `TradeoffRule`.

Creates a quantified tradeoff rule for machine-readable organizational intent.

Parameters:

- `when: string`: the conflict (for example `"quality vs speed"`)
- `prefer: string`: default preference (for example `"quality"`)
- `until: string`: threshold (for example `"2x time cost"`)
- `thenPrefer: string`: preference after threshold (for example `"speed"`)
- `context?: string`: optional context

Returns `TradeoffRule` with `ruleId`, `when`, `prefer`, `until`, `thenPrefer`.

#### evaluateTradeoff

`evaluateTradeoff(rule, thresholdExceeded)` returns `TradeoffEvaluation`.

Evaluates a tradeoff rule at runtime given whether the threshold was exceeded.

Parameters:

- `rule: TradeoffRule`
- `thresholdExceeded: boolean`

Returns `TradeoffEvaluation`: `{ ruleId, winner, thresholdExceeded, reasoning }`

#### createIntentDocument

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

#### createDeliberation

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

#### submitConsensusRound

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

#### evaluateConsensus

`evaluateConsensus(deliberation)` returns `ConsensusEvaluation`.

Checks if agents have converged on a decision. With fewer than two assessments in the latest round it returns `converged: false` and `recommendation: 'continue'`.

Returns: `{ converged: boolean, standardDeviation: number, roundNumber: number, agentCount: number, recommendation: 'continue' | 'converged' | 'escalate' }`

#### resolveDeliberation

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

#### getPrecedentsByTopic

`getPrecedentsByTopic(precedents, topic)` returns `Precedent[]`.

Filters precedents by topic string match (subject, context, or decision). Sorted by `citedCount` descending.

#### citePrecedent

`citePrecedent(precedent)` returns `Precedent`.

Increments a precedent's `citedCount` by 1.

#### createIntentPassportExtension

`createIntentPassportExtension(options)` returns `IntentPassportExtension`.

Creates the bridge between Layer 1 identity and Layer 5 governance.

Parameters:

- `role: AgentRole`
- `autonomyLevel: AutonomyLevel`
- `department?: string`
- `activeIntents: string[]`: intent document IDs
- `tradeoffHierarchyHash: string`

Returns `IntentPassportExtension` with role, autonomy, deliberation and precedent counters.

## Further reading

[llms-full.txt](https://agent-passport.org/llms-full.txt) describes the wider module surface in prose. It is not a typed reference. The package's declarations under `dist/src/index.d.ts` are the source of truth for signatures.
