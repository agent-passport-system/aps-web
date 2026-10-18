---
id: "day-180-an-explicit-zero-that-signed-no-cap"
title: "Day 180: an explicit zero that signed no cap, and a claim on this site that the code did not back."
date: "2026-08-15"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 180: an explicit zero that signed no cap, and a claim on this site that the code did not back.

**The published CLI signed an uncapped delegation when you asked for a cap of zero.** The flag parser read `Number(getFlag('--limit') || '0') || undefined`, and zero is falsy twice in that expression, so `--limit 0` produced a delegation with no spend limit at all. The core library already handled zero correctly and its own comment warned against exactly this coercion; the CLI in front of it did not. `--depth abc` was worse in a quieter way: `Number('abc')` is NaN, JSON serializes NaN as null, and chain verifiers guard the depth rule on the ceiling being present, so a typo removed the ceiling. Both are fixed in 4.3.1, which is on npm now: an explicit zero signs a zero cap, non-decimal or unparseable numeric flags exit with an error and write nothing.

**Same day, a sentence on this site came down.** The AIVSS page said spend limits can only decrease. The specification says that; the shipped TypeScript and Go verifiers enforce it only when both parent and child carry the field, and a child that omits the field is not compared. I knew that on Day 179 and left the sentence up for three days while I worked on the fix, which was the wrong order. The page now says what the specification requires, what the code enforces today, and where the gap is, dated. The scope claim stays, because scope narrowing is enforced. The unqualified "authority can only narrow" came off the delegation page's description for the same reason.
