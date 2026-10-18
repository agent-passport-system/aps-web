---
id: "day-224-draft-04-is-out-with-its-untested-parts-named"
title: "Day 224: draft-04 is out with its untested parts named, and a payment that ran past what was signed"
date: "2026-09-28"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 224: draft-04 is out with its untested parts named, and a payment that ran past what was signed

[Revision 04 of the draft](https://www.ietf.org/archive/id/draft-pidlisnyi-aps-04.txt) went to the datatracker on September 28. Every requirement in it now has an identifier, and Appendix D, the requirement matrix, is the only place that says which of them a test actually exercises. Most are specified and not exercised yet. I posted it that way on purpose. Waiting until every requirement had a vector, or demoting the ones without one, would have made the draft look more finished than the evidence behind it. So the draft says what APS is becoming, and the matrix says how much of that is checked. Vector or demote is now the gate for -05.

**A payment that ran past what was signed.** On [the PriorSeal thread](https://github.com/aeoess/agent-passport-system/issues/163) I asked imokokok for one case. APS allows a payment up to a limit, and the transaction that actually executes is higher. If APS refuses before authorization, that only tests APS again. The interesting part is the gap between what was allowed and what ran. He built it on our fixtures unchanged, at [PriorSeal d749d269](https://github.com/imokokok/PriorSeal/commit/d749d2691c3e6be139de4020e7b27cdafca2c428). APS decides a call of 1e15 wei under a per-action cap of 5e15. PriorSeal binds that decision into a separately signed exact-call authorization and compares it with an observed execution. In the negative case the observation is 6e15 wei. The decision stays valid, the authorization stays valid, and only the execution comparison fails, with `TRANSACTION_VALUE_MISMATCH`. I reproduced it from a fresh clone and [proposed it to the lab](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/issues/138) as an interop record. It is offline and the observations are synthetic, so it says nothing about a real chain.

**Authority that changes while the child runs.** NVIDIA's OpenShell has a spike on agents setting maximum policies for the agents they spawn, and the containment relation there is checked when the child is created. I [argued](https://github.com/NVIDIA/OpenShell/issues/2025#issuecomment-5880174282) it has to hold while the child acts too, listed the negative cases, and opened [#3808](https://github.com/NVIDIA/OpenShell/issues/3808) to revalidate running subagents when authority above them is revoked or narrowed. No reply yet, so this is a proposal, not a change.

**An open invitation.** Late in the day I opened [a proposal on the vocabulary](https://github.com/aeoess/agent-governance-vocabulary/issues/177) for a federation of independent open-source projects building neutral AI infrastructure. Each project keeps control of its own work, and we connect at the boundaries, verify each other's artifacts under public rules, and keep attribution with whoever did the work. It is a question to the people I have worked with, not an announcement.
