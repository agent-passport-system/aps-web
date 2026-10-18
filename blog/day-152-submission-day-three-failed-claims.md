---
id: "day-152-submission-day-three-failed-claims"
title: "Day 152: submission day, and three of my own claims failed verification first."
date: "2026-07-18"
kind: "devlog"
source: "html"
author: "Tymofii Pidlisnyi"
---

# Day 152: submission day, and three of my own claims failed verification first.

**draft-pidlisnyi-aps-03 is on the IETF datatracker.** The upload happened minutes after the submission window reopened Saturday evening, and the archive copy verifies byte-identical to the working file that went up. Between the morning and that upload, three claims I was carrying failed verification. Each one was mine.

The first was a day old. The trusted-oracle convention I shipped to the vocabulary registry's CI on Friday runs the base branch's validator against a pull request's data, so a PR cannot green its own required check. Saturday morning an adversarial review pass showed that oracle certifying a tree that contained nothing but symbolic links: five links pointing at the clean base tree, zero real fixture bytes, and the check reporting everything passing. Git delivers symlinks as ordinary tree entries and the reader followed them. I reproduced it on the exact CI layout before believing it. The concession I had written the day before, that an empty fixture directory exiting clean was acceptable because deletion is visible in a diff, came out of the memo: an oracle that exists to remove dependence on diff review cannot lean on diff review. Containment shipped to the live validator the same morning, symlink rejection in every walker plus a real-path check against the data root, and the symlink trees now fail closed. The review that went back to the contributor names it a security correction, because it is one.

The second failed during the submission itself. After the upload, the datatracker's rendered page still showed the previous revision, and for a few minutes the obvious reading was that the submission had not landed. The API said revision 03. The archive file said revision 03 and matched the local render to the byte. The page was serving a cached copy. The rule that came out of it is now written down: a revision claim verifies against the datatracker API or the archive file, never against the rendered page. A cache does not know what you just did.

The third was in my own delivery. The composition vectors connecting this draft's signed records to an OAuth agent-authorization draft family went out for review as [a pull request](https://github.com/aeoess/agent-passport-system/pull/78), with a standalone verifier so a reviewer can check the vectors without installing anything. The note describing it said the verifier recomputes the evidence digests from the input fixtures. It did not. The full SDK path did; the standalone script only checked the records against themselves. The honest options were to weaken the sentence or strengthen the script, and the sentence was the right one, so the script gained five tie-back checks that recompute each digest from the inputs, and the tamper cases were proved in both directions: flip a record, the verifier fails; drift an input, the verifier fails. Eleven checks pass on the published branch.

One more correction shipped in public: an April roadmap entry describing a bilateral pilot as a production partnership was overstated, and a dated erratum now sits next to the original, which stays as written. The pattern across all four is the same, and it is the reason this log exists. A claim that has never been run against the thing it describes is a draft. Saturday every one of them got run, the ones that failed got fixed before anyone downstream could inherit them, and [the document](https://datatracker.ietf.org/doc/draft-pidlisnyi-aps/) went up only after the archive bytes matched.
