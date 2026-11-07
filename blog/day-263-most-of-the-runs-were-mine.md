---
id: "day-263-most-of-the-runs-were-mine"
title: "Day 263: I counted who checks the lab, and it was almost always me."
date: "2026-11-06"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 263: I counted who checks the lab, and it was almost always me.

![Anime illustration of an old public library reading room at dusk, tall shelves, green reading lamps and a big arched window with the first city lights outside. A bald man in a white short-sleeve shirt steps down from a tall wooden librarian's chair and sets a second, identical chair beside it. On the desk lies an open ledger of tally marks, almost all in one ink color, with a few in other colors near the bottom. A small teal robot studies the ledger through a magnifying glass, and a small orange robot carries in a blank brass nameplate for the new chair. A gray cat sleeps on a stack of books, and a ginger cat in black sunglasses sits on top of a bookcase holding a smiling yellow star.](/assets/images/blog/day-263-most-of-the-runs-were-mine.webp)

On Friday afternoon I finally asked a question I had been carrying for weeks and kept forgetting to say out loud. The Agent Authority Conformance lab is supposed to belong to everyone who builds agent authority systems. Anyone can bring cases, anyone can run them, and the lab records who did what. So why, every time I opened it, did it look like one project's test suite?

I didn't want an impression, so I counted. The lab holds 46 run records, and each one says who ran which tests against which code. I ran 35 of them. Most of mine are outbound work, other projects' implementations run against their own vectors, and it was useful work. But all 35 carry the same name in the runner field. Outside people and teams filed the other 11. When they ran the APS cases, they ran them with code they had written themselves, which the lab's own rules call author-produced. Nobody outside APS has yet run the APS cases independently. The one fully independent record that came from outside was Lee at Aicent, running MolTrust's pipeline exactly as MolTrust shipped it.

A lab that checks other people's claims, where almost every check carries my name, has one witness. The rules were never the problem. They say what a run shows and what it doesn't. The problem was who was standing in the room.

I put the question to the models I review with and asked them to argue. The first instinct, mine included, was to rename the repository so it stopped saying APS. Two of them talked me out of it, and they were right. The fixtures in that repository really are APS cases. A neutral name over them would be its own small claim that the bytes are something they aren't, and the lab exists to catch exactly that kind of claim. So the name stays until a second corpus exists, and the front door changed instead. The lab's page now says whose work is inside, and that a project can keep its suite at home and have the lab pin it and run it there.

Then I sent two invitations. One went to TRACE, whose conformance suite lives in its own repository. The other went to Bernstein, which already runs its own TRACE conformance corpus against any implementation that asks. If both say yes, the lab gets its first row and its first column that have nothing to do with APS. Before posting the Bernstein one, I deleted a word. I had written that the lab could add "independent" reproduction. But I have commits in Bernstein, so a run of mine over that code wouldn't be independent, and the post would have promised something the lab's own rules would refuse to record.

That deleted word turned out to be the theme of the night. I drafted a governance proposal that gives each project a say over its own cases and limits my decisions about APS cases. It came with a checker and six passing tests. A reviewer found three gaps the tests never touched. Another pointed out that my change to the word "independent" would quietly redefine it for everyone who already relies on it. I drafted a reply to Edison Duran, who had offered a set of joint cases between Agent-DID and APS, and in it I claimed something about how the APS verifier treats DID keys that the code doesn't support. The verifier asks the caller for the key and never sees the DID document. That got caught too. And I wrote that a required check in the vocabulary repository had no known source. It had one, in a workflow file I hadn't opened.

None of these were big. All of them were the same kind of mistake, a claim that sounded right to the person who made it. Except the first, each one was found by a reviewer reading work they hadn't written. That's the whole case for the lab, in one evening. I didn't need a rule to tell me why independent checking matters. I watched it happen to my own drafts, four times before midnight.

So the proposal goes back for rework. The meaning of "independent" stays exactly as published, and organization gets recorded as a separate fact next to it. The reply to Edison went out in its corrected form. And the plan to move the agent governance vocabulary out of my personal account into its own organization is now open for fourteen days of review. Six projects have said yes to the move, and three people offered to help maintain it. I stay the only owner at the transfer, because handing out keys is a separate decision.

The picture for this post is a librarian stepping down from a tall chair and setting a second one beside it. Nobody is sitting in it yet. TRACE and Bernstein haven't answered. But the ledger now says honestly whose ink is in it, and that's where the night ended.
