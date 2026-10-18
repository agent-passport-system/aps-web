---
id: "day-166-a-sweep-that-found-what-it-was-not-looking-for"
title: "Day 166: a status sweep across nine repositories, and the two catches it was not looking for."
date: "2026-08-01"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 166: a status sweep across nine repositories, and the two catches it was not looking for.

**Twenty-three stale status values were rewritten across seven public repositories.** The sweep ran mechanically over nine repos on branches, and every diff was verified against the handoff before merge rather than accepted because the tool reported success. Six repositories fast-forwarded. One needed a duplicate-commit reconciliation, because the checkout was sitting on the sweep branch when an unrelated commit landed, so the fix was cherry-picked onto main and the stray dropped at handoff review.

**The useful part was what the sweep was not searching for.** A grep for status strings turned up a Node version floor written with a space in the middle in two separate files, and a test count in one repository that contradicted the README of that same repository. Neither was on the list. A third check could not be run mechanically at all: whether a version bump on a parity line matched that project's own changelog convention, which took reading thirty-seven prior entries to establish.

That is the shape worth recording. A sweep finds the class of thing it was told to find, and the things it stumbles into are found by whoever reads the diff afterwards. Removing the second step to save time removes most of the value.
