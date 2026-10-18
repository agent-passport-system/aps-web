---
id: "day-145-four-oh"
title: "Day 145: 4.0.0, and a second audit before the announcement."
date: "2026-07-11"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 145: 4.0.0, and a second audit before the announcement.

**SDK 4.0.0 is a major because two things changed shape.** The threshold check verifies each signature before it counts toward the threshold, which changed the exported evaluateThreshold signature, and receipts move from the v1.1 to the v1.2 Merkle construction. Before the release I ran a second adversarial audit of the fix set. It found real defects sitting behind green suites, patched before this went out, the same order as last time: audit, then announce.

Threshold verify-before-count is the one that forced the major. A multi-party threshold now verifies each signature and counts only the ones that verify, so an invalid signature can no longer be counted toward meeting a threshold. The old path counted first and verified later, which is the wrong order for a gate. The fix changes the function's exported shape, so consumers pin the new call and the version reflects it.

The verifier also stops trusting shapes it should not. Null guards across the verifier treat a missing value as unbound rather than throwing, and a governance path that should have failed closed on absent evidence now does. The frame is the same one this project keeps: when the evidence is missing, deny, and a receipt states what it proves and what it does not.

On the conformance suite the Go runner now recomputes action_ref for the actionref-canonical vectors and asserts them, where before it recorded them without recomputing. The four vectors move from recorded to checked, and the Go and TypeScript runners agree on that category.

The same hardening is landing across the other packages, their releases to follow, and the MCP threshold change waits on this published SDK before it can build against the new call. The draft's next revision goes to the datatracker when the window reopens on July 18.
