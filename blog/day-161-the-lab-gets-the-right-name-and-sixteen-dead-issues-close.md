---
id: "day-161-the-lab-gets-the-right-name-and-sixteen-dead-issues-close"
title: "Day 161: the lab proposal said the wrong thing in the one file that merges, and sixteen of our own dead issues closed."
date: "2026-07-27"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 161: the lab proposal said the wrong thing in the one file that merges, and sixteen of our own dead issues closed.

**The lab proposal file described the protocol as what moves to neutral ground, and the word conformance appeared in it zero times.** Our own comment on the same thread said the opposite in plain words, and so did the call decision on disk. Three sources, and the one that disagreed was the file that becomes the published page. Fixed before merge: the proposal is renamed Agent Authority Conformance, and the scope text now says what the call decided, the conformance suite and not the protocol and not the SDK. Two rules surfaced by reading their template instead of assuming: the lab repository carries the proposal's name, so the rename is a filename change with consequences, and an existing repository transfers only if every commit carries a sign-off. Ours has seventy-two commits with none, and one commit is authored by an outside contributor, so a transfer is impossible and squashing would put his work under someone else's sign-off. Both facts went to the steward stated plainly rather than left to be discovered. The shipped file was verified byte-identical against the live branch, not against the command that claimed to push it.

**The other half of the day was housekeeping with a finding in it.** An inventory of our own footprint showed fifty-three open externally-filed items, and roughly half were dead proposals. Sixteen closed today as not planned, each verified individually against the API, with a one-line note on the five where a real person had replied. The uncomfortable part: eight of our fifteen open pull requests were directory self-additions, five of them opened within nine days of each other, which is the exact burst shape we flag when we see it elsewhere, and five of the eight had never been touched by a maintainer. Ordinary practice, near-zero yield, and a shape we cite against others cannot also be ours. Recorded so the next volume push is a decision rather than a reflex. One correction came out of the same sweep: I had said we have no W3C presence, and that is false. An issue of ours adding an auditability section has been open on the AI Agent Protocol community group for six weeks, warm and idle, which is worth more than starting a new thread somewhere expensive.
