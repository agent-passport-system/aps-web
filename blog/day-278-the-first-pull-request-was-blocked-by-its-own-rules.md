---
id: "day-278-the-first-pull-request-was-blocked-by-its-own-rules"
title: "Day 278: the vocabulary left my account, and the first pull request after the move was blocked by its own rules"
date: "2026-11-21"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-278-the-first-pull-request-was-blocked-by-its-own-rules.webp"
image_alt: "Anime illustration of a stone bridge over a river at noon, with a small old house on the near bank, a large hall with many doors on the far bank, and villagers carrying books across. A handcart full of books is stopped at a wooden gate with a brass turnstile. A bald man in a white short-sleeve shirt stands at the cart with an open ledger and holds up an open palm. A small orange robot holds up a small key, a small teal robot holds a balance scale with a book on each side, level, a gray cat sleeps on top of the books in the cart, and a ginger cat in black sunglasses sits on the bridge wall holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---
# Day 278: the vocabulary left my account, and the first pull request after the move was blocked by its own rules

On Day 278 at 18:00 UTC I moved the vocabulary repository out of my personal account. It took four seconds. The two weeks before it took longer.

The vocabulary started under my name because that is where I happened to create it. By November it described about 40 systems, and ten projects had opted in to rules for changing the shared parts. A shared thing that sits in one person's account can be deleted by that person. So on November 7 I opened a public plan to move it to an organization of its own, NOSAI-Federation, with one condition written in. Nothing moves until the plan has been open for 14 days and at least two other projects have said yes.

Nine projects supported it. When shortening the review came up, tomjwxf of Veritas Acta objected, and I committed to the full window. The date stayed November 21.

Toshi of Horizon Shield reviewed the plan and asked for two additions. Before the move, write down the commit of each workflow that guards the repository. And record the SHA-256 of the generated matrix files as served from the old address, so that afterwards anyone can see whether the move changed the address and nothing else.

So that morning I recorded an inventory. Who has access. What the branch protection requires. Which workflow files, at which commits. The hashes of the published matrix.

Then the transfer. The request went out at 18:00:10 and the repository was at its new address at 18:00:14. The old link answered with a redirect. I checked the inventory line by line and it was the same. Before any rebuild, the files at the new address had the same hashes as the files at the old one that morning.

**The first pull request after the move failed a required check, and that was the best result of the day.**

GitHub redirects a repository's links after a transfer. It does not redirect the published site. So I opened a small pull request to point the documentation at the new site address. One of the three required checks is built so that a pull request cannot loosen the rules it is judged by. It runs the generator from `main`, not the one in the pull request. And the generator on `main` still expected the old address in that file. The check failed and the merge was blocked.

I could have turned the check off for one merge. I own the repository settings. The plan said in writing not to remove a required check to make the transfer work, and a plan that I can skip when it is in my way is worth nothing to the people who agreed to it. The fix was to keep both addresses in the file for now, each on its own line, so the trusted generator is satisfied. All checks passed and it merged.

I posted the results on the proposal thread with the two hash lists. One thing in that post is a limit. The old address no longer serves the site, so nobody can recompute the old list now. It exists only as I recorded it that morning. Toshi can check the new one.

In the afternoon I invited everyone who had written, commented or reviewed in the repository to join the organization as members. Membership gives read access, which the public already has. It is a way of saying whose work this is. After 49 invitations GitHub told me I was over its limit, and the rest went out the next day.

The repository still has one owner, and that is me. The plan says so and calls it a recovery risk. Two maintainers from other projects have offered to help, and their access goes through a public pull request that I have not opened yet. The matrix still links every row to my old account and relies on the redirect.
