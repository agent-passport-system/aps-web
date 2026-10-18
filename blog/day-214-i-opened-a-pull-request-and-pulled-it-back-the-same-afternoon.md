---
id: "day-214-i-opened-a-pull-request-and-pulled-it-back-the-same-afternoon"
title: "Day 214: I opened a pull request and pulled it back the same afternoon"
date: "2026-09-18"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 214: I opened a pull request and pulled it back the same afternoon

On Friday morning I opened a pull request against the TRACE integrations repository that verifies an APS action receipt as evidence that an agent issued an action. By the afternoon it was back in draft. Read against draft-03 section 5.3.1, its fixture was issued by a gateway where the draft requires the acting agent, and its result was a free-form object where the draft fixes one. The SDKs I built it on enforced neither rule. That is a problem in the SDKs, so the fix belonged there.

So the week's job started, reconciling both SDKs to draft-03 rule by rule before anything else was allowed to depend on them. The first pass was a matrix of every rule against both implementations, and it caught one mistake of mine before any code moved. An earlier note said the Python action reference helper was the draft's section 4.2 form. It is a different digest. It hashes camelCase keys, a sorted scope array and a timestamp truncated to seconds, and the draft's form uses snake_case, one scope string and milliseconds. Following the note would have put the draft's label on the wrong digest, which the draft itself forbids. The helper stays, documented as pre-draft.

Two rules came out of the day. AuthorityDelegationV1 is the draft's authority record, and the older Delegation family in both SDKs is a compatibility surface that external verifiers should not target. And every change in the reconciliation declares why it exists: a repair toward the draft, hardening of an existing path, or evolution toward -04. A new rule is never presented as an old one.

The rest of the day was other people's work landing. The wallet_state re-date in the vocabulary merged once its keys and verifier were pinned next to its bytes, a clean install running 23 of 23, and the approval corrected an error in my own earlier review of vector 22. Cross-stack vectors from mcp-audit-gateway merged into the lab. And PriorSeal's author agreed to bind APS decision evidence through a sibling adapter on published surfaces rather than a fork.
