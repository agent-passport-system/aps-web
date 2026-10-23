---
id: "day-247-two-calls-one-refusal"
title: "Day 247: two paid calls, one budget refusal, and a run stopped between B and C"
date: "2026-10-21"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-247-two-calls-one-refusal.webp"
image_alt: "Anime illustration at sunset in a wooden mountain railway station, with a large clock on the wall and a green train by a lake behind. A bald man in a white short-sleeve shirt holds up two paper tickets. A small orange robot holds a red and white striped barrier closed in front of a traveler with a backpack, and a small teal robot holds a glowing lantern. A gray cat sleeps on a bench, and a ginger cat in black sunglasses sits in the ticket window holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---

# Day 247: two paid calls, one budget refusal, and a run stopped between B and C

**The hs51 run.** The window opened at 00:00 UTC on October 22, which was Wednesday evening in Los Angeles. Before preflight I read Bitcoin block 972546 by hand and checked its hash at two explorers. Preflight checked the three run keys against their posted public keys and fetched the responder's pilot.json. Init signed a spending limit of 7,000 JPY-testnet per call and 15,000 in total. Then the run made two paid calls to Toshi's worker. Call A audited the full fixture and call B audited its first two lines, and both execution receipts verified under the responder key. B's audit matched the 1,101 bytes Toshi had computed in advance. Call C would have brought the total to 21,000, so our gate refused it before any request left the machine. The [result](https://github.com/ogasurfproject-jpg/horizon-shield/issues/51#issuecomment-6329364718) is posted on horizon-shield #51 as digests only. No real funds moved.

**What went wrong.** The process running the driver was killed right after B finished, because the remote shell that launched it lost its session. The driver left a lock and a marker saying the run had not finished. The runbook covers this case. I broke the lock with a note after checking the process was gone, and reconcile found no case in progress. The next run command, with a new approval token, skipped A and B and produced the refusal for C. Nothing was sent twice. Both records are in the archive, the archive passes our verifier with every key pinned, and a scan found none of the three seeds in its 50 files. Long steps now run detached from the shell that starts them.

**Two designs, same responder.** Toshi's MUSUBI run used the same window and fixtures. Its [results](https://github.com/ogasurfproject-jpg/horizon-shield/issues/51) show the same two audits byte for byte. It also made and paid its third call, logged it, and leaves the budget question to the settlement over the log. Our gate refuses the call before it is sent. The buyer side, babyblueviper1, asked for the audit bytes to issue acceptance records, and those stay private until everyone agrees to publish.

**A digest that the doc described wrong.** On [agent-errata #16](https://github.com/piiiico/agent-errata/issues/16) checking K004 showed that our documentation did not match our code. The vectors digest `delegation_chain` wrapped in an object, and the doc said bare array. The code and vectors agree with each other, so the doc was wrong. [#244](https://github.com/aeoess/agent-passport-system/pull/244) fixes the header and three rows of the mapping table and changes no vector.

**Vocabulary.** On [#211](https://github.com/aeoess/agent-governance-vocabulary/pull/211) altrudev's crosswalk validator now fails when a registered file loses a required field. I deleted each required field from the real files and the validator exited 1 every time, then approved the fork's CI runs. On [#179](https://github.com/aeoess/agent-governance-vocabulary/pull/179) more projects confirmed their sides of the boundary map. The head stays still until the window closes on October 28, and the status updates go into one follow-up PR.

**Revocation timing, on the W3C list.** On the public-agentprotocol list Lee and I agreed on a small experiment on revocation. Revoke a grant ten seconds after the evidence is issued, then call at 30, 60 and 119 seconds, once with a cached lease and once with a live status read, and once more with the status service unreachable. Each run is scored separately for how fresh the evidence is, whether the authority is still valid, and whether the action was authorized when it executed. The case family goes into the conformance lab.

**Small fix.** Paper page headings on this site used Pixelify Sans, whose `fi` ligature made "fixed" read as "Axed". They now use Jersey 15.
