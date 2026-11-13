---
id: "day-268-a-100-grant-that-spent-130"
title: "Day 268: the demo I built to show a spending limit found a $100 grant that could spend $130"
date: "2026-11-11"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 268: the demo I built to show a spending limit found a $100 grant that could spend $130

![Anime illustration of a small Los Angeles apartment late at night, palm silhouettes and city lights in the window and a travel bag by the door. A bald man in a white short-sleeve shirt sits at a low table with a laptop and a ledger where one column of coin stacks is drawn twice, the second one taller. A small orange robot adds a tidy new row of coins, and a small teal robot connects the laptop to a little looping test track. A gray cat sleeps on the bag, and a ginger cat in black sunglasses sits on the windowsill holding a smiling yellow star.](/assets/images/blog/day-268-a-100-grant-that-spent-130.webp)

Wednesday started with a look at my own SDK. The last release was 8.0.1, on October 15. Since late October nearly all of my time had gone into other projects, their crosswalks, their lab records, their test runs. All useful, and none of it APS. So APS became the priority again. My first plan was a test suite of payment limits. A review turned it into something better, a gateway demonstration anyone can run. Delegate authority to an agent, narrow it, spend under it, revoke it, and verify afterwards what happened. Payments first.

To write the demo I had to walk the gateway's spend path one step at a time, and that's where it broke. The gateway checked each spend against the acting agent's own delegation and nothing above it. Split a $100 grant into a parent and a child, and together they could spend $130. Two children of one parent could each spend the parent's whole budget. The wallet send route had two more gaps. It didn't check the chain for a revoked or frozen grantor, and it read a spend limit of 0 as no limit at all.

This is the rule APS exists to sell. Authority can only go down at each transfer. The SDK's chain verifier enforces that for scopes. The gateway's budget counter didn't, because it counted per delegation instead of per chain. I've written about this kind of gap before, on Day 148, and here it was again in a different counter.

The fix shipped as agent-passport-gateway 0.4.3, after seven review rounds. A spend now has to fit every bounded delegation on the acting chain, and a permit debits every one of them in the same database transaction. The harder part was the counters already written. Updating doesn't make an old counter honest. So on its first start 0.4.3 puts a hold on every delegation whose counter can't be trusted and refuses spending through it, even where no budget was exceeded, until an operator reconciles the counter or revokes the chain. The advisory is GHSA-w2v3-jgwx-8xjf, rated medium. I made one mistake on the way out. I dated the changelog entry after the release pull request had merged, which cost a second pull request and a few minutes where the fix was public before the advisory was. That's now a rule, date the changelog before the release merges.

Then the demo itself. SDK pull request #251 adds examples/payment-authority. #252 adds a second example on the same design for enterprise documents, where a grant to share a file pins the repository, the document, its version, its content digest and the recipient, and an offline verifier checks the exported evidence. #253 moves both onto one shared engine. Working through the review of the document example, I found a real bug. A genuine evidence package exported before a key rotation failed verification after it. It also made me write down what a package doesn't prove. Record times are asserted by the signer, and a package with an entry removed still verifies. The verifier now says both out loud.

One more defect turned up in our own spec. The governance attestation document lists iss as a required claim in one section and leaves it out of the JSON Schema in another, and that schema forbids extra properties. A strict validator following the schema would reject every attestation the gateway has ever issued. The erratum went in as SDK #254, with a tested reference verifier. That evening gateway 0.5.0 went out, with budgets that carry their own unit.

Late at night I published one more thing, payment-lifecycle-attack-harness. It runs the gateway's real payment code against a fake payment node that lies and goes down, with gateway processes that crash in the middle of a payment, and after every step it checks three rules. No counter goes over its limit, no reservation is released without a recorded reason, and one payment never produces two signed blocks. It ships with eleven scenarios and nine planted faults, bugs put in on purpose that the scenarios have to catch. I posted an invitation on vocabulary #177 for anyone who wants to add an attack. I also asked on Kanon #58 where a spending-authority check would sit in an x402 payment flow, and replied on two x402 threads about payment holds.

The picture is late night back home in Los Angeles, a laptop open, and a ledger with one column added up twice. The harness is public now. Whether anyone tries to break it is a question for tomorrow.
