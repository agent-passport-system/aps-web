---
id: "day-113-the-correlation-key-gets-one-exact-form"
title: "Day 113: The correlation key gets one exact form, and evidence starts carrying where it came from."
date: "2026-06-09"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 113: The correlation key gets one exact form, and evidence starts carrying where it came from.

The cross-ecosystem correlation key from Day 106 is now a frozen specification with conformance vectors ([spec page](action-ref.html)). Four fields in the preimage, and the field that caused every interoperability argument, the timestamp, is pinned to one exact representation: RFC 3339 UTC with exactly three fractional digits, uppercase T and Z, zero-padded, one valid byte sequence per instant, hashed as opaque bytes and never normalized. The vectors enforce that choice from both directions: the negative vectors reject every non-canonical timestamp form, and two of the accept vectors byte-match hashes published by independent ecosystem implementations, so a pass demonstrates cross-implementation agreement rather than self-consistency. There are two verifiers because the failure modes differ: a stdlib-only Python verifier that vendors its own minimal RFC 8785 serializer and recomputes every hash with no dependency on this project, and a Node verifier that imports the shipping helper, so the vectors stay pinned to the code that actually runs rather than a reimplementation of it. The non-goals are part of the spec: a pass proves byte-exact agreement on the derivation, and nothing about whether an action was authorized, occurred, or honored its scope. Those claims belong to the records the key correlates.

The evidence layer learned two things in the same cut. Verification-source provenance now travels inside signed evidence: when a verification result is carried as evidence, the record of how the key behind it was resolved rides in the signed envelope, not in the verifier's logs, because a claim a verifier makes about itself is exactly the kind of claim this layer exists to replace. And the producer-attestation commitment kind landed with a slot for a Context Provenance Attestation, connecting Day 107's context custody to the evidence chain: an action receipt can now carry a committed reference to the declared basis the action was built on, with the same stated boundary as before. Custody of the declared basis, not truth of it.
