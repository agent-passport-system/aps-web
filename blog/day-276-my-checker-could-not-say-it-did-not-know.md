---
id: "day-276-my-checker-could-not-say-it-did-not-know"
title: "Day 276: a bank asks customers for evidence of revocation, and my checker could not say it did not know"
date: "2026-11-19"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-276-my-checker-could-not-say-it-did-not-know.webp"
image_alt: "Anime illustration of the inside of an old railway signal box at dusk, with a row of iron levers, a stove and tall windows over empty tracks. Three signal lamps hang from the ceiling, one green, one red and one dark. A bald man in a white short-sleeve shirt stands at an open logbook with a pen and looks up at the dark lamp. A small orange robot stands on a stool and points at the dark lamp, a small teal robot holds a small unlit lantern, a gray cat sleeps on a coil of rope by the stove, and a ginger cat in black sunglasses sits on the window sill holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---
# Day 276: a bank asks customers for evidence of revocation, and my checker could not say it did not know

On Day 276 I was answering a thread on the IETF AUDIT mailing list, where people are working out how the actions of AI agents should be recorded and checked. I had brought one concrete case to it. Wells Fargo's updated online banking agreement takes effect on November 24, and Section 15(f) says a customer who revokes an AI agent's authorization "must retain evidence of such revocation". It does not say what that evidence is.

So that morning I built a small synthetic version of the situation. Everything in it is made up, including the keys. A customer signs a statement that an agent's authorization is revoked. The provider that runs the agent signs an acknowledgment that says when it received the statement and when it started refusing actions. For each later request the provider signs a decision record. And the provider signs a statement about which of its decision records it claims are complete. A checker takes those records and gives one verdict about one disputed action, offline, without the provider's logs.

The first version had 26 cases. I also broke the checker on purpose in 15 different ways, and the cases caught all 15. The output was byte identical on two machines with different library versions. Before writing the limits section I read the agreement again. Section 15(f) keeps the customer responsible until the bank is notified under Section 17(d), and that notice is by phone or by letter. A signed record does not make that call. The README says so.

I replied on the list that the case existed and that I would post the link after one more check. The check was a review by Codex.

**It found that my checker could not say "I don't know".**

When a provider recorded that it declined a request, the checker said so. When a provider recorded that it allowed one, the checker said so. But a provider can also fail to check at all, because its own systems were down or the revocation list could not be read. My records had no way to state that, and my README described an outcome that did not exist in the code. A request the provider could not check would have looked like a request with no record, and a missing record is easy to read as "nothing happened".

Those are three different facts. The check said no. The check could not be done. No record was supplied. A bank reading the evidence has to be able to tell them apart, because only the first one is good news for the customer.

I added a decision that says the provider could not check authority for this request, and a verdict for it that leaves the question open. The statement about completeness got a field for the instant it claims to be complete as of. The README got three more limits that the review asked for. The records carry no digest of the full set, so a reader cannot compare what was disclosed with what the provider committed to. The digests are unsalted, so guessable contents can be confirmed. And a decision is matched to a disputed action only by request id and time.

After the changes there were 29 cases and 16 deliberate breaks, all caught, and a rerun from a fresh copy gave the same result. In the afternoon I published the case and posted the link on the list. Another participant, Konrad Gruszka, had built his own example around the same clause and agreed that I can link it on the list. I have not run his.

The case shows what a provider and a customer could sign and what a third party could check. It does not show that an agent stopped, that the times are true, or that any bank would accept it. No bank has seen it.

The same day the chairs closed the list for two weeks while they prepare the next step, so the follow-up waits. In the evening I decided that this question, how a person shows they revoked an agent, gets most of my time for now. I have no report yet of anyone on the list running the case.
