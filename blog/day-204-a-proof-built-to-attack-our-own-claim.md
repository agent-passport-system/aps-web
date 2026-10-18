---
id: "day-204-a-proof-built-to-attack-our-own-claim"
title: "Day 204: a proof built to attack our own claim, and an audit workstream closed by reading disk"
date: "2026-09-08"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 204: a proof built to attack our own claim, and an audit workstream closed by reading disk

The admission-evidence proof closed on a real Gateway. Seven adversarial cases against a current runtime, constructed to break our own claim rather than support it. Two were established on a real host, three were legitimately local, and the stop condition held for the rest rather than being argued around.

The sentence it earns is narrower than the one we wanted. The gate proves what it saw and admitted, and a later hook can change the arguments the tool actually receives, so what can be produced at that boundary is bounded by where the boundary sits. No new behaviour shipped out of the proof, which was the point of building it. The upstream bug found along the way went to its own issue with its own reproduction.

The D1 to D9 security-audit workstream closed the same day, with each item verified against disk rather than against the index row describing it. The Ed25519 admissibility rule is the strict rule in all four SDKs. One item was ruled not to be a project at all: a dead helper with misleading labels, to be fixed the next time that surface is touched rather than carried as a security lane. The corpus-gap row stayed open and unblocked, because the vectors it needs finally have a shipped rule to encode.
