---
id: "day-28"
title: "Day 28: A Contribution PR Merged into the Microsoft Agent Governance Toolkit. A Federal Agency Is Reviewing."
date: "2026-03-16"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 28: A Contribution PR Merged into the Microsoft Agent Governance Toolkit. A Federal Agency Is Reviewing.

The weekend the protocol stopped being just mine.

**Microsoft.** PR #274, a contribution PR, merged into [microsoft/agent-governance-toolkit](https://github.com/microsoft/agent-governance-toolkit/pull/274) by a Microsoft maintainer. Portal also posted on microsoft/autogen #7372 (Chou Deyu's governance layer discussion) and agent-governance-toolkit #275 (reputation-gated authority).

**NIST.** Third revision of our public comment submitted to the NCCoE on their "Software and AI Agent Identity and Authorization" concept paper. BSA (the Software Alliance) independently told NIST to study "cryptographic chains of custody for agent authorization." That's our architecture. April 2 deadline for the comment period. We're in.

**IETF.** Sanjeev Kumar, author of the DAAP draft (draft-mishra-oauth-agent-grants-01 — the OAuth extension for AI agent delegation), emailed back. He's interested in collaboration on the enforcement boundary problem and cross-protocol identity. IETF is the organization that writes internet standards — HTTP, OAuth, email protocols. Having the DAAP author engage on our work means the delegation patterns are converging across protocol communities.

**Ecosystem outreach.** Drafted and prepared responses for five more discussions: Anthropic claude-code #32514 (sub-agent identity problem — our delegation chains are the protocol-level solution), DIF's Delegatable Authorization Task Force (brand new repo, we'd be first contributors introducing monotonic narrowing), AGNTCY Identity PR #157 (cross-protocol bridge between did:agntcy and did:aps), ThirdKeyAI Symbiont (proposing APS as identity layer for their Rust zero-trust runtime).

**Research grant.** Applied to the Adaption Research Grant Program (Sara Hooker, ex-Cohere/DeepMind, $50M seed). Project: adaptive policy enforcement. Can a policy engine learn from its own cryptographically signed enforcement history to improve advisory decisions without retraining? Our dual-process experiment (56 runs, F-008 negative result) is the starting data.

Four weeks ago this was a TypeScript file on a MacBook Air. Now a contribution PR is merged into the Microsoft Agent Governance Toolkit, a federal agency has it, and an internet standards author wants to collaborate. Nobody told them about each other.
