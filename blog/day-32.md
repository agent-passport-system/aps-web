---
id: "day-32"
title: "Day 32: Data Attribution Starts Here"
date: "2026-03-20"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 32: Data Attribution Starts Here

Listening to Bernie Sanders talk about data rights and realizing the protocol already had 80% of the answer. The gateway tracks what agents access (taint tracking). The Merkle trees commit receipts. The delegation chains prove authorization. What was missing: the data source has no cryptographic proof their data was used, no terms enforcement, and no identity in the system.

**The design process.** Gave three models the same open-ended problem independently: "the protocol tracks what agents DO but not what data CONTRIBUTES. How would you solve this?" No templates, no type hints. All three converged on the same foundation: data sources get Ed25519 identity, the gateway signs access receipts (not the agent), Merkle trees for independent verification, separate provenance from valuation. Then six rounds of hostile review against the merged spec. Ten rounds total before a single line of code.

**The key insight everyone converged on:** access is not contribution, and contribution is not value. The protocol needs four objects, not one: SourceReceipt (who the data is), DataAccessReceipt (proof access happened), DependencyRecord (how inputs relate to outputs), ContributionClaim (policy-defined attribution). Brief 1 ships the first two. The rest builds on top.

**Module 36A: Data Source Registration & Access Receipts.** Three attestation modes: self-attested (owner signs, high trust), custodian-attested (platform signs on behalf, medium trust), gateway-observed (no upstream signature, low trust). Trust level propagates to every downstream object. Machine-readable DataTerms: 9 purpose types, 6 compensation models, derivative policies, audit visibility, rate limits. The terms snapshot rule freezes terms at access time. If a source later changes terms, historical receipts are unchanged. The access was authorized under THOSE terms, period.

**Hard vs advisory compliance.** Deterministic checks (revoked source, expired terms, excluded agent) block access inline. Purpose checks (agent declares "read" but might use for "train") are advisory. The gateway cannot verify actual usage intent. Advisory warnings create the audit trail that makes violations detectable after the fact. This distinction survived every hostile review.

**The honest framing.** These receipts provide cryptographic accountability, not independent verification. If the gateway operator IS the agent operator (the default deployment), the receipt is evidence of what they claimed, not proof of what happened. That is still more than any existing system provides. And it makes gateway dishonesty detectable and attributable.

14 functions. 2884 tests. Zero failures. The foundation for data attribution is live. Prove use before trying to price it.
