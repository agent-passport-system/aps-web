---
id: "day-237-same-bytes-two-verdicts"
title: "Day 237: the same signed bytes got two verdicts from my two SDKs, and the reviewers found bugs in my fixes"
date: "2026-10-11"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 237: the same signed bytes got two verdicts from my two SDKs, and the reviewers found bugs in my fixes

![Anime illustration. A bald man in a white short-sleeve shirt stands at a workbench at night behind two identical brass scales, a pencil at his chin. The same taped envelope sits on each scale. One scale raises a small green flag and the other a small red flag. A small orange robot looks at the left envelope through a magnifying glass, a small teal robot holds up a blank card, and a gray cat sleeps on a stack of papers.](/assets/images/blog/day-237-two-scales.webp)

**A string where a number belongs.** Codex reproduced issue #223 with a freshly signed legacy delegation carrying `maxDepth: "1"`. TypeScript compared the string as a number and rejected the record at depth 2. Python skipped the comparison and accepted it at any depth. Same signed bytes, two verdicts. Now a present `maxDepth` or `currentDepth` that is not a non-negative integer up to 2**53 minus 1 makes the record invalid in both, and no depth result is claimed for it. GPT then found that both writers could still sign values like 1.5 or -1 that their own verifiers now reject, so the writers refuse them too. #225 and agent-passport-python #26.

**The reviewers found bugs in my fixes.** I moved profile recognition into a helper shared by both identity verifiers. Codex found that a proxy whose prototype trap throws now escaped the principal binding verifier as an exception, where before it returned malformed. The passport verifier had done the same since #221 this morning. One guard in the helper fixed both (#226). In the revocation fix (#227), the reviews showed that my changelog said every out of contract resolver answer used to throw. An answer like `{ state: "revoked" }` had returned invalid. I corrected the sentence before merge. GPT also found that the shared resolver classifier said it refused non-plain answers and did not check. A `Date` carrying a key passed. The key it returned still had to verify the signature, but the code did not do what its comment said. Issue #228, fixed in #230.

**An unknown key is now indeterminate.** When the key resolver found no key, `verifyPassportV2` and the principal binding verifier used to say invalid. Nothing was established about the key, so they now say indeterminate, with key authority unresolved. A record that names a type or version the SDK does not implement says unsupported, before the schema check and before any resolver call. Draft-04 does not prescribe these answers for these records, so they are reference choices, and the PRs say so. None of them admits anything, and the changelog marks the change breaking for callers that deny only on invalid. #221 and #226.

**The frozen vectors stayed frozen.** Three of yesterday's twenty passport cases now record answers the SDK no longer gives. Readers outside the project pin that file by sha256, so it stays byte for byte as published, and a second revision sits next to it with the same passports and the three new answers (#224). They are the cases where Probity's report already differed. Probity has not run the new file, and I wrote that on Toshi's thread with both hashes.

**A missing depth limit means no limit.** Both SDKs now apply no ceiling on verification when `maxDepth` is absent, as section 4.1 of the v1.1 spec says, and `null` gets the same answer because it signs to the same bytes. Minting a child under a parent with no ceiling is refused. Ryan's adapter applies a ceiling of 1, which is his local acceptance policy and fine as one, and I answered his thread with that. #222 and agent-passport-python #25.

**Eleven Dependabot alerts, and a lockfile my laptop broke.** Nine were fastify 4 in the example middleware folder, which the package does not ship but people copy. The example now asks for fastify 5.12.5, and the adapter type-checks against it unchanged. The other two were dev dependencies. My first lockfile came from npm 11 on macOS, which dropped optional entries, and CI's `npm ci` refused it. I regenerated it with npm 10.8.2, the version CI runs. Zero open alerts after #229.
