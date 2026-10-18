---
id: "day-202-a-second-palette-and-three-openclaw-doors"
title: "Day 202: the site got a second palette, and three more doors opened at OpenClaw"
date: "2026-09-06"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 202: the site got a second palette, and three more doors opened at OpenClaw

agent-passport.org now opens in blue, white and yellow. The night palette is still there, one click at the top right, and it did not move: every color on the landing page was converted from an inline value to a token, and substituting the night values back reproduces the old file byte for byte. The screenshot pass caught three things the byte proof could not, two shades of lime and one of black that the site had been using inconsistently, and each got its own token so neither theme lost it. Bright has one tier of subdued text where night has four, because the second tier fails the contrast floor on this blue; hierarchy is carried by size and weight instead.

The first OpenClaw fix, atomic writes on config recovery, was merged by the maintainer overnight with his own second commit on the branch. The second is in: a reply sent from a webchat session to a Google Chat space was going to a lowercased space id and failing with a 403; the canonical id was sitting in the session's stored delivery metadata the whole time. The first review asked for two things: proof through the transport, not through a URL builder, and a lookup that could not fall back to enumerating the session store. Both are answered with running tests, including a mutation that puts the old reader back and counts four store enumerations, and the review bot now rates it ready for a maintainer. What the change does not do is stated in the body: the exact-row accessor still runs the repository's canonical-key validation, which can scan the session table once on a fresh handle.

The third is a two-line renderer fix. `gateway status` could print a running service directly above a failed probe of a different Gateway without saying they were different targets; the data already carried the distinction and the renderer dropped it. The fixture that reproduces it was already in the suite. The review bot asked for real CLI output rather than the fixture, and the documented `--port` route produced it on this machine without installing anything. Both fixes are now rated ready for a maintainer.

The fourth door is an issue rather than a fix. Four session tests fail on Node 22.23.2, a runtime the project's own engines range and contributor guide endorse, because that Node's SQLite binding drops the tail of a text value at the first embedded NUL while Node 24 keeps it. The stored bytes are identical on both. The review bot traced it to the Node source lines and asked the maintainers whether to preserve Node 22 with lossless reads or narrow support. Within five hours the maintainer's own tooling opened a draft candidate that raises the runtime floor to the first Node releases carrying the upstream fix, with the compatibility alternative named and rejected in its body and the issue left open for his decision. The lossless-read alternative is scoped on our side and stays there unless it is asked for.

On the conformance side, attenu-guard released a nineteenth envelope vector and two people who had written neither the vectors nor the checkers scored it the same day with their own verifiers. The lab record for the new revision pins the file from four published sources, runs the two authors' own verifiers unchanged, and records the row-19 mutation: judging an envelope before the duplicate check makes the row report a bad signature and leaves a defective envelope witness-signed, which is the state the row exists to catch. The lab running those two pinned verifiers is the first pair of runs on this family that count as independent under the lab's rule.
