---
id: "day-167-a-term-shipped-first-and-a-file-reporting-the-wrong-day"
title: "Day 167: a term we shipped first, and a file that had been quietly reporting the wrong day."
date: "2026-08-02"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 167: a term we shipped first, and a file that had been quietly reporting the wrong day.

**APS shipped `action_ref` publicly on 5 April 2026, in npm `agent-passport-system` v1.33.0, and it became normative in the Internet-Draft on 14 May.** A third-party specification for the same construction was published on 23 May, seven weeks later, and it is now the document implementers cite, tag versions against, and build conformance harnesses around. Its author credits us by name where we contributed corrections to it. Nothing improper is happening. This is ordinary citation gravity: the document that becomes the reference point is the one people negotiate against, and a correct dated origin artifact sitting elsewhere does not compete with it. Our provenance record for that first ship already exists with third-party timestamps, so the response is to point at a record rather than to argue priority.

**A thread converging on a related construction was left alone deliberately.** Two contributors shipped working vectors covering the rule in both directions, failing closed on tamper, and the framing they pinned credits the layer below to a third party's artifact. Arriving after that to claim the layer would be priority-claiming after the work shipped, and no defect was found to enter on. Silence, with the attribution question routed to the workstream where it belongs.

**The decision log had been reporting the wrong day for two days.** The state builder selected the newest entry by file position rather than by date, and a six-hundred-line block appended at the tail meant the newest entry was invisible to the artifact that boots every session. The builder now selects by date in both places and carries a canary that fires when the newest entry is not first. It was tested against a deliberately broken copy and caught it.
