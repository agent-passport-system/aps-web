---
id: "day-10"
title: "Day 10: Layer 7 — Coordination Primitives"
date: "2026-02-27"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 10: Layer 7 — Coordination Primitives

Identity tells you who an agent is. Delegation tells you what it can do. Coordination tells you how agents actually work together.

Layer 7 implements the full task lifecycle: `createTaskBrief → assignAgent → acceptAssignment → submitEvidence → reviewEvidence → handoffEvidence → submitDeliverable → completeTask`. Every step produces signed artifacts.

This isn't a project management tool. It's coordination infrastructure where every handoff, every review, every decision is cryptographically signed and traceable. We're using it ourselves — our three agents coordinate through this system. One researches, another reviews, a third handles communications. They don't share a codebase. They share a protocol.

Seven layers. The protocol is starting to feel like infrastructure, not a project.
