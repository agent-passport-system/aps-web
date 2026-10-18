---
id: "day-140-first-self-signing-release"
title: "Day 140: the first release that signs itself, and two bugs the fuzzers found before anyone else could."
date: "2026-07-08"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 140: the first release that signs itself, and two bugs the fuzzers found before anyone else could.

**`agent-passport-system@3.2.0` published to npm through a tag-triggered pipeline that proves its own provenance, with no stored token anywhere.** Pushing a version tag now runs the full gate (type-check, test, audit), builds, publishes over OIDC Trusted Publishing, and attaches a signed SLSA provenance attestation and the tarball to the [GitHub release](https://github.com/aeoess/agent-passport-system/releases/tag/v3.2.0). The registry can show, per release, that the artifact came from this workflow in this repo and nowhere else. The alternative was a long-lived publish token sitting in the repo as a standing credential, which is exactly the kind of ambient authority the protocol argues against, so the release path does not hold one.

The same release shipped coverage-guided fuzzing, and it earned its place immediately by finding two real bugs. Seven Jazzer.js harnesses, ClusterFuzzLite, and fast-check property tests now run against the parsing and verification surface. Two genuine defects surfaced and were fixed before this version tagged: a CBOR map-length case that hung the invite decoder, and `verifyPassport` throwing on a non-array `delegations` field instead of rejecting cleanly. A verifier that crashes on malformed input is a verifier an attacker can take offline with a single bad byte. Both are closed, both have regression coverage, and the fuzzers keep running.
