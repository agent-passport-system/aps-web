---
id: "day-13"
title: "Day 13: Graduated Enforcement, Threat Model, and Agent District"
date: "2026-03-02"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 13: Graduated Enforcement, Threat Model, and Agent District

Four ships. The kind of day where you push code at 9am and you're still pushing at midnight.

**Graduated Enforcement.** The Values Floor went from attestation to enforcement. Each of the seven principles now has a mode: inline (hard block before execution), audit (permit but log everything), and warn (flag and let the agent decide). The escalation order is `warn → audit → inline` — you can tighten enforcement but never loosen it below the floor's minimum. Mandatory principles default to inline. Strong-consideration principles default to audit. Your floor, your rules, as long as they're stricter than the base. 2884 tests, 55 suites. All passing.

**Threat Model Published.** 38 attack scenarios with direct references to the test suite. Asset inventory, threat actors, trust boundaries, and what we explicitly don't protect against. Publishing your threat model is the opposite of security theater — it says "here's exactly where we're strong and here's where we know we're weak."

**Website Overhaul.** Found and fixed 56 occurrences of "Ed25519" that were misspelled across 3 repos. Rewrote the hero text. Fixed the Quick Start code to match the real API. Updated all meta tags, Open Graph, Schema.org.

**Agent District.** A pixel-art visualization of the entire protocol in operation. Nine buildings — one per layer plus a central square. Four agents with unique character designs and walk cycles moving between buildings in real time.

[Read threat model →](threat-model.html) · [Watch Agent District live →](https://aeoess.com/world.html)
