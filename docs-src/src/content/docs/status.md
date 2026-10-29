---
title: Status and conformance
description: How the SDK import paths, SDK maturity labels, the draft's Core and Candidate status, conformance classes and corpus evidence relate, and how to run the conformance corpus.
---

APS uses several status labels, and each answers a different question. None of them implies another.

## The axes

| Axis | Labels | What it answers | Where it is defined |
| --- | --- | --- | --- |
| Package entry point | `agent-passport-system` (root) and `agent-passport-system/core` | Which functions an import reaches. `/core` is a curated set of 25 older functions, and three of them throw in 8.0.1 | The package `exports` map |
| SDK maturity | Canonical, Production-Extension, Experimental | How stable an SDK surface is expected to be | [Status labels](/docs/evidence/#status-labels) |
| Draft normative status | Core, Candidate | Whether a requirement binds every implementation of a conformance class, or only one that claims an opt-in feature | `draft-pidlisnyi-aps-04` section 13.3 |
| Conformance class | Authority issuer, Delegation verifier, Lifecycle and status verifier, Receipt verifier, Enforcement boundary, Profile implementation, Protocol adapter | Which obligations a claim covers | Draft section 13.1 |
| Corpus evidence | Per-vector results, Mode A and Mode B, author-produced and independent | Who ran which vectors with which implementation | The conformance corpus |

A curated import is not the draft's Core. An SDK label of Canonical is not a statement that a surface meets a draft requirement. A passing corpus run is not a deployment.

## Core and Candidate

In draft -04, Core means a requirement is mandatory for an implementation that claims the conformance class it applies to. Candidate means the requirement belongs to an opt-in feature: it is normative for an implementation that claims that feature, and is not part of APS Core conformance. Candidate is not weaker language, not a lower grade of Core, and not a promise of promotion.

The Candidate features an implementation can claim in -04 include the revocation record format of section 4.5.2, the evidence model of sections 2.3 and 2.4, the profile model of section 6, the lifecycle mechanisms of section 8.3, the decision to effect model of section 9, the adapter contracts of section 11.4 and the per-vector result vocabulary of section 13.5. A claim takes the form "APS Core in the named classes, plus named features". A claim that names no feature is a claim of APS Core alone.

The conformance classes are not a maturity ladder and are not ordered. A claim names its classes and must not present one class as covering another.

## The draft

`draft-pidlisnyi-aps-04` was submitted as an individual Internet-Draft. It is not an IETF standard and has no standing in the IETF standards process. Its status is on the [Datatracker](https://datatracker.ietf.org/doc/draft-pidlisnyi-aps/).

## Verify your implementation

The APS corpus in the Agent Authority Conformance lab holds byte-level vectors, verifier adapters and run reports. At commit `f6890d99`:

```bash
npm ci --include=dev && npm test
```

That run, on a copy of the corpus at that commit with Node.js 24, exited 0 for both commands and ended with:

```text
PASSED: reference-boundary matched every presentation, every defective policy matched its declared categories
```

What the corpus README states about that run: after dependencies are installed it makes no network calls, exit 0 means every APS-native vector passed, and external-system families under `fixtures/cross-stack/` are not executed by `npm test`. Each of those declares its own reproduction commands.

To report a run, the README asks for the verbatim output in a run report issue or committed under `interop/`, and `docs/RUN-REPORT.md` describes a report for vectors run with your own implementation. Record the corpus commit, your implementation and its version, the family and profile you ran, and each vector's result, including the axes you do not support.

The corpus labels each record by who ran what: Mode A is a reproduction with the corpus's own runner, Mode B is a recomputation with another implementation, and each is either author-produced or independent.

## What a passing run does not establish

From draft section 13.6: a passing run shows that a boundary implementing the reading under test reaches a stated verdict on stated bytes, and that the named defective boundaries diverge on exactly their declared sets. It does not show that the reading is the correct one. It does not show that the reference runners are independent implementations, since both were written for the corpus by the draft's author. It does not show adoption, endorsement or production use by anyone whose artifacts the corpus carries.

The corpus README adds that the corpus is not a normative specification, not a substitute for the SDK's own test suite, and not a validator of an implementation's API surface.
