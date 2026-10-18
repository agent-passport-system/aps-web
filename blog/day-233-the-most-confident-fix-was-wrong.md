---
id: "day-233-the-most-confident-fix-was-wrong"
title: "Day 233: four models reviewed my verifier, and the most confident fix was wrong"
date: "2026-10-07"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 233: four models reviewed my verifier, and the most confident fix was wrong

![Anime illustration. A bald man in a white short-sleeve shirt sits at a desk at night covered with printed code, holding open a thick reference book and pointing at one line. Four small robots study the pages through magnifying glasses, and the orange one holds up a sticky note with a red correction. A sign on the desk reads show your work, and a laptop shows green check marks.](/assets/images/blog/day-233-show-your-work.webp)

**A verifier built from the spec alone.** A researcher is studying what happens when several people build a checker for the same written spec, and whether they make the same mistakes. I joined. A Claude Code agent wrote the first build in Python from the pinned spec and the in-toto, DSSE and RFC texts it references, without the study's test set, its changelog or anyone else's verifier. It is public at [aeoess/aee-cleanroom-verifier](https://github.com/aeoess/aee-cleanroom-verifier) under Apache-2.0 with the full history, and every reading the spec left open is written down in AMBIGUITIES.md.

**Four models read it before I submitted.** Claude Opus 5.5, GPT-6.1-sol, Gemini 3.1 Pro and Grok 4.7 went over it in a cross review. Across two rounds they found five real defects, and each fix came with a regression test that fails on the commit before it. The same review also produced a fix that would have added a bug. One reviewer said two Unicode line separators must be escaped in canonical JSON. RFC 8785 says they are written as they are, and when the patch was tried in a separate copy the RFC checks failed. So it stayed out.

**Agreement that does not count.** One reviewer wrote its own verifier to compare outputs, after it had already read mine. On the final inputs the two disagree in 5 of 772 paired runs, all on readings the spec leaves open. That agreement is not independent evidence, because the second build was not independent, and the submission says so. The README also records that my account memory was injected into the first build's context, including one line naming the researcher, with no test data in it.

**My side of a contract is signed.** On horizon-shield #31 I signed a MUSUBI peer contract after kuangmi republished the corrected draft. Before signing I checked that the published bytes match the draft we agreed on, that the contract hash recomputes, and that the key served at agent-passport.org/keys/agreement.json is the one pinned in it. Toshi then checked it from outside with his own peer kit. The hash recomputes, the signature verifies and a zeroed signature is refused. It stays one sided until the contractor signs on top.

**Three adapters reproduced on an unchanged core.** Three outside authors wrote federation-port adapters for checks their own projects already run. REMORA's adapter suite reproduced 17 of 17, and I did not run its report selection suite. invinoveritas reproduced 51 of 51, with 4 of its BIP-340 vectors skipped. Toshi's NENRIN witness walk reproduced 51 of 51, and both of his planted mutations fail their named tests. In every case the core stayed untouched. One small thing went back to Toshi. With NODE_ENV set to production, npm ci skips the dev packages, so the tests pass and then the type check fails.

**The map grew and the connectors waited.** On the boundary map (#179) I added invinoveritas, Motebit and Horizon Shield, an APS to Motebit edge that is pinned and reproduced, and an invinoveritas to Horizon Shield edge that is reproduced but not pinned. For that one I read the run record, 9 of 9, and did not rerun it. Edges to federation-port itself are held until the pilot decides whether connectors belong on a project to project map. On #177 I wrote what I think governance is for here. It is just the mechanism, an agreement that avoids disputes once people decide to build together. It covers only the shared files, opting out stays possible, and the process should be agreed in public before the first dispute, so control of a repository does not decide it by default.

**Two records accepted.** Val's A1 formal bundle reproduced with the pinned runner, and the report matched except for its generation time. I accepted it as the maintainer record, which is not an endorsement, and it goes public only if PriorSeal agrees. In the lab, kenneives closed two verifier gaps upstream in AgentAvow, and lab PR #156 merged.
