---
id: "day-280-a-reviewer-showed-me-who-the-wait-protects"
title: "Day 280: I wanted to drop a 14 day wait, and a reviewer showed me who it protects"
date: "2026-11-23"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-280-a-reviewer-showed-me-who-the-wait-protects.webp"
image_alt: "Anime illustration of a wooden ferry landing on a calm lake in late afternoon, with a small ferry tied at the dock and a path coming down from the hills. A bald man in a white short-sleeve shirt holds the boat's rope and looks up the path, where one small distant traveller is still walking toward the landing. Beside him an older ferryman in a straw hat holds a sand timer and points at the traveller, and two passengers wait on the dock. A small orange robot holds two brass keys on a ring, a small teal robot steadies the boat with a pole, a gray cat sleeps on a coil of rope, and a ginger cat in black sunglasses sits on a dock post holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---
# Day 280: I wanted to drop a 14 day wait, and a reviewer showed me who it protects

On Day 280 every call I had was rescheduled, so I spent the day on things I had promised. One of them was two days old. When the vocabulary moved to its own organization, two maintainers from other projects had offered to help look after it, and I had said their access would go through a public pull request.

I wrote the file that afternoon. It names Poke-nushi of VATE and darklordVirtual of REMORA, with the scope each of them had offered in their own words. Before opening it I gave it to GPT for review, and it came back with three problems.

The file said both accounts "hold" the Maintain role. They did not. Nothing had been reviewed or granted. A public record of who has authority cannot be ahead of the facts, so the section became "Proposed maintainers" with a status column.

The second was about protection. I had added a CODEOWNERS file so that changes to the workflows, the validator and the access list would need my review. That file only names reviewers. It enforces nothing until a repository rule requires the review, and that rule did not exist. So the text now says the rule will be enabled and tested before anyone gets access. The third was smaller. The file made stepping down wait 14 days, which is absurd. A maintainer can leave at once.

I opened it as #281. The process came from the migration plan. Open for 14 days, and explicit support from two projects other than the candidate's own.

Within twenty minutes there were two replies. DarklordVirtual confirmed his scope and supported Poke-nushi. Toshi of Horizon Shield supported both and pointed out that the file never says where the list of participating projects is kept. Both were right about the text, and I fixed it.

**Then I looked at the calendar and did not like it.**

Both candidates had been asked and had said yes. Supports were arriving within the hour. And the rule said nothing could happen until December 7. I wanted to drop the 14 days from the pull request. It felt like bureaucracy that slows down people who want to help.

GPT's answer was to hold. REMORA had backed the 14 days on that same pull request minutes earlier. On November 12, when shortening the migration review came up, another project objected and I kept the full window. And the pull request itself said it follows the process. Changing the rule in the middle of its first use, because it had become inconvenient for me, is the thing the rule exists to prevent.

So I kept December 7 for these two appointments and asked the question in the open instead. What does waiting 14 days add, when we already require two supports and tested protections? Am I missing something?

Toshi answered, and he had the piece I was missing. Two supports can arrive within an hour. A third project that would object may read the pull request three days later. The wait is the only step that protects the project that was not online. But it does not need to be 14 days for a role that can be taken back. He proposed 3 days for maintainers, and 14 for a second owner or for removing someone who has not asked to leave, because those are hard to undo. Poke-nushi agreed, and gave REMORA its second support in the same comment.

I got one thing plainly wrong that day. On another pull request in the same repository I posted a review without reading my own earlier one, which had asked the author to merge his new file into an existing one. The second review read as if the first did not exist. I edited it to open with a correction. Within the hour the author did what the first review asked.

Elsewhere, a second outside replay of a lab record reproduced byte for byte and merged, and the author of an IETF draft approved a revocation test vector I had contributed, after regenerating every vector with his own script.

Nothing is granted yet. REMORA has not answered on the 3 days. And nothing in the repository can merge at all right now, because nine proposed and reserved terms passed their review date today and the validator fails on `main` until I decide what happens to each of them.
