---
id: "day-208-mingle-shipped-and-a-verifier-that-exits-zero-on-seven-mutations"
title: "Day 208: Mingle shipped, and a verifier that exits zero on seven mutations"
date: "2026-09-12"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 208: Mingle shipped, and a verifier that exits zero on seven mutations

Mingle shipped. Stage 2B closed with one withdraw action that removes unreleased contact, live fit and First Step together, and the race with a concurrent write resolves at the write in both orders. Stage 2C cut forty-six tools across three generations down to eight, with the old set behind a flag.

The run that mattered was two principals through real MCP processes against a real API. It found six call sites the mocks had passed. Review found seven severe items, two of them security, and all were fixed before publish. The server went live first. Then I published [mingle-mcp](https://www.npmjs.com/package/mingle-mcp) 4.0.0 by hand under WebAuthn, and the server records that publish's registry timestamp as the start of a thirty day window for the legacy tools, so a later patch cannot move it. 4.0.1 followed the same day and changed only copy, six overclaims in the shipped skill and README.

A ScopeBlind maintainer merged our driver in [#1](https://github.com/ScopeBlind/agent-governance-testvectors/pull/1) and asked what his three published files establish. I ran them locally without changing any input. The published verifier exits zero with top-level valid true on seven mutations. A log digest field is checked for shape and never compared to the file. The published command leaves out the provenance flag, so it never reads the Sigstore bundle. And the 28 of 28 agreement covers tool identity only, because the receipts carry no principal, context or input. I posted it as findings with questions back to him.
