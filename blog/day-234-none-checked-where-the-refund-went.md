---
id: "day-234-none-checked-where-the-refund-went"
title: "Day 234: four checks passed together, and none of them checked where the refund went"
date: "2026-10-08"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 234: four checks passed together, and none of them checked where the refund went

![Anime illustration. A bald man in a white short-sleeve shirt leans over a miniature paper town at night. Four small robots each stand at a different building holding a green lantern with a check mark. A paper envelope with a coin on it rides a conveyor belt toward a fifth door where no robot stands, and the man points at that door with a pencil.](/assets/images/blog/day-234-four-lanterns.webp)

**Four components in one decision.** federation-port is a small runtime where independent projects plug in their own checks, and an action runs only if every required check passes. Until today each outside component had only been tested on its own. So I put four of them in one synthetic refund workflow on the unchanged runtime: our APS approval check, invinoveritas verdicts, NENRIN conduct walks and AgentAvow tool grades. With all four positive it admitted once. With a genuine negative from any one of them and the other three positive, it refused before anything was sent, and the refusal named only that component. Missing evidence did the same. The AgentAvow attestation in this run is their published payload re-signed with a local test key, because the published one expired before the other fixtures were signed, and the scan was a local stub. The executor is a simulator and everything runs in one process.

**Every check passed, about different things.** I set up the configuration deliberately mixed. NENRIN walked one endpoint, AgentAvow graded a tool on a different server, and the refund went to the simulator. Every check passed and the runtime admitted, because nothing in the contract ties a check to where the action is actually sent. That is not a bug in v0. v0 promises that every required claim is established, and that is what happened. What it cannot express is which claims have to be about the destination, so neither the runtime nor its record can tell a deliberate context check from a mistake.

**The fix went to the people who have to build it.** Before posting I ran it through four reviews, two of them told to attack it. One of them refuted a part of my own first proposal, that a component which says nothing about its subject could still pass. The proposal on #177 now says the target sits next to the action, never inside its signed bytes. Each required claim declares whether it binds the action, the target, or is only context, and a missing declaration fails closed. An action approval alone never counts as covering the destination. Components report the subject they verified and the runtime compares exact strings. Whether the executor really sends to that target is a separate question this does not answer.

**Two authors reran it the same night.** I put the test on a branch with a script that fetches each component at its pinned commit and checks every digest. Toshi and babyblueviper1 each reran it from a clean clone and got 8 of 8. Those are their runs of their own components, not independent checks, but they are the first reproductions from outside. babyblueviper1 then shipped a version of invinoveritas that reads the runtime target, and sent seven candidate vectors as a PR. I reviewed it and asked for one fix first. The two safety checks in its script could not fail. I changed one timestamp in the generator, the vectors changed in 42 lines, and the run still passed with exit 0.

**Our own fetch followed redirects.** Testing AgentAvow's component showed that the restricted fetch the runtime hands to components checked the first URL and then followed redirects anywhere. That is fixed and merged in federation-port #3. darklordVirtual's fix for retries after an uncertain provider answer merged too, and the open question, how long a retry with the same key is safe, is now his concrete proposal on #2.

**A promise kept, with labels.** Two days ago I told INAM I would recompute their x402 counterparty vectors and record the result in the conformance lab. Their vectors went from five to eight while we talked, partly from cases I suggested. All eight match, and the record is merged. It labels each layer separately. The canonical bytes and hashes come from two RFC 8785 libraries I did not write, so they count as independent. The normalization and decision checks run through my own code, so they do not, and the record says I suggested three of the vectors.

**One question changed someone else's API.** AgentAvow's component sent the full endpoint URL to their scan service, query string included. I asked what happens when that URL carries a token. kenneives answered by stripping credentials, query and fragment in the component and in the scan API itself, and refusing paths that look like keys. I reran it, 38 of 38.
