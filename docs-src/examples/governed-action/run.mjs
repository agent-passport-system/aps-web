// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
// Prints the grant, every case, the revocation record and the ledger counter.

import { grant, runAll } from './governed-action.mjs'

const { rows, revocation, ledger, resourceCalls } = runAll()

console.log('grant (AuthorityDelegationV1):')
console.log(JSON.stringify(grant, null, 2))
console.log()
for (const row of rows) console.log(JSON.stringify(row))
console.log()
console.log('revocation (AuthorityRevocationV1):')
console.log(JSON.stringify(revocation, null, 2))
console.log()
console.log('ledger counter for the grant:', JSON.stringify(ledger))
console.log('resource calls:', resourceCalls)
