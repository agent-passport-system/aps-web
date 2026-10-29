---
title: Languages and artifacts
description: Which artifact each SDK release can create, parse and verify, with the time, key, trust and revocation inputs it takes.
---

The four SDKs do not share one feature set. Pick the SDK by the artifact you have to produce or verify. The table describes these releases:

| SDK | Release | Source revision checked |
| --- | --- | --- |
| TypeScript | npm `agent-passport-system` 8.0.1 | `f95c916` |
| Python | PyPI `agent-passport-system` 4.3.0 | `ae274f1` |
| Go | `github.com/aeoess/agent-passport-go` v0.7.0 | `d3722ca` |
| Rust | crates.io `agent-passport-system` 0.3.0, library `agent_passport` | `7e0eb82` |

The Go module path is `github.com/aeoess/agent-passport-go`, as `go.mod` declares. The repository now lives under the `agent-passport-system` GitHub organization, and the import path is unchanged.

## Artifact support

| Artifact | TypeScript 8.0.1 | Python 4.3.0 | Go v0.7.0 | Rust 0.3.0 |
| --- | --- | --- | --- | --- |
| `AuthorityDelegationV1` | Issue, sub-issue, parse, verify a chain with explicit `now`, key resolver, root trust and revocation resolver, budget ledger | The same set | None | None |
| `AuthorityRevocationV1` | Issue, verify, record, resolver | The same set | None | None |
| `ReceiptV1` (`aps-receipt-v1`) | Create, verify, strict serialized verify, decision binding check | The same functions are exported | Create, verify, strict parse. No decision binding check | Verify only. No decision binding check |
| `aps-mcp-1` authorization | Issue, verify, host middleware | None | None | None |
| Legacy passport | Create, verify, countersign. The clock is optional and defaults to the system time | Create, verify. Expiry is checked against the system clock only | Create, verify, countersign. An empty `Now` skips the expiry check | Verify only. `evaluation_time` is required |
| Legacy `Delegation` | Create, sub-delegate, verify one record against the system clock. `validateChain` and `revokeDelegation` throw in 8.0.1 | Create, sub-delegate, verify one record against the system clock and the record's own `revoked` flag | Create, sub-delegate, verify one record with `VerifyDelegationAt(now)`. `VerifyDelegationChain` checks narrowing only | Verify only: a chain with trust roots, signatures, time window, narrowing and a revocation resolver |
| Legacy camelCase `ActionReceipt` | Create, verify | Create, verify | The type and its hash. No exported verifier | None |
| Canonicalization | Legacy `canonicalize` and RFC 8785 `canonicalizeJCS` | Legacy and JCS, and a strict I-JSON parser | JCS only. Legacy records are signed over JCS | Legacy and JCS, and a strict I-JSON parser |

Go also has a separate composition chain format (links with `delegator`, `delegatee` and `scope`) that `VerifyChainAuthorization` checks against trusted roots, scope narrowing and a revocation resolver. It is not the camelCase legacy `Delegation`.

How each cell was established:

- TypeScript, from the published 8.0.1 declarations, with each named function checked as a root export. The [Quickstart](/docs/quickstart/) program issues and verifies `AuthorityDelegationV1`, `AuthorityRevocationV1` and `ReceiptV1` records.
- Python `AuthorityDelegationV1` and `AuthorityRevocationV1`, from a program run against the 4.3.0 wheel that issued a two link chain, verified it at three times, revoked it and reserved spend. The [Install](/docs/install/#python) page has a tested recipe. Python `ReceiptV1` and legacy `ActionReceipt` support rests on the exported functions only. No Python receipt was created for this page.
- Go and Rust, from reading the exported API at the source revision. Both libraries' own test suites passed at that revision when built offline (`go build`, `go vet`, `go test`, and `cargo test` with 151 tests passing). No program written for this page exercised each Go or Rust cell.

Shared names across languages do not prove the same bytes or the same results. No cross-language parity run was made for this page.

## Behavior that differs

- Go signs legacy passports and delegations over JCS. TypeScript signs them over the legacy canonicalizer, which drops object members whose value is `null`. The two produce the same bytes only for a record with no `null` members. This comes from the source and was not tested.
- Rust `verify_chain_authorization` never authorizes. Without a revocation resolver it ends in `RevocationIndeterminate`. Use `verify_chain_authorization_with_revocation`. Go `VerifyChainAuthorization` with no resolver returns `REVOCATION_INDETERMINATE`.
- Go treats an empty `Now` differently by artifact. A composition chain falls back to the system clock, and a passport skips its expiry check.
- The TypeScript and Python budget ledgers take a chain the caller has already verified. They do not check revocation or time. In the Python run, a reservation on a chain whose root had been revoked succeeded. Verify the chain first.
- The revocation resolvers answer from what the store holds, not from the verification time. In the Python run, a chain checked at 22:10 against a revocation with `revoked_at` 22:20 returned `REVOKED`.

## Runtime requirements

| SDK | From the manifest | Smoke check |
| --- | --- | --- |
| TypeScript | `"node": ">=18.0.0"`, ES modules | Run on Node.js 24.11.1, see [Install](/docs/install/#typescript) |
| Python | `requires-python = ">=3.10"` | Run on Python 3.14.6, see [Install](/docs/install/#python) |
| Go | `go 1.22` | Built offline on go1.26.3 against the published v0.7.0 files. `go get` itself was not run for this page |
| Rust | `edition = "2021"`, no `rust-version` field | Built offline on rustc 1.95.0 against the published 0.3.0 files. `cargo add` itself was not run for this page |

The Rust crate declares no minimum compiler version, so none is given here. The minimum versions in the manifests were not run.

## Language READMEs

Some README statements differ from these releases:

- The Rust README says the seven facet record does not exist in any language yet. Python 4.3.0 and TypeScript 8.0.1 both issue and verify it.
- The Rust README says it is the matching verifier for TypeScript, Python and Go output. It does not verify `AuthorityDelegationV1`, `AuthorityRevocationV1`, `aps-mcp-1` authorizations or the camelCase `ActionReceipt`.
- The Rust README says low-order Ed25519 keys are accepted. The crate verifies with `verify_strict`, and its admissibility tests reject small-order keys and `R` values. Go rejects them in `VerifyEd25519`.
- The Python README cites TypeScript 2.6.0-alpha.0 fixtures, and its module table leaves out `v2.authority_revocation` and `receipt_core`, both of which ship in 4.3.0.

Where a README and this page disagree, the source at the revision above decides.
