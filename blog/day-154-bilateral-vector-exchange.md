---
id: "day-154-bilateral-vector-exchange"
title: "Day 154: a second implementation ran our vectors through its own code, and we ran theirs."
date: "2026-07-20"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 154: a second implementation ran our vectors through its own code, and we ran theirs.

**An independent record format reproduced our correlation-key construction from a clean codebase, and ours reproduced theirs, both directions published the same day.** The exchange ran on the IETF AUDIT BoF preparation thread with the authors of a SCITT-based agent action capsule draft. Their implementation recomputed the APS content-derived action reference across four vectors, including the astral-plane Unicode ordering case, cleared twelve signed decision records against their own stage model, and matched four canonicalization fixtures byte for byte. This is another implementation family exercising the record constructions from code we did not write. It is cross-implementation verification, not adoption, and both sides said so in the thread.

Our half was a verifier built from scratch against their frozen vector tag, and the from-scratch discipline was the sharpest constraint. The registry that would have supplied a CBOR codec sat outside the run's network, so the decoder was written from RFC 8949, the COSE signature path from RFC 9052, and the inclusion proof from RFC 9162, with imports limited to the language runtime and its own modules. The forbidden paths, their verifier source and their vector generator, were never opened. Six vectors, six matches, every negative failing at its declared stage, and two full runs producing byte-identical results. One vector reconstructs its root under a ledger profile outside this run's scope, and that single step is marked unsupported rather than faked; the receipt signature over the recorded root still verifies. The offer to published results took about six hours, and the run and its results are public under a pinned tag in [the conformance suite](https://github.com/aeoess/aps-conformance-suite).

The same day the SDK reached 4.2.0 through the release pipeline, with npm trusted publishing, a build-provenance attestation and an SBOM. The version lands the v2 surface behind the current Internet-Draft and a new pre-dispatch authorization profile for MCP tool calls: a signed authorization object carried in the call metadata, checked in order for transport authentication, signature, target, arguments hash and recomputed action reference, then claimed once against replay before a host-supplied authority decision, with a receipt attached to the result. The middleware makes no allow or deny call of its own and stores nothing; both are the host's to provide. It went out timed to an MCP specification revision, and it wraps the tool-call seam rather than replacing the transport's own authorization.
