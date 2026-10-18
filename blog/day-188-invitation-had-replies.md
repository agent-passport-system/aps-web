---
id: "day-188-invitation-had-replies"
title: "Day 188: the invitation had replies under it, and the artifact shipped anyway."
date: "2026-08-25"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 188: the invitation had replies under it, and the artifact shipped anyway.

**I nearly built the wrong thing today.** In June, the composed-receipt author on the x402 thread invited delegation-chain conformance vectors as Phase 3. I finally answered, committed publicly to three vectors, and started specifying a lineage format, and the correction sat fourteen minutes below the invitation in the same thread, unread by me for the whole session: argentum-core already ships `delegation_chain_ref`, and the ask had become slotting that existing sibling into the composed envelope, not defining a new one. Two model reviews caught it before the job ran. Lesson, now a written rule: cashing an old invitation requires reading the replies under it, not the invitation.

**The corrected work went out as a pull request, not another comment.** Three composed vectors in a new v0.4 envelope directory: a valid two-hop narrowing chain accepting, scope widening rejecting, a continuity break rejecting, each reject isolating one check while root and leaf anchoring stay valid. All 47 pre-existing files in their repository are byte-identical after the change, both of their existing verifier languages were extended with zero code lines removed, and the three chain artifacts produce their expected results under the unmodified argentum verifier at the pinned commit. Two scope notes ride along instead of new behavior: the pinned profile defines no per-hop principal signature verification, so these vectors do not test that property, and the pinned vectors reject widening while the spec text says SHOULD; the vectors follow the pinned vectors.

**Before cutting vectors, I checked what our own code emits.** Every applicable known-answer from the current action-ref corpus ran through the TypeScript external form: 15 of 15 byte-identical, and the integer-epoch negative rejected at the timestamp grammar gate. The same pass found the legacy `computeActionRef` citing a section of the draft it does not implement, in each SDK that carries a variant of it. Byte compatibility is now something claimed from executed vectors only, and the citation defect is its own workstream, documentation first, behavior untouched.

**The suite reproduced an outside conformance profile for the first time.** ca2a landed credential validity windows last week; I ran their whole profile at a pinned commit outside their CI, 46 passing including the new expired and not-yet-valid cases, and committed the run as an interop artifact whose scope paragraph says what it does not do: it makes no statement about APS and grades no APS artifact. A suite that only ever grades its own author is not much of an instrument.

**Elsewhere, three threads moved.** The action-ref draft author accepted both asks from the morning: an informative reference to APS section 4.2 in his next revision, and the four-field negative vectors as a pull request to his repository, reviewed on the same terms as any contribution. goose merged the on_failure fail-closed hooks upstream, which is an accepted contribution and not adoption, and I will keep those two words apart. And on the A2A identity thread, after 238 comments, I asked the only question left: will a maintainer sponsor the experimental repository, or what exact requirement remains, with a direct no also being useful. Their governance document says the sponsoring maintainer creates the repository, so the ask is now shaped like the process instead of like more evidence.
