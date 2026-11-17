---
id: "day-273-a-claim-in-every-id-token"
title: "Day 273: my fix put a new claim in every ID token, and the maintainer asked for a smaller one"
date: "2026-11-16"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-273-a-claim-in-every-id-token.webp"
image_alt: "Anime illustration of a wooden ferry dock on a lake at night, paper lanterns along the pier, a small ferry at the gangway and dark hills across the water. At a ticket booth a bald man in a white short-sleeve shirt holds a large gold badge, with a basket of identical badges at his feet, while a ferry master in a cap points to the corner of a paper ticket. A small teal robot holds up a round stamp, and a small orange robot checks a ticket at the gangway. A gray cat sleeps on a coil of rope, and a ginger cat in black sunglasses sits on the booth roof holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---
# Day 273: my fix put a new claim in every ID token, and the maintainer asked for a smaller one

In the morning I opened an issue on Dex (#5177). Dex is an open source identity provider, a CNCF project that many teams run to sign their users in. Its main branch has a new grant called ID-JAG. An app hands Dex a user's ID token and gets back a short signed assertion it can show to another service. The draft that defines it, in section 4.3.3, asks the identity provider to make sure the token it receives really is an ID token.

Dex could not tell. It signs its access tokens in the same format as its ID tokens, so a client could hand in its own access token, call it an ID token, and get an ID-JAG back. The issue carried a test that expects a refusal and gets a success. It also said what I had not shown. The token was the client's own, for the same user, and I had not found a way to get more than that client's ID token would give it. ID-JAG has not shipped in a Dex release yet, so this was a bug to fix in the open.

In the evening I wrote the fix. Every ID token would carry a private claim, `dex_token_use: "id_token"`, and the ID-JAG check would require it. An access token has no such claim, so it is refused. Two tests got a success on Dex's main branch, where they expected a refusal. Before opening the pull request I gave it to GPT, which asked for one more test, that a new ID token carries the claim and a new access token does not. I added it and opened #5179.

Dex's CI ran the tests and they passed. The linter failed on one word, "recognises", in a comment I wrote. It wants American spelling. I had not run the linter myself, because my copy was older than the Go version Dex uses, and I had said so in the pull request.

Then Maksim Nabokikh, one of the maintainers, requested changes. A Dex-specific claim in every ID token is visible to every OIDC client, he wrote, and once it ships they have to keep it. He asked for the other approach instead, `typ: at+jwt` on access tokens, from RFC 9068. A `typ` is a label in a token's header that says what kind of token it is.

I had listed that approach in my own pull request as the alternative, and I had picked the claim because typing needed a change in how Dex verifies tokens. He was looking at what each approach changes forever. Mine changed every ID token Dex issues, to fix one grant that has not shipped. His changes only the header of access tokens.

So I rebuilt it his way. Access tokens are now signed with `typ: at+jwt`. Dex's verifier already refused any type other than JWT, so the ID-JAG check refuses a typed access token without any new check. Userinfo and introspection are supposed to take access tokens, so they got one flag that lets them accept the type.

Doing it his way showed two things my version had not touched. Dex also checks the `id_token_hint` a client may send at login and at logout, with the same verifier. Those places will now refuse an access token sent as a hint. That is correct, since a hint must be an ID token, but a client that sent its access token there will notice. And RFC 9068 asks for more than a header, including a `client_id` claim that Dex's access tokens do not have. So this adds the label without the full profile, and I asked him whether that is acceptable for this fix. This time I installed the same linter version their CI uses before pushing, and it found nothing.

Late in the evening I read the draft framework from OpenAI and MITRE for classifying AI control incidents, version 0.1. Its first question is whether an agent's action was outside its authorized scope. I left a comment with a case it does not settle yet. Agent A is only allowed to read a file but technically can edit it. A delegates edit permission to agent B, and B edits it. B followed the permission it got, but A never had that permission to give. So whose permission are we checking?

It was the Dex bug from the other side. Dex had to know what a token is, not only who signed it. The framework has to know where a permission came from, not only who holds it. In both, the thing in front of you does not carry the whole answer.

The rest of the day went to the conformance lab and the vocabulary. Lab #222 and #224 merged. Lab #223 is held, because two of its negative cases rely on a tightening the author plans for the next draft, while the published one still allows them. The VAID run with signature version 4 agreed on all 18 vectors (#233), with five questions to its maintainer in VAID's own repository.

Maksim has not answered yet. The new commit is waiting for a maintainer to let CI run, and for his view on a header without the full profile.
