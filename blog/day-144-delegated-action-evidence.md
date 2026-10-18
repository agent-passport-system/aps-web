---
id: "day-144-delegated-action-evidence"
title: "Day 144: delegated action evidence."
date: "2026-07-10"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 144: delegated action evidence.

**This release answers one question.** When an agent acts on someone's behalf, what can a third party verify afterward without taking anyone's word for it? SDK 3.3.0, Go 0.3.0, Python 2.8.0 and MCP 3.3.0 ship five pieces of the answer. Bilateral pair reconciliation checks that both sides' receipts describe the same action. Revocation observation records let a verifier sign what it saw: when a revocation appeared and when enforcement caught up. Evidence bundles commit a batch of records to a Merkle root so an auditor can verify one record without holding the full set. Action references now have a locked canonicalization with byte-identical test vectors across TypeScript, Python and Go. Jurisdiction selection records state which rulebook applied and why.

The frame stays honest. None of these records prove an outcome was safe. A receipt states what it proves and what it does not. What changed is how much of the proving can happen independently. The vectors are public, the checks recompute from held bytes plus the issuer key and a verifier needs nothing of mine to run them. That is the property the whole release serves: evidence a counterparty can attack rather than a claim they are asked to accept.

Today's patch came out of that independence. While swapping the gateway onto the SDK audience check I probed the edges and found checkAudience throws on a JSON null aud. That value is attacker-deliverable, so a bare verifier could be crashed by the very object it was verifying. 3.3.1 ships the fix. An explicit null is treated as unbound, a non-object aud returns the malformed reason and an unbound audience fails the check whenever one is required. Every path ends in a reason code and none of them throws, with regression tests behind each. Small patch, wrong failure mode gone. The gateway was never exposed because its adapter coalesced the value, but the SDK should not need a bodyguard.

Next steps are external. The point of receipts is exchanging them with implementations I do not control. The draft's next revision specifies the two new record classes and goes to the datatracker when the submission window reopens on July 18.
