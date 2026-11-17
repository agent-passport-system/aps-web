---
id: "day-271-the-site-said-more-than-the-code"
title: "Day 271: the site said things the code did not do"
date: "2026-11-14"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-271-the-site-said-more-than-the-code.webp"
image_alt: "Anime illustration of a small shop painted in blue and yellow pixel blocks on a seaside boardwalk at blue hour, string lights overhead and a pier with harbor lights behind. A bald man in a white short-sleeve shirt stands on a ladder peeling a big bright poster of a ringed planet off the shop window, a rolled plain poster under his arm. Inside, a small teal robot holds a tiny glass globe with a planet in it up next to the poster. A small orange robot steadies the ladder beside a pile of removed posters. A gray cat sleeps on a striped awning, and a ginger cat in black sunglasses sits on the shop sign holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---
# Day 271: the site said things the code did not do

I asked for one thing on Saturday evening. The long pages on agent-passport.org were hard to read, and I wanted them easier to read. By the end of the night that was the smaller change.

The first try was a plain academic layout with serif text and no color. It was readable, and it was not this site anymore. I asked for something with more character, so the long pages became a window from an old game, with pixel headings, blue and yellow, black outlines, a small pixel icon for each page, and a list of sections with a bar that shows how far you have read. The text inside is a calm serif at about seventy characters a line. The homepage, careers, federation, contact and team pages stayed as they were.

To rewrite the pages I needed a list of what was wrong with them, and GPT had written one. Before using it I checked each point against the code. The first five all held.

The wallet page described sending Nano as if it worked today. The gateway at its current public commit refuses every send until its payment lifecycle is switched on, and it is not switched on. The passport page showed an import of `commercePreflight` from the SDK's `/core` path, and in SDK 8.0.1 that function throws. The threat model said a valid signature shows that a delegation chain is valid. A signature shows who signed one record. Whether the whole chain holds is a separate check. The FAQ listed Values Floor as part of the core. The comparison page put other projects in a table full of dashes, which said more about them than I could support.

So the rework turned into a claims pass. Every page that got a new sentence also got a read-only check by Codex, which reads the page next to the code and reports what does not match. On the first five pages it found 19 more things. The wallet page described a signed receipt that the send route does not produce. The passport page named functions that SDK 8.0.1 does not export. The threat model carried coverage totals that did not add up to its own tables. I checked three of those findings against the source myself before applying them.

Two pages changed in meaning, not only in wording. The payments page used to center on Nano. Now it says that spending limits come from the delegation, and payment networks are adapters under it. Nano came first because it has no network fee. The identity page now starts with bring your own identity, meaning your own identifiers checked by your own resolver, and offers the agent passport as one option among others.

The threat model also got a note about its own tests. I ran the SDK suite on my machine and listed what happened. Nine test files are linked from its tables. Seven ran with no failure. Two of them do not exist in the SDK repository, so those rows are now marked instead of pointing at nothing.

The site went out in ten pushes that evening, and one of them was wrong because of me. Before each push I run a check that the sitemap dates match the pages. I piped its output into a command that showed only the last few lines, and that hid its failure. Three pages went out with wrong dates, the check on GitHub turned red, and the next push fixed it. Since then the check's own exit code is tested before anything leaves the machine. A few minutes later that habit stopped a push that would have failed the same way, because the script that dates pages skips any commit that touches more than ten of them. I split the commit in two and it passed.

Earlier that day the vocabulary got a crosswalk for Pipelock's action receipts (#263), and Lee's fail-closed candidate from Aicent merged into the conformance lab (#221).

Not everything is done. The threat model's detail rows have not been rechecked one by one against SDK 8.0.1. Six old FAQ entries were removed and not restored, and the reference material cut from the wallet and passport pages still has to move into the docs. The pages are shorter than they were, and every sentence left on them is one I could check.
