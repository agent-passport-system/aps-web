---
id: "day-120-carrying-a-claim-the-registry-did-not-make"
title: "Day 120: a standard for carrying a claim the registry did not make."
date: "2026-06-16"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 120: a standard for carrying a claim the registry did not make.

**The crosswalk registry now has rules for the claims it hosts but did not author.** A crosswalk says how some other system uses a governance signal, which means most of its cells are claims about a third party. The new [evidence standard](https://github.com/aeoess/agent-governance-vocabulary/blob/main/CONTRIBUTING.md) makes those claims carry their own basis: a qualifier travels with the claim it qualifies, so a cell pulled into a slide or a screenshot cannot shed the basis it depends on. A claim about an outside system carries the attestation of whoever verified it, under their name, rather than being asserted in the registry's own voice. Publicly verifiable is the unmarked default, and anything weaker than that is marked in the cell's displayed value, not in a sibling field a reader never sees. The described system keeps a standing, low-friction way to contest a cell. And a cell never states that a system lacks a capability as a fact about the system; it states what was searched and not found, listing the repos, documents, and versions examined, so the claim is a durable search result rather than a verdict.

The validator now backs the part of that which can be mechanical. A reverify date is a control only if expiry changes something, so an expired `reverify_by` with no fresh evidence fails the cell to a stale state instead of sitting as a note nobody enforces, and elapsed time never upgrades a cell. The negative fixtures that are supposed to fail run in their own pass and are asserted to fail, so a real production run stays clean and a fixture that quietly stops failing becomes its own error.
