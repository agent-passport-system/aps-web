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
