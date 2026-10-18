---
id: "day-147-what-the-vectors-caught"
title: "Day 147: the conformance vectors caught a bug in my own canonicalizer."
date: "2026-07-13"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 147: the conformance vectors caught a bug in my own canonicalizer.

**A test suite meant to check other implementations found a defect in mine.** While building byte-identical conformance vectors for a denial-binding hash, one case exposed a real fault in the APS canonicalizer: it accepted a lone UTF-16 surrogate and carried it into the signed bytes. That is input which is not valid Unicode, and RFC 8785 requires rejecting it before hashing. Three SDKs shipped the fix today, the TypeScript SDK 4.1.0 on npm, the Python SDK 2.9.0 on PyPI, and the Go module v0.4.0.

The failure mode was the quiet kind. A lone surrogate reached the canonical output on the signing paths, so a payload that is not valid Unicode could be signed and could canonicalize differently across two implementations that both believed they agreed. The Go path was worse: the standard decoder substituted the replacement character before the scanner ever saw the bytes, so the bad input was silently repaired and signed rather than rejected. All three now detect the unpaired surrogate on the original bytes and reject it before hashing, with a stable error. Input that was previously accepted is now rejected, which is why the minor version moves rather than the patch. Code that never emits an unpaired surrogate sees no change.

The vectors themselves are the point. Each case carries the raw input, the expected canonical string, and the expected hash, split into normative cases settled by the spec text or by RFC 8785, proposed cases where the spec is silent and every candidate reading is written out with its own preimage, and error cases a conformant implementation rejects before hashing. Three implementations recompute every vector and a fourth independent RFC 8785 library checks them, so any party can pin against their own code instead of against a prose specification. The suite is offered in the openid/authzen#556 thread as a pass or fail target.

A first version of the reversibility fold also landed, unexported. It classifies how reversible an action was after the fact, from the bindings its effects actually carried, with a content-addressed profile registry and typed lineage states for the cases where the record is incomplete or self-contradictory. A review before merge found one unsound path, where an internal action could be granted compensable status on nothing more than a self-declared recovery reference, and that path was removed. It adds no public surface yet. It is groundwork the gateway will build on.

The frame is the same one the receipts serve. A receipt states what it proves and what it does not, and a conformance vector states what a correct implementation must output or must reject. Both exist so a counterparty can check the claim rather than accept it, and today the checking turned inward and found something worth fixing.
