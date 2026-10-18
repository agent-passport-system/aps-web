---
id: "day-148-the-invariant-was-not-enforced"
title: "Day 148: the rule I sell was not enforced in my own gateway."
date: "2026-07-14"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 148: the rule I sell was not enforced in my own gateway.

**Authority can only decrease at each transfer point. That is the sentence APS is built on, and yesterday my own deployed gateway did not enforce it.** The narrowing check compared a child delegation's spend limit against its parent only when both sides carried one. A child that simply omitted the limit skipped the check entirely, while the evaluation path reads an absent limit as unlimited. So a child minted under a spend-bounded ancestor could leave the field out and become unbounded, and every row in the delegation chain still validated. Found, fixed, merged and deployed the same day.

The fix is one pivot. Gate the check on the ancestor being bounded rather than on both sides being present. If the parent carries a bound, an absent child bound is a widening and denies. Absent must not read as unconstrained on a path where absent also reads as unlimited. Both directions carry tests now: a null child under a bounded parent denies, and a null child under an unbounded parent still passes, because introducing a bound where none existed is narrowing and should never have been blocked.

The interesting part is why it survived. The gateway had no continuous integration at all. Every other repository in the project runs tests on push. The one standing in front of the money path did not, so a fix could sit unmerged for three days and nobody would hear about it. Worse, a directory of 639 tests had not executed since April, stranded by a glob that matched one directory name and not the other. They were green the whole time. Nobody was running them. That is now 1,510 tests on every push, along with a build, a type check and a scan that fails the run if a credential literal is ever committed.

Two smaller corrections landed alongside. Version 4.1.0 went out by hand on Monday, which meant the release pipeline never reached its publish step and that version carries no build provenance, no SBOM and no attestation, while every release before it does. Provenance cannot be attached to an already published version, so 4.1.1 exists purely to put the current release back under a signed SLSA attestation. There is no functional change between them. On a project whose argument is that evidence should be checkable by the party relying on it, shipping an unattested artifact is not a small thing to shrug at.

The conformance vectors for the AuthZEN denial-binding hash are public now, Apache-2.0, at aeoess/authzen-556-vectors. Thirty-five normative cases, eight rejection cases, and the contested readings carried separately with both candidate preimages so nothing unsettled is presented as settled. Three implementations recompute every case and a fourth independent library checks them. They had been sitting in a private repository, which is a strange place for an artifact whose entire purpose is to let someone else check your work.

The day started as an outward push and the useful part came back inward. A gap turned up in a major identity provider's agent delegation design: their schema is careful about an agent not inheriting its owner's permissions, and says nothing about a delegation whose grantor is itself another agent. Once agents dispatch sub-agents that case arrives on its own. I raised it, and the most useful thing I had to offer was not the invariant. It was the bug I had shipped against that same invariant hours earlier, and the exact shape it took.
