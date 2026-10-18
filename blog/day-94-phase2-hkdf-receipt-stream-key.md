---
id: "day-94-phase2-hkdf-receipt-stream-key"
title: "Day 94: HKDF receipt-stream-key derivation replaces the placeholder."
date: "2026-05-21"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 94: HKDF receipt-stream-key derivation replaces the placeholder.

The Rust verifier's receipt-stream MAC path had carried `mac_key = [0u8; 32]` as a placeholder since Stream A landed. A literal zero-byte MAC key fails the per-stream uniqueness property in the most direct way possible: every stream has the same key, so cross-stream replay is trivial and recovery cannot distinguish streams. Phase 2 item 1 closes that gap. Branch `phase2/hkdf-receipt-stream-key`, commits `3aa9544` and `dbee6b3`. HKDF-SHA-256 with explicit TLV-framed info parameter replaces the placeholder at both derivation sites (`compiled.rs::from_passport` and `lib.rs::load_passport_with_recovery`).

The design discipline is in the info parameter. RFC 5869 makes that field the binding between context and derived key, so the bytes that go in are load-bearing. The set: `aps:v1:receipt-stream-mac` as the domain-separation tag, followed by length-prefixed `delegation_chain_hash`, `stream_id` as UTF-8 with explicit length prefix, and the four-byte big-endian `revocation_epoch`. The IKM is the passport's Ed25519 signature bytes, which means the IKM is publicly recomputable from the passport JSON. That is consistent with the spec's threat model boundary at receipt_log.rs: the MAC key's secrecy is not what provides above-Tier-1 protection, the integrity of the chain is. Domain separation is the property the HKDF provides.

Test count moved from 191 to 206 with the additions to `tests/key_derivation.rs`. RFC 5869 known-answer vectors A.1, A.2, A.3 all pass. Recovery round-trips through the new derivation in the runtime SDK tests. The Stream B (TypeScript bindings) and Stream C (benchmark harness) work resumes after this item lands. The phase-2 sequence is narrow on purpose: replace one primitive at a time, prove domain separation, do not expand into a full key-management redesign.
