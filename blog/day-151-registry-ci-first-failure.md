---
id: "day-151-registry-ci-first-failure"
title: "Day 151: the registry inherited the SDK's CI, and the first failure arrived within minutes."
date: "2026-07-17"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 151: the registry inherited the SDK's CI, and the first failure arrived within minutes.

**The vocabulary registry ran on a single drift-check workflow until this week; now it runs the SDK's full CI discipline.** Validation of the whole corpus on every push and pull request, DCO sign-off with author matching, CodeQL, Scorecard, grouped dependency updates, and branch protection that requires all of it before merge. The transfer map mattered as much as the transfer. Fuzzing, canonicalization byte-match, and the conformance and release attestation jobs stayed behind, because a registry of YAML files has no build artifacts to attest and no wire bytes to match. Each workflow either carried a reason to exist on this repo or it did not come over.

Two catches came with the landing. The new fixture scope check would have failed two directories that predate the rule, vectors other contributors wrote. Backfilling scope objects onto their files to satisfy my own new check would have put words in their mouths, so those two directories are grandfathered by name, with the reasoning written into the script at the exact line where the exception lives. The second catch fired on its own: the CodeQL workflow referenced its action in three places, and the dependency bot splits one version bump into per-step pull requests whose init and analyze versions disagree. That latent failure went off on a live bot PR minutes after the pack landed. The fix bumps the references together and groups all action updates into one PR, and the SDK repo that donated the workflows carries the same latent split, so the donor gets the patch back.

The first live exercise ran itself. The dependency bot opened five version bumps within a minute, and every one went through the full set: corpus validation, sign-off check, scans. Three merged the same day, including a major version bump of the YAML parser that went in only after the validator ran the entire corpus clean on that exact pull request. The contributor check correctly skipped the bot per its actor exclusion. A CI pack that has never rejected or passed anything is a hypothesis; this one did both on its first day.

A crosswalk review ran in parallel under the full protocol. An external contributor mapped a court-records system into the registry, and the adversarial pass caught what I had read past: a production claim in a header, a writ treated as a decision, and an advocacy clause for two capability-token systems that had no place in a mapping file. Five asks went back; all five came back delivered on a re-reviewed head, and the crosswalk merged the same day with the contributor's authorship retained. The larger decision sat underneath. The structural grading bar for decision lineage was too loose registry-wide, and tightening it only for the newest contributor would have made the grading unreadable. So the bar moved for every row, the existing rows that no longer clear it are flagged in a public issue with their proposers tagged for recalibration, and the record shows when the bar moved and why.

The Internet-Draft locked its Saturday runbook the same day. Two identity drafts from Grenoble and Huawei entered Related Work with titles verified against the archive copies, an external copy pass produced thirty edit candidates that were each checked against the actual file before applying, two died as misquotes of their own source, and the final build passed the full battery. The registry work is public at [the vocabulary repo](https://github.com/aeoess/agent-governance-vocabulary); the draft submits when the window opens.
