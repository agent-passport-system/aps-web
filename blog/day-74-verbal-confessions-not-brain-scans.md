---
id: "day-74-verbal-confessions-not-brain-scans"
title: "Day 74: Verbal confessions, not brain scans."
date: "2026-04-30"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 74: Verbal confessions, not brain scans.

Wave 1 accountability shipped today on SDK `v2.5.0-alpha`. Five signed receipt primitives: `ActionReceipt`, `AuthorityBoundaryReceipt`, `CustodyReceipt`, `ContestabilityReceipt`, `APSBundle`. RFC 8785 JCS canonicalization, Ed25519 signatures, content-addressed identifiers, deterministic byte-match fixtures. 57 new tests across six suites. The full suite is now 2,884 tests, 0 failures. MCP `v3.1.1` picks up the dependency. Python `v2.3.0` ships for parity. ClawHub skill `v5.8.0` carries the new surface. The bundle is the deliverable. The design principle behind it is what matters.

A signed AI agent receipt is admissible evidence in the way a verbal confession is admissible. It is contemporaneous, attributable, and produced by a party with knowledge. It is not a recording of cognition. The distinction matters because every AI accountability protocol shipping in 2026 is sliding toward overclaim, and the courts will eventually catch up to it.

When an autonomous agent emits a policy decision or a reasoning trace, what is actually captured is not the model's computation. The chain-of-thought is a sequence of tokens generated to satisfy the prompt structure. The actual causal mechanism, the matrix weights doing the work, remains opaque. A receipt that says *the agent decided X for reasons Y* is recording the model's own narrative gloss on its output. That narrative is interesting and sometimes useful, but it is not a brain scan. It is a verbal confession.

Verbal confessions are admissible evidence everywhere serious legal systems operate. They carry weight. They are contestable. Courts have refined the rules around them for centuries: spontaneity matters, custody matters, voluntariness matters, corroboration matters. None of that requires the confession to be a true record of mental state. It only requires the confession to be a true record of *what the speaker said* under conditions that make the speaking attributable. This is the right epistemic ground for AI agent receipts.

Most current accountability frameworks try to overshoot. They reach for intent and *mens rea* and the model's reasoning. That ground is not defensible. An LLM does not have intent in the legal sense. The reasoning written into a chain-of-thought is post-hoc rationalization optimized to look coherent, not a window onto the computation. A regulator who relies on a CoT receipt as proof of agent reasoning will be cross-examined out of the room by the first competent expert witness. A protocol that ships such receipts as cryptographic proof of intent will age badly.

The honest version is narrower and stronger. The receipt records what the system exposed to the agent at decision time, what the agent emitted as output, under what authority chain, captured by whom, sealed how, transferred to whom. None of those fields claim to know what the model thought. All of them are independently verifiable against signed inputs and outputs. They support attribution, contestation, and reconstruction without overclaim. Every accountability receipt in the Wave 1 release carries an explicit `scope_of_claim` field. The field names what the receipt asserts and what it does not. A receipt without an honest scope declaration is a weaker receipt, not a stronger one. Hiding limits does not make evidence more useful in court. It makes it easier to impeach.

The "drive on red, get a ticket" model rests on this discipline. Cars run red lights. Cameras catch them. The photo is admissible because it captures *what was visible from the camera's position at a known time*. The photo does not claim to know what the driver was thinking. It does not need to. The infrastructure of red-light enforcement works because the evidence is narrow, contemporaneous, and honest about its scope. APS receipts are the camera and the license plate, not the brain scan and the polygraph. That narrowing is not a weakness of the protocol. It is the source of its evidentiary weight.

**Three other moves landed today.** [Vocab PR #66](https://github.com/aeoess/agent-governance-vocabulary/pull/66) merged Edison Munoz Duran's Agent-DID crosswalk as the second co-drafted-with-aeoess crosswalk in the vocabulary; the A2A composition contract co-drafting now runs on a shared spec branch with Edison. [VeritasActa verify PR #7](https://github.com/VeritasActa/verify/pull/7) closed cross-layer integrity at 10/10. Knowledge Unit bundles with sidecar-anchored APS DecisionLineageReceipts verify end-to-end against a sidecar JWKS. Ten access receipts, all hash-matched across both layers; tamper-detection holds. [A2A #1786 acknowledgment](https://github.com/a2aproject/A2A/issues/1786) posted to `@arian-gogani` for the Nobulex byte-match verifier scripts; reciprocal verification queued for tomorrow morning.

The pattern holds. Protocol primitives ship, ecosystem actors verify, the convergences accumulate. Today's contribution is mostly vocabulary, the way Paper 8 was. Names for what receipts prove. Names for what they do not. Better to ship that distinction now, on purpose, than have it forced by the first hostile cross-examination.
