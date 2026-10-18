---
id: "world-id-is-the-root-aps-is-the-chain"
title: "World ID is the root. APS is the chain."
date: "2026-04-22"
kind: "article"
source: "html"
author: "Tymofii Pidlisnyi"
---

# World ID is the root. APS is the chain.

World shipped AgentKit on April 17 with Okta, Vercel, Browserbase, and Exa. The pitch is clean. An AI agent can now carry cryptographic proof that a unique human is behind it. The Shopify demo routes a World ID signature through UCP to complete a purchase, and the merchant ends up with a receipt of human intent.

This solves an identity question that payments alone never could. Is there a human here becomes yes or no, anchored in biometric proof-of-personhood. Real move, genuinely useful.

But agentic commerce has two questions, not one. Who is the human is the first. What is the agent permitted to do on their behalf, with what limits, and how do we trace a specific action back to a specific delegation, is the second. AgentKit handles the first. It does not try to handle the second. That is the correct design choice. It also leaves a seam.

Agent Passport System (APS) fills that seam. A delegation object in APS is a signed, scoped, attenuated authorization that travels with an agent action. It says which human principal delegated it, what scopes are permitted (`commerce:checkout`, `data:read`), what budget remains, what TTL is left, and which sub-agents are allowed in the chain. Ed25519 signatures, offline-verifiable, no registry round-trip required. Apache 2.0. Shipped February 18, 2026.

The composition is clean.

World ID proof of human anchors the delegation root. The signed World ID credential becomes the principal attestation for an APS delegation object. From there, the delegation narrows. An agent gets `commerce:checkout` scope with a $500 budget for a specific merchant allowlist, valid for 24 hours. The agent does its work. Every action it takes is signed against that delegation. At the merchant, a 4-gate preflight runs: passport valid, scope authorized, budget remaining, merchant allowed. Any fail emits a signed rejection receipt. Success produces a CommerceActionReceipt that links the purchase back through the delegation chain to the original human via their World ID.

For a flash sale with limited inventory, that merchant now knows two things. There is a unique human behind this agent. That human delegated this specific purchase, within these specific limits, and the signed chain proves it. Fraud reduces. Over-purchase reduces. Audit trails become real.

The human-in-the-loop threshold pattern in AgentKit's docs maps directly onto the APS `HumanApprovalRequest` primitive. For purchases above a delegation-specified threshold, the agent pauses and emits a signed approval request. The human's response (signed, via World ID or otherwise) becomes part of the CommerceActionReceipt.

None of this requires either side to change. AgentKit's SDK works as is. APS's commerce adapter works as is. The seam is a header or extension field carrying the delegation object alongside the World ID signature. Any UCP or ACP endpoint can implement the 4-gate preflight in under 50 lines.

Working reference today: [github.com/aeoess/agent-passport-system/tree/main/examples/stripe-governance](https://github.com/aeoess/agent-passport-system/tree/main/examples/stripe-governance)

The agentic commerce stack has three trust layers emerging. Payments, proof-of-human, and scoped delegation. The first two are consolidating around strong incumbents. The third is the one that answers what did this agent do on behalf of whom, within what limits, provably. It belongs in the stack too, and it composes with what is already there rather than competing.

AgentKit is the root. APS is the chain.
