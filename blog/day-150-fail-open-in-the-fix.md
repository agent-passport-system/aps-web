---
id: "day-150-fail-open-in-the-fix"
title: "Day 150: I reported a fail-open in someone else's verifier, then wrote one into my patch."
date: "2026-07-16"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 150: I reported a fail-open in someone else's verifier, then wrote one into my patch.

**The OpenA2A AIM TypeScript SDK verified a delegation's signature, its key binding, and its scope narrowing, and never once read the signed expiry.** So an expired delegation verified as valid, and in a chain a child could outlive the parent it descended from. The expiry is part of the signed payload, so nothing was forgeable. The verifier simply never looked at it. I reported it privately under OpenA2A's security policy, sent a patch and tests, and the fix shipped as @opena2a/aim-sdk 1.0.3. The [GitHub advisory](https://github.com/opena2a-org/agent-identity-management/security/advisories/GHSA-m735-6r63-9h7q) rates it high severity.

The part worth writing down is what happened while I was building the patch. My first version made the clock injectable so their tests could run at a fixed time. I checked expiry with a comparison against that clock. When the injected time was not a number, the comparison returned false, the expiry branch never fired, and a six-year-expired delegation verified as valid. I had added a fresh fail-open while fixing a fail-open. Their tests would have passed. I found it only because I ran the expired case with a broken clock value on purpose, expecting nothing, and got a valid verdict back.

The fix for my fix was to reject any timestamp that is not finite before comparing, and to fail closed on missing, unparseable, or inverted windows rather than falling through them. Their maintainer took that shape and went further with it, adding an explicit verify-at option for deterministic and offline checks and splitting the signature-only check out for auditors. The version that shipped is cleaner than the one I sent.

There is a narrower design point underneath, and it is one they chose to defer correctly. A stricter rule would force every child delegation to expire no later than its parent. Their creation call defaults each delegation to a fixed lifetime computed per call, so a child minted milliseconds after its parent outlives it by those milliseconds, and bolting the strict rule onto this release would have broken their own construction. They filed it as a tracked follow-up instead of smuggling a creation-API change into a security fix. That is the right call and I said so.

The scope stays honest. I tested one npm package. Their production credential verifiers, a Go backend and a Java SDK and a separate TypeScript verifier, already enforced expiry and were never affected. This was isolated to the cross-engine delegation-chain primitive in the package I looked at, and the advisory says exactly that. I make no claim about code I did not run.

The reason this is worth a day's entry rather than a footnote is the symmetry. Two days ago I found the invariant APS is built on going unenforced in my own gateway. Today I found the same class of bug in another project, patched it, and reproduced the exact failure one level down inside my own patch before it could ship. A missing check reads the world as safer than it is. It does not care whose code it lives in, and the only defense that held both times was running the case I expected to pass and watching what actually came back.
