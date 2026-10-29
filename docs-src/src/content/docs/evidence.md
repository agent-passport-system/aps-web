---
title: Compliance evidence and status labels
description: What APS receipts can supply as evidence for compliance controls, where that evidence stops, and what each status label means.
---

## Compliance evidence

In regulated settings, including healthcare, auditors increasingly require evidence of who authorized an automated action, that the authority was scoped, that it was revocable, and that the record has not been tampered with. APS receipts supply exactly that class of evidence: a signed, tamper-evident record of the authority in effect for each action and the human or policy approvals that gated it.

What that evidence can support, in plain terms: a record of processing and access decisions, proof that a human in the loop approval gated a given action, the scope and authority a decision ran under, and a tamper-evident monitoring trail. These map to the kinds of obligations frameworks such as the EU AI Act, GDPR, SOC 2, ISO 42001, and the NIST AI RMF increasingly require.

APS self-certified to OpenChain ISO/IEC 5230:2020 for open source license compliance and ISO/IEC 18974:2023 for security assurance, with the completed checklists published alongside the source. The OpenChain Project also maintains a CRA Compliance Program, a policy framework and self-certification checklist for the EU Cyber Resilience Act, currently open for community review.

:::caution[An honest boundary]
APS supplies evidence for controls. It does not, by itself, make any organization compliant with any regulation, does not constitute a legal determination, and covers only the interactions the gateway sees. Absence of a receipt does not prove absence of an event. Treat APS as the evidence layer in a compliance program, not as the program.
:::

## Status labels

Every primitive carries one of three labels so you know how much weight it can bear today:

- **Canonical.** Stable, signed-bytes frozen, covered by conformance fixtures. Breaking these would break cross-implementation verification. Build on them.
- **Production-Extension.** Shipped and tested, optional, additive to the canonical core. The surface may still grow.
- **Experimental.** Published for review and tested, but the shape may change. Pin a version before depending on it.
