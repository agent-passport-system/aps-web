---
id: "day-123-a-child-cannot-outlive-its-parent"
title: "Day 123: a sub-delegation can no longer outlive its parent, and a spend unit cannot change once a delegation has one."
date: "2026-06-19"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 123: a sub-delegation can no longer outlive its parent, and a spend unit cannot change once a delegation has one.

**Time was the one narrowing dimension that did not hold at delegation creation: a child could be created with a longer life than its parent, while scope, spend, and depth all narrowed correctly.** Two creation-time defects combined to allow it. `createDelegation` built the expiry with `setHours` and an `|| 24` default, which turned a deliberate zero-hour window into a fresh 24 hours and dropped fractional hours. And `subDelegate` computed the child's window as a duration from one reading of the current time, then passed it to `createDelegation`, which re-based that duration on a later reading, so the child outlived the parent by the gap between the two readings, and an already-expired parent produced a fresh 24-hour child. The [fix](https://github.com/aeoess/agent-passport-system/commit/d69e3eb) moves expiry to millisecond math, reads the current time once, rejects a parent whose expiry is non-finite or already past, and sets the child's absolute expiry to the earlier of two times: 24 hours from now, or the parent's expiry. That absolute value is signed directly, so no relative duration enters the signed object. The invariant now holds to the millisecond at any depth: a child's expiry is at most its parent's. This is creation-time enforcement, matching how every other narrowing dimension works in the SDK today. It does not add a verify-time or chain-level temporal check.

**The spend dimension got the matching guard: once a delegation carries a spend unit, a child can narrow the amount but cannot change the unit the amount is measured in.** A child that switched the unit could restate the same number against a different denomination and pass an amount check while stepping outside the parent's spend constraint. The [guard](https://github.com/aeoess/agent-passport-system/commit/938bdfb) rejects a unit change at narrowing once a spend dimension exists, with adversarial cases in the vector set. Separately, the action-ref-v1 conformance vectors gained a `verification_mode` field that marks whether each vector is structurally enforced, a reader that omits the field treats the vector as enforced, and both the JavaScript and Python runners now print a tally of the field. No code path or hash changed for that annotation.
