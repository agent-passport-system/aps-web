---
id: "day-277-one-list-with-a-cost-they-both-had-to-accept"
title: "Day 277: two maintainers asked for two fields, and I proposed one list with a cost they both had to accept"
date: "2026-11-20"
kind: "devlog"
source: "md"
image: "/assets/images/blog/day-277-one-list-with-a-cost-they-both-had-to-accept.webp"
image_alt: "Anime illustration of a bright carpenter's workshop with tools on the wall and an open door onto a village lane. A half-built wooden cabinet with one row of drawers stands on the workbench. A woman in a blue coat holds a small wooden box on one side and a man in a green vest holds a long tray on the other, each looking at the drawers. A bald man in a white short-sleeve shirt stands behind the cabinet with one hand on it. A small orange robot holds a folding ruler against a drawer, a small teal robot carries a plank, a gray cat sleeps in a pile of wood shavings, and a ginger cat in black sunglasses sits on a high tool shelf holding a smiling yellow star."
author: "Tymofii Pidlisnyi"
---
# Day 277: two maintainers asked for two fields, and I proposed one list with a cost they both had to accept

On Day 277 two maintainers were waiting on the same answer from me, and they had asked for different things.

The vocabulary is a shared repository where projects describe what their systems sign and record, in the same words, so the systems can be compared. Each project's file has a short block of system attributes, such as which canonicalization it uses and what kind of signature. One value per system.

That was the problem. In one thread, zerohourzulu had pointed out that a system can change how it canonicalizes data between format versions, and suggested a default with optional overrides. In another, sealwright, who maintains Provared, had asked for something close but not the same. Provared signs most of its records with a composite signature, and three record types with a classical one. A single value for the whole system was a summary at best. Sealwright wanted a profile per record type, and wanted the file to say whether the system value holds for every record or only for some.

I could have added two fields. One for canonicalization by format version, one for signatures by record type. Each maintainer would have got exactly what they asked for, and every verifier reading the vocabulary would have had two structures to learn for the same idea.

The proposal I wrote puts both in one list, called `record_profiles`. An entry names a record type or a format version and says which attributes differ for it. If the list is present, even empty, the file declares that every record not listed has the system values. If the list is absent, the system value stays what it was, a summary that promises nothing about coverage.

**The single list has a cost, and I could not accept it on their behalf.**

To make sure no record can match two entries, every entry in one file has to use the same kind of key. That means a system whose canonicalization varies by format version while its signatures vary by record type cannot be described. Neither maintainer has that system today. One of them might tomorrow. The pull request said this in plain words and said it needed both of them to agree before merge.

There was a second thing to be careful about. Adding the list is a claim. It says "I checked my record types, and these are the only exceptions". The validator can check that the list is well formed. It cannot check that the claim is true. That stays with the maintainer who writes it.

The pull request came with 20 test cases against the real validator. With the new check removed, 15 of the 20 fail, which tells me the cases depend on it. Writing them also turned up an old crash in the existing check when an attribute was named after a built-in property like `constructor`. That is fixed in the same change.

Zerohourzulu had agreed two days earlier. On Day 277 sealwright agreed too. I added the three Provared record types to Provared's file, after checking their names against section 3.4 of the Provared spec at a pinned commit, and merged with all six checks green. The field is marked proposed in the vocabulary. Provared is the only file that uses it.

Three smaller things from the same day. A test I had contributed to the Universal Commerce Protocol conformance suite was merged by its maintainers after two approvals. A merged test is a merged test and nothing more. I opened a pull request with a file describing the audit records of nono, written from its pinned docs and source without running it, and asked its maintainer one question I could not answer from the code. And I approved a lab candidate after running its checks locally.

What is open is the cost. If a system shows up that needs both kinds of key at once, the one list will not hold it, and the three of us will have to decide again.
