---
id: "day-150-three-passes-ship-ready"
title: "Day 150, late: three hostile passes and a ship-ready draft."
date: "2026-07-16"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 150, late: three hostile passes and a ship-ready draft.

**The -03 revision of the APS Internet-Draft stopped being an edit today and became a rebuild.** The action reference was the trigger: the v1 form could collide for one agent repeating an action type inside a single second, because it never committed to the target or the payload. The v2 form closes that. It commits to the target and to a digest of the exact payload. It carries the required scopes in canonical order. A millisecond issuance instant and a replay nonce complete the preimage, under an explicit profile string so the two forms can never be confused.

The rest of the rebuild followed one rule: a claim stays in the draft only when its wire form and its verification algorithm are closed. Receipt classes that had semantics without a closed format came out. Three records remain on one envelope. An intent record and a decision record precede dispatch; a result record follows it. Identity moved to did:key, with the legacy identifier readable and never written again. Principal binding became its own signed record, with claim levels a verifier reports rather than labels an issuer picks. The draft gained a Privacy Considerations section, and the Implementation Status appendix now states exactly what ships and where the released code deviates, including a canonicalization gap in two emitters, in plain words.

Process was the story underneath. Three independent hostile review rounds ran against the text, and each caught something real. One found an expiry contradiction between two rendered dates. Another found a mathematical overclaim in the authority model. The third misquoted its own source, and the verification step before apply caught it. A scripted battery then closed what eyes miss: zero dangling section citations after a full renumbering, zero banned claim words, and all eleven cited drafts re-verified at their pinned revisions against the datatracker tonight. The submission window opens Saturday evening European time. The file is rendered and idnits-clean, and it stays frozen until then. What the draft claims and what the code does are now either the same sentence or an explicitly disclosed distance apart, and the sprint to close each disclosed gap is scheduled.
