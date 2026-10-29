// Copyright (c) 2026 Tymofii Pidlisnyi
// SPDX-License-Identifier: Apache-2.0
//
// Writes three evidence bundles for `agent-passport verify-bundle` into a directory:
// bundle.json (a signed bundle with a passport and a delegation member), tampered.json
// (a member payload changed after signing) and wrong-key.json (signer_public_key replaced).
// The fixed key seed is for this example only.
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createEvidenceBundle, createPassport, publicKeyFromPrivate } from 'agent-passport-system'

/** @param {string} dir */
export function makeBundles(dir) {
  const { signedPassport } = createPassport({
    agentId: 'docs-agent', agentName: 'Docs agent', ownerAlias: 'docs', mission: 'Read notes',
    capabilities: ['notes:read'], runtime: { platform: 'node', models: [], toolsCount: 0, memoryType: 'none' },
  })
  const signerPrivateKey = createHash('sha256').update('aps-docs-example-seed:bundle-signer').digest('hex')
  const bundle = createEvidenceBundle({
    members: [
      { member_id: 'passport-1', member_type: 'passport', payload: signedPassport },
      { member_id: 'delegation-1', member_type: 'delegation', payload: { delegation_id: 'sha256:example', scope: ['notes:read'] } },
    ],
    signerPrivateKey,
    signerPublicKey: publicKeyFromPrivate(signerPrivateKey),
    createdAt: '2026-10-28T10:00:00.000Z',
  })
  writeFileSync(join(dir, 'bundle.json'), JSON.stringify(bundle, null, 2))
  const tampered = structuredClone(bundle)
  tampered.members[1].payload = { delegation_id: 'sha256:example', scope: ['notes:write'] }
  writeFileSync(join(dir, 'tampered.json'), JSON.stringify(tampered, null, 2))
  const wrongKey = structuredClone(bundle)
  wrongKey.signer_public_key = publicKeyFromPrivate(createHash('sha256').update('aps-docs-example-seed:someone-else').digest('hex'))
  writeFileSync(join(dir, 'wrong-key.json'), JSON.stringify(wrongKey, null, 2))
}
