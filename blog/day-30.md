---
id: "day-30"
title: "Day 30: Three Modules in One Day. Two Claudes Built Them."
date: "2026-03-17"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 30: Three Modules in One Day. Two Claudes Built Them.

Module 19: E2E Encrypted Messaging. Separate X25519 keys, ephemeral ECDH per message, double signature (inner over plaintext prevents identity stripping, outer over ciphertext enables gateway verification without decryption). Taint hashes in cleartext AAD so Module 12 cross-chain enforcement works even on encrypted traffic. libsodium-wrappers. 2884 tests including wrong-recipient, surreptitious forwarding, tampered ciphertext, and identity stripping attacks. Consensus spec from GPT + Gemini + Claude hostile review.

Module 20: Obligations Model. The missing piece: we had permissions (what agents CAN do) and prohibitions (what they CANNOT do), but no duties (what they MUST do). Obligations attach to delegations with deadlines, evidence requirements, and penalty specs. Parameterized constraints catch malicious compliance — a $0.01 refund doesn't satisfy a "process $500 refund" obligation. Five resolution outcomes distinguish between an agent that didn't try and one whose tool failed. Penalty severity monotonically narrows in sub-delegations. 2884 tests. Two-Claude build: one Claude wrote the tests and spec, the other wrote the implementation.

Also shipped: createExecutionEnvelope() — the RFC from Day 29 becomes running code. Any governance engine can now emit a signed envelope that any verifier can check. Protocol: 42 modules, 2884 tests.
