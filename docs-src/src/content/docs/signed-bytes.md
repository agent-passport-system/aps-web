---
title: Signed bytes and references
description: Which canonicalizer, domain tag and preimage each APS artifact uses, the legacy canonicalizer versus RFC 8785 JCS, and the three action reference forms.
---

Two implementations agree on a signature or an identifier only when they hash and sign exactly the same bytes. APS uses more than one canonical form, and each artifact names its own.

## Two canonicalizers

`agent-passport-system` 8.0.1 exports two:

- `canonicalize`, the legacy form. It sorts object keys and drops object members whose value is `null` or `undefined`. It is used by the compatibility formats: the legacy passport, the legacy `Delegation` and the camelCase `ActionReceipt`.
- `canonicalizeJCS`, RFC 8785 JSON Canonicalization Scheme. It keeps `null` members. Every current artifact on this page uses it.

The SDK repository's [`CANONICAL-SPEC.md`](https://github.com/agent-passport-system/agent-passport-system/blob/f95c9168187cbac0493099fe4a7cddaff653bf39/docs/CANONICAL-SPEC.md) says it covers all cryptographic operations and that null members are dropped. That describes the legacy form only. Read it as the specification of `canonicalize`.

The difference changes identifiers. A root `AuthorityDelegationV1` carries `"parent_delegation_id": null`. This program, `canonicalizers.mjs` in `docs-src/examples/governed-action/`, hashes the Quickstart grant's body both ways under the same domain tag:

```js
// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
// The legacy canonicalizer drops null members. RFC 8785 JCS keeps them. A root
// AuthorityDelegationV1 carries "parent_delegation_id": null, so the two give different IDs.

import { createHash } from 'node:crypto'
import { canonicalize, canonicalizeJCS, computeAuthorityDelegationId } from 'agent-passport-system'
import { grant } from './governed-action.mjs'

console.log(JSON.stringify({ legacy: canonicalize({ a: 1, b: null }), jcs: canonicalizeJCS({ a: 1, b: null }) }))
const { delegation_id, signature, ...body } = grant
const legacyId = 'sha256:' + createHash('sha256')
  .update('APS-AUTHORITY-DELEGATION-ID-V1\0' + canonicalize(body), 'utf8').digest('hex')
console.log('delegation_id in the record:  ', delegation_id)
console.log('computeAuthorityDelegationId: ', computeAuthorityDelegationId(body))
console.log('same tag, legacy canonicalize:', legacyId)
```

```text
{"legacy":"{\"a\":1}","jcs":"{\"a\":1,\"b\":null}"}
delegation_id in the record:   sha256:7123e7d656ef4ed367c27f49e089d7c64df307c6780bd9577014f7426ae1529f
computeAuthorityDelegationId:  sha256:7123e7d656ef4ed367c27f49e089d7c64df307c6780bd9577014f7426ae1529f
same tag, legacy canonicalize: sha256:1ec66bccfc3ee784bfa73ef0672dc26a730efc0f0c46fe2faa58104db7b8236a
```

The legacy form drops `parent_delegation_id`, so the hash no longer matches the record's own `delegation_id`.

## Per artifact

Every current artifact below is hashed and signed over `TAG || 0x00 || UTF8(JCS(value))`, where the tag is ASCII and one zero byte follows it. "Without X" means the member is absent from the object, not set to `null`.

| Artifact | Identifier preimage | Signature preimage | Encoding |
| --- | --- | --- | --- |
| `AuthorityDelegationV1` | `APS-AUTHORITY-DELEGATION-ID-V1`, record without `delegation_id` and `signature` | `APS-AUTHORITY-DELEGATION-SIGNATURE-V1`, record without `signature` | `delegation_id` is `sha256:` plus 64 hex. Signature 128 hex |
| `AuthorityRevocationV1` | `APS-AUTHORITY-REVOCATION-ID-V1`, record without `revocation_id` and `signature` | `APS-AUTHORITY-REVOCATION-SIGNATURE-V1`, record without `signature` | `revocation_id` is `sha256:` plus 64 hex |
| `ReceiptV1` | `APS-RECEIPT-ID-V1`, receipt without `receipt_id` and `signatures` | `APS-RECEIPT-SIG-V1`, the object `{ "receipt": <receipt without signatures>, "signer": <signature descriptor without value> }` | `receipt_id` is 64 hex, no prefix. Each signature carries `signer`, `key_id`, `alg` and `value` |
| `DecisionRefV1` | `APS-DECISION-REF-V1` over the decision reference input. Its four component digests use `APS-DECISION-AUTHORITY-V1`, `APS-DECISION-POLICY-V1`, `APS-DECISION-CONTEXT-V1` and `APS-DECISION-OUTPUT-V1` | none | 64 hex |
| Action reference (`aps-action-ref-v2`) | `APS-ACTION-REF-V2` over the action reference input | none | 64 hex |
| Action payload reference | `APS-ACTION-PAYLOAD-V1` over the payload | none | 64 hex |
| Supporting record | `APS-SUPPORTING-RECORD-ID-V1`, then the `record_type` and one more zero byte, over the record without `record_id` and `sig` | `APS-SUPPORTING-RECORD-SIG-V1`, same layout, record without `sig` | 64 hex |
| `PassportV2`, draft section 3.1 | `APS-PASSPORT-ID-V2` | `APS-PASSPORT-SIG-V2` | Not exposed by the 8.0.1 package. See [Identity](/docs/identity/) |
| `PrincipalBindingV1`, draft section 3.3 | `APS-PRINCIPAL-BINDING-ID-V1` | `APS-PRINCIPAL-BINDING-SIG-V1` | Not exposed by the 8.0.1 package |

Values must be I-JSON. Timestamps in these records use exact UTC milliseconds with seconds 00 to 59. The verifiers accept canonical arrays only, such as sorted and irredundant scope grants or sorted decision `constraints`, and reject an unsorted one rather than repairing it.

`verifyReceiptV1` works on a parsed object and so cannot see duplicate members in the original JSON text. `verifyReceiptV1Serialized` parses the raw string strictly and is the entry point for receipts received as bytes. `parseAuthorityDelegationJson` does the same for delegation records.

## Action references

Three different digests can identify an action. They are not interchangeable.

- `computeActionRefV2(input)` is the draft-native reference used in `ReceiptV1.action_ref`. Build the input with `createActionReferenceInputV2({ agent_id, action_type, target, payload_ref, scope_required, issued_at, nonce })`. `payload_ref` comes from `computePayloadRefV1(payload)`, which binds the arguments. `scope_required` is NFC normalized, sorted and de-duplicated. The [Quickstart](/docs/quickstart/) boundary recomputes this from the presented action and compares it with the intent receipt.
- `computeExternalActionRefV1`, in `agent-passport-system/core`, is the legacy external correlation form of draft section 5.2, for correlating with systems outside APS.
- `computeActionRef`, also in core, is the pre-draft digest over an action intent, from `draft-pidlisnyi-aps-01` section 4.1. It uses JCS too, and its preimage is not the v2 input.

A digest from one form never matches a digest from another for the same action. A verifier checks the `action_ref` it receives against the form that artifact's profile names.

## Vectors

Known-answer vectors for RFC 8785 behavior, including key ordering, number serialization and string escaping, are in the `canonical-bytes` family of the [conformance corpus](https://github.com/Agent-Authority-Conformance). The [Status and conformance](/docs/status/) page describes how to run it.
