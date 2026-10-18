---
id: "day-132-verified-means-a-verifier-ran"
title: "Day 132: verified now means a verifier ran, and the SDK takes a major version to say so."
date: "2026-06-30"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 132: verified now means a verifier ran, and the SDK takes a major version to say so.

**TypeScript SDK 3.0.0 changes what `traceBeneficiary().verified` means, and the change is breaking on purpose.** The field used to report lookup success: the chain resolved to a known beneficiary, so it said true. It now reports cryptography: the receipt signature checks out under Ed25519 and every hop in the delegation chain passes signature and temporal verification, or the field is false. The old semantics did not disappear, they moved to a new `resolved` field with an honest name, so a caller that only needs lineage still gets it and a caller that needs proof can no longer mistake one for the other. [Python 2.6.0](https://pypi.org/project/agent-passport-system/) ships the same pair, and the two SDKs produce byte-identical RFC 8785 canonical payloads on shared fixtures, verified in both directions.

**A second primitive shipped alongside it: a stateless verifier for composition-check receipts.** `CompositionCheckV0` follows the same produce and verify split as the Regulated Action Profile: an attestor produces the receipt, the SDK only verifies the anchor, meaning the signature, the binding to the checked artifact, freshness, attestor trust, and whether the attestor is independent of the party it checked. The result is a small enum, pass, fail, indeterminate, or not_checked, and there is no boolean named safe anywhere in the type, because a receipt can state that a check ran and what it returned without claiming the composition is harmless. Independence is classified from the caller's own trust context rather than from anything the attestor says about itself.
