---
id: "day-133-authority-checked-inside-the-lock"
title: "Day 133: the hosted gateway's money path now checks authority where it counts, inside the write lock."
date: "2026-07-01"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 133: the hosted gateway's money path now checks authority where it counts, inside the write lock.

**The gateway's delegation and receipt paths went through five rounds of adversarial review across three independent models, each round attacking the previous round's fixes, and the surviving stack deployed today.** A receipt is now signature-verified at ingestion before it is stored, so the store holds evidence rather than claims. Root authority became an origin property: an agent that has ever received a delegation is never inferred to be a root, roots are designated through an audited admin action, and a designated root that later accepts an inbound delegation is demoted in the same transaction that records the delegation, with an audit row naming the cause. Restoring it takes an explicit re-designation with a written reason. The review's last finding was the sharpest: the grant path read the grantor's authority before taking the write lock, so across processes a revocation or demotion could land between the check and the insert. The grant now re-verifies the grantor's status, root standing, and inbound delegation inside a write-locked transaction, and a mismatch fails the grant instead of committing on a stale read. The schema migration behind all of this is transactional and marker-gated, so a crash between the column add and the backfill re-runs instead of silently skipping.

**The Go SDK caught up to the same honesty rule the TypeScript SDK shipped a day earlier.** Go's `TraceBeneficiary` used to report `verified: true` from lookup success alone, with no signature checked anywhere. It now carries the same split as TS 3.0.0: `resolved` means the chain maps to a known beneficiary, and `verified` means the receipt signature and every delegation hop pass real Ed25519 verification, with a [cross-implementation test](https://github.com/aeoess/agent-passport-go/commit/3b8c128) holding the two SDKs to the same answers on the same fixtures. A field named verified that never ran a verifier is the exact failure mode the protocol exists to remove, and it is now gone from every SDK that had it. The weekly cross-vendor token exchange also continued: this week's AgentLair pair verified against their published JWKS and landed in the [conformance suite](https://github.com/aeoess/aps-conformance-suite/tree/main/fixtures/cross-stack/aat-amdal), with an opt-in act-binding claim joining the cadence next week.
