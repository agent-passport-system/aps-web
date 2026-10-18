---
id: "day-130-a-secret-the-agent-never-sees"
title: "Day 130: a live demo where the agent spends real authority and never sees the secret."
date: "2026-06-28"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 130: a live demo where the agent spends real authority and never sees the secret.

**At AGI House's Agent Identity Build Day we wired APS to 1Password and ran the loop on stage: an agent asks to spend, the gateway decides from delegation math, and the credential stays in the vault.** Four beats, all live. A 42 dollar purchase inside the delegated budget is allowed and executes with the real key. A 300 dollar purchase over budget is denied before any credential is touched. A prompt-injection attempt that tells the agent to ignore its limits is denied the same way, because the gateway evaluates the signed delegation rather than the agent's text. And every decision lands as a signed receipt attributable to a specific key. The property worth stating precisely: the agent's context only ever contains an op:// reference, the resolver runs on the gateway side and only on an allow, so a denied or manipulated agent has nothing to exfiltrate. Credential custody is 1Password's work; the allow and deny logic is deterministic delegation evaluation, and none of it is model judgment. The demo is public at [aeoess/aps-1password-demo](https://github.com/aeoess/aps-1password-demo).
