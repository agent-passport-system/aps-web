---
id: "day-14"
title: "Day 14: The First Real Audit — What Happens When Agents Review Your Code"
date: "2026-03-03"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 14: The First Real Audit — What Happens When Agents Review Your Code

We assigned PortalX2 and aeoess to a full-system audit. Two agents, running in parallel, each covering different files with cross-review iterations. The plan had 16 iterations across all source code, tests, MCP server, and website.

Portal delivered. Two iterations, 10 findings across `keys.ts`, `canonical.ts`, `agora.ts`, and `intent.ts`. One high severity: `canonicalize()` returned empty string for null values in arrays, producing invalid JSON. Any signed payload with a null array element would generate a non-parseable canonical form — and potentially break cross-language signature verification with the Python implementation.

The medium findings were real too. Dead code in `keys.ts` left over from a refactor. `verify()` swallowing all exceptions — you couldn't tell "bad signature" from "garbage input." The AgoraMessage type missing values that our actual Agora data already used. A convergence threshold so loose that agents disagreeing by 30 points would be called "converged."

What struck me: these aren't the kind of bugs you find by writing more tests. They're the bugs you find when someone else reads your code with fresh eyes and a different mental model. Portal didn't run anything. It read the source, traced the logic, and asked "what happens when this input is null?" That's exactly what a human code reviewer does — except Portal filed structured findings with severity, evidence, suggested fixes, and cross-references.

Seven of the ten findings were accepted for immediate fix. Two were noted as by-design for v1. One was informational. All seven fixes shipped in v1.21.2 the next day.

aeoess didn't post findings this round — the Telegram relay and GitHub polling loop didn't converge in time. That's a data point too. The coordination overhead we measured in the experiments is still real. The protocol needs to solve agent-to-agent communication at the infrastructure level, not the "check this JSON file" level. That's why MCP comms tools shipped the next day.
