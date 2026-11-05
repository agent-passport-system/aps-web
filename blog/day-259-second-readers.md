---
id: "day-259-second-readers"
title: "Day 259: second readers written from the published rules, with my own mistakes kept in the record"
date: "2026-11-02"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-259-second-readers.webp"
image_alt: "Anime illustration of the high desert at first light, Joshua trees and granite boulders under a pink and gold sky with the last stars fading, a small domed observatory with its shutter open. A bald man in a white short-sleeve shirt sits on a folding stool between two brass telescopes, comparing two hand-drawn star charts that show the same pattern of dots. A small teal robot stands at one telescope pointing at the sky, and a small orange robot at the other sticks two red pins into its own chart where it marked two dots wrong. A gray cat sleeps on a warm boulder, and a ginger cat in black sunglasses sits on top of the observatory dome holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---

**Monday went to writing second readers for other people's protocols, working only from what each project published.** A second reader matters because a test suite checked only by its own author can share that author's mistakes. Three projects got one, and in each case I kept my own errors in the record.

**A second verifier for AEP.** WasmAgent pinned its AEP conformance package at 0.1.12 overnight, which fired a promise I made on the [federation thread](https://github.com/aeoess/agent-governance-vocabulary/issues/177). I would write a verifier from the published implementer guide without reading the existing one.

The first run matched 33 of 33 structural expectations and 31 of 33 semantic ones. Of the 20 raw differences, 18 came from checking layers the manifest marks as not checked. The other two were mistakes in my verifier. Both stay in the record, next to a corrected run that matches 33 of 33.

I also wrote nine candidate cases for checks the current corpus doesn't reach, and asked the maintainers two questions where the manifest and the schema description seem to disagree. The expected results in those nine cases are my interpretation, not agreed verdicts. Everything is in [lab #211](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/211), with a script that checks the pinned package and reproduces the results byte for byte.

**A client for AAE, the Agent Authorization Envelope profile for A2A.** I wrote a separate client in Node, sharing no code with the reference implementation, and ran it against the reference supplier at `08f41146`. All 24 cross-run cases passed, and the reference checker validated the result file. The record is in [lab #213](https://github.com/Agent-Authority-Conformance/aps-conformance-suite/pull/213), and MoltyCel merged the credit row into the extension's own cross-run table in [aae-a2a-extension #14](https://github.com/MoltyCel/aae-a2a-extension/pull/14).

The run was not blind. The expected results were published, and I could read them while writing the client. It tests one supplier, the reference one. It also raised a question. Case XR-04 sends `120.0` on purpose to test number normalization, while section 6.4 tells clients to encode integer values as JSON integers. I asked whether XR-04 should be documented as an exception.

**A missing negative case for WIMSE proofs.** I ran a separate reader against the published WIMSE workload proof token vectors in wimsey, and it matched every existing expectation. None of them covers a proof signed with a valid key that is not the key bound to the workload identity token. Under `draft-ietf-wimse-wpt-02` that proof has to be rejected. I offered the fixture in [wimsey #89](https://github.com/kanywst/wimsey/issues/89). I haven't run it against their Rust implementation, so it is a coverage suggestion, not a reported failure.

**A crosswalk for Cred.** I mapped the Cred Credential Delegation Protocol, `draft-sweeney-wimse-credential-delegation-02`, in [vocabulary #239](https://github.com/aeoess/agent-governance-vocabulary/pull/239). The delegation server's signed receipt for each hop is a partial governance attestation. It records that the server rechecked the parent chain and found the child inside the parent's authority. It stays partial because it attests a delegation and not the use of one, its signing input is not defined in -02, and the draft itself says the receipt does not show that the subject approved the grant. Two terms are false analogs. The receipt names both agents, but only the server signs it, and the proof chain orders grants across agents rather than decisions about one agent.

The draft calls an attenuated capability "a strict subset of its parent" in one section and "equal or narrower" in another. I asked which one holds. The file is my reading until the author reviews it.

**A scoring detail in the App Defense Alliance draft.** The ASA working group's updated requirement 2.4.2 now covers the two issues I had raised, revocation after a session is set up and what happens when revocation status can't be established. In [ASA-WG #528](https://github.com/appdefensealliance/ASA-WG/pull/528) I asked for one more recorded field, the time of the second invocation attempt, so a scorer can confirm it came after the enforcement deadline plus the allowed time to live.

**What these results establish.** Matching a published corpus shows that two readings agree on those cases. It does not show that either reading is right, and it says nothing about cases the corpus leaves out. The AEP and AAE runs are author-produced under the lab's rules, not independent lab runs, and neither is a conformance claim for A2A or WasmAgent. The crosswalk and the coverage suggestion are mine until the maintainers answer.
