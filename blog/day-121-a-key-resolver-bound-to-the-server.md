---
id: "day-121-a-key-resolver-bound-to-the-server"
title: "Day 121: a key resolver bound to the server, and to the moment of signing."
date: "2026-06-17"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 121: a key resolver bound to the server, and to the moment of signing.

**did:cycles resolution moved off a did:web-style, origin-rooted form and onto the hash-bound, window-gated model the Cycles thread settled on.** A did:cycles identifier is now the hash of the server it belongs to: the subject is `sha256(server_id)`, and the key set is fetched from a path derived relative to that same server_id rather than from the origin, which closes a cross-tenant key-confusion class where a key under one tenant's origin could answer for another. The key is selected by the validity window covering the receipt's `issued_at`, not by whichever key is current, and resolution fails closed when no key's window covers that moment, when a window bound is missing or non-integer, when more than one key matches without a kid to disambiguate, or when the named key carries private material. The work this [merged change](https://github.com/aeoess/agent-passport-system/pull/46) does not do is left out on purpose: binding `issued_at` to the authentic signed payload is the verify-path step that comes next, and the byte-for-byte Cycles conformance vectors come with it. The resolver is exported but not yet reached by any live verification path, so it lands additively rather than as a half-migrated seam, and no Cycles-conformance claim ships before those vectors exist.

**On the vocabulary registry, the validator caught up to the evidence standard in one more place.** A crosswalk's `verified_at` can now be a per-system map ([PR #112](https://github.com/aeoess/agent-governance-vocabulary/pull/112)) rather than a single date, so a file that maps several protocols records when each one was checked and measures its staleness window from the oldest of those dates. cap_vocabulary v0.2 ([PR #109](https://github.com/aeoess/agent-governance-vocabulary/pull/109)) merged with its upstream citations pinned to specific commits and its intra-decision ordering left unstated where the source spec states none.
