---
title: Identity and principal binding
description: What a passport establishes, how a principal binding ties an agent to a person or organization, what the 8.0.1 package exposes, and which identifier schemes are parsed versus resolved.
---

An agent's key shows that whoever signed holds that key. It does not show who the agent works for. APS keeps those two statements in separate records: a passport for the agent's own key, and a principal binding signed by the principal.

## What the published packages expose

`draft-pidlisnyi-aps-04` section 3 specifies `PassportV2` (`record_type` `aps.agent-passport`, version `2.0`) and `PrincipalBindingV1` (`record_type` `aps.principal-binding`, version `1.0`). The SDK source at commit [`f95c916`](https://github.com/agent-passport-system/agent-passport-system/tree/f95c9168187cbac0493099fe4a7cddaff653bf39/src/v2/identity-binding) implements issuing and verifying both, in `src/v2/identity-binding/`.

The published package does not reach that code. In `agent-passport-system` 8.0.1 the root import exports none of `issuePassportV2`, `verifyPassportV2`, `issuePrincipalBindingV1` or `verifyPrincipalBindingV1`, only the type `HistoricalKeyResolver`. A deep import of the compiled module fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`. The Python SDK 4.3.0 has no module for these records either.

What 8.0.1 does export for identity:

- The legacy passport: `createPassport`, `verifyPassport`, `countersignPassport` and `verifyIssuerSignature`, and the social contract wrappers on [Compatibility](/docs/compatibility/). These sign over the legacy canonicalizer.
- Identifier strings in `AuthorityDelegationV1`. `issuer`, `subject` and `verification_method` are strings, and the verifier gets keys only through the `resolveVerificationKey` function you pass. The record format does not limit which identifier scheme you use.

## The passport

A `PassportV2` carries `passport_id`, `agent_id`, `verification_method`, `public_key_multibase`, `issued_at`, `expires_at`, `nonce`, `self_asserted`, `record_type`, `version` and `signature`. It has no owner or principal member. `self_asserted` holds a sorted capabilities array and an optional display name, and every value in it is the agent's own claim.

A valid self-signature establishes that the signer holds the private key for `public_key_multibase`, and that the signed fields have not changed. It does not establish that `verification_method` belongs to `agent_id`, or that any self-asserted claim is true. A verifier reports key possession and key authority as two results. For an identifier that does not commit to its key, key authority comes from resolving `verification_method` at `issued_at` under that identifier's method and the verifier's trust policy.

The legacy passport differs: it has an `ownerAlias` field. That field is the agent's own statement. In the [Compatibility](/docs/compatibility/) example, `structurallyValid` is `true` for a self-signed passport and `issuerTrusted` stays `false` until an issuer the verifier names countersigns it.

## The principal binding

A `PrincipalBindingV1` is signed by the principal, with the key named in its `verification_method`. It carries `binding_id`, `agent_id`, `principal_id`, `verification_method`, `audiences`, `authority_profiles`, `status_uri`, `issued_at`, `expires_at`, `nonce` and `signature`. `audiences` and `authority_profiles` are non-empty sorted arrays, so a binding is scoped to the relying parties and authority profiles it names. It is not a statement that the agent represents the principal for every purpose.

A binding is revoked by a separate signed `aps.principal-binding-revocation` record. Revoking a binding does not revoke the agent's key or any delegation. Which delegations depended on the binding is defined by the enforcement profile in use.

### Claim levels

A claim level is a verifier's result, never a label the issuer chooses:

| Level | When the verifier reports it |
| --- | --- |
| `self_asserted` | The principal appears only in a self-signed or legacy passport |
| `principal_attested` | A binding's principal signature verifies and the principal's signing key resolves as authorized |
| `externally_verified_principal` | As above, and the verifier's own trust policy has also verified the principal's real-world identity |

A verifier must not infer a higher level from the presence of a field.

The source verifier `verifyPrincipalBindingV1` at `f95c916` checks the record's shape, `binding_id`, its validity window at `now`, key resolution through a `HistoricalKeyResolver` at `issued_at`, and the signature. It reports `externally_verified_principal` only when the caller passes a `principal_is_externally_verified` callback that returns true. It does not compare `audiences` or `authority_profiles` with the relying party, and it does not fetch `status_uri`. The relying party makes those checks.

## Historical key resolution

A key that signed a record is selected by the record's own `issued_at`, not by what is current at verification time. A resolver that cannot select by time, for example a `did:web` document read live, answers ambiguous instead of returning today's key. The draft's resolution outcomes are resolved, not found, ambiguous, malformed key material, unreachable and unsupported scheme. The `AuthorityDelegationV1` verifier accepts either a key string or `{ outcome }` naming one of the five failures, and reports each under its own code. See [Authority and revocation](/docs/authority/#verifying-a-chain).

The timestamp in a record is the issuer's claim. When a key was retired and the result depends on whether a record was signed before that, a profile must name acceptable timestamp evidence. Without it the key authority result is indeterminate, even with a valid signature.

## Identifier schemes in 8.0.1

| Scheme | What 8.0.1 exports | Resolves a key | Verifies a credential |
| --- | --- | --- | --- |
| `did:key` | `toDIDKey`, `fromDIDKey`, `passportToDIDKeyDocument` | Yes, the key is in the identifier. `fromDIDKey(toDIDKey(k))` returns `k` | Not applicable |
| `did:web` | `didWebToUrl`, `resolveDIDWeb` | `resolveDIDWeb` fetches the DID document over HTTPS. It reads the current document, so it cannot select a key by time | No |
| `did:aps` | No new-write helper | The draft allows reading the immutable `did:aps:z...` form for compatibility, with the embedded key as the whole identifier state | Not applicable |
| SPIFFE | `parseSPIFFEID`, `validateSpiffeId`, `importSPIFFESVID`, `jwtSvidToDidInput` | No | No. `importSPIFFESVID` maps fields of an SVID you have already verified |
| OAuth and ID-JAG | `importOAuthToken`, `mapOAuthScopes`, `verifyIdJagDescriptor`, `bindIdJagGrant` | No | `importOAuthToken` maps claims of a token you have already verified. It requires `sub`, `iss` and `exp` and checks no signature. `verifyIdJagDescriptor` checks the APS binding descriptor built by `bindIdJagGrant`, including the caller's signature on it, and reports external constraints it did not check, such as audience, as unenforced |

Parsing or carrying an identifier is not the same as resolving its key, and resolving a key is not the same as trusting it for a given authorization. Each of those is a separate decision in the relying party's trust policy.

## Where the rules come from

The record layouts, claim levels and key selection rules on this page are from `draft-pidlisnyi-aps-04` sections 3.1 to 3.5. The export lists are from the 8.0.1 package, checked by importing it.
