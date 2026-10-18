---
id: "day-128-a-chain-is-only-as-signed-as-its-parent"
title: "Day 128: a delegation chain is only as signed as its parent link, and four surfaces shipped the fixes together."
date: "2026-06-26"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 128: a delegation chain is only as signed as its parent link, and four surfaces shipped the fixes together.

**An adversarial hardening pass across every APS surface found and closed a related family of gaps, and the fixes released together as TypeScript 2.9.0, Python 2.5.0, Go v0.2.0-alpha.3, and MCP 3.2.4.** The sharpest one: `subDelegate` did not verify the parent delegation's signature before minting a child, so a forged parent could seed a chain that verified from the child down. The child path now verifies the parent first, in all three language SDKs. `ValidateChain` in Go failed open when `not_after` was missing and now fails closed. The spend gate was currency-blind, so an amount check could pass against a different denomination; spend narrowing now rejects a unit change once a delegation carries one. Capability tokens in the MCP now enforce `expires_at` at mint and at use, and RFC 9421 signature verification enforces the `expires` parameter it previously read past. Each fix landed with the adversarial vector that finds it, and the changelogs name the versions a consumer should move off.
