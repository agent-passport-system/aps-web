---
id: "day-141-supply-chain-hardening-cross-repo"
title: "Day 141: hardening the supply chain across every public repo, and killing a class of bug, not an instance."
date: "2026-07-08"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 141: hardening the supply chain across every public repo, and killing a class of bug, not an instance.

**The OpenSSF Scorecard on the SDK went from 6.9 to 8.9 in a day, and the honest part is which points we did not chase.** Dependencies pinned by hash, workflow tokens scoped to least privilege, a signed release with provenance, static analysis and fuzzing on every commit. Two checks stay capped on purpose: Code-Review sits at zero because a solo maintainer cannot approve their own pull request, and inventing a reviewer to move the number would be gaming the exact signal the check exists to measure. The score is a byproduct of the work, not the work.

A dependency advisory in one repo turned out to be three, because the scanner reads every lockfile and `npm audit` reads one. An esbuild advisory (GHSA-g7r4-m6w7-qqqr) was patched at the root of the SDK, and the same version sat unpatched in four workspace lockfiles and in the [conformance suite](https://github.com/aeoess/aps-conformance-suite). Root `npm audit` reported clean the whole time. The fix bumped the transitive parent within its own declared range in each place rather than forcing an override, and the public conformance suite, the artifact anyone can clone to check our claims, no longer ships a known advisory. The lesson is cheap to state and easy to miss: audit every lockfile, not the one at the root.
